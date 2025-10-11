import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function checkChiusure() {
  console.log('🔍 Controllo chiusure e configurazioni...\n');

  try {
    // 1. Controlla tabella closures
    console.log('1️⃣ Verifica tabella closures...');
    const closures = await sql`
      SELECT * FROM closures 
      WHERE date >= '2025-10-25'
      ORDER BY date, start_time
    `;

    if (closures.length > 0) {
      console.log(`\n📋 Trovate ${closures.length} chiusure:\n`);
      closures.forEach((closure, i) => {
        console.log(`${i + 1}. Data: ${closure.date}`);
        console.log(`   Barbiere: ${closure.barber_id || 'TUTTI'} (${closure.barber_name || 'N/A'})`);
        console.log(`   Orario: ${closure.start_time} - ${closure.end_time || 'Fine giornata'}`);
        console.log(`   Motivo: ${closure.reason || 'N/A'}`);
        console.log(`   Ricorrente: ${closure.is_recurring ? 'SÌ' : 'NO'}`);
        console.log(`   Giorno settimana: ${closure.day_of_week || 'N/A'}`);
        console.log('');
      });
    } else {
      console.log('   ✅ Nessuna chiusura trovata in tabella closures');
    }

    // 2. Controlla se esiste una tabella barber_schedules
    console.log('\n2️⃣ Verifica tabella barber_schedules...');
    const schedules = await sql`
      SELECT * FROM barber_schedules
      WHERE barber_id IN ('fabio', 'michele')
      ORDER BY barber_id, day_of_week
    `;

    if (schedules.length > 0) {
      console.log(`\n📋 Trovate ${schedules.length} configurazioni orari:\n`);
      
      const days = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];
      
      schedules.forEach((schedule) => {
        console.log(`Barbiere: ${schedule.barber_id}`);
        console.log(`  Giorno: ${days[schedule.day_of_week]} (${schedule.day_of_week})`);
        console.log(`  Aperto: ${schedule.is_open ? 'SÌ' : 'NO'}`);
        console.log(`  Orario: ${schedule.start_time} - ${schedule.end_time}`);
        console.log('');
      });

      // Controlla specificamente il sabato (day_of_week = 6)
      const saturdays = schedules.filter(s => s.day_of_week === 6);
      if (saturdays.length > 0) {
        console.log('⚠️ SABATI CONFIGURATI:');
        saturdays.forEach(s => {
          console.log(`   ${s.barber_id}: ${s.start_time} - ${s.end_time} (Aperto: ${s.is_open})`);
        });
      }
    } else {
      console.log('   ✅ Nessuna configurazione orari personalizzata');
    }

    // 3. Controlla prenotazioni specifiche per i sabati alle 14:30
    console.log('\n3️⃣ Verifica prenotazioni sabati alle 14:30...');
    const sabatiBookings = await sql`
      SELECT b.*, EXTRACT(DOW FROM b.date::date) as day_of_week
      FROM bookings b
      WHERE b.date >= '2025-10-25'
      AND b.time = '14:30'
      AND EXTRACT(DOW FROM b.date::date) = 6
      ORDER BY b.date
    `;

    if (sabatiBookings.length > 0) {
      console.log(`\n📋 Prenotazioni trovate per sabati alle 14:30: ${sabatiBookings.length}\n`);
      sabatiBookings.forEach((booking) => {
        console.log(`   ${booking.date} - ${booking.barber_name} - ${booking.customer_name} (${booking.status})`);
      });
    } else {
      console.log('   ✅ Nessuna prenotazione trovata per sabati alle 14:30');
    }

    // 4. Lista di tutti i sabati dal 25 ottobre in poi
    console.log('\n4️⃣ Analisi sabati dal 25 ottobre...');
    const allSaturdays = await sql`
      SELECT 
        date,
        COUNT(*) as total_bookings,
        COUNT(*) FILTER (WHERE time = '14:30') as bookings_1430
      FROM bookings
      WHERE date >= '2025-10-25'
      AND EXTRACT(DOW FROM date::date) = 6
      GROUP BY date
      ORDER BY date
    `;

    console.log('\n📊 Riepilogo sabati:\n');
    allSaturdays.forEach(day => {
      console.log(`   ${day.date}: ${day.total_bookings} prenotazioni totali, ${day.bookings_1430} alle 14:30`);
    });

    // 5. Controlla se esiste una chiusura ricorrente per i sabati
    console.log('\n5️⃣ Chiusure ricorrenti per sabato...');
    const recurringClosures = await sql`
      SELECT * FROM closures
      WHERE is_recurring = true
      AND day_of_week = 6
    `;

    if (recurringClosures.length > 0) {
      console.log('\n⚠️ TROVATE CHIUSURE RICORRENTI PER SABATO:\n');
      recurringClosures.forEach((closure) => {
        console.log(`   Barbiere: ${closure.barber_id || 'TUTTI'}`);
        console.log(`   Orario: ${closure.start_time} - ${closure.end_time || 'Fine giornata'}`);
        console.log(`   Motivo: ${closure.reason || 'N/A'}`);
        console.log('');
      });
    } else {
      console.log('   ✅ Nessuna chiusura ricorrente per sabato');
    }

    console.log('\n' + '='.repeat(70));
    console.log('🎯 CONCLUSIONE');
    console.log('='.repeat(70));

    if (recurringClosures.length > 0 && recurringClosures.some(c => c.start_time <= '14:30' && (!c.end_time || c.end_time >= '14:30'))) {
      console.log('❌ PROBLEMA TROVATO: Chiusura ricorrente blocca le 14:30 nei sabati');
      console.log('   Soluzione: Rimuovere o modificare la chiusura ricorrente');
    } else if (saturdays && saturdays.some(s => !s.is_open)) {
      console.log('❌ PROBLEMA TROVATO: Sabato configurato come chiuso');
      console.log('   Soluzione: Modificare barber_schedules per aprire il sabato');
    } else if (saturdays && saturdays.some(s => s.end_time && s.end_time < '14:30')) {
      console.log('❌ PROBLEMA TROVATO: Orario di chiusura sabato prima delle 14:30');
      console.log('   Soluzione: Estendere orario di apertura del sabato');
    } else {
      console.log('✅ Nessun problema evidente trovato nel database');
      console.log('   Il problema potrebbe essere nel codice frontend/logica slot');
    }

  } catch (error) {
    console.error('❌ Errore:', error);
  }
}

checkChiusure();
