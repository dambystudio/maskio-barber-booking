import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function fixMondaySlots() {
  try {
    console.log('🔧 FIX SLOT LUNEDÌ 18:00\n');

    // Ottieni tutti gli schedule del lunedì (day of week = 1) aperti
    const mondaySchedules = await sql`
      SELECT 
        bs.id,
        bs.barber_id,
        b.name,
        b.email,
        bs.date,
        bs.available_slots,
        bs.day_off
      FROM barber_schedules bs
      JOIN barbers b ON bs.barber_id = b.id
      WHERE EXTRACT(DOW FROM bs.date::date) = 1
      AND bs.day_off = false
      AND bs.date >= '2025-11-18'
      AND bs.date <= '2026-01-31'
      ORDER BY bs.date, b.name
    `;

    console.log(`📋 Trovati ${mondaySchedules.length} lunedì aperti\n`);

    let fixed = 0;
    let skipped = 0;

    for (const schedule of mondaySchedules) {
      console.log(`📅 ${schedule.date} - ${schedule.name}:`);

      if (!schedule.available_slots || schedule.available_slots.trim() === '') {
        console.log(`   ⚠️ Nessuno slot - skip (gestito separatamente)`);
        skipped++;
        continue;
      }

      let slots = JSON.parse(schedule.available_slots);

      // Se manca 18:00, aggiungilo
      if (!slots.includes('18:00')) {
        slots.push('18:00');
        slots.sort(); // Ordina gli slot

        await sql`
          UPDATE barber_schedules
          SET available_slots = ${JSON.stringify(slots)}
          WHERE id = ${schedule.id}
        `;

        console.log(`   ✅ Aggiunto 18:00 (slots: ${slots.join(', ')})`);
        fixed++;
      } else {
        console.log(`   ✓ Già presente 18:00`);
        skipped++;
      }
    }

    // Fix speciale per Nicolò 29 dicembre (slots vuoti)
    console.log('\n🔧 FIX SPECIALE: Nicolò 29 dicembre\n');

    const nicoloSchedule = await sql`
      SELECT bs.id, bs.available_slots
      FROM barber_schedules bs
      JOIN barbers b ON bs.barber_id = b.id
      WHERE b.email = 'giorgiodesa00@gmail.com'
      AND bs.date = '2025-12-29'
      AND bs.day_off = false
    `;

    if (nicoloSchedule.length > 0) {
      // Nicolò ha solo pomeriggio: 15:00-18:00
      const nicoloAfternoonSlots = ['15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00'];

      await sql`
        UPDATE barber_schedules
        SET available_slots = ${JSON.stringify(nicoloAfternoonSlots)}
        WHERE id = ${nicoloSchedule[0].id}
      `;

      console.log(`✅ Nicolò 29 dicembre: aggiunti slot ${nicoloAfternoonSlots.join(', ')}`);
      fixed++;
    } else {
      console.log('⚠️ Schedule non trovato per Nicolò 29 dicembre');
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 RIEPILOGO');
    console.log('='.repeat(60));
    console.log(`✅ Slot 18:00 aggiunti: ${fixed}`);
    console.log(`⏭️  Saltati (già presenti o vuoti): ${skipped}`);
    console.log('='.repeat(60));
    console.log('\n✨ Fix completato!\n');

  } catch (error) {
    console.error('❌ Errore:', error);
    throw error;
  }
}

fixMondaySlots();
