#!/usr/bin/env node
import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env.local') });

async function testNewSystem() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connesso al database\n');

    const nicoloEmail = 'nicolodesantis069@gmail.com';
    const testDate = '2024-12-05'; // Giovedì - normalmente chiuso

    console.log('🧪 TEST DEL NUOVO SISTEMA\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // 1. Verifica schedule per il 5 dicembre
    console.log('📅 STEP 1: Verifica schedule per', testDate, '\n');
    
    const schedule = await client.query(
      `SELECT date, available_slots, day_off 
       FROM barber_schedules 
       WHERE barber_id = 'nicolo' AND date = $1`,
      [testDate]
    );

    if (schedule.rows.length > 0) {
      const { available_slots, day_off } = schedule.rows[0];
      console.log(`✅ Schedule trovato:`);
      console.log(`   - Day off: ${day_off}`);
      console.log(`   - Slot disponibili: ${available_slots?.length || 0}`);
      if (available_slots && available_slots.length > 0) {
        const morning = available_slots.filter(s => parseInt(s.split(':')[0]) < 14);
        const afternoon = available_slots.filter(s => parseInt(s.split(':')[0]) >= 14);
        console.log(`   - Mattina: ${morning.length} slot`);
        console.log(`   - Pomeriggio: ${afternoon.length} slot`);
      }
    } else {
      console.log('⚠️  Nessuno schedule trovato per questa data');
    }

    // 2. Verifica chiusure automatiche
    console.log('\n🚫 STEP 2: Verifica chiusure automatiche\n');
    
    const closures = await client.query(
      `SELECT closure_date, closure_type, created_by, reason
       FROM barber_closures 
       WHERE barber_email = $1 AND closure_date = $2`,
      [nicoloEmail, testDate]
    );

    if (closures.rows.length > 0) {
      console.log(`✅ Trovate ${closures.rows.length} chiusure:`);
      closures.rows.forEach(c => {
        console.log(`   - Tipo: ${c.closure_type}`);
        console.log(`   - Creata da: ${c.created_by}`);
        console.log(`   - Motivo: ${c.reason}`);
      });
    } else {
      console.log('ℹ️  Nessuna chiusura trovata per questa data');
    }

    // 3. Verifica chiusure rimosse manualmente
    console.log('\n🗑️  STEP 3: Verifica chiusure rimosse manualmente\n');
    
    const removed = await client.query(
      `SELECT closure_date, closure_type, removed_at
       FROM barber_removed_auto_closures 
       WHERE barber_email = $1 AND closure_date = $2`,
      [nicoloEmail, testDate]
    );

    if (removed.rows.length > 0) {
      console.log(`✅ Trovate ${removed.rows.length} chiusure rimosse:`);
      removed.rows.forEach(r => {
        console.log(`   - Tipo: ${r.closure_type}`);
        console.log(`   - Rimossa il: ${r.removed_at}`);
      });
    } else {
      console.log('ℹ️  Nessuna chiusura rimossa per questa data');
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('📋 COMPORTAMENTO ATTESO:\n');
    console.log('1️⃣  Sistema crea schedule con TUTTI gli slot (mattina + pomeriggio)');
    console.log('2️⃣  Sistema crea chiusura automatica "morning" per Nicolò');
    console.log('3️⃣  Frontend mostra solo slot pomeridiani (chiusura nasconde mattina)');
    console.log('\n💡 PER APRIRE LA MATTINA:');
    console.log('   → Vai nel pannello barbieri');
    console.log('   → Elimina la chiusura "Mattina" per quella data');
    console.log('   → Sistema NON la ricreerà (rispetta la tua scelta)');
    console.log('   → Slot mattutini diventano prenotabili\n');

  } catch (error) {
    console.error('❌ Errore:', error);
  } finally {
    await client.end();
  }
}

testNewSystem();
