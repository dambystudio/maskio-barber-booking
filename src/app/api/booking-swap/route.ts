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

    const { booking1Id, booking2Id, swapType, newDate, newTime, newBarberName, crossBarber } = await request.json();

    console.log('📋 Richiesta swap:', { booking1Id, booking2Id, swapType, newDate, newTime, newBarberName, crossBarber });

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

    // ✅ MODIFICA: Michele e Fabio possono gestirsi reciprocamente
    // Controllo autorizzazioni rimosso - barbieri possono modificare appuntamenti di altri barbieri
    console.log('✅ Gestione reciproca abilitata - autorizzazione verificata');

    if (swapType === 'move') {
      console.log('📅 Modalità MOVE - Spostamento in slot libero');
      // Spostamento semplice in uno slot libero
      
      if (!newDate || !newTime) {
        console.error('❌ Parametri mancanti:', { newDate, newTime });
        return NextResponse.json({ error: 'Nuova data e ora richieste' }, { status: 400 });
      }

      // ✅ NUOVO: Supporto per cambio barbiere
      let targetBarberId = booking1.barber_id;
      let targetBarberName = booking1.barber_name;
      
      if (crossBarber && newBarberName) {
        console.log('🔄 Cambio barbiere richiesto:', { from: booking1.barber_name, to: newBarberName });
        
        // Trova il nuovo barbiere
        const targetBarber = await sql`
          SELECT id, name FROM barbers WHERE name = ${newBarberName}
        `;
        
        if (targetBarber.length === 0) {
          console.error('❌ Barbiere target non trovato:', newBarberName);
          return NextResponse.json({ error: 'Barbiere di destinazione non trovato' }, { status: 404 });
        }
        
        targetBarberId = targetBarber[0].id;
        targetBarberName = targetBarber[0].name;
        console.log('✅ Barbiere target trovato:', { id: targetBarberId, name: targetBarberName });
      }

      console.log('🔍 Controllo disponibilità slot:', { barber: targetBarberId, newDate, newTime });

      // Verifica che il nuovo slot sia libero (con il barbiere target)
      const existingBooking = await sql`
        SELECT id FROM bookings 
        WHERE barber_id = ${targetBarberId} 
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

      // Sposta l'appuntamento (aggiorna anche barbiere se necessario)
      await sql`
        UPDATE bookings 
        SET date = ${newDate}, 
            time = ${newTime},
            barber_id = ${targetBarberId},
            barber_name = ${targetBarberName}
        WHERE id = ${booking1Id}
      `;

      console.log('✅ Appuntamento spostato con successo', crossBarber ? '(con cambio barbiere)' : '');

      return NextResponse.json({ 
        success: true, 
        message: crossBarber 
          ? `Appuntamento spostato con successo da ${booking1.barber_name} a ${targetBarberName}`
          : 'Appuntamento spostato con successo',
        type: 'move',
        crossBarber,
        booking: {
          id: booking1Id,
          newDate,
          newTime,
          newBarber: targetBarberName
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

      // ✅ MODIFICA: Gestione reciproca - barbieri possono scambiare appuntamenti tra loro
      console.log('✅ Gestione reciproca abilitata per swap', crossBarber ? '(tra barbieri diversi)' : '(stesso barbiere)');

      // Scambia date, orari e barbieri
      await sql`BEGIN`;
      
      try {
        if (crossBarber) {
          // Scambio tra barbieri: scambia anche barber_id e barber_name
          console.log('🔄 Scambio tra barbieri:', { 
            booking1: `${booking1.barber_name} → ${booking2.barber_name}`,
            booking2: `${booking2.barber_name} → ${booking1.barber_name}`
          });
          
          await sql`
            UPDATE bookings 
            SET date = ${booking2.date}, 
                time = ${booking2.time},
                barber_id = ${booking2.barber_id},
                barber_name = ${booking2.barber_name}
            WHERE id = ${booking1Id}
          `;
          
          await sql`
            UPDATE bookings 
            SET date = ${booking1.date}, 
                time = ${booking1.time},
                barber_id = ${booking1.barber_id},
                barber_name = ${booking1.barber_name}
            WHERE id = ${booking2Id}
          `;
        } else {
          // Scambio normale (stesso barbiere)
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
        }
        
        await sql`COMMIT`;

        return NextResponse.json({ 
          success: true, 
          message: crossBarber 
            ? `Appuntamenti scambiati con successo tra ${booking1.barber_name} e ${booking2.barber_name}`
            : 'Appuntamenti scambiati con successo',
          type: 'swap',
          crossBarber,
          bookings: {
            booking1: {
              id: booking1Id,
              newDate: booking2.date,
              newTime: booking2.time,
              newBarber: crossBarber ? booking2.barber_name : booking1.barber_name
            },
            booking2: {
              id: booking2Id,
              newDate: booking1.date,
              newTime: booking1.time,
              newBarber: crossBarber ? booking1.barber_name : booking2.barber_name
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