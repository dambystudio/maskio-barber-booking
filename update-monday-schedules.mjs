// Script per aggiornare lunedì: Michele pomeriggio con 18:00, Fabio chiuso
import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

const sql = neon(process.env.DATABASE_URL);

async function updateMondaySchedules() {
  console.log('🔧 Aggiornamento orari lunedì...\n');

  try {
    // 1. Trova i barbieri
    const barbers = await sql`
      SELECT id, name, email FROM barbers
      WHERE id IN ('fabio', 'michele')
    `;

    const fabio = barbers.find(b => b.id === 'fabio');
    const michele = barbers.find(b => b.id === 'michele');

    console.log('👥 Barbieri trovati:');
    console.log(`   - Fabio: ${fabio.email}`);
    console.log(`   - Michele: ${michele.email}\n`);

    // 2. Trova tutti i lunedì futuri
    console.log('📅 Cerco tutti i lunedì dal oggi in poi...\n');
    
    const mondays = await sql`
      SELECT id, barber_id, date, available_slots, day_off
      FROM barber_schedules
      WHERE EXTRACT(DOW FROM date::date) = 1
      AND date::date >= CURRENT_DATE
      ORDER BY date, barber_id
    `;

    console.log(`   Trovati ${mondays.length} record di lunedì\n`);

    // 3. Aggiorna Fabio: tutti i lunedì day_off = true
    console.log('🔧 Aggiorno Fabio: tutti i lunedì chiuso...\n');
    
    const fabioMondays = mondays.filter(m => m.barber_id === fabio.id);
    let fabioUpdated = 0;

    for (const monday of fabioMondays) {
      if (!monday.day_off) {
        await sql`
          UPDATE barber_schedules
          SET day_off = true,
              available_slots = '[]',
              updated_at = NOW()
          WHERE id = ${monday.id}
        `;
        console.log(`   ✅ ${monday.date}: Fabio impostato come chiuso`);
        fabioUpdated++;
      }
    }

    console.log(`\n   Fabio: ${fabioUpdated} lunedì aggiornati\n`);

    // 4. Aggiorna Michele: pomeriggio 15:00-18:00
    console.log('🔧 Aggiorno Michele: pomeriggio 15:00-18:00...\n');
    
    const micheleMondays = mondays.filter(m => m.barber_id === michele.id);
    const correctSlots = ['15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00'];
    let micheleUpdated = 0;

    for (const monday of micheleMondays) {
      const currentSlots = monday.day_off ? [] : JSON.parse(monday.available_slots);
      
      // Verifica se gli slot sono corretti
      const slotsCorrect = 
        currentSlots.length === correctSlots.length &&
        correctSlots.every(slot => currentSlots.includes(slot));

      if (!slotsCorrect || monday.day_off) {
        await sql`
          UPDATE barber_schedules
          SET day_off = false,
              available_slots = ${JSON.stringify(correctSlots)},
              updated_at = NOW()
          WHERE id = ${monday.id}
        `;
        console.log(`   ✅ ${monday.date}: Michele aggiornato (15:00-18:00)`);
        micheleUpdated++;
      } else {
        console.log(`   ℹ️ ${monday.date}: Michele già corretto`);
      }
    }

    console.log(`\n   Michele: ${micheleUpdated} lunedì aggiornati\n`);

    // 5. Verifica finale
    console.log('='.repeat(70));
    console.log('📊 Verifica finale:\n');

    const verification = await sql`
      SELECT b.name, bs.date, bs.day_off, bs.available_slots
      FROM barber_schedules bs
      JOIN barbers b ON bs.barber_id = b.id
      WHERE EXTRACT(DOW FROM bs.date::date) = 1
      AND bs.date::date >= CURRENT_DATE
      AND b.id IN ('fabio', 'michele')
      ORDER BY bs.date, b.id
      LIMIT 10
    `;

    verification.forEach(v => {
      const slots = v.day_off ? [] : JSON.parse(v.available_slots);
      const slotRange = slots.length > 0 
        ? `${slots[0]}-${slots[slots.length - 1]}` 
        : 'CHIUSO';
      
      console.log(`   ${v.date} - ${v.name}: ${slotRange} (${slots.length} slot)`);
    });

    console.log('\n🎉 Aggiornamento completato!');

  } catch (error) {
    console.error('❌ Errore:', error);
  }
}

updateMondaySchedules();
