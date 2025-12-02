import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function testBookingSwapLogic() {
  console.log('🧪 Test logica API booking-swap\n');

  try {
    // Simula i dati della richiesta
    const booking1Id = '8b03c866-bd98-4a17-a6d2-90a4e22866bb'; // Sostituisci con un ID reale
    const newDate = '2024-10-18';
    const newTime = '09:30';

    console.log('📋 Parametri test:');
    console.log('  booking1Id:', booking1Id);
    console.log('  newDate:', newDate);
    console.log('  newTime:', newTime);
    console.log('');

    // 1. Trova la prenotazione
    console.log('🔍 Step 1: Ricerca prenotazione...');
    const bookings = await sql`
      SELECT id, barber_email, booking_date, booking_time, customer_name, customer_phone, service_name, status
      FROM bookings 
      WHERE id = ${booking1Id}
    `;

    if (bookings.length === 0) {
      console.error('❌ Prenotazione non trovata');
      return;
    }

    const booking1 = bookings[0];
    console.log('✅ Prenotazione trovata:');
    console.log('  ID:', booking1.id);
    console.log('  Barbiere:', booking1.barber_email);
    console.log('  Data corrente:', booking1.booking_date);
    console.log('  Ora corrente:', booking1.booking_time);
    console.log('  Cliente:', booking1.customer_name);
    console.log('  Stato:', booking1.status);
    console.log('');

    // 2. Verifica disponibilità dello slot di destinazione
    console.log('🔍 Step 2: Verifica disponibilità slot destinazione...');
    const existingBooking = await sql`
      SELECT id, customer_name FROM bookings 
      WHERE barber_email = ${booking1.barber_email} 
      AND booking_date = ${newDate} 
      AND booking_time = ${newTime}
      AND status != 'cancelled'
      AND id != ${booking1Id}
    `;

    if (existingBooking.length > 0) {
      console.error('❌ Slot occupato da:', existingBooking[0].customer_name);
      console.error('   ID prenotazione:', existingBooking[0].id);
      return;
    }

    console.log('✅ Slot libero!');
    console.log('');

    // 3. Simula l'update (senza eseguirlo realmente)
    console.log('📝 Step 3: Query UPDATE che verrebbe eseguita:');
    console.log(`
      UPDATE bookings 
      SET booking_date = '${newDate}', booking_time = '${newTime}'
      WHERE id = '${booking1Id}'
    `);
    console.log('');

    console.log('✅ Tutti i controlli passati!');
    console.log('⚠️  L\'update NON è stato eseguito (solo test)');
    console.log('');
    console.log('🔧 Se vuoi eseguire l\'update realmente, decommenta la query nel codice.');

    // DECOMMENTARE PER ESEGUIRE L'UPDATE REALE
    // await sql`
    //   UPDATE bookings 
    //   SET booking_date = ${newDate}, booking_time = ${newTime}
    //   WHERE id = ${booking1Id}
    // `;
    // console.log('✅ Update eseguito con successo!');

  } catch (error) {
    console.error('❌ Errore durante il test:', error);
    console.error('Stack trace:', error instanceof Error ? error.stack : 'N/A');
  }
}

// Esegui il test
testBookingSwapLogic()
  .then(() => {
    console.log('\n🎉 Test completato!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Test fallito:', error);
    process.exit(1);
  });
