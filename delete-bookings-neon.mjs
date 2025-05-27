// Delete all bookings from Neon database
import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function deleteAllBookings() {
  try {
    console.log('🗑️ Eliminazione di tutte le prenotazioni...');
    
    // First check how many bookings exist
    const countResult = await sql`SELECT COUNT(*) FROM bookings`;
    const totalBookings = parseInt(countResult[0].count);
    
    console.log(`📊 Trovate ${totalBookings} prenotazioni da eliminare`);
    
    if (totalBookings === 0) {
      console.log('✅ Nessuna prenotazione da eliminare');
      return;
    }
    
    // Delete all bookings
    const deleteResult = await sql`DELETE FROM bookings`;
    
    console.log(`✅ Eliminate con successo ${totalBookings} prenotazioni!`);
    
    // Verify deletion
    const verifyResult = await sql`SELECT COUNT(*) FROM bookings`;
    const remainingBookings = parseInt(verifyResult[0].count);
    
    if (remainingBookings === 0) {
      console.log('✅ Verifica completata: tutte le prenotazioni sono state eliminate');
    } else {
      console.log(`⚠️ Attenzione: rimangono ancora ${remainingBookings} prenotazioni`);
    }
    
  } catch (error) {
    console.error('❌ Errore durante l\'eliminazione delle prenotazioni:', error);
  }
}

// Run the deletion
deleteAllBookings();
