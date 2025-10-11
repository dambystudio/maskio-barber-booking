// Script per rimuovere 17:30 da tutti i sabati esistenti
import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

const sql = neon(process.env.DATABASE_URL);

async function removeSaturday1730() {
  console.log('🔧 Rimozione slot 17:30 dai sabati...\n');

  try {
    // 1. Trova tutti i sabati con 17:30
    console.log('1️⃣ Cerco sabati con slot 17:30...\n');
    
    const saturdays = await sql`
      SELECT id, barber_id, date, available_slots
      FROM barber_schedules
      WHERE EXTRACT(DOW FROM date::date) = 6
      AND date >= CURRENT_DATE
      AND available_slots LIKE '%17:30%'
      ORDER BY date, barber_id
    `;

    if (saturdays.length === 0) {
      console.log('✅ Nessun sabato con 17:30 trovato!');
      return;
    }

    console.log(`⚠️ Trovati ${saturdays.length} sabati con 17:30:\n`);
    saturdays.forEach(s => {
      console.log(`   ${s.date} - ${s.barber_id}`);
    });

    // 2. Rimuovi 17:30 da ogni record
    console.log('\n2️⃣ Rimuovo 17:30 da tutti i sabati...\n');

    let updated = 0;
    for (const saturday of saturdays) {
      const slots = JSON.parse(saturday.available_slots);
      
      // Rimuovi 17:30
      const newSlots = slots.filter(slot => slot !== '17:30');
      
      if (newSlots.length !== slots.length) {
        await sql`
          UPDATE barber_schedules
          SET available_slots = ${JSON.stringify(newSlots)},
              updated_at = NOW()
          WHERE id = ${saturday.id}
        `;
        
        console.log(`   ✅ ${saturday.date} - ${saturday.barber_id}: rimosso 17:30`);
        updated++;
      }
    }

    console.log(`\n✅ Aggiornati ${updated}/${saturdays.length} sabati`);

    // 3. Verifica
    console.log('\n3️⃣ Verifica finale...\n');
    const verification = await sql`
      SELECT date, barber_id, available_slots
      FROM barber_schedules
      WHERE EXTRACT(DOW FROM date::date) = 6
      AND date >= CURRENT_DATE
      ORDER BY date, barber_id
      LIMIT 5
    `;

    verification.forEach(v => {
      const slots = JSON.parse(v.available_slots);
      const has1730 = slots.includes('17:30');
      const lastSlot = slots[slots.length - 1];
      console.log(`   ${v.date} - ${v.barber_id}: ultimo slot = ${lastSlot} ${has1730 ? '❌ ERRORE' : '✅'}`);
    });

    console.log('\n🎉 Operazione completata!');

  } catch (error) {
    console.error('❌ Errore:', error);
  }
}

removeSaturday1730();
