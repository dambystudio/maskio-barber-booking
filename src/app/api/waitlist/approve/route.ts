import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'barber' && session.user.role !== 'admin')) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    const body = await request.json();
    const { waitlistId } = body;

    if (!waitlistId) {
      return NextResponse.json({ error: 'ID waitlist richiesto' }, { status: 400 });
    }

    // Recupera i dati dalla waitlist
    const waitlistEntry = await sql`
      SELECT * FROM waitlist WHERE id = ${waitlistId} AND status = 'waiting'
    `;

    if (waitlistEntry.length === 0) {
      return NextResponse.json({ error: 'Entry waitlist non trovata' }, { status: 404 });
    }

    const entry = waitlistEntry[0];

    // Verifica se ci sono slot disponibili per quella data/barbiere
    const existingBookings = await sql`
      SELECT COUNT(*) as count
      FROM bookings 
      WHERE barber_id = ${entry.barber_id} 
      AND date = ${entry.date}
      AND status != 'cancelled'
    `;

    // Per semplicità, assumiamo un massimo di 8 slot per barbiere al giorno
    const maxSlotsPerDay = 8;
    if (existingBookings[0].count >= maxSlotsPerDay) {
      return NextResponse.json({ 
        error: 'Nessuno slot disponibile per quella data' 
      }, { status: 409 });
    }

    // Trova il primo slot disponibile per quella data
    const timeSlots = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'];
    
    const bookedSlots = await sql`
      SELECT time FROM bookings 
      WHERE barber_id = ${entry.barber_id} 
      AND date = ${entry.date}
      AND status != 'cancelled'
    `;

    const bookedTimes = bookedSlots.map(b => b.time);
    const availableSlot = timeSlots.find(slot => !bookedTimes.includes(slot));

    if (!availableSlot) {
      return NextResponse.json({ 
        error: 'Nessun orario disponibile per quella data' 
      }, { status: 409 });
    }

    // Crea la prenotazione
    const newBooking = await sql`
      INSERT INTO bookings (
        user_id, customer_name, customer_email, customer_phone,
        barber_id, barber_name, service, price, date, time,
        duration, status, notes
      ) VALUES (
        ${entry.user_id}, ${entry.customer_name}, ${entry.customer_email}, 
        ${entry.customer_phone}, ${entry.barber_id}, ${entry.barber_name},
        ${entry.service || 'Taglio Uomo'}, ${entry.price || 25}, 
        ${entry.date}, ${availableSlot}, 30, 'confirmed',
        ${entry.notes ? `Dalla lista d'attesa: ${entry.notes}` : 'Dalla lista d\'attesa'}
      ) RETURNING *
    `;

    // Aggiorna lo status della waitlist entry
    await sql`
      UPDATE waitlist 
      SET status = 'approved', updated_at = NOW()
      WHERE id = ${waitlistId}
    `;

    // Riordina le posizioni degli altri in lista
    await sql`
      UPDATE waitlist 
      SET position = position - 1, updated_at = NOW()
      WHERE date = ${entry.date} 
      AND barber_id = ${entry.barber_id}
      AND position > ${entry.position}
      AND status = 'waiting'
    `;

    return NextResponse.json({ 
      success: true, 
      booking: newBooking[0],
      message: `Prenotazione creata per ${availableSlot}`
    });

  } catch (error) {
    console.error('Errore nell\'approvazione dalla waitlist:', error);
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 });
  }
}
