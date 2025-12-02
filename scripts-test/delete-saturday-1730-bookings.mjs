import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function deleteBookings1730Saturday() {
  try {
    console.log('🗑️  Eliminazione appuntamenti alle 17:30 di sabato...\n');
    
    // Trova appuntamenti alle 17:30 di sabato
    const bookings = await sql`
      SELECT b.id, b.date, b.time, b.customer_name, br.name as barber_name
      FROM bookings b
      JOIN barbers br ON b.barber_id = br.id
      WHERE b.time = '17:30'
      AND EXTRACT(DOW FROM b.date::date) = 6
      AND b.status != 'cancelled'
      ORDER BY b.date ASC
    `;
    
    if (bookings.length === 0) {
      console.log('✅ Nessun appuntamento alle 17:30 di sabato da eliminare');
      return;
    }
    
    console.log(`Trovati ${bookings.length} appuntamenti da cancellare:\n`);
    
    for (const booking of bookings) {
      console.log(`📌 ${booking.date} ${booking.time}`);
      console.log(`   Barbiere: ${booking.barber_name}`);
      console.log(`   Cliente: ${booking.customer_name}`);
      console.log(`   ID: ${booking.id}`);
      
      // Cancella l'appuntamento
      await sql`
        UPDATE bookings
        SET status = 'cancelled'
        WHERE id = ${booking.id}
      `;
      
      console.log(`   ✅ Cancellato\n`);
    }
    
    console.log(`✨ Completato! ${bookings.length} appuntamenti cancellati`);
    
  } catch (error) {
    console.error('❌ Errore:', error);
  }
}

deleteBookings1730Saturday();
