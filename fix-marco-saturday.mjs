import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://neondb_owner:npg_Wj09qDUmTsxE@ep-old-forest-a2ur722g-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require';
const sql = neon(DATABASE_URL);

async function fixMarcoSaturday() {
  console.log('🔧 Fix Marco sabato 2025-09-06...\n');

  try {
    const saturdayDate = '2025-09-06';
    
    // Controlla lo stato attuale
    console.log('1. 📊 Stato attuale:');
    const current = await sql`
      SELECT id, available_slots, updated_at
      FROM barber_schedules
      WHERE barber_id = 'marco'
      AND date = ${saturdayDate}
    `;

    if (current.length > 0) {
      const currentSlots = JSON.parse(current[0].available_slots);
      console.log(`   Slot attuali: ${currentSlots.join(', ')}`);
      console.log(`   Ultimo aggiornamento: ${current[0].updated_at}`);
      
      // Nuovi slot corretti per Marco sabato
      const newSlots = ['09:00', '10:00', '11:00', '12:00', '14:30', '15:30', '16:30'];
      
      console.log(`\n2. 🔄 Aggiornamento a nuovi slot:`);
      console.log(`   Nuovi slot: ${newSlots.join(', ')}`);
      
      // Aggiorna il record
      await sql`
        UPDATE barber_schedules
        SET available_slots = ${JSON.stringify(newSlots)},
            updated_at = NOW()
        WHERE id = ${current[0].id}
      `;
      
      console.log('   ✅ Aggiornamento completato!');
      
      // Verifica
      console.log(`\n3. ✅ Verifica post-aggiornamento:`);
      const updated = await sql`
        SELECT available_slots, updated_at
        FROM barber_schedules
        WHERE barber_id = 'marco'
        AND date = ${saturdayDate}
      `;
      
      const updatedSlots = JSON.parse(updated[0].available_slots);
      console.log(`   Slot aggiornati: ${updatedSlots.join(', ')}`);
      console.log(`   Nuovo timestamp: ${updated[0].updated_at}`);
      
      const has1430 = updatedSlots.includes('14:30');
      console.log(`   🕐 14:30 presente: ${has1430 ? 'SÌ ✅' : 'NO ❌'}`);
      
    } else {
      console.log('   ❌ Nessun record trovato per questo sabato');
    }

    // Aggiorniamo anche tutti gli altri sabati di Marco che potrebbero avere lo stesso problema
    console.log(`\n4. 🔄 Controllo e fix altri sabati Marco:`);
    
    const allSaturdays = await sql`
      SELECT id, date, available_slots
      FROM barber_schedules
      WHERE barber_id = 'marco'
      AND date::date >= CURRENT_DATE
      AND EXTRACT(DOW FROM date::date) = 6
      ORDER BY date::date
    `;

    console.log(`   Trovati ${allSaturdays.length} sabati da controllare:`);
    
    let fixedCount = 0;
    for (const saturday of allSaturdays) {
      const currentSlots = JSON.parse(saturday.available_slots);
      const expectedSlots = ['09:00', '10:00', '11:00', '12:00', '14:30', '15:30', '16:30'];
      
      // Controlla se gli slot sono corretti
      const isCorrect = JSON.stringify(currentSlots.sort()) === JSON.stringify(expectedSlots.sort());
      
      console.log(`   📅 ${saturday.date}: ${isCorrect ? '✅ OK' : '❌ DA FIXARE'}`);
      
      if (!isCorrect) {
        await sql`
          UPDATE barber_schedules
          SET available_slots = ${JSON.stringify(expectedSlots)},
              updated_at = NOW()
          WHERE id = ${saturday.id}
        `;
        fixedCount++;
        console.log(`      🔧 Aggiornato: ${currentSlots.join(', ')} → ${expectedSlots.join(', ')}`);
      }
    }
    
    console.log(`\n📊 Risultato finale:`);
    console.log(`   ✅ Sabati controllati: ${allSaturdays.length}`);
    console.log(`   🔧 Sabati corretti: ${fixedCount}`);
    console.log(`   🎯 Marco sabato 14:30 ora disponibile!`);

  } catch (error) {
    console.error('❌ Errore durante il fix:', error);
  }
}

fixMarcoSaturday();
