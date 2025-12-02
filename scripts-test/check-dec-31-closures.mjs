#!/usr/bin/env node
import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env.local') });

async function checkDec31() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connesso al database\n');

    const nicoloEmail = 'nicolodesantis069@gmail.com';
    const date = '2024-12-31';

    // 1. Verifica chiusure per il 31 dicembre
    console.log('📋 CHIUSURE 31 DICEMBRE per Nicolò:\n');
    const closures = await client.query(
      `SELECT id, closure_date, closure_type, reason, created_by, created_at
       FROM barber_closures
       WHERE barber_email = $1 AND closure_date = $2
       ORDER BY closure_type`,
      [nicoloEmail, date]
    );

    if (closures.rows.length === 0) {
      console.log('❌ Nessuna chiusura trovata per il 31 dicembre\n');
    } else {
      closures.rows.forEach((row, index) => {
        console.log(`Chiusura ${index + 1}:`);
        console.log(`  ID: ${row.id}`);
        console.log(`  Tipo: ${row.closure_type}`);
        console.log(`  Motivo: ${row.reason || 'N/A'}`);
        console.log(`  Creata da: ${row.created_by}`);
        console.log(`  Creata il: ${row.created_at}`);
        console.log('');
      });
    }

    // 2. Verifica schedule per il 31 dicembre
    console.log('📅 SCHEDULE 31 DICEMBRE per Nicolò:\n');
    const schedule = await client.query(
      `SELECT id, date, available_slots, day_off, created_at
       FROM barber_schedules
       WHERE barber_id = 'nicolo' AND date = $1`,
      [date]
    );

    if (schedule.rows.length === 0) {
      console.log('❌ Nessuno schedule trovato per il 31 dicembre\n');
    } else {
      schedule.rows.forEach((row) => {
        console.log(`Schedule:`);
        console.log(`  ID: ${row.id}`);
        console.log(`  Date: ${row.date}`);
        console.log(`  Day off: ${row.day_off}`);
        console.log(`  Available slots: ${row.available_slots}`);
        console.log(`  Created at: ${row.created_at}`);
        console.log('');
      });
    }

    // 3. Cerca chiusure "full" che potrebbero essere duplicate
    console.log('🔍 TUTTE LE CHIUSURE FULL per Nicolò a Dicembre:\n');
    const allFullClosures = await client.query(
      `SELECT id, closure_date, closure_type, reason, created_by, created_at
       FROM barber_closures
       WHERE barber_email = $1 
       AND closure_date LIKE '2024-12%'
       AND closure_type = 'full'
       ORDER BY closure_date`,
      [nicoloEmail]
    );

    if (allFullClosures.rows.length > 0) {
      allFullClosures.rows.forEach((row) => {
        console.log(`  ${row.closure_date}: ID=${row.id}, by=${row.created_by}, reason="${row.reason || 'N/A'}"`);
      });
    } else {
      console.log('  Nessuna chiusura FULL trovata a dicembre');
    }

  } catch (error) {
    console.error('❌ Errore:', error);
  } finally {
    await client.end();
  }
}

checkDec31();
