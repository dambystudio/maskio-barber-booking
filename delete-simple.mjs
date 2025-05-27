// Script semplice per eliminare le prenotazioni
import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

console.log('🗑️ Eliminazione prenotazioni in corso...');

try {
  // Prima verifica quante prenotazioni ci sono
  const count = await sql`SELECT COUNT(*) as total FROM bookings`;
  console.log(`📊 Prenotazioni trovate: ${count[0].total}`);
  
  if (count[0].total > 0) {
    // Elimina tutte le prenotazioni
    const result = await sql`DELETE FROM bookings`;
    console.log(`✅ Eliminate ${count[0].total} prenotazioni!`);
    
    // Verifica
    const verify = await sql`SELECT COUNT(*) as remaining FROM bookings`;
    console.log(`🔍 Prenotazioni rimanenti: ${verify[0].remaining}`);
  } else {
    console.log('ℹ️ Nessuna prenotazione da eliminare');
  }
} catch (error) {
  console.error('❌ Errore:', error);
}
