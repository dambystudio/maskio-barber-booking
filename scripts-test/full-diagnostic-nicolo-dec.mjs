#!/usr/bin/env node
import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env.local') });

async function fullDiagnostic() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connesso al database\n');

    const nicoloEmail = 'nicolodesantis069@gmail.com';

    // 1. Chiusure ricorrenti
    console.log('📅 CHIUSURE RICORRENTI per Nicolò:\n');
    const recurring = await client.query(
      `SELECT * FROM barber_recurring_closures WHERE barber_email = $1`,
      [nicoloEmail]
    );
    
    if (recurring.rows.length > 0) {
      recurring.rows.forEach(row => {
        console.log(`  Giorni chiusi: ${row.closed_days}`);
        console.log(`  Creato da: ${row.created_by}`);
        console.log(`  Creato il: ${row.created_at}\n`);
      });
    } else {
      console.log('  Nessuna chiusura ricorrente\n');
    }

    // 2. Tutte le chiusure di dicembre
    console.log('📋 TUTTE LE CHIUSURE DICEMBRE per Nicolò:\n');
    const allClosures = await client.query(
      `SELECT closure_date, closure_type, reason, created_by, created_at
       FROM barber_closures
       WHERE barber_email = $1 
       AND closure_date LIKE '2024-12%'
       ORDER BY closure_date, closure_type`,
      [nicoloEmail]
    );

    if (allClosures.rows.length > 0) {
      const grouped = {};
      allClosures.rows.forEach(row => {
        if (!grouped[row.closure_date]) {
          grouped[row.closure_date] = [];
        }
        grouped[row.closure_date].push(row);
      });

      Object.keys(grouped).sort().forEach(date => {
        console.log(`\n  ${date}:`);
        grouped[date].forEach(closure => {
          console.log(`    - ${closure.closure_type} (by: ${closure.created_by}, reason: "${closure.reason || 'N/A'}")`);
        });
      });
    } else {
      console.log('  Nessuna chiusura trovata a dicembre\n');
    }

    // 3. Tutti gli schedules di dicembre
    console.log('\n\n📆 TUTTI GLI SCHEDULES DICEMBRE per Nicolò:\n');
    const schedules = await client.query(
      `SELECT date, day_off, available_slots
       FROM barber_schedules
       WHERE barber_id = 'nicolo' 
       AND date LIKE '2024-12%'
       ORDER BY date`,
    );

    if (schedules.rows.length > 0) {
      schedules.rows.forEach(row => {
        const slots = JSON.parse(row.available_slots || '[]');
        console.log(`  ${row.date}: day_off=${row.day_off}, slots=${slots.length}`);
      });
    } else {
      console.log('  Nessuno schedule trovato a dicembre\n');
    }

    // 4. Verifica eccezioni (schedule_exceptions)
    console.log('\n\n🔧 ECCEZIONI SCHEDULE per Nicolò a Dicembre:\n');
    const exceptions = await client.query(
      `SELECT date, exception_type, available_slots, reason
       FROM barber_schedule_exceptions
       WHERE barber_id = 'nicolo'
       AND date LIKE '2024-12%'
       ORDER BY date`,
    );

    if (exceptions.rows.length > 0) {
      exceptions.rows.forEach(row => {
        console.log(`  ${row.date}: ${row.exception_type}, reason: "${row.reason || 'N/A'}"`);
      });
    } else {
      console.log('  Nessuna eccezione trovata a dicembre\n');
    }

  } catch (error) {
    console.error('❌ Errore:', error);
  } finally {
    await client.end();
  }
}

fullDiagnostic();
