import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL non definito');
}

const sql = neon(process.env.DATABASE_URL);

// POST - Scambia due appuntamenti
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    const { booking1Id, booking2Id, swapType, newDate, newTime } = await request.json();

    console.log('📋 Richiesta swap:', { booking1Id, booking2Id, swapType, newDate, newTime });

    if (!booking1Id) {
      return NextResponse.json({ error: 'ID prenotazione 1 richiesto' }, { status: 400 });
    }

    // Verifica che il barbiere possa modificare queste prenotazioni
    console.log('🔍 Ricerca prenotazioni:', { booking1Id, booking2Id });
    
    const bookings = await sql`
      SELECT id, barber_id, barber_name, date, time, customer_name, customer_phone, service, status
      FROM bookings 
      WHERE id = ${booking1Id} ${booking2Id ? sql`OR id = ${booking2Id}` : sql``}
    `;

    console.log('📊 Prenotazioni trovate:', bookings.length);

    if (bookings.length === 0) {
      return NextResponse.json({ error: 'Prenotazione non trovata' }, { status: 404 });
    }

    const booking1 = bookings.find(b => b.id === booking1Id);
    if (!booking1) {
      console.error('❌ Prima prenotazione non trovata in risultati');
      return NextResponse.json({ error: 'Prima prenotazione non trovata' }, { status: 404 });
    }

    console.log('✅ Booking1 trovato:', { id: booking1.id, barber: booking1.barber_id });

    // Trova il barber_id corrispondente all'email del barbiere loggato
    const barber = await sql`
      SELECT id FROM barbers WHERE email = ${session.user.email}
    `;

    if (barber.length === 0) {
      console.error('❌ Barbiere non trovato per email:', session.user.email);
      return NextResponse.json({ error: 'Barbiere non trovato' }, { status: 404 });
    }

    const barberId = barber[0].id;
    console.log('✅ Barber ID trovato:', barberId);

    // Verifica autorizzazioni (barbiere può modificare solo i suoi appuntamenti)
    if (booking1.barber_id !== barberId) {
      console.error('❌ Non autorizzato:', { booking_barber: booking1.barber_id, user_barber: barberId });
      return NextResponse.json({ error: 'Non autorizzato a modificare questa prenotazione' }, { status: 403 });
    }

    console.log('✅ Autorizzazione verificata');

    if (swapType === 'move') {
      console.log('📅 Modalità MOVE - Spostamento in slot libero');
      // Spostamento semplice in uno slot libero
      
      if (!newDate || !newTime) {
        console.error('❌ Parametri mancanti:', { newDate, newTime });
        return NextResponse.json({ error: 'Nuova data e ora richieste' }, { status: 400 });
      }

      console.log('🔍 Controllo disponibilità slot:', { barber: booking1.barber_id, newDate, newTime });

      // Verifica che il nuovo slot sia libero
      const existingBooking = await sql`
        SELECT id FROM bookings 
        WHERE barber_id = ${booking1.barber_id} 
        AND date = ${newDate} 
        AND time = ${newTime}
        AND status != 'cancelled'
        AND id != ${booking1Id}
      `;

      console.log('📊 Prenotazioni esistenti nello slot:', existingBooking.length);

      if (existingBooking.length > 0) {
        console.error('❌ Slot occupato:', existingBooking[0].id);
        return NextResponse.json({ error: 'Lo slot selezionato è già occupato' }, { status: 409 });
      }

      console.log('✅ Slot libero, procedo con lo spostamento');

      // Sposta l'appuntamento
      await sql`
        UPDATE bookings 
        SET date = ${newDate}, time = ${newTime}
        WHERE id = ${booking1Id}
      `;

      console.log('✅ Appuntamento spostato con successo');

      return NextResponse.json({ 
        success: true, 
        message: 'Appuntamento spostato con successo',
        type: 'move',
        booking: {
          id: booking1Id,
          newDate,
          newTime
        }
      });

    } else if (swapType === 'swap') {
      // Scambio tra due prenotazioni
      if (!booking2Id) {
        return NextResponse.json({ error: 'ID seconda prenotazione richiesto per lo scambio' }, { status: 400 });
      }

      const booking2 = bookings.find(b => b.id === booking2Id);
      if (!booking2) {
        return NextResponse.json({ error: 'Seconda prenotazione non trovata' }, { status: 404 });
      }

      // Verifica che anche la seconda prenotazione appartenga allo stesso barbiere
      if (booking2.barber_id !== barberId) {
        return NextResponse.json({ error: 'Non autorizzato a modificare la seconda prenotazione' }, { status: 403 });
      }

      // Scambia le date e orari
      await sql`BEGIN`;
      
      try {
        await sql`
          UPDATE bookings 
          SET date = ${booking2.date}, time = ${booking2.time}
          WHERE id = ${booking1Id}
        `;
        
        await sql`
          UPDATE bookings 
          SET date = ${booking1.date}, time = ${booking1.time}
          WHERE id = ${booking2Id}
        `;
        
        await sql`COMMIT`;

        return NextResponse.json({ 
          success: true, 
          message: 'Appuntamenti scambiati con successo',
          type: 'swap',
          bookings: {
            booking1: {
              id: booking1Id,
              newDate: booking2.date,
              newTime: booking2.time
            },
            booking2: {
              id: booking2Id,
              newDate: booking1.date,
              newTime: booking1.time
            }
          }
        });

      } catch (error) {
        await sql`ROLLBACK`;
        throw error;
      }

    } else {
      return NextResponse.json({ error: 'Tipo di operazione non valido' }, { status: 400 });
    }

  } catch (error) {
    console.error('❌ Errore nello scambio appuntamenti:', error);
    console.error('Stack trace:', error instanceof Error ? error.stack : 'N/A');
    return NextResponse.json({ 
      error: 'Errore interno del server',
      details: error instanceof Error ? error.message : 'Errore sconosciuto'
    }, { status: 500 });
  }
}

// GET - Verifica disponibilità di uno slot
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const barberEmail = searchParams.get('barberEmail');
    const date = searchParams.get('date');
    const time = searchParams.get('time');
    const excludeBookingId = searchParams.get('excludeBookingId');

    if (!barberEmail || !date || !time) {
      return NextResponse.json({ error: 'Parametri mancanti' }, { status: 400 });
    }

    // Trova il barber_id dall'email
    const barber = await sql`
      SELECT id FROM barbers WHERE email = ${barberEmail}
    `;

    if (barber.length === 0) {
      return NextResponse.json({ error: 'Barbiere non trovato' }, { status: 404 });
    }

    const barberId = barber[0].id;

    // Verifica che lo slot sia libero
    const query = sql`
      SELECT id, customer_name FROM bookings 
      WHERE barber_id = ${barberId} 
      AND date = ${date} 
      AND time = ${time}
      AND status != 'cancelled'
      ${excludeBookingId ? sql`AND id != ${excludeBookingId}` : sql``}
    `;

    const existingBooking = await query;

    if (existingBooking.length > 0) {
      return NextResponse.json({ 
        available: false, 
        occupiedBy: {
          id: existingBooking[0].id,
          customerName: existingBooking[0].customer_name
        }
      });
    }

    return NextResponse.json({ available: true });

  } catch (error) {
    console.error('Errore nella verifica disponibilità:', error);
    return NextResponse.json({ 
      error: 'Errore interno del server' 
    }, { status: 500 });
  }
}