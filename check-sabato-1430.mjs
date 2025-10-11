import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function checkSabato1430() {
  console.log('🔍 Analisi problema sabati ore 14:30...\n');

  try {
    // 1. Lista tabelle disponibili
    console.log('1️⃣ Tabelle nel database...');
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    console.log('   Tabelle:', tables.map(t => t.table_name).join(', '));

    // 2. Controlla barber_schedules
    console.log('\n2️⃣ Configurazione orari barbieri (barber_schedules)...');
    const schedules = await sql`
      SELECT * FROM barber_schedules
      ORDER BY barber_id, day_of_week
    `;

    if (schedules.length > 0) {
      const days = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];
      
      console.log('\n📋 Orari configurati:\n');
      schedules.forEach((schedule) => {
        console.log(`${schedule.barber_id.toUpperCase()} - ${days[schedule.day_of_week]}:`);
        console.log(`   Aperto: ${schedule.is_open ? '✅ SÌ' : '❌ NO'}`);
        console.log(`   Orario: ${schedule.start_time} - ${schedule.end_time}`);
        if (schedule.lunch_break_start) {
          console.log(`   Pausa pranzo: ${schedule.lunch_break_start} - ${schedule.lunch_break_end}`);
        }
        console.log('');
      });

      // Focus sui sabati (day_of_week = 6)
      const saturdays = schedules.filter(s => s.day_of_week === 6);
      console.log('⚠️ FOCUS SABATO (giorno 6):\n');
      saturdays.forEach(s => {
        console.log(`${s.barber_id.toUpperCase()}:`);
        console.log(`   Aperto: ${s.is_open ? '✅' : '❌'}`);
        console.log(`   Orario: ${s.start_time} - ${s.end_time}`);
        
        if (s.lunch_break_start && s.lunch_break_end) {
          const lunchStart = s.lunch_break_start;
          const lunchEnd = s.lunch_break_end;
          console.log(`   Pausa pranzo: ${lunchStart} - ${lunchEnd}`);
          
          // Verifica se 14:30 è nella pausa pranzo
          if (lunchStart <= '14:30' && lunchEnd > '14:30') {
            console.log(`   ⚠️ 14:30 è nella pausa pranzo! (${lunchStart} - ${lunchEnd})`);
          }
        }
        
        // Verifica se 14:30 è nell'orario di apertura
        if (s.start_time > '14:30' || s.end_time <= '14:30') {
          console.log(`   ⚠️ 14:30 è FUORI dall'orario di apertura!`);
        }
        console.log('');
      });
    }

    // 3. Controlla le prenotazioni per sabati alle 14:30
    console.log('\n3️⃣ Prenotazioni esistenti per sabati alle 14:30...');
    const bookings = await sql`
      SELECT b.date, b.barber_name, b.customer_name, b.status, b.time
      FROM bookings b
      WHERE b.date >= '2025-10-25'
      AND b.time = '14:30'
      AND EXTRACT(DOW FROM b.date::date) = 6
      ORDER BY b.date
    `;

    if (bookings.length > 0) {
      console.log(`\n   Trovate ${bookings.length} prenotazioni:\n`);
      bookings.forEach(b => {
        console.log(`   📅 ${b.date} - ${b.barber_name} - ${b.customer_name} (${b.status})`);
      });
    } else {
      console.log('   ❌ NESSUNA prenotazione trovata alle 14:30 nei sabati');
      console.log('   Questo conferma che lo slot è bloccato, non prenotato!');
    }

    // 4. Lista tutti i sabati dal 25 ottobre con count prenotazioni
    console.log('\n4️⃣ Riepilogo tutti i sabati dal 25 ottobre...');
    const allSaturdays = await sql`
      WITH saturday_dates AS (
        SELECT generate_series(
          '2025-10-25'::date,
          '2025-12-31'::date,
          '7 days'::interval
        )::date AS date
        WHERE EXTRACT(DOW FROM generate_series(
          '2025-10-25'::date,
          '2025-12-31'::date,
          '7 days'::interval
        )::date) = 6
      )
      SELECT 
        sd.date,
        COUNT(b.id) as total_bookings,
        COUNT(b.id) FILTER (WHERE b.time = '14:30') as bookings_1430
      FROM saturday_dates sd
      LEFT JOIN bookings b ON b.date = sd.date
      GROUP BY sd.date
      ORDER BY sd.date
    `;

    console.log('\n   Sabati e prenotazioni:\n');
    allSaturdays.forEach(day => {
      const dateObj = new Date(day.date);
      const formattedDate = dateObj.toLocaleDateString('it-IT');
      console.log(`   ${formattedDate}: ${day.total_bookings} prenotazioni totali, ${day.bookings_1430} alle 14:30`);
    });

    // 5. Controlla se esiste tabella lunch_breaks o schedule_exceptions
    console.log('\n5️⃣ Altre tabelle rilevanti...');
    const otherTables = tables.filter(t => 
      ['lunch_breaks', 'schedule_exceptions', 'barber_availability', 'exceptions'].includes(t.table_name)
    );

    if (otherTables.length > 0) {
      console.log('   Trovate:', otherTables.map(t => t.table_name).join(', '));
      
      for (const table of otherTables) {
        const data = await sql`SELECT * FROM ${sql(table.table_name)} LIMIT 5`;
        console.log(`\n   ${table.table_name}:`, data);
      }
    } else {
      console.log('   Nessuna altra tabella di configurazione trovata');
    }

    console.log('\n' + '='.repeat(70));
    console.log('🎯 DIAGNOSI');
    console.log('='.repeat(70));

    const saturdaySchedules = schedules.filter(s => s.day_of_week === 6);
    
    for (const schedule of saturdaySchedules) {
      const barbiere = schedule.barber_id.toUpperCase();
      
      console.log(`\n${barbiere}:`);
      
      // Check 1: Sabato aperto?
      if (!schedule.is_open) {
        console.log('   ❌ PROBLEMA: Sabato configurato come CHIUSO');
        continue;
      }
      
      // Check 2: 14:30 nell'orario?
      if (schedule.start_time > '14:30') {
        console.log(`   ❌ PROBLEMA: Apertura alle ${schedule.start_time}, dopo le 14:30`);
        continue;
      }
      if (schedule.end_time <= '14:30') {
        console.log(`   ❌ PROBLEMA: Chiusura alle ${schedule.end_time}, prima delle 14:30`);
        continue;
      }
      
      // Check 3: 14:30 nella pausa pranzo?
      if (schedule.lunch_break_start && schedule.lunch_break_end) {
        if (schedule.lunch_break_start <= '14:30' && schedule.lunch_break_end > '14:30') {
          console.log(`   ❌ PROBLEMA: 14:30 è nella pausa pranzo (${schedule.lunch_break_start} - ${schedule.lunch_break_end})`);
          console.log(`   💡 SOLUZIONE: Modificare la pausa pranzo per terminare prima delle 14:30`);
          console.log(`                o iniziare dopo le 14:30`);
          continue;
        }
      }
      
      console.log('   ✅ Configurazione corretta per le 14:30');
    }

  } catch (error) {
    console.error('\n❌ Errore:', error.message);
  }
}

checkSabato1430();
