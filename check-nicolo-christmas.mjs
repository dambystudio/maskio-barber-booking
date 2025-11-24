#!/usr/bin/env node
import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env.local') });

async function checkNicoloChristmas() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connesso al database\n');

    const nicoloEmail = 'nicolodesantis069@gmail.com';
    const dates = ['2025-12-23', '2025-12-24', '2025-12-30', '2025-12-31'];

    console.log('🔍 ANALISI NICOLÒ - DATE NATALIZIE\n');
    console.log('=' .repeat(80));

    // 1. Verifica chiusure ricorrenti
    const recurringResult = await client.query(
      'SELECT * FROM barber_recurring_closures WHERE barber_email = $1',
      [nicoloEmail]
    );
    console.log('\n📅 CHIUSURE RICORRENTI:');
    if (recurringResult.rows.length > 0) {
      const closedDays = JSON.parse(recurringResult.rows[0].closed_days);
      const dayNames = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];
      console.log('   Giorni chiusi:', closedDays.map(d => dayNames[d]).join(', '));
    } else {
      console.log('   Nessuna chiusura ricorrente');
    }

    // 2. Verifica schedules per ogni data
    console.log('\n📋 SCHEDULES PER DATA:');
    for (const date of dates) {
      const dateObj = new Date(date + 'T12:00:00');
      const dayName = dateObj.toLocaleDateString('it-IT', { weekday: 'long' });
      
      const scheduleResult = await client.query(
        `SELECT * FROM barber_schedules 
         WHERE barber_id = 'nicolo' AND date = $1`,
        [date]
      );

      console.log(`\n   ${date} (${dayName}):`);
      if (scheduleResult.rows.length > 0) {
        const schedule = scheduleResult.rows[0];
        console.log(`      ID: ${schedule.id}`);
        console.log(`      Day off: ${schedule.day_off}`);
        console.log(`      Available slots: ${schedule.available_slots}`);
        console.log(`      Unavailable slots: ${schedule.unavailable_slots}`);
      } else {
        console.log('      ❌ Nessuno schedule trovato');
      }
    }

    // 3. Verifica chiusure specifiche
    console.log('\n🚫 CHIUSURE SPECIFICHE:');
    for (const date of dates) {
      const closureResult = await client.query(
        `SELECT * FROM barber_closures 
         WHERE barber_email = $1 AND closure_date = $2`,
        [nicoloEmail, date]
      );

      if (closureResult.rows.length > 0) {
        console.log(`\n   ${date}:`);
        closureResult.rows.forEach(closure => {
          console.log(`      Tipo: ${closure.closure_type}`);
          console.log(`      Motivo: ${closure.reason || 'N/A'}`);
          console.log(`      Creato da: ${closure.created_by}`);
        });
      } else {
        console.log(`   ${date}: Nessuna chiusura`);
      }
    }

    // 4. Verifica prenotazioni esistenti
    console.log('\n📅 PRENOTAZIONI ESISTENTI:');
    for (const date of dates) {
      const bookingsResult = await client.query(
        `SELECT * FROM bookings 
         WHERE barber_id = 'nicolo' AND date = $1 AND status != 'cancelled'
         ORDER BY time`,
        [date]
      );

      console.log(`\n   ${date}:`);
      if (bookingsResult.rows.length > 0) {
        bookingsResult.rows.forEach(booking => {
          console.log(`      ${booking.time} - ${booking.customer_name} (${booking.status})`);
        });
      } else {
        console.log('      Nessuna prenotazione');
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('\n💡 SITUAZIONE DESIDERATA:');
    console.log('   23 dicembre: APERTO SOLO MATTINA');
    console.log('   24 dicembre: APERTO SOLO MATTINA');
    console.log('   30 dicembre: APERTO TUTTO IL GIORNO');
    console.log('   31 dicembre: APERTO SOLO MATTINA');

  } catch (error) {
    console.error('❌ Errore:', error.message);
  } finally {
    await client.end();
  }
}

checkNicoloChristmas();
