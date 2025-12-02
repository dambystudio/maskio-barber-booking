import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function checkBarberNames() {
  try {
    console.log('🔍 Controllo nomi barbieri nelle prenotazioni...\n');
    
    // Prendi tutti i nomi barbieri unici
    const barberNames = await sql`
      SELECT DISTINCT barber_name, COUNT(*) as count
      FROM bookings
      WHERE status != 'cancelled'
      GROUP BY barber_name
      ORDER BY count DESC
    `;
    
    console.log('📊 Nomi barbieri trovati nel database:');
    console.log('=====================================');
    barberNames.forEach(row => {
      console.log(`Barber Name: "${row.barber_name}" | Prenotazioni: ${row.count}`);
      console.log(`  - Lunghezza: ${row.barber_name.length} caratteri`);
      console.log(`  - toLowerCase(): "${row.barber_name.toLowerCase()}"`);
      console.log(`  - includes('michele'): ${row.barber_name.toLowerCase().includes('michele')}`);
      console.log(`  - includes('fabio'): ${row.barber_name.toLowerCase().includes('fabio')}`);
      console.log('');
    });
    
    // Prendi alcuni esempi di prenotazioni
    console.log('\n📋 Esempio di 5 prenotazioni recenti:');
    console.log('====================================');
    const examples = await sql`
      SELECT id, barber_name, customer_name, booking_date, booking_time, status
      FROM bookings
      ORDER BY created_at DESC
      LIMIT 5
    `;
    
    examples.forEach(booking => {
      console.log(`ID: ${booking.id}`);
      console.log(`  Barber: "${booking.barber_name}"`);
      console.log(`  Cliente: ${booking.customer_name}`);
      console.log(`  Data: ${booking.booking_date} alle ${booking.booking_time}`);
      console.log(`  Status: ${booking.status}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Errore:', error);
  }
}

checkBarberNames();
