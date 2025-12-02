import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function fixSaturdaySlots() {
  try {
    console.log('🔧 Correzione slot sabato (aggiunta 14:30)...\n');
    
    // Slot corretti per il sabato
    const correctSlots = [
      '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', // Mattina
      '14:30', '15:00', '15:30', '16:00', '16:30', '17:00' // Pomeriggio (con 14:30, senza 17:30)
    ];
    
    // Trova tutti i barbieri
    const barbers = await sql`SELECT id, name FROM barbers`;
    
    for (const barber of barbers) {
      console.log(`\n${'='.repeat(50)}`);
      console.log(`👤 ${barber.name}`);
      console.log('='.repeat(50));
      
      // Trova tutti i sabati
      const saturdays = await sql`
        SELECT id, date, available_slots
        FROM barber_schedules
        WHERE barber_id = ${barber.id}
        AND EXTRACT(DOW FROM date::date) = 6
        ORDER BY date ASC
      `;
      
      console.log(`📅 Trovati ${saturdays.length} sabati da aggiornare\n`);
      
      let updated = 0;
      for (const saturday of saturdays) {
        const currentSlots = JSON.parse(saturday.available_slots);
        
        // Controlla se manca 14:30 o ha 17:30
        const missing1430 = !currentSlots.includes('14:30');
        const has1730 = currentSlots.includes('17:30');
        
        if (missing1430 || has1730) {
          await sql`
            UPDATE barber_schedules
            SET available_slots = ${JSON.stringify(correctSlots)}
            WHERE id = ${saturday.id}
          `;
          
          console.log(`✅ Aggiornato: ${saturday.date}`);
          if (missing1430) console.log(`   + Aggiunto 14:30`);
          if (has1730) console.log(`   - Rimosso 17:30`);
          updated++;
        } else {
          console.log(`⏭️  Skip: ${saturday.date} (già corretto)`);
        }
      }
      
      console.log(`\n✨ ${barber.name}: ${updated}/${saturdays.length} sabati aggiornati`);
    }
    
    console.log(`\n\n${'='.repeat(50)}`);
    console.log('📋 Slot corretti applicati:');
    console.log('='.repeat(50));
    console.log(`Mattina: 9:00-12:30 (8 slot)`);
    console.log(`Pomeriggio: 14:30, 15:00-17:00 (6 slot)`);
    console.log(`Total: 14 slot`);
    console.log(`✅ Include: 14:30`);
    console.log(`❌ Escluso: 17:30`);
    
  } catch (error) {
    console.error('❌ Errore:', error);
  }
}

fixSaturdaySlots();
