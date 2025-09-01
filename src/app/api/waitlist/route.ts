import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const barberId = searchParams.get('barberId');
    const userEmail = searchParams.get('user_email');

    let waitlist;

    if (userEmail) {
      // Filtro per email utente - per il profilo utente
      waitlist = await sql`
        SELECT w.*, u.name as user_name, u.email as user_email
        FROM waitlist w
        LEFT JOIN users u ON w.user_id = u.id
        WHERE w.status = 'waiting'
        AND w.customer_email = ${userEmail}
        ORDER BY w.date ASC, w.created_at ASC
      `;
    } else if (date && barberId) {
      waitlist = await sql`
        SELECT w.*, u.name as user_name, u.email as user_email
        FROM waitlist w
        LEFT JOIN users u ON w.user_id = u.id
        WHERE w.status = 'waiting'
        AND w.date = ${date}
        AND w.barber_id = ${barberId}
        ORDER BY w.position ASC, w.created_at ASC
      `;
    } else if (date) {
      waitlist = await sql`
        SELECT w.*, u.name as user_name, u.email as user_email
        FROM waitlist w
        LEFT JOIN users u ON w.user_id = u.id
        WHERE w.status = 'waiting'
        AND w.date = ${date}
        ORDER BY w.barber_id ASC, w.position ASC, w.created_at ASC
      `;
    } else if (barberId) {
      waitlist = await sql`
        SELECT w.*, u.name as user_name, u.email as user_email
        FROM waitlist w
        LEFT JOIN users u ON w.user_id = u.id
        WHERE w.status = 'waiting'
        AND w.barber_id = ${barberId}
        ORDER BY w.date ASC, w.position ASC, w.created_at ASC
      `;
    } else {
      waitlist = await sql`
        SELECT w.*, u.name as user_name, u.email as user_email
        FROM waitlist w
        LEFT JOIN users u ON w.user_id = u.id
        WHERE w.status = 'waiting'
        ORDER BY w.date ASC, w.barber_id ASC, w.position ASC, w.created_at ASC
      `;
    }

    return NextResponse.json(waitlist);
  } catch (error) {
    console.error('Errore nel recupero waitlist:', error);
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    const body = await request.json();
    const { barberId, barberName, date, service, price, customerName, customerEmail, customerPhone, notes } = body;

    // Verifica se l'utente è già in lista d'attesa per quel giorno
    const existingEntry = await sql`
      SELECT id FROM waitlist 
      WHERE user_id = ${session.user.id} 
      AND date = ${date} 
      AND status = 'waiting'
    `;

    if (existingEntry.length > 0) {
      return NextResponse.json({ 
        error: 'Sei già in lista d\'attesa per questo giorno' 
      }, { status: 409 });
    }

    // Calcola la posizione nella lista
    const positionResult = await sql`
      SELECT COALESCE(MAX(position), 0) + 1 as next_position
      FROM waitlist 
      WHERE date = ${date} 
      AND barber_id = ${barberId}
      AND status = 'waiting'
    `;

    const position = positionResult[0].next_position;

    // Crea l'entry nella waitlist
    const waitlistEntry = await sql`
      INSERT INTO waitlist (
        user_id, barber_id, barber_name, date, service, price,
        customer_name, customer_email, customer_phone, notes,
        position, status
      ) VALUES (
        ${session.user.id}, ${barberId}, ${barberName}, ${date}, ${service}, ${price},
        ${customerName || session.user.name}, 
        ${customerEmail || session.user.email}, 
        ${customerPhone}, ${notes}, ${position}, 'waiting'
      ) RETURNING *
    `;

    return NextResponse.json({ 
      success: true, 
      waitlistEntry: waitlistEntry[0],
      message: `Aggiunto alla lista d'attesa in posizione ${position}`
    });

  } catch (error) {
    console.error('Errore nell\'aggiunta alla waitlist:', error);
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const waitlistId = searchParams.get('id');

    if (!waitlistId) {
      return NextResponse.json({ error: 'ID waitlist richiesto' }, { status: 400 });
    }

    // Verifica che l'utente possa cancellare questa entry
    const waitlistEntry = await sql`
      SELECT * FROM waitlist WHERE id = ${waitlistId}
    `;

    if (waitlistEntry.length === 0) {
      return NextResponse.json({ error: 'Entry non trovata' }, { status: 404 });
    }

    const entry = waitlistEntry[0];

    // Solo il proprietario o un barbiere/admin può cancellare
    if (entry.user_id !== session.user.id && 
        session.user.role !== 'barber' && 
        session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 });
    }

    // Elimina l'entry
    await sql`DELETE FROM waitlist WHERE id = ${waitlistId}`;

    // Riordina le posizioni degli altri in lista per quella data/barbiere
    await sql`
      UPDATE waitlist 
      SET position = position - 1, updated_at = NOW()
      WHERE date = ${entry.date} 
      AND barber_id = ${entry.barber_id}
      AND position > ${entry.position}
      AND status = 'waiting'
    `;

    return NextResponse.json({ success: true, message: 'Rimosso dalla lista d\'attesa' });

  } catch (error) {
    console.error('Errore nella rimozione dalla waitlist:', error);
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 });
  }
}
