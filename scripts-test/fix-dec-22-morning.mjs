#!/usr/bin/env node
import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env.local') });

async function fixDec22() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connesso al database\n');

    const nicoloId = 'nicolo';
    const date = '2024-12-22';

    // Slot mattutini (9:00 - 12:30)
    const morningSlots = [
      '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30'
    ];

    console.log('🔧 Aggiornamento 22 dicembre per Nicolò...\n');

    // Aggiorna lo schedule esistente
    const result = await client.query(
      `UPDATE barber_schedules 
       SET available_slots = $1, day_off = false
       WHERE barber_id = $2 AND date = $3
       RETURNING *`,
      [JSON.stringify(morningSlots), nicoloId, date]
    );

    if (result.rows.length > 0) {
      console.log('✅ 22 dicembre aggiornato:');
      console.log(`   Slot: ${morningSlots.join(', ')}`);
      console.log(`   Totale: ${morningSlots.length} slot mattutini`);
    } else {
      console.log('❌ Schedule non trovato per il 22 dicembre');
    }

  } catch (error) {
    console.error('❌ Errore:', error);
  } finally {
    await client.end();
  }
}

fixDec22();
