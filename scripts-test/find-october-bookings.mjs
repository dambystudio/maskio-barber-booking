import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function findOctoberBookings() {
  console.log('🔍 Ricerca prenotazioni del 18 ottobre 2024\n');

  try {
    const bookings = await sql`
      SELECT id, barber_email, barber_name, booking_date, booking_time, customer_name, service_name, status
      FROM bookings 
      WHERE booking_date = '2024-10-18'
      ORDER BY booking_time
    `;

    console.log(`📊 Trovate ${bookings.length} prenotazioni per il 18/10/2024\n`);

    bookings.forEach((booking, index) => {
      console.log(`${index + 1}. ID: ${booking.id}`);
      console.log(`   Cliente: ${booking.customer_name}`);
      console.log(`   Barbiere: ${booking.barber_name} (${booking.barber_email})`);
      console.log(`   Orario: ${booking.booking_time}`);
      console.log(`   Servizio: ${booking.service_name}`);
      console.log(`   Stato: ${booking.status}`);
      console.log('');
    });

    // Trova specificamente quella delle 12:30
    const booking1230 = bookings.find(b => b.booking_time === '12:30:00' || b.booking_time === '12:30');
    
    if (booking1230) {
      console.log('🎯 Prenotazione trovata alle 12:30:');
      console.log(`   ID: ${booking1230.id}`);
      console.log(`   Cliente: ${booking1230.customer_name}`);
      console.log(`   Barbiere: ${booking1230.barber_name}`);
      console.log('');
      console.log('📋 Copia questo ID per il test:');
      console.log(booking1230.id);
    } else {
      console.log('❌ Nessuna prenotazione trovata alle 12:30');
    }

  } catch (error) {
    console.error('❌ Errore:', error);
  }
}

findOctoberBookings()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
