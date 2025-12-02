#!/usr/bin/env node
import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env.local') });

async function diagnoseAllIssues() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connesso al database\n');

    console.log('🔍 DIAGNOSI COMPLETA PROBLEMI');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // PROBLEMA 1: Nicolò 22-23-24-31 dicembre
    console.log('═══════════════════════════════════════════════');
    console.log('🔴 PROBLEMA 1: Nicolò - Date dicembre');
    console.log('═══════════════════════════════════════════════\n');

    const nicoloDates = ['2024-12-22', '2024-12-23', '2024-12-24', '2024-12-31'];
    
    for (const date of nicoloDates) {
      console.log(`\n━━━ ${date} ━━━\n`);
      
      // Schedule
      const schedule = await client.query(
        `SELECT date, available_slots, day_off 
         FROM barber_schedules 
         WHERE barber_id = 'nicolo' AND date = $1`,
        [date]
      );

      if (schedule.rows.length > 0) {
        const { available_slots, day_off } = schedule.rows[0];
        console.log('📅 SCHEDULE:');
        console.log(`   - Day off: ${day_off}`);
        console.log(`   - Slot totali: ${available_slots?.length || 0}`);
        if (available_slots && available_slots.length > 0) {
          const morning = available_slots.filter(s => parseInt(s.split(':')[0]) < 14);
          const afternoon = available_slots.filter(s => parseInt(s.split(':')[0]) >= 14);
          console.log(`   - Mattina: ${morning.length} slot - ${morning.slice(0, 3).join(', ')}${morning.length > 3 ? '...' : ''}`);
          console.log(`   - Pomeriggio: ${afternoon.length} slot - ${afternoon.slice(0, 3).join(', ')}${afternoon.length > 3 ? '...' : ''}`);
        }
      } else {
        console.log('📅 SCHEDULE: ❌ Non trovato');
      }

      // Chiusure
      const closures = await client.query(
        `SELECT id, closure_type, reason, created_by, created_at
         FROM barber_closures 
         WHERE barber_email = 'nicolodesantis069@gmail.com' AND closure_date = $1
         ORDER BY created_at`,
        [date]
      );

      console.log('\n🚫 CHIUSURE:');
      if (closures.rows.length > 0) {
        closures.rows.forEach((c, i) => {
          console.log(`   ${i + 1}. ID: ${c.id}`);
          console.log(`      Tipo: ${c.closure_type}`);
          console.log(`      Creata da: ${c.created_by}`);
          console.log(`      Motivo: ${c.reason || 'N/A'}`);
        });
      } else {
        console.log('   ✅ Nessuna chiusura trovata');
      }

      // Prenotazioni
      const bookings = await client.query(
        `SELECT id, time, customer_name
         FROM bookings 
         WHERE barber_id = 'nicolo' AND date = $1`,
        [date]
      );

      console.log('\n📋 PRENOTAZIONI:');
      if (bookings.rows.length > 0) {
        console.log(`   - Totale: ${bookings.rows.length}`);
        bookings.rows.forEach(b => {
          console.log(`   - ${b.time}: ${b.customer_name}`);
        });
      } else {
        console.log('   ✅ Nessuna prenotazione');
      }
    }

    // PROBLEMA 2: Fabio e Michele 22 dicembre
    console.log('\n\n═══════════════════════════════════════════════');
    console.log('🔴 PROBLEMA 2: Fabio e Michele - 22 dicembre');
    console.log('═══════════════════════════════════════════════\n');

    const barbers = [
      { id: 'fabio', email: 'fabio.cassano97@icloud.com', name: 'Fabio' },
      { id: 'michele', email: 'michelebiancofiore0230@gmail.com', name: 'Michele' }
    ];

    for (const barber of barbers) {
      console.log(`\n━━━ ${barber.name} - 2024-12-22 (Domenica) ━━━\n`);

      // Schedule
      const schedule = await client.query(
        `SELECT date, available_slots, day_off 
         FROM barber_schedules 
         WHERE barber_id = $1 AND date = '2024-12-22'`,
        [barber.id]
      );

      if (schedule.rows.length > 0) {
        const { available_slots, day_off } = schedule.rows[0];
        console.log('📅 SCHEDULE:');
        console.log(`   - Day off: ${day_off}`);
        console.log(`   - Slot totali: ${available_slots?.length || 0}`);
        if (available_slots && available_slots.length > 0) {
          console.log(`   - Slot: ${available_slots.join(', ')}`);
        }
      } else {
        console.log('📅 SCHEDULE: ❌ Non trovato');
      }

      // Chiusure
      const closures = await client.query(
        `SELECT id, closure_type, reason, created_by
         FROM barber_closures 
         WHERE barber_email = $1 AND closure_date = '2024-12-22'`,
        [barber.email]
      );

      console.log('\n🚫 CHIUSURE:');
      if (closures.rows.length > 0) {
        closures.rows.forEach((c, i) => {
          console.log(`   ${i + 1}. ID: ${c.id}`);
          console.log(`      Tipo: ${c.closure_type}`);
          console.log(`      Creata da: ${c.created_by}`);
          console.log(`      Motivo: ${c.reason || 'N/A'}`);
        });
      } else {
        console.log('   ✅ Nessuna chiusura');
      }

      // Chiusure ricorrenti (domenica = 0)
      const recurring = await client.query(
        `SELECT closed_days FROM barber_recurring_closures WHERE barber_email = $1`,
        [barber.email]
      );

      console.log('\n🔁 CHIUSURE RICORRENTI:');
      if (recurring.rows.length > 0) {
        const closedDays = recurring.rows[0].closed_days;
        const days = Array.isArray(closedDays) ? closedDays : (closedDays ? JSON.parse(closedDays) : []);
        const dayNames = {
          0: 'Domenica',
          1: 'Lunedì',
          2: 'Martedì',
          3: 'Mercoledì',
          4: 'Giovedì',
          5: 'Venerdì',
          6: 'Sabato'
        };
        console.log(`   - Giorni chiusi: ${days.map(d => dayNames[d]).join(', ')}`);
        console.log(`   - 22 dic (Domenica) è chiuso ricorrente: ${days.includes(0) ? '✅ SÌ' : '❌ NO'}`);
      } else {
        console.log('   ✅ Nessuna chiusura ricorrente');
      }

      // Prenotazioni
      const bookings = await client.query(
        `SELECT id, time, customer_name
         FROM bookings 
         WHERE barber_id = $1 AND date = '2024-12-22'`,
        [barber.id]
      );

      console.log('\n📋 PRENOTAZIONI:');
      console.log(`   - Totale: ${bookings.rows.length}`);
      if (bookings.rows.length > 0) {
        bookings.rows.forEach(b => {
          console.log(`   - ${b.time}: ${b.customer_name}`);
        });
      }
    }

    console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 ANALISI PROBLEMI');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('❌ Errore:', error);
  } finally {
    await client.end();
  }
}

diagnoseAllIssues();
