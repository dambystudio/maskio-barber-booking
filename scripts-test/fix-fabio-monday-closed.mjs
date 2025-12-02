import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function fixFabioMonday() {
  try {
    console.log('🔧 Impostazione Fabio chiuso il lunedì...\n');
    
    // Trova Fabio
    const barbers = await sql`
      SELECT id, name FROM barbers WHERE name ILIKE '%fabio%'
    `;
    
    if (barbers.length === 0) {
      console.log('❌ Fabio non trovato');
      return;
    }
    
    const fabio = barbers[0];
    console.log(`✅ Fabio trovato: ${fabio.name} (ID: ${fabio.id})\n`);
    
    // Trova tutti i lunedì
    const mondays = await sql`
      SELECT id, date, available_slots
      FROM barber_schedules
      WHERE barber_id = ${fabio.id}
      AND EXTRACT(DOW FROM date::date) = 1
      ORDER BY date ASC
    `;
    
    console.log(`📅 Trovati ${mondays.length} lunedì da chiudere\n`);
    
    let updated = 0;
    for (const monday of mondays) {
      const currentSlots = JSON.parse(monday.available_slots);
      
      // Chiudi solo se ha slot disponibili
      if (currentSlots.length > 0) {
        await sql`
          UPDATE barber_schedules
          SET available_slots = ${JSON.stringify([])},
              unavailable_slots = ${JSON.stringify([])},
              day_off = true
          WHERE id = ${monday.id}
        `;
        
        console.log(`✅ Chiuso: ${monday.date} (aveva ${currentSlots.length} slot)`);
        updated++;
      } else {
        console.log(`⏭️  Skip: ${monday.date} (già chiuso)`);
      }
    }
    
    console.log(`\n✨ Completato! ${updated}/${mondays.length} lunedì chiusi per Fabio`);
    
  } catch (error) {
    console.error('❌ Errore:', error);
  }
}

fixFabioMonday();
