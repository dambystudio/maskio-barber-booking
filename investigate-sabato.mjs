import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function investigateSabato() {
  console.log('🔍 Investigazione problema sabato 14:30...\n');

  try {
    // 1. Struttura barber_schedules
    console.log('1️⃣ Struttura tabella barber_schedules...');
    const scheduleColumns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'barber_schedules'
      ORDER BY ordinal_position
    `;
    console.log('\n   Colonne:');
    scheduleColumns.forEach(col => {
      console.log(`   - ${col.column_name} (${col.data_type})`);
    });

    // 2. Dati in barber_schedules
    console.log('\n2️⃣ Contenuto barber_schedules...');
    const schedules = await sql`SELECT * FROM barber_schedules`;
    
    if (schedules.length > 0) {
      console.log(`\n   Trovate ${schedules.length} righe:\n`);
      schedules.forEach((s, i) => {
        console.log(`${i + 1}. Record:`, JSON.stringify(s, null, 2));
      });
    } else {
      console.log('   ⚠️ Tabella VUOTA!');
    }

    // 3. Controlla barber_closures per i sabati
    console.log('\n3️⃣ Chiusure specifiche (barber_closures)...');
    const closures = await sql`
      SELECT * FROM barber_closures
      WHERE date >= '2025-10-25'
      ORDER BY date
    `;

    if (closures.length > 0) {
      console.log(`\n   Trovate ${closures.length} chiusure:\n`);
      closures.forEach(c => {
        const dow = new Date(c.date).getDay(); // 0=Dom, 6=Sab
        const dayName = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'][dow];
        console.log(`   📅 ${c.date} (${dayName})`);
        console.log(`      Barbiere: ${c.barber_id}`);
        console.log(`      Orario: ${c.start_time || 'tutto il giorno'} - ${c.end_time || 'tutto il giorno'}`);
        console.log(`      Motivo: ${c.reason || 'N/A'}`);
        
        // Verifica se è sabato e copre le 14:30
        if (dow === 6) {
          console.log(`      ⚠️ È un SABATO!`);
          if (!c.start_time || !c.end_time) {
            console.log(`      ❌ Chiusura tutto il giorno - blocca le 14:30`);
          } else if (c.start_time <= '14:30' && c.end_time > '14:30') {
            console.log(`      ❌ Chiusura copre le 14:30`);
          }
        }
        console.log('');
      });
    } else {
      console.log('   ✅ Nessuna chiusura specifica trovata');
    }

    // 4. Controlla chiusure ricorrenti
    console.log('\n4️⃣ Chiusure ricorrenti (barber_recurring_closures)...');
    const recurringClosures = await sql`
      SELECT * FROM barber_recurring_closures
    `;

    if (recurringClosures.length > 0) {
      console.log(`\n   Trovate ${recurringClosures.length} chiusure ricorrenti:\n`);
      recurringClosures.forEach(rc => {
        const days = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];
        console.log(`   Barbiere: ${rc.barber_id}`);
        console.log(`   Giorno: ${rc.day_of_week !== null ? days[rc.day_of_week] : 'N/A'} (${rc.day_of_week})`);
        console.log(`   Orario: ${rc.start_time || 'tutto il giorno'} - ${rc.end_time || 'tutto il giorno'}`);
        console.log(`   Motivo: ${rc.reason || 'N/A'}`);
        
        // Se è sabato (6) e copre le 14:30
        if (rc.day_of_week === 6) {
          console.log(`   ⚠️ Chiusura ricorrente per SABATO!`);
          if (!rc.start_time || !rc.end_time) {
            console.log(`   ❌ PROBLEMA: Chiusura tutto il giorno ogni sabato`);
          } else if (rc.start_time <= '14:30' && rc.end_time > '14:30') {
            console.log(`   ❌ PROBLEMA: Copre le 14:30 ogni sabato`);
          }
        }
        console.log('');
      });
    } else {
      console.log('   ✅ Nessuna chiusura ricorrente');
    }

    // 5. Prenotazioni sabati 14:30
    console.log('\n5️⃣ Prenotazioni sabati alle 14:30...');
    const bookings = await sql`
      SELECT date, barber_name, customer_name, time, status
      FROM bookings
      WHERE date >= '2025-10-25'
      AND EXTRACT(DOW FROM date::date) = 6
      AND time = '14:30'
      ORDER BY date
    `;

    if (bookings.length > 0) {
      console.log(`\n   Trovate ${bookings.length} prenotazioni:\n`);
      bookings.forEach(b => {
        console.log(`   ${b.date} - ${b.barber_name} - ${b.customer_name} (${b.status})`);
      });
    } else {
      console.log('   ❌ NESSUNA prenotazione alle 14:30 nei sabati');
      console.log('   ➡️ Questo significa che lo slot appare occupato ma NON lo è!');
    }

    // 6. Controlla closure_settings
    console.log('\n6️⃣ Impostazioni generali chiusure (closure_settings)...');
    const closureSettings = await sql`SELECT * FROM closure_settings`;
    
    if (closureSettings.length > 0) {
      console.log('\n   Impostazioni trovate:\n');
      closureSettings.forEach(cs => {
        console.log(`   ID: ${cs.id}`);
        console.log(`   Dati:`, JSON.stringify(cs, null, 2));
      });
    } else {
      console.log('   ✅ Nessuna impostazione generale');
    }

    console.log('\n' + '='.repeat(70));
    console.log('🎯 DIAGNOSI FINALE');
    console.log('='.repeat(70) + '\n');

    // Identifica il problema
    const saturdayRecurringClosures = recurringClosures.filter(rc => rc.day_of_week === 6);
    const problematicClosures = saturdayRecurringClosures.filter(rc => {
      if (!rc.start_time || !rc.end_time) return true;
      return rc.start_time <= '14:30' && rc.end_time > '14:30';
    });

    if (problematicClosures.length > 0) {
      console.log('❌ PROBLEMA TROVATO: Chiusura ricorrente nei sabati alle 14:30\n');
      problematicClosures.forEach(pc => {
        console.log(`   Barbiere: ${pc.barber_id}`);
        console.log(`   Orario chiusura: ${pc.start_time || 'inizio'} - ${pc.end_time || 'fine'}`);
        console.log(`   ID: ${pc.id}`);
        console.log('');
      });
      console.log('💡 SOLUZIONE:');
      console.log('   Eseguire uno script per eliminare o modificare questa chiusura ricorrente.');
      
      if (problematicClosures.length === 1) {
        const pc = problematicClosures[0];
        console.log(`\n   Script suggerito:`);
        console.log(`   DELETE FROM barber_recurring_closures WHERE id = '${pc.id}';`);
      }
    } else if (saturdayRecurringClosures.length > 0) {
      console.log('⚠️ Ci sono chiusure ricorrenti per sabato ma non coprono le 14:30');
      console.log('   Il problema potrebbe essere nel codice frontend');
    } else {
      console.log('✅ Nessuna chiusura ricorrente per sabato trovata nel database');
      console.log('   Il problema è probabilmente nel codice che genera gli slot disponibili');
    }

  } catch (error) {
    console.error('\n❌ Errore:', error);
    console.error(error.stack);
  }
}

investigateSabato();
