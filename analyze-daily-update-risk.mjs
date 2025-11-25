#!/usr/bin/env node
import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env.local') });

async function analyzeCurrentState() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connesso al database\n');

    console.log('🔍 ANALISI PROTEZIONE STATO ATTUALE\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // 1. Check schedule con slot customizzati
    console.log('📋 STEP 1: Schedule con slot NON standard\n');
    
    const customSchedules = await client.query(`
      SELECT barber_id, date, available_slots, day_off
      FROM barber_schedules
      WHERE date >= TO_CHAR(CURRENT_DATE, 'YYYY-MM-DD')
        AND date < TO_CHAR(CURRENT_DATE + INTERVAL '60 days', 'YYYY-MM-DD')
      ORDER BY date, barber_id
      LIMIT 50
    `);

    if (customSchedules.rows.length > 0) {
      // Filtra schedule anomali
      const anomalous = customSchedules.rows.filter(s => {
        const slots = Array.isArray(s.available_slots) ? s.available_slots.length : 
                      (typeof s.available_slots === 'string' ? JSON.parse(s.available_slots).length : 0);
        return slots !== 14 && slots !== 15 && !(s.day_off && slots === 0);
      });
      
      if (anomalous.length > 0) {
        console.log(`⚠️  Trovati ${anomalous.length} schedule con slot customizzati:`);
        anomalous.forEach(s => {
          const slots = Array.isArray(s.available_slots) ? s.available_slots.length : 
                        (typeof s.available_slots === 'string' ? JSON.parse(s.available_slots).length : 0);
          console.log(`   ${s.date} - ${s.barber_id}: ${slots} slot (day_off: ${s.day_off})`);
        });
        console.log('\n⚠️  RISCHIO: Daily-update potrebbe sovrascrivere questi schedule!\n');
      } else {
        console.log('✅ Tutti gli schedule hanno slot standard (14 o 15)\n');
      }
    } else {
      console.log('✅ Nessuno schedule trovato\n');
    }

    // 2. Check chiusure manuali (non system-auto)
    console.log('🚫 STEP 2: Chiusure manuali (potrebbero essere perse)\n');
    
    const manualClosures = await client.query(`
      SELECT barber_email, closure_date, closure_type, reason, created_by
      FROM barber_closures
      WHERE closure_date >= TO_CHAR(CURRENT_DATE, 'YYYY-MM-DD')
        AND closure_date < TO_CHAR(CURRENT_DATE + INTERVAL '60 days', 'YYYY-MM-DD')
        AND created_by != 'system-auto'
      ORDER BY closure_date, barber_email
    `);

    if (manualClosures.rows.length > 0) {
      console.log(`⚠️  Trovate ${manualClosures.rows.length} chiusure manuali:`);
      manualClosures.rows.forEach(c => {
        const name = c.barber_email.includes('fabio') ? 'Fabio' :
                     c.barber_email.includes('michele') ? 'Michele' : 'Nicolò';
        console.log(`   ${c.closure_date} - ${name}: ${c.closure_type} (${c.created_by})`);
        console.log(`      Motivo: ${c.reason || 'N/A'}`);
      });
      console.log('\n✅ SICURE: Le chiusure manuali NON vengono toccate dal daily-update\n');
    } else {
      console.log('ℹ️  Nessuna chiusura manuale futura\n');
    }

    // 3. Check chiusure automatiche rimosse
    console.log('🗑️  STEP 3: Chiusure automatiche rimosse manualmente\n');
    
    const removedClosures = await client.query(`
      SELECT barber_email, closure_date, closure_type, removed_at
      FROM barber_removed_auto_closures
      WHERE closure_date >= TO_CHAR(CURRENT_DATE, 'YYYY-MM-DD')
        AND closure_date < TO_CHAR(CURRENT_DATE + INTERVAL '60 days', 'YYYY-MM-DD')
      ORDER BY closure_date, barber_email
    `);

    if (removedClosures.rows.length > 0) {
      console.log(`✅ Trovate ${removedClosures.rows.length} rimozioni registrate:`);
      removedClosures.rows.forEach(r => {
        const name = r.barber_email.includes('fabio') ? 'Fabio' :
                     r.barber_email.includes('michele') ? 'Michele' : 'Nicolò';
        console.log(`   ${r.closure_date} - ${name}: ${r.closure_type} rimossa`);
      });
      console.log('\n✅ PROTETTE: Il sistema NON ricreerà queste chiusure\n');
    } else {
      console.log('ℹ️  Nessuna chiusura rimossa registrata\n');
    }

    // 4. Simula cosa farà il daily-update
    console.log('🌅 STEP 4: Simulazione Daily-Update\n');
    
    console.log('Il daily-update esegue queste operazioni:\n');
    console.log('1. ✅ Crea schedule per prossimi 60 giorni con slot STANDARD');
    console.log('   → ATTENZIONE: Sovrascrive schedule esistenti con slot standard!');
    console.log('   → Slot standard: 15 (lunedì), 14 (mar-ven), 14 (sabato)\n');
    
    console.log('2. ✅ Crea chiusure automatiche (Nicolò morning, Fabio lunedì, etc.)');
    console.log('   → NON ricrea chiusure in barber_removed_auto_closures\n');
    
    console.log('3. ❌ NON tocca chiusure manuali (created_by != system-auto)\n');
    
    console.log('4. ❌ NON tocca prenotazioni esistenti\n');

    // 5. Controlla prenotazioni future
    console.log('📝 STEP 5: Prenotazioni future\n');
    
    const futureBookings = await client.query(`
      SELECT COUNT(*) as count,
             COUNT(DISTINCT date) as dates,
             MIN(date) as prima_data,
             MAX(date) as ultima_data
      FROM bookings
      WHERE date >= TO_CHAR(CURRENT_DATE, 'YYYY-MM-DD')
        AND status != 'cancelled'
    `);

    const booking = futureBookings.rows[0];
    console.log(`✅ Prenotazioni future: ${booking.count}`);
    console.log(`   Date: ${booking.dates} giorni diversi`);
    if (booking.prima_data) {
      console.log(`   Range: ${booking.prima_data} → ${booking.ultima_data}`);
    }
    console.log('\n✅ SICURE: Le prenotazioni NON vengono mai toccate dal daily-update\n');

    // RIEPILOGO FINALE
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 RIEPILOGO PROTEZIONE\n');
    
    console.log('✅ SICURO (NON verrà toccato):');
    console.log('   • Prenotazioni esistenti');
    console.log('   • Chiusure manuali (admin/barbieri)');
    console.log('   • Chiusure rimosse (in barber_removed_auto_closures)\n');
    
    console.log('⚠️  POTREBBE ESSERE SOVRASCRITTO:');
    console.log('   • Schedule con slot customizzati');
    console.log('   • Solo se NON protetti da meccanismo specifico\n');
    
    console.log('💡 RACCOMANDAZIONI:\n');
    
    if (customSchedules.rows.length > 0) {
      console.log('⚠️  HAI SCHEDULE CUSTOMIZZATI!');
      console.log('   Opzioni per proteggerli:');
      console.log('   1. Aggiungerli a PROTECTED_DATES nel daily-update');
      console.log('   2. Modificare logica per rilevare slot custom');
      console.log('   3. Disabilitare temporaneamente daily-update\n');
    } else {
      console.log('✅ Nessuno schedule a rischio!');
      console.log('   Il tuo setup attuale è sicuro.\n');
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('❌ Errore:', error);
  } finally {
    await client.end();
  }
}

analyzeCurrentState();
