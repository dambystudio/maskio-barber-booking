#!/usr/bin/env node
import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env.local') });

async function fixChristmasDates() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connesso al database\n');

    const nicoloId = 'nicolo';

    // Slot mattutini (9:00 - 12:30)
    const morningSlots = [
      '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30'
    ];

    // Slot pomeridiani (15:00 - 17:30)
    const afternoonSlots = [
      '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
    ];

    // Slot intera giornata
    const fullDaySlots = [...morningSlots, ...afternoonSlots];

    console.log('🎄 Correzione date natalizie per Nicolò...\n');

    const updates = [
      { date: '2024-12-23', slots: morningSlots, desc: 'SOLO MATTINA' },
      { date: '2024-12-24', slots: morningSlots, desc: 'SOLO MATTINA' },
      { date: '2024-12-30', slots: fullDaySlots, desc: 'TUTTO IL GIORNO' },
      { date: '2024-12-31', slots: morningSlots, desc: 'SOLO MATTINA' }
    ];

    for (const update of updates) {
      const result = await client.query(
        `UPDATE barber_schedules 
         SET available_slots = $1, day_off = false
         WHERE barber_id = $2 AND date = $3
         RETURNING date`,
        [JSON.stringify(update.slots), nicoloId, update.date]
      );

      if (result.rows.length > 0) {
        const dateObj = new Date(update.date + 'T12:00:00');
        const dayName = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'][dateObj.getDay()];
        console.log(`✅ ${update.date} (${dayName}): ${update.desc} - ${update.slots.length} slot`);
      } else {
        console.log(`❌ ${update.date}: Non trovato`);
      }
    }

    console.log('\n✅ Aggiornamento completato!\n');

    // Verifica finale
    console.log('📋 VERIFICA FINALE:\n');
    for (const update of updates) {
      const check = await client.query(
        `SELECT available_slots FROM barber_schedules 
         WHERE barber_id = $1 AND date = $2`,
        [nicoloId, update.date]
      );

      if (check.rows.length > 0) {
        const slots = JSON.parse(check.rows[0].available_slots);
        console.log(`   ${update.date}: ${slots.length} slot (${slots[0]} - ${slots[slots.length - 1]})`);
      }
    }

  } catch (error) {
    console.error('❌ Errore:', error);
  } finally {
    await client.end();
  }
}

fixChristmasDates();
