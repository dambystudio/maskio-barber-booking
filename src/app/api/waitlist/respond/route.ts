import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    const body = await request.json();
    const { waitlistId, response } = body; // response = 'accepted' o 'declined'

    if (!waitlistId || !response) {
      return NextResponse.json({ 
        error: 'Parametri mancanti' 
      }, { status: 400 });
    }

    if (response !== 'accepted' && response !== 'declined') {
      return NextResponse.json({ 
        error: 'Risposta non valida' 
      }, { status: 400 });
    }

    // Recupera l'offerta dalla waitlist
    const waitlistEntry = await sql`
      SELECT * FROM waitlist 
      WHERE id = ${waitlistId} 
      AND user_id = ${session.user.id}
      AND status = 'offered'
    `;

    if (waitlistEntry.length === 0) {
      return NextResponse.json({ 
        error: 'Offerta non trovata o già scaduta' 
      }, { status: 404 });
    }

    const entry = waitlistEntry[0];

    // Verifica se l'offerta è scaduta
    if (entry.offer_expires_at && new Date(entry.offer_expires_at) < new Date()) {
      await sql`
        UPDATE waitlist 
        SET status = 'expired', 
            offer_response = 'expired',
            updated_at = NOW()
        WHERE id = ${waitlistId}
      `;

      return NextResponse.json({ 
        error: 'L\'offerta è scaduta' 
      }, { status: 410 });
    }

    if (response === 'accepted') {
      // L'utente accetta: crea la prenotazione
      const newBooking = await sql`
        INSERT INTO bookings (
          user_id, customer_name, customer_email, customer_phone,
          barber_id, barber_name, service, price, date, time,
          duration, status, notes
        ) VALUES (
          ${entry.user_id}, 
          ${entry.customer_name}, 
          ${entry.customer_email}, 
          ${entry.customer_phone}, 
          ${entry.barber_id}, 
          ${entry.barber_name},
          ${entry.service || 'Taglio Uomo'}, 
          ${entry.price || 25}, 
          ${entry.date}, 
          ${entry.offered_time}, 
          30, 
          'confirmed',
          ${entry.notes ? `Dalla lista d'attesa (confermato): ${entry.notes}` : 'Dalla lista d\'attesa (confermato)'}
        ) RETURNING *
      `;

      // Aggiorna lo status della waitlist entry
      await sql`
        UPDATE waitlist 
        SET status = 'approved', 
            offer_response = 'accepted',
            updated_at = NOW()
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
        message: `Prenotazione confermata per il ${entry.date} alle ${entry.offered_time}`
      });

    } else { // response === 'declined'
      // L'utente rifiuta: aggiorna lo status e notifica il prossimo in lista
      await sql`
        UPDATE waitlist 
        SET status = 'declined', 
            offer_response = 'declined',
            updated_at = NOW()
        WHERE id = ${waitlistId}
      `;

      // Riordina le posizioni
      await sql`
        UPDATE waitlist 
        SET position = position - 1, updated_at = NOW()
        WHERE date = ${entry.date} 
        AND barber_id = ${entry.barber_id}
        AND position > ${entry.position}
        AND status = 'waiting'
      `;

      // Trova il prossimo utente in lista d'attesa e invia notifica
      const nextInLine = await sql`
        SELECT * FROM waitlist
        WHERE date = ${entry.date}
        AND barber_id = ${entry.barber_id}
        AND status = 'waiting'
        ORDER BY position ASC
        LIMIT 1
      `;

      if (nextInLine.length > 0) {
        // Invia notifica al prossimo in lista
        try {
          await fetch(`${process.env.NEXTAUTH_URL}/api/notifications/send-waitlist-alert`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              bookingId: entry.offered_booking_id,
              barberId: entry.barber_id,
              date: entry.date,
              time: entry.offered_time
            })
          });
        } catch (notifyError) {
          console.error('❌ Errore nell\'invio notifica al prossimo:', notifyError);
        }
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Offerta rifiutata'
      });
    }

  } catch (error) {
    console.error('Errore nella risposta alla waitlist:', error);
    return NextResponse.json({ 
      error: 'Errore interno del server' 
    }, { status: 500 });
  }
}
