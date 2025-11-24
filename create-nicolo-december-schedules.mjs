#!/usr/bin/env node
import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env.local') });

async function createDecemberSchedules() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connesso al database\n');

    const nicoloId = 'nicolo';

    // Slot standard per Nicolò (solo pomeriggio, come configurato)
    const afternoonSlots = [
      '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
    ];

    // Date di dicembre 2024 da configurare
    const decemberDates = [];
    for (let day = 1; day <= 31; day++) {
      decemberDates.push(`2024-12-${day.toString().padStart(2, '0')}`);
    }

    console.log('🗓️  Creazione schedules per Dicembre 2024...\n');

    let created = 0;
    let skipped = 0;

    for (const date of decemberDates) {
      const dateObj = new Date(date + 'T12:00:00');
      const dayOfWeek = dateObj.getDay();
      const dayName = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'][dayOfWeek];

      // Controlla se lo schedule esiste già
      const existing = await client.query(
        'SELECT id FROM barber_schedules WHERE barber_id = $1 AND date = $2',
        [nicoloId, date]
      );

      if (existing.rows.length > 0) {
        console.log(`  ⏭️  ${date} (${dayName}): già esistente`);
        skipped++;
        continue;
      }

      // Determina se è giorno di chiusura ricorrente
      const isRecurringClosure = dayOfWeek === 0 || dayOfWeek === 4; // Domenica o Giovedì

      if (isRecurringClosure) {
        // Crea schedule con day_off = true
        await client.query(
          `INSERT INTO barber_schedules (barber_id, date, available_slots, unavailable_slots, day_off)
           VALUES ($1, $2, $3, $4, $5)`,
          [nicoloId, date, JSON.stringify([]), JSON.stringify([]), true]
        );
        console.log(`  🚫 ${date} (${dayName}): day_off (ricorrente)`);
      } else {
        // Crea schedule normale con slot pomeridiani
        await client.query(
          `INSERT INTO barber_schedules (barber_id, date, available_slots, unavailable_slots, day_off)
           VALUES ($1, $2, $3, $4, $5)`,
          [nicoloId, date, JSON.stringify(afternoonSlots), JSON.stringify([]), false]
        );
        console.log(`  ✅ ${date} (${dayName}): ${afternoonSlots.length} slot pomeridiani`);
      }

      created++;
    }

    console.log(`\n✅ COMPLETATO!`);
    console.log(`   Creati: ${created}`);
    console.log(`   Saltati (già esistenti): ${skipped}`);
    console.log(`   Totale: ${decemberDates.length}`);

  } catch (error) {
    console.error('❌ Errore:', error);
  } finally {
    await client.end();
  }
}

createDecemberSchedules();
