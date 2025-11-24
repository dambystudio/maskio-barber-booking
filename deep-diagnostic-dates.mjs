#!/usr/bin/env node
import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env.local') });

async function deepDiagnostic() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connesso al database\n');

    const nicoloEmail = 'nicolodesantis069@gmail.com';
    const dates = ['2024-12-23', '2024-12-24', '2024-12-30', '2024-12-31'];

    console.log('🔍 DIAGNOSTICA COMPLETA per date problematiche:\n');

    for (const date of dates) {
      console.log(`\n━━━ ${date} ━━━`);

      // 1. Schedule
      const schedule = await client.query(
        `SELECT * FROM barber_schedules WHERE barber_id = 'nicolo' AND date = $1`,
        [date]
      );

      if (schedule.rows.length > 0) {
        const s = schedule.rows[0];
        const slots = JSON.parse(s.available_slots || '[]');
        console.log(`📅 Schedule: day_off=${s.day_off}, ${slots.length} slot disponibili`);
        console.log(`   Slot: ${slots.join(', ')}`);
      } else {
        console.log(`📅 Schedule: ❌ NON TROVATO`);
      }

      // 2. Chiusure specifiche
      const closures = await client.query(
        `SELECT id, closure_type, reason, created_by FROM barber_closures 
         WHERE barber_email = $1 AND closure_date = $2`,
        [nicoloEmail, date]
      );

      if (closures.rows.length > 0) {
        console.log(`🚫 Chiusure trovate: ${closures.rows.length}`);
        closures.rows.forEach(c => {
          console.log(`   - ID: ${c.id}`);
          console.log(`     Tipo: ${c.closure_type}`);
          console.log(`     Creata da: ${c.created_by}`);
          console.log(`     Motivo: ${c.reason || 'N/A'}`);
        });
      } else {
        console.log(`🚫 Chiusure: ✅ Nessuna trovata`);
      }

      // 3. Prenotazioni esistenti
      const bookings = await client.query(
        `SELECT time, customer_name, status FROM bookings 
         WHERE barber_id = 'nicolo' AND date = $1
         ORDER BY time`,
        [date]
      );

      if (bookings.rows.length > 0) {
        console.log(`📋 Prenotazioni: ${bookings.rows.length}`);
        bookings.rows.forEach(b => {
          console.log(`   - ${b.time}: ${b.customer_name} (${b.status})`);
        });
      } else {
        console.log(`📋 Prenotazioni: ✅ Nessuna`);
      }
    }

    // 4. Verifica chiusure ricorrenti
    console.log('\n\n━━━ CHIUSURE RICORRENTI ━━━');
    const recurring = await client.query(
      `SELECT closed_days FROM barber_recurring_closures WHERE barber_email = $1`,
      [nicoloEmail]
    );

    if (recurring.rows.length > 0) {
      const days = JSON.parse(recurring.rows[0].closed_days);
      const dayNames = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];
      console.log(`Giorni chiusi: ${days.map(d => dayNames[d]).join(', ')}`);
    }

  } catch (error) {
    console.error('❌ Errore:', error);
  } finally {
    await client.end();
  }
}

deepDiagnostic();
