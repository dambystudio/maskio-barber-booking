#!/usr/bin/env node
import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env.local') });

const sql = neon(process.env.DATABASE_URL);

async function fixSchedulesDirectly() {
  try {
    console.log('✅ Connesso al database\n');

    // Slot lunedì (09:00-12:30 + 15:00-18:00)
    const mondaySlots = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00'];

    // Slot mar-ven (09:00-12:30 + 15:00-17:30)
    const weekdaySlots = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'];

    const updates = [
      { date: '2025-12-22', slots: mondaySlots, day: 'Lunedì' },
      { date: '2025-12-23', slots: weekdaySlots, day: 'Martedì' },
      { date: '2025-12-24', slots: weekdaySlots, day: 'Mercoledì' },
      { date: '2025-12-31', slots: weekdaySlots, day: 'Mercoledì' }
    ];

    console.log('📋 AGGIORNAMENTO SCHEDULE\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const barbers = ['fabio', 'michele', 'nicolo'];

    for (const { date, slots, day } of updates) {
      console.log(`${date} (${day}):`);
      
      for (const barberId of barbers) {
        const result = await sql`
          UPDATE barber_schedules
          SET available_slots = ${slots}
          WHERE barber_id = ${barberId} AND date = ${date}
          RETURNING barber_id, available_slots
        `;
        
        if (result.length > 0) {
          const returnedSlots = result[0].available_slots;
          console.log(`   ✅ ${barberId}: ${returnedSlots.length} slot (${returnedSlots[0]} - ${returnedSlots[returnedSlots.length-1]})`);
        } else {
          console.log(`   ⚠️  ${barberId}: schedule non trovato, lo creo...`);
          
          await sql`
            INSERT INTO barber_schedules (barber_id, date, available_slots, unavailable_slots, day_off)
            VALUES (${barberId}, ${date}, ${slots}, ${[]}, false)
          `;
          console.log(`   ✅ ${barberId}: schedule creato con ${slots.length} slot`);
        }
      }
      console.log('');
    }

    // Verifica finale
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔍 VERIFICA FINALE\n');

    for (const { date } of updates) {
      console.log(`${date}:`);
      
      const schedules = await sql`
        SELECT barber_id, array_length(available_slots, 1) as slot_count, available_slots[1] as first_slot, available_slots[array_length(available_slots, 1)] as last_slot
        FROM barber_schedules
        WHERE date = ${date}
        ORDER BY barber_id
      `;
      
      schedules.forEach(s => {
        console.log(`   ${s.barber_id}: ${s.slot_count || 0} slot (${s.first_slot || 'N/A'} - ${s.last_slot || 'N/A'})`);
      });
      console.log('');
    }

    console.log('✅ COMPLETATO\n');

  } catch (error) {
    console.error('❌ Errore:', error);
  }
}

fixSchedulesDirectly();
