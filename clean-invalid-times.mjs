import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';

// Carica le variabili d'ambiente
config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function cleanInvalidTimeSlots() {
  try {
    console.log('🧹 Rimuovendo prenotazioni con orari non validi...');
    
    // Orari da rimuovere
    const invalidTimes = ['14:00', '14:30', '18:00', '18:30'];
    
    for (const time of invalidTimes) {
      const result = await sql`
        DELETE FROM bookings 
        WHERE time = ${time} AND date = '2025-06-18'
      `;
      
      console.log(`✅ Rimosse ${result.count || 0} prenotazioni per le ore ${time}`);
    }
    
    console.log('\n🎉 Pulizia completata!');
    console.log('Ora gli orari validi per il 18 giugno sono:');
    console.log('- Mattina: 09:00-12:30');
    console.log('- Pomeriggio: 15:00-17:30');
    
  } catch (error) {
    console.error('❌ Errore durante la pulizia:', error);
  }
}

cleanInvalidTimeSlots();
