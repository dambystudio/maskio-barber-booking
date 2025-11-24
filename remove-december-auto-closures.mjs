#!/usr/bin/env node
import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env.local') });

async function cleanDecemberClosures() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connesso al database\n');

    const nicoloEmail = 'nicolodesantis069@gmail.com';
    
    // Elimina TUTTE le chiusure automatiche di dicembre per Nicolò
    console.log('🗑️  Eliminazione chiusure automatiche di dicembre per Nicolò...\n');
    
    const result = await client.query(
      `DELETE FROM barber_closures 
       WHERE barber_email = $1 
       AND closure_date >= '2024-12-01' 
       AND closure_date < '2025-01-01'
       AND created_by = 'system-auto'
       RETURNING closure_date, closure_type`,
      [nicoloEmail]
    );

    if (result.rows.length > 0) {
      console.log(`✅ Rimosse ${result.rows.length} chiusure automatiche:`);
      result.rows.forEach(row => {
        console.log(`   - ${row.closure_date}: ${row.closure_type}`);
      });
    } else {
      console.log('ℹ️  Nessuna chiusura automatica trovata');
    }

    // Verifica che gli schedule eccezionali siano ancora presenti
    console.log('\n🔍 Verifica schedule eccezionali...\n');
    
    const schedules = await client.query(
      `SELECT date, available_slots, day_off 
       FROM barber_schedules 
       WHERE barber_id = 'nicolo'
       AND date IN ('2024-12-22', '2024-12-23', '2024-12-24', '2024-12-30', '2024-12-31')
       ORDER BY date`,
    );

    schedules.rows.forEach(row => {
      const slots = row.available_slots || [];
      const hasMorning = slots.some(s => parseInt(s.split(':')[0]) < 14);
      const hasAfternoon = slots.some(s => parseInt(s.split(':')[0]) >= 14);
      
      console.log(`✅ ${row.date}:`);
      console.log(`   - Slot totali: ${slots.length}`);
      console.log(`   - Mattina: ${hasMorning ? 'SÌ' : 'NO'}`);
      console.log(`   - Pomeriggio: ${hasAfternoon ? 'SÌ' : 'NO'}`);
      console.log(`   - Day off: ${row.day_off ? 'SÌ' : 'NO'}`);
    });

    console.log('\n✅ Pulizia completata! Ora il sistema riconoscerà automaticamente gli schedule eccezionali.');

  } catch (error) {
    console.error('❌ Errore:', error);
  } finally {
    await client.end();
  }
}

cleanDecemberClosures();
