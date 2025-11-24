#!/usr/bin/env node
import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env.local') });

async function verifySpecialDates() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connesso al database\n');

    const nicoloId = 'nicolo';
    const specialDates = ['2024-12-22', '2024-12-23', '2024-12-24', '2024-12-30', '2024-12-31'];

    console.log('📋 VERIFICA DATE SPECIALI DICEMBRE per Nicolò:\n');

    for (const date of specialDates) {
      const dateObj = new Date(date + 'T12:00:00');
      const dayName = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'][dateObj.getDay()];

      const schedule = await client.query(
        `SELECT date, day_off, available_slots FROM barber_schedules 
         WHERE barber_id = $1 AND date = $2`,
        [nicoloId, date]
      );

      if (schedule.rows.length > 0) {
        const row = schedule.rows[0];
        const slots = JSON.parse(row.available_slots || '[]');
        const isDayOff = row.day_off;

        if (isDayOff) {
          console.log(`🚫 ${date} (${dayName}): CHIUSO`);
        } else {
          const firstSlot = slots[0] || 'N/A';
          const lastSlot = slots[slots.length - 1] || 'N/A';
          const isMorning = slots.every(s => parseInt(s.split(':')[0]) < 14);
          const isAfternoon = slots.every(s => parseInt(s.split(':')[0]) >= 14);
          
          let timeInfo = '';
          if (isMorning) {
            timeInfo = '🌅 SOLO MATTINA';
          } else if (isAfternoon) {
            timeInfo = '🌆 SOLO POMERIGGIO';
          } else {
            timeInfo = '🌞 TUTTO IL GIORNO';
          }

          console.log(`✅ ${date} (${dayName}): ${timeInfo} - ${slots.length} slot (${firstSlot} - ${lastSlot})`);
        }
      } else {
        console.log(`❌ ${date} (${dayName}): Nessuno schedule trovato`);
      }
    }

    console.log('\n');

  } catch (error) {
    console.error('❌ Errore:', error);
  } finally {
    await client.end();
  }
}

verifySpecialDates();
