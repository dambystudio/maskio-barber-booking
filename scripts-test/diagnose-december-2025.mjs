#!/usr/bin/env node
import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env.local') });

async function diagnoseDecember2025() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connesso al database\n');

    const dates = [
      { date: '2025-12-22', day: 'Lunedì' },
      { date: '2025-12-23', day: 'Martedì' },
      { date: '2025-12-24', day: 'Mercoledì' },
      { date: '2025-12-31', day: 'Mercoledì' }
    ];

    console.log('🔍 DIAGNOSI DICEMBRE 2025\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    for (const { date, day } of dates) {
      console.log(`\n📅 ${date} (${day})`);
      console.log('═══════════════════════════════════════════════\n');

      // SCHEDULES per tutti i barbieri
      console.log('📋 SCHEDULES:\n');
      const schedules = await client.query(
        `SELECT barber_id, date, available_slots, day_off
         FROM barber_schedules
         WHERE date = $1
         ORDER BY barber_id`,
        [date]
      );

      if (schedules.rows.length === 0) {
        console.log('❌ NESSUNO SCHEDULE TROVATO per questa data!\n');
      } else {
        schedules.rows.forEach(s => {
          const slots = Array.isArray(s.available_slots) ? s.available_slots : [];
          const morning = slots.filter(sl => parseInt(sl.split(':')[0]) < 14);
          const afternoon = slots.filter(sl => parseInt(sl.split(':')[0]) >= 14);
          
          console.log(`   ${s.barber_id.toUpperCase()}:`);
          console.log(`      - Day off: ${s.day_off ? 'SÌ' : 'NO'}`);
          console.log(`      - Slot totali: ${slots.length}`);
          console.log(`      - Mattina: ${morning.length} slot`);
          console.log(`      - Pomeriggio: ${afternoon.length} slot`);
        });
        console.log('');
      }

      // CLOSURES per tutti i barbieri
      console.log('🚫 CHIUSURE:\n');
      const closures = await client.query(
        `SELECT barber_email, closure_type, reason, created_by
         FROM barber_closures
         WHERE closure_date = $1
         ORDER BY barber_email`,
        [date]
      );

      if (closures.rows.length === 0) {
        console.log('✅ Nessuna chiusura\n');
      } else {
        closures.rows.forEach(c => {
          const name = c.barber_email.includes('fabio') ? 'FABIO' :
                       c.barber_email.includes('michele') ? 'MICHELE' : 'NICOLÒ';
          console.log(`   ${name}:`);
          console.log(`      - Tipo: ${c.closure_type}`);
          console.log(`      - Motivo: ${c.reason || 'N/A'}`);
          console.log(`      - Creata da: ${c.created_by}`);
        });
        console.log('');
      }

      // BOOKINGS
      console.log('📝 PRENOTAZIONI:\n');
      const bookings = await client.query(
        `SELECT barber_id, time, customer_name
         FROM bookings
         WHERE date = $1
         ORDER BY barber_id, time`,
        [date]
      );

      if (bookings.rows.length === 0) {
        console.log('✅ Nessuna prenotazione\n');
      } else {
        const byBarber = {};
        bookings.rows.forEach(b => {
          if (!byBarber[b.barber_id]) byBarber[b.barber_id] = [];
          byBarber[b.barber_id].push(`${b.time} - ${b.customer_name}`);
        });
        
        Object.keys(byBarber).forEach(barberId => {
          console.log(`   ${barberId.toUpperCase()}: ${byBarber[barberId].length} prenotazioni`);
          byBarber[barberId].forEach(booking => {
            console.log(`      - ${booking}`);
          });
        });
        console.log('');
      }
    }

    // Check chiusure ricorrenti
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔁 CHIUSURE RICORRENTI\n');
    
    const recurring = await client.query(
      `SELECT barber_email, closed_days
       FROM barber_recurring_closures
       ORDER BY barber_email`
    );

    recurring.rows.forEach(r => {
      const name = r.barber_email.includes('fabio') ? 'FABIO' :
                   r.barber_email.includes('michele') ? 'MICHELE' : 'NICOLÒ';
      const days = r.closed_days || [];
      const dayNames = days.map(d => {
        switch(d) {
          case 0: return 'Domenica';
          case 1: return 'Lunedì';
          case 2: return 'Martedì';
          case 3: return 'Mercoledì';
          case 4: return 'Giovedì';
          case 5: return 'Venerdì';
          case 6: return 'Sabato';
          default: return `Giorno ${d}`;
        }
      });
      console.log(`${name}: ${dayNames.join(', ')}`);
    });

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('❌ Errore:', error);
  } finally {
    await client.end();
  }
}

diagnoseDecember2025();
