import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function POST(request: NextRequest) {
  try {
    // Log iniziale per debug
    console.log('🔵 [WAITLIST JOIN] Inizio richiesta');
    
    // Verifica autenticazione
    const session = await getServerSession(authOptions);
    console.log('🔵 [WAITLIST JOIN] Session:', session ? 'OK' : 'MANCANTE', session?.user?.id);
    
    if (!session?.user?.id) {
      console.log('❌ [WAITLIST JOIN] Autenticazione fallita');
      return NextResponse.json(
        { error: 'Non autenticato. Effettua il login per iscriverti alla lista d\'attesa.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log('🔵 [WAITLIST JOIN] Body ricevuto:', JSON.stringify(body, null, 2));
    
    const {
      barberId,
      barberName,
      date,
      time,
      service,
      price,
      customerName,
      customerEmail,
    } = body;

    // Validazione input
    if (!barberId || !date || !time || !service) {
      console.log('❌ [WAITLIST JOIN] Validazione fallita:', { barberId, date, time, service });
      return NextResponse.json(
        { error: 'Dati mancanti. barberId, date, time e service sono obbligatori.' },
        { status: 400 }
      );
    }
    
    console.log('🔵 [WAITLIST JOIN] Validazione OK, controllo duplicati...');

    // Controlla se l'utente è già in lista d'attesa per questo barbiere/data
    const existing = await sql`
      SELECT id 
      FROM waitlist 
      WHERE user_id = ${session.user.id}
        AND barber_id = ${barberId}
        AND date = ${date}
        AND status = 'waiting'
    `;
    
    console.log('🔵 [WAITLIST JOIN] Iscrizioni esistenti:', existing.length);

    if (existing.length > 0) {
      console.log('⚠️ [WAITLIST JOIN] Duplicato trovato');
      return NextResponse.json(
        { 
          error: 'Sei già in lista d\'attesa per questo giorno.',
          message: 'Sei già iscritto alla lista d\'attesa per questo barbiere e data.'
        },
        { status: 409 }
      );
    }
    
    console.log('🔵 [WAITLIST JOIN] Calcolo posizione...');

    console.log('🔵 [WAITLIST JOIN] Calcolo posizione...');

    // Ottieni la prossima posizione in coda
    const positionResult = await sql`
      SELECT COALESCE(MAX(position), 0) as max_position 
      FROM waitlist 
      WHERE barber_id = ${barberId}
        AND date = ${date}
    `;
    const nextPosition = (positionResult[0]?.max_position || 0) + 1;
    console.log('🔵 [WAITLIST JOIN] Posizione calcolata:', nextPosition);

    // Inserisci nella lista d'attesa
    console.log('🔵 [WAITLIST JOIN] Inserimento nel database...');
    const result = await sql`
      INSERT INTO waitlist (
        user_id,
        barber_id,
        barber_name,
        date,
        time,
        service,
        price,
        customer_name,
        customer_email,
        status,
        position,
        created_at
      ) VALUES (
        ${session.user.id},
        ${barberId},
        ${barberName || 'Barbiere'},
        ${date},
        ${time},
        ${service},
        ${price || 0},
        ${customerName || session.user.name || ''},
        ${customerEmail || session.user.email || ''},
        'waiting',
        ${nextPosition},
        NOW()
      )
      RETURNING id, position
    `;
    
    console.log('✅ [WAITLIST JOIN] Inserimento completato:', result[0]);

    return NextResponse.json({
      success: true,
      message: 'Iscrizione alla lista d\'attesa completata con successo!',
      data: {
        waitlistId: result[0].id,
        position: result[0].position,
        barberId,
        date,
        time,
        service,
      },
    });

  } catch (error) {
    console.error('❌ [WAITLIST JOIN] ERRORE:', error);
    console.error('❌ [WAITLIST JOIN] Stack:', error instanceof Error ? error.stack : 'No stack');
    
    // Salva errore nel database per debug da mobile
    try {
      await sql`
        INSERT INTO system_logs (level, message, details, created_at)
        VALUES ('error', 'Waitlist join failed', ${JSON.stringify({
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined
        })}, NOW())
      `.catch(() => {}); // Ignora errori di logging
    } catch {}
    
    return NextResponse.json(
      { 
        error: 'Errore del server',
        details: error instanceof Error ? error.message : 'Errore sconosciuto',
        type: error instanceof Error ? error.constructor.name : typeof error
      },
      { status: 500 }
    );
  }
}

// GET: Ottieni le iscrizioni alla lista d'attesa dell'utente corrente
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autenticato' },
        { status: 401 }
      );
    }

    const waitlistEntries = await sql`
      SELECT 
        id,
        barber_id,
        barber_name,
        date,
        time,
        service,
        price,
        status,
        position,
        created_at
      FROM waitlist
      WHERE user_id = ${session.user.id}
        AND status IN ('waiting', 'notified')
      ORDER BY date ASC, created_at ASC
    `;

    return NextResponse.json({
      success: true,
      entries: waitlistEntries,
    });

  } catch (error) {
    console.error('❌ Errore durante il recupero della lista d\'attesa:', error);
    return NextResponse.json(
      { error: 'Errore del server' },
      { status: 500 }
    );
  }
}

// DELETE: Rimuovi un'iscrizione dalla lista d'attesa
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autenticato' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const waitlistId = searchParams.get('id');

    if (!waitlistId) {
      return NextResponse.json(
        { error: 'ID lista d\'attesa mancante' },
        { status: 400 }
      );
    }

    // Verifica che l'entry appartenga all'utente
    const entry = await sql`
      SELECT id 
      FROM waitlist 
      WHERE id = ${waitlistId}
        AND user_id = ${session.user.id}
    `;

    if (entry.length === 0) {
      return NextResponse.json(
        { error: 'Iscrizione non trovata o non autorizzato' },
        { status: 404 }
      );
    }

    // Aggiorna lo stato a 'cancelled'
    await sql`
      UPDATE waitlist 
      SET status = 'cancelled',
          updated_at = NOW()
      WHERE id = ${waitlistId}
        AND user_id = ${session.user.id}
    `;

    return NextResponse.json({
      success: true,
      message: 'Iscrizione rimossa dalla lista d\'attesa',
    });

  } catch (error) {
    console.error('❌ Errore durante la rimozione dalla lista d\'attesa:', error);
    return NextResponse.json(
      { error: 'Errore del server' },
      { status: 500 }
    );
  }
}
