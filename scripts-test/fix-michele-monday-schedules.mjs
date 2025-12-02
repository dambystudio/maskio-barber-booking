import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function fixMondaySchedules() {
  try {
    console.log('🔧 Correzione schedule lunedì per Michele...\n');
    
    // Slot corretti per Michele il lunedì
    const correctSlots = ['15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00'];
    
    // Trova Michele
    const barbers = await sql`
      SELECT id, name FROM barbers WHERE name ILIKE '%michele%'
    `;
    
    if (barbers.length === 0) {
      console.log('❌ Michele non trovato');
      return;
    }
    
    const michele = barbers[0];
    console.log(`✅ Michele trovato: ${michele.name} (ID: ${michele.id})\n`);
    
    // Trova tutti i lunedì
    const mondays = await sql`
      SELECT id, date, available_slots
      FROM barber_schedules
      WHERE barber_id = ${michele.id}
      AND EXTRACT(DOW FROM date::date) = 1
      ORDER BY date ASC
    `;
    
    console.log(`📅 Trovati ${mondays.length} lunedì da aggiornare\n`);
    
    // Aggiorna ogni lunedì
    let updated = 0;
    for (const monday of mondays) {
      const currentSlots = JSON.parse(monday.available_slots);
      
      // Controlla se ha bisogno di essere aggiornato
      const needsUpdate = 
        currentSlots.length !== 7 || 
        !currentSlots.includes('18:00') ||
        currentSlots.some(slot => {
          const hour = parseInt(slot.split(':')[0]);
          return hour >= 9 && hour <= 12;
        });
      
      if (needsUpdate) {
        await sql`
          UPDATE barber_schedules
          SET available_slots = ${JSON.stringify(correctSlots)},
              unavailable_slots = ${JSON.stringify([])},
              day_off = false
          WHERE id = ${monday.id}
        `;
        
        console.log(`✅ Aggiornato: ${monday.date}`);
        console.log(`   Da: ${currentSlots.length} slot → A: 7 slot`);
        console.log(`   Nuovo: ${correctSlots.join(', ')}`);
        updated++;
      } else {
        console.log(`⏭️  Skip: ${monday.date} (già corretto)`);
      }
    }
    
    console.log(`\n✨ Completato! ${updated}/${mondays.length} lunedì aggiornati`);
    console.log(`\n📋 Slot corretti applicati:`);
    console.log(`   ${correctSlots.join(', ')}`);
    
  } catch (error) {
    console.error('❌ Errore:', error);
  }
}

fixMondaySchedules();
