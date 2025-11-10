import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const sql = neon(process.env.DATABASE_URL!);

// GET - Recupera lista d'attesa per un utente O per una data specifica (dashboard barbiere)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get('user_email');
    const date = searchParams.get('date');

    // Se è specificato date, restituisci tutte le entry per quella data (per dashboard barbiere)
    if (date) {
      const waitlistEntries = await sql`
        SELECT 
          w.*,
          b.name as barber_name,
          u.name as user_name,
          u.email as user_email,
          u.phone as user_phone
        FROM waitlist w
        LEFT JOIN barbers b ON w.barber_id = b.id
        LEFT JOIN users u ON w.user_id = u.id
        WHERE w.date = ${date}
        AND w.status IN ('active', 'waiting', 'notified')
        ORDER BY w.barber_id, w.created_at ASC
      `;

      return NextResponse.json({ 
        entries: waitlistEntries.map(entry => ({
          id: entry.id,
          user_name: entry.user_name || entry.customer_name || 'Utente',
          user_email: entry.user_email || entry.customer_email,
          user_phone: entry.user_phone || entry.customer_phone,
          barber_name: entry.barber_name,
          date: entry.date,
          preferred_time: entry.preferred_time,
          status: entry.status,
          created_at: entry.created_at
        }))
      });
    }

    // Altrimenti, query per utente specifico
    if (!userEmail) {
      return NextResponse.json(
        { error: 'user_email o date è richiesto' },
        { status: 400 }
      );
    }

    const waitlistEntries = await sql`
      SELECT 
        w.*,
        b.name as barber_name_from_table
      FROM waitlist w
      LEFT JOIN barbers b ON w.barber_id = b.id
      WHERE w.customer_email = ${userEmail}
      AND w.status IN ('waiting', 'notified')
      ORDER BY w.created_at DESC
    `;

    return NextResponse.json({ waitlist: waitlistEntries });
  } catch (error) {
    console.error('Errore nel recupero della waitlist:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero della waitlist' },
      { status: 500 }
    );
  }
}

// POST - Aggiunge un utente alla lista d'attesa
export async function POST(request: NextRequest) {
  try {
    // Prova a recuperare la sessione (potrebbe essere NULL per guest)
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id || null;
    
    console.log('🔵 [WAITLIST] Session user_id:', userId);
    
    const body = await request.json();
    const { barberId, date, customerName, customerEmail, customerPhone } = body;

    console.log('🔵 [WAITLIST] POST request body:', body);

    // Validazione
    if (!barberId || !date || !customerName || !customerEmail) {
      console.log('❌ [WAITLIST] Validation failed - missing required fields');
      return NextResponse.json(
        { error: 'barberId, date, customerName e customerEmail sono richiesti' },
        { status: 400 }
      );
    }

    // Verifica che la data sia valida
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return NextResponse.json(
        { error: 'Data non valida' },
        { status: 400 }
      );
    }

    // Verifica che la data sia futura
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (dateObj < today) {
      return NextResponse.json(
        { error: 'La data deve essere futura' },
        { status: 400 }
      );
    }

    // Ottieni il nome del barbiere
    const barberResult = await sql`
      SELECT name FROM barbers WHERE id = ${barberId}
    `;

    if (barberResult.length === 0) {
      return NextResponse.json(
        { error: 'Barbiere non trovato' },
        { status: 404 }
      );
    }

    const barberName = barberResult[0].name;

    // Controlla se l'utente è già in lista d'attesa per questa data/barbiere
    const existingEntry = await sql`
      SELECT id FROM waitlist
      WHERE barber_id = ${barberId}
      AND date = ${date}
      AND customer_email = ${customerEmail}
      AND status IN ('waiting', 'notified')
    `;

    if (existingEntry.length > 0) {
      console.log('⚠️ [WAITLIST] User already in waitlist for this date');
      return NextResponse.json(
        { error: 'Sei già in lista d\'attesa per questa data' },
        { status: 400 }
      );
    }

    console.log('🔵 [WAITLIST] Calculating position...');
    
    // ✅ FIX: Se customerPhone non è fornito e l'utente è loggato, prova a recuperarlo dal profilo
    let phoneToUse = customerPhone;
    if ((!phoneToUse || phoneToUse.trim() === '') && userId) {
      console.log('📞 [WAITLIST] customerPhone vuoto, recupero dal profilo utente...');
      const userProfile = await sql`
        SELECT phone FROM users WHERE id = ${userId}
      `;
      if (userProfile.length > 0 && userProfile[0].phone) {
        phoneToUse = userProfile[0].phone;
        console.log('✅ [WAITLIST] Telefono recuperato dal profilo:', phoneToUse);
      } else {
        console.log('⚠️ [WAITLIST] Nessun telefono trovato nel profilo');
      }
    }
    
    // Calcola la posizione nella lista
    const positionResult = await sql`
      SELECT COUNT(*) as count FROM waitlist
      WHERE barber_id = ${barberId}
      AND date = ${date}
      AND status IN ('waiting', 'notified')
    `;

    const position = Number(positionResult[0].count) + 1;
    console.log('🔵 [WAITLIST] Position calculated:', position);

    console.log('🔵 [WAITLIST] Inserting into database...');
    
    // Inserisci nella waitlist
    const result = await sql`
      INSERT INTO waitlist (
        user_id,
        barber_id,
        barber_name,
        date,
        customer_name,
        customer_email,
        customer_phone,
        position,
        status,
        created_at,
        updated_at
      ) VALUES (
        ${userId},
        ${barberId},
        ${barberName},
        ${date},
        ${customerName},
        ${customerEmail},
        ${phoneToUse || null},
        ${position},
        'waiting',
        NOW(),
        NOW()
      )
      RETURNING id, position
    `;

    console.log(`✅ [WAITLIST] User added: ${customerEmail} (user_id: ${userId}) for ${date} (position ${position})`);

    return NextResponse.json({
      success: true,
      waitlistId: result[0].id,
      position: result[0].position,
      message: `Aggiunto alla lista d'attesa in posizione ${position}`
    });

  } catch (error) {
    console.error('Errore nell\'aggiunta alla waitlist:', error);
    return NextResponse.json(
      { error: 'Errore nell\'aggiunta alla lista d\'attesa' },
      { status: 500 }
    );
  }
}

// DELETE - Rimuove un utente dalla lista d'attesa
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const waitlistId = searchParams.get('id');
    const userEmail = searchParams.get('user_email');

    if (!waitlistId || !userEmail) {
      return NextResponse.json(
        { error: 'id e user_email sono richiesti' },
        { status: 400 }
      );
    }

    // Verifica che l'entry appartenga all'utente
    const entry = await sql`
      SELECT id, barber_id, date, position
      FROM waitlist
      WHERE id = ${waitlistId}
      AND customer_email = ${userEmail}
    `;

    if (entry.length === 0) {
      return NextResponse.json(
        { error: 'Entry non trovata o non autorizzato' },
        { status: 404 }
      );
    }

    const { barber_id, date: entryDate, position: removedPosition } = entry[0];

    // Elimina l'entry
    await sql`
      DELETE FROM waitlist
      WHERE id = ${waitlistId}
    `;

    // Aggiorna le posizioni degli altri utenti
    await sql`
      UPDATE waitlist
      SET position = position - 1,
          updated_at = NOW()
      WHERE barber_id = ${barber_id}
      AND date = ${entryDate}
      AND position > ${removedPosition}
      AND status IN ('waiting', 'notified')
    `;

    console.log(`✅ Utente rimosso dalla waitlist: ${userEmail} per ${entryDate}`);

    return NextResponse.json({
      success: true,
      message: 'Rimosso dalla lista d\'attesa'
    });

  } catch (error) {
    console.error('Errore nella rimozione dalla waitlist:', error);
    return NextResponse.json(
      { error: 'Errore nella rimozione dalla lista d\'attesa' },
      { status: 500 }
    );
  }
}
