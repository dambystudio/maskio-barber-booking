import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

const sql = neon(process.env.DATABASE_URL);

async function fixAllNicoloSlots() {
  try {
    console.log('🔧 FIX TUTTI GLI SLOT DI NICOLÒ (AGGIUNGI 18:00)\n');
    
    // Get all Nicolò's schedules (not day_off, not Sundays, future dates only)
    const nicoloSchedules = await sql`
      SELECT id, date, available_slots, day_off
      FROM barber_schedules
      WHERE barber_id = 'nicolo'
      AND day_off = false
      AND EXTRACT(DOW FROM date::date) != 0
      AND date::date >= CURRENT_DATE
      ORDER BY date
    `;
    
    console.log(`Trovati ${nicoloSchedules.length} schedule da verificare\n`);
    
    let updatedCount = 0;
    let alreadyCorrectCount = 0;
    
    // Date che dovrebbero rimanere solo mattina (23-24 dicembre)
    const morningOnlyDates = ['2025-12-23', '2025-12-24'];
    
    for (const schedule of nicoloSchedules) {
      const slots = schedule.available_slots ? JSON.parse(schedule.available_slots) : [];
      const has18 = slots.includes('18:00');
      
      // Se è una data solo mattina, salta
      if (morningOnlyDates.includes(schedule.date)) {
        console.log(`⏭️  ${schedule.date}: Solo mattina (23-24 dic) - non modifico`);
        continue;
      }
      
      // Se ha meno di 8 slot, è probabilmente solo mattina (come 22 dic domenica)
      if (slots.length < 8 && slots.length > 0) {
        const lastSlot = slots[slots.length - 1];
        if (lastSlot <= '12:30') {
          console.log(`⏭️  ${schedule.date}: Solo mattina (${slots.length} slot fino a ${lastSlot}) - non modifico`);
          continue;
        }
      }
      
      if (!has18) {
        // Aggiungi 18:00
        slots.push('18:00');
        slots.sort();
        
        await sql`
          UPDATE barber_schedules
          SET available_slots = ${JSON.stringify(slots)},
              updated_at = NOW()
          WHERE id = ${schedule.id}
        `;
        
        const dateObj = new Date(schedule.date);
        const dayName = dateObj.toLocaleDateString('it-IT', { weekday: 'short' });
        console.log(`✅ ${schedule.date} (${dayName}): aggiunto 18:00 (ora ${slots.length} slot)`);
        updatedCount++;
      } else {
        alreadyCorrectCount++;
      }
    }
    
    console.log('\n📊 RISULTATI:');
    console.log(`   Aggiornati: ${updatedCount}`);
    console.log(`   Già corretti: ${alreadyCorrectCount}`);
    console.log(`   Totale verificati: ${nicoloSchedules.length}`);
    
    // Verifica finale
    console.log('\n📋 VERIFICA FINALE - CAMPIONE CASUALE');
    console.log('─'.repeat(60));
    
    const sampleSchedules = await sql`
      SELECT date, available_slots, EXTRACT(DOW FROM date::date) as day_of_week
      FROM barber_schedules
      WHERE barber_id = 'nicolo'
      AND day_off = false
      AND date::date >= CURRENT_DATE
      ORDER BY date
      LIMIT 10
    `;
    
    for (const schedule of sampleSchedules) {
      const slots = schedule.available_slots ? JSON.parse(schedule.available_slots) : [];
      const has18 = slots.includes('18:00');
      const lastSlot = slots.length > 0 ? slots[slots.length - 1] : 'NESSUNO';
      const dayNames = ['dom', 'lun', 'mar', 'mer', 'gio', 'ven', 'sab'];
      const dayName = dayNames[schedule.day_of_week];
      
      const status = has18 ? '✅' : (lastSlot <= '12:30' ? '⏭️  MATTINA' : '❌');
      console.log(`${status} ${schedule.date} (${dayName}): ${slots.length} slot, ultimo: ${lastSlot}`);
    }
    
    console.log('\n🏁 Fix completato!');
    
  } catch (error) {
    console.error('❌ Errore:', error.message);
    console.error(error);
    process.exit(1);
  }
}

fixAllNicoloSlots();
