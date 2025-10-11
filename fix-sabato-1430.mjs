import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function fixSabato1430() {
  console.log('🔧 Fix orario 14:30 nei sabati...\n');

  try {
    // 1. Trova tutti i record di sabati senza 14:30
    console.log('1️⃣ Cerco sabati senza 14:30 negli available_slots...\n');
    
    const schedules = await sql`
      SELECT id, barber_id, date, available_slots
      FROM barber_schedules
      WHERE date >= '2025-10-25'
      AND EXTRACT(DOW FROM date::date) = 6
      AND available_slots NOT LIKE '%14:30%'
      ORDER BY date
    `;

    if (schedules.length === 0) {
      console.log('✅ Nessun sabato da correggere trovato!');
      return;
    }

    console.log(`⚠️ Trovati ${schedules.length} sabati da correggere:\n`);
    schedules.forEach(s => {
      console.log(`   ${s.date} - ${s.barber_id}`);
    });

    console.log('\n2️⃣ Aggiorno i record aggiungendo 14:30...\n');

    let fixed = 0;
    for (const schedule of schedules) {
      const slots = JSON.parse(schedule.available_slots);
      
      // Trova la posizione corretta per inserire 14:30 (dopo 12:30 e prima di 15:00)
      const index = slots.findIndex(slot => slot === '15:00');
      
      if (index > 0 && !slots.includes('14:30')) {
        // Inserisci 14:30 prima di 15:00
        slots.splice(index, 0, '14:30');
        
        const newSlots = JSON.stringify(slots);
        
        await sql`
          UPDATE barber_schedules
          SET available_slots = ${newSlots},
              updated_at = NOW()
          WHERE id = ${schedule.id}
        `;
        
        console.log(`   ✅ ${schedule.date} - ${schedule.barber_id} aggiornato`);
        fixed++;
      }
    }

    console.log(`\n✅ Totale sabati corretti: ${fixed}/${schedules.length}`);

    // 3. Verifica
    console.log('\n3️⃣ Verifica finale...\n');
    const verification = await sql`
      SELECT date, barber_id, available_slots
      FROM barber_schedules
      WHERE date >= '2025-10-25'
      AND EXTRACT(DOW FROM date::date) = 6
      ORDER BY date
      LIMIT 5
    `;

    verification.forEach(v => {
      const slots = JSON.parse(v.available_slots);
      const has1430 = slots.includes('14:30');
      console.log(`   ${v.date} - ${v.barber_id}: 14:30 presente? ${has1430 ? '✅ SÌ' : '❌ NO'}`);
    });

    console.log('\n🎉 Fix completato!');

  } catch (error) {
    console.error('❌ Errore:', error);
  }
}

fixSabato1430();
