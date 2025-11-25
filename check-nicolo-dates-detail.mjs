#!/usr/bin/env node
import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env.local') });

async function checkNicoloDates() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connesso al database\n');

    const dates = ['2025-11-30', '2025-12-07'];

    for (const date of dates) {
      const dateObj = new Date(date + 'T00:00:00');
      const dayOfWeek = dateObj.getDay();
      const dayNames = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];
      
      console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`📅 ${date} (${dayNames[dayOfWeek]})`);
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

      // 1. Check schedule
      const schedule = await client.query(
        `SELECT barber_id, date, available_slots, day_off
         FROM barber_schedules
         WHERE barber_id = 'nicolo' AND date = $1`,
        [date]
      );

      console.log('📋 SCHEDULE:\n');
      if (schedule.rows.length === 0) {
        console.log('❌ NESSUNO SCHEDULE TROVATO!\n');
      } else {
        const s = schedule.rows[0];
        let slots = [];
        
        // Parse slots (può essere array o stringa JSON)
        if (Array.isArray(s.available_slots)) {
          slots = s.available_slots;
        } else if (typeof s.available_slots === 'string') {
          try {
            // Prova a parsare come JSON
            slots = JSON.parse(s.available_slots);
          } catch {
            // Se fallisce, potrebbe essere formato PostgreSQL array {elem1,elem2}
            const match = s.available_slots.match(/\{([^}]*)\}/);
            if (match) {
              slots = match[1].split(',').map(s => s.trim().replace(/"/g, ''));
            }
          }
        }

        console.log(`Day off: ${s.day_off ? '✅ SÌ' : '❌ NO'}`);
        console.log(`Slot disponibili: ${slots.length}`);
        
        if (slots.length > 0) {
          const morning = slots.filter(sl => {
            const hour = parseInt(sl.split(':')[0]);
            return hour < 14;
          });
          const afternoon = slots.filter(sl => {
            const hour = parseInt(sl.split(':')[0]);
            return hour >= 14;
          });
          
          console.log(`   - Mattina: ${morning.length} slot ${morning.length > 0 ? `(${morning[0]}-${morning[morning.length-1]})` : ''}`);
          console.log(`   - Pomeriggio: ${afternoon.length} slot ${afternoon.length > 0 ? `(${afternoon[0]}-${afternoon[afternoon.length-1]})` : ''}`);
        } else if (s.day_off) {
          console.log('   → Giorno di riposo (normale)');
        } else {
          console.log('   ⚠️  PROBLEMA: day_off=false ma 0 slot!');
          console.log('   → Il daily-update popolerà con slot standard');
        }
        console.log('');
      }

      // 2. Check closures
      const closures = await client.query(
        `SELECT closure_type, reason, created_by
         FROM barber_closures
         WHERE barber_email = 'nicolodesantis069@gmail.com' AND closure_date = $1`,
        [date]
      );

      console.log('🚫 CHIUSURE:\n');
      if (closures.rows.length === 0) {
        console.log('✅ Nessuna chiusura\n');
      } else {
        closures.rows.forEach(c => {
          console.log(`   - Tipo: ${c.closure_type}`);
          console.log(`     Motivo: ${c.reason || 'N/A'}`);
          console.log(`     Creata da: ${c.created_by}`);
          console.log('');
        });
      }

      // 3. Check bookings
      const bookings = await client.query(
        `SELECT time, customer_name, status
         FROM bookings
         WHERE barber_id = 'nicolo' AND date = $1 AND status != 'cancelled'
         ORDER BY time`,
        [date]
      );

      console.log('📝 PRENOTAZIONI:\n');
      if (bookings.rows.length === 0) {
        console.log('✅ Nessuna prenotazione\n');
      } else {
        console.log(`Totale: ${bookings.rows.length} prenotazioni\n`);
        bookings.rows.forEach(b => {
          console.log(`   ${b.time} - ${b.customer_name} (${b.status})`);
        });
        console.log('');
      }

      // 4. Verifica chiusure ricorrenti
      const recurring = await client.query(
        `SELECT closed_days FROM barber_recurring_closures
         WHERE barber_email = 'nicolodesantis069@gmail.com'`
      );

      if (recurring.rows.length > 0) {
        const closedDays = recurring.rows[0].closed_days || [];
        const isRecurringClosed = closedDays.includes(dayOfWeek);
        
        console.log('🔁 CHIUSURA RICORRENTE:\n');
        console.log(`   Questo giorno (${dayNames[dayOfWeek]}): ${isRecurringClosed ? '❌ CHIUSO' : '✅ APERTO'}`);
        
        if (isRecurringClosed) {
          console.log('   → Nicolò è normalmente chiuso questo giorno della settimana');
          
          if (schedule.rows.length > 0 && !schedule.rows[0].day_off) {
            console.log('   ⚠️  ATTENZIONE: Ma lo schedule ha day_off=false!');
            console.log('   → Potrebbe essere un\'apertura eccezionale');
          }
        }
        console.log('');
      }

      // 5. Cosa farà il daily-update
      console.log('🌅 COSA FARÀ IL DAILY-UPDATE:\n');
      
      if (schedule.rows.length === 0) {
        console.log('   1. Creerà uno schedule nuovo');
        console.log(`   2. Con slot standard per ${dayNames[dayOfWeek]}`);
        console.log('   3. Creerà chiusura automatica "morning" (Nicolò lavora solo pomeriggio)');
      } else {
        const s = schedule.rows[0];
        let slots = [];
        if (Array.isArray(s.available_slots)) {
          slots = s.available_slots;
        } else if (typeof s.available_slots === 'string') {
          try {
            slots = JSON.parse(s.available_slots);
          } catch {
            const match = s.available_slots.match(/\{([^}]*)\}/);
            if (match) {
              slots = match[1].split(',').map(s => s.trim().replace(/"/g, ''));
            }
          }
        }
        
        if (!s.day_off && slots.length === 0) {
          console.log('   ⚠️  SOVRASCRIVERÀ lo schedule attuale!');
          console.log('   1. Aggiornerà available_slots con slot standard');
          console.log(`   2. Per ${dayNames[dayOfWeek]}: ${dayOfWeek === 1 ? '15 slot (09:00-18:00)' : dayOfWeek === 6 ? '14 slot (09:00-17:00)' : '14 slot (09:00-17:30)'}`);
          console.log('   3. Creerà chiusura automatica "morning"');
          console.log('   → Risultato: Nicolò avrà slot pomeridiani prenotabili');
        } else {
          console.log('   ✅ NON toccherà lo schedule');
          console.log('   → Ha già slot o è day_off');
        }
      }
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 RIEPILOGO\n');
    console.log('Il problema è che questi schedule hanno:');
    console.log('  • day_off = false (dovrebbe essere aperto)');
    console.log('  • available_slots = [] (0 slot)');
    console.log('');
    console.log('Questo è uno stato inconsistente che può accadere quando:');
    console.log('  1. Uno schedule viene creato manualmente senza slot');
    console.log('  2. Gli slot vengono rimossi/svuotati accidentalmente');
    console.log('  3. C\'è stato un errore durante la creazione');
    console.log('');
    console.log('✅ BUONA NOTIZIA: Il daily-update li correggerà!');
    console.log('   → Popolerà gli slot mancanti');
    console.log('   → Nicolò avrà il pomeriggio prenotabile');
    console.log('');
    console.log('Se invece VUOI che siano chiusi:');
    console.log('   → Imposta day_off = true nello schedule');
    console.log('   → O aggiungi una chiusura "full" manuale');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('❌ Errore:', error);
  } finally {
    await client.end();
  }
}

checkNicoloDates();
