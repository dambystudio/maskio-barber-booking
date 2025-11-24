#!/usr/bin/env node
import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env.local') });

async function fixDecember2025() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connesso al database\n');

    console.log('🔧 FIX DICEMBRE 2025\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // STEP 1: Elimina chiusure "afternoon" per 22, 23, 24, 31 dicembre
    console.log('🗑️  STEP 1: Rimozione chiusure afternoon non volute\n');
    
    const datesToFix = ['2025-12-22', '2025-12-23', '2025-12-24', '2025-12-31'];
    
    for (const date of datesToFix) {
      const result = await client.query(
        `DELETE FROM barber_closures
         WHERE closure_date = $1 
         AND closure_type = 'afternoon'
         RETURNING barber_email, closure_type, reason`,
        [date]
      );
      
      if (result.rows.length > 0) {
        console.log(`✅ ${date}:`);
        result.rows.forEach(r => {
          const name = r.barber_email.includes('fabio') ? 'Fabio' :
                       r.barber_email.includes('michele') ? 'Michele' : 'Nicolò';
          console.log(`   - ${name}: rimossa chiusura afternoon "${r.reason}"`);
        });
      } else {
        console.log(`   ${date}: nessuna chiusura afternoon trovata`);
      }
    }

    // STEP 2: Popola gli schedule con gli slot corretti
    console.log('\n📋 STEP 2: Ripopolamento schedule con slot corretti\n');

    // Slot standard per lunedì (09:00-12:30 + 15:00-18:00)
    const mondaySlots = [
      '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
      '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00'
    ];

    // Slot standard mar-ven (09:00-12:30 + 15:00-17:30)
    const weekdaySlots = [
      '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
      '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
    ];

    const scheduleUpdates = [
      { date: '2025-12-22', day: 'Lunedì', slots: mondaySlots },
      { date: '2025-12-23', day: 'Martedì', slots: weekdaySlots },
      { date: '2025-12-24', day: 'Mercoledì', slots: weekdaySlots },
      { date: '2025-12-31', day: 'Mercoledì', slots: weekdaySlots }
    ];

    for (const { date, day, slots } of scheduleUpdates) {
      console.log(`${date} (${day}):`);
      
      const barbers = ['fabio', 'michele', 'nicolo'];
      for (const barberId of barbers) {
        const result = await client.query(
          `UPDATE barber_schedules
           SET available_slots = $1
           WHERE barber_id = $2 AND date = $3
           RETURNING barber_id`,
          [JSON.stringify(slots), barberId, date]
        );
        
        if (result.rows.length > 0) {
          console.log(`   ✅ ${barberId}: ${slots.length} slot aggiunti`);
        }
      }
    }

    // STEP 3: Verifica stato finale
    console.log('\n🔍 STEP 3: Verifica stato finale\n');

    for (const date of datesToFix) {
      console.log(`\n${date}:`);
      
      const schedules = await client.query(
        `SELECT barber_id, available_slots FROM barber_schedules WHERE date = $1 ORDER BY barber_id`,
        [date]
      );
      
      const closures = await client.query(
        `SELECT barber_email, closure_type FROM barber_closures WHERE closure_date = $1 ORDER BY barber_email`,
        [date]
      );

      console.log('   Schedules:');
      schedules.rows.forEach(s => {
        const slots = Array.isArray(s.available_slots) ? s.available_slots : [];
        console.log(`      ${s.barber_id}: ${slots.length} slot`);
      });

      console.log('   Chiusure:');
      if (closures.rows.length === 0) {
        console.log('      Nessuna');
      } else {
        closures.rows.forEach(c => {
          const name = c.barber_email.includes('fabio') ? 'Fabio' :
                       c.barber_email.includes('michele') ? 'Michele' : 'Nicolò';
          console.log(`      ${name}: ${c.closure_type}`);
        });
      }
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ FIX COMPLETATO\n');
    console.log('📌 Risultato atteso:');
    console.log('   - 22 dicembre (Lunedì):');
    console.log('      • Fabio: chiuso (lunedì riposo)');
    console.log('      • Michele: solo pomeriggio (chiusura morning automatica)');
    console.log('      • Nicolò: solo pomeriggio (chiusura morning automatica)');
    console.log('   - 23, 24, 31 dicembre:');
    console.log('      • Fabio: tutto il giorno disponibile');
    console.log('      • Michele: tutto il giorno disponibile');
    console.log('      • Nicolò: solo pomeriggio (chiusura morning automatica)\n');

  } catch (error) {
    console.error('❌ Errore:', error);
  } finally {
    await client.end();
  }
}

fixDecember2025();
