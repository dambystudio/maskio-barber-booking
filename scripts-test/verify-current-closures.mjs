#!/usr/bin/env node
import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env.local') });

async function verifyCurrentState() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connesso al database\n');

    const dates = ['2025-12-22', '2025-12-23', '2025-12-24', '2025-12-31'];

    console.log('🔍 STATO ATTUALE CHIUSURE DICEMBRE 2025\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    for (const date of dates) {
      console.log(`📅 ${date}`);
      console.log('═══════════════════════════════════════════════\n');

      const closures = await client.query(
        `SELECT barber_email, closure_type, reason, created_by, id
         FROM barber_closures
         WHERE closure_date = $1
         ORDER BY barber_email, closure_type`,
        [date]
      );

      if (closures.rows.length === 0) {
        console.log('   ✅ Nessuna chiusura\n');
      } else {
        closures.rows.forEach(c => {
          const name = c.barber_email.includes('fabio') ? 'FABIO' :
                       c.barber_email.includes('michele') ? 'MICHELE' : 'NICOLÒ';
          console.log(`   ${name}:`);
          console.log(`      Tipo: ${c.closure_type}`);
          console.log(`      Motivo: ${c.reason}`);
          console.log(`      Creata da: ${c.created_by}`);
          console.log(`      ID: ${c.id}`);
          console.log('');
        });
      }

      // Simula come frontend interpreta le chiusure
      console.log('   📊 Come appare nel pannello:');
      const byBarber = {};
      closures.rows.forEach(c => {
        if (!byBarber[c.barber_email]) {
          byBarber[c.barber_email] = { morning: false, afternoon: false };
        }
        if (c.closure_type === 'full') {
          byBarber[c.barber_email].morning = true;
          byBarber[c.barber_email].afternoon = true;
        } else if (c.closure_type === 'morning') {
          byBarber[c.barber_email].morning = true;
        } else if (c.closure_type === 'afternoon') {
          byBarber[c.barber_email].afternoon = true;
        }
      });

      Object.keys(byBarber).forEach(email => {
        const name = email.includes('fabio') ? 'FABIO' :
                     email.includes('michele') ? 'MICHELE' : 'NICOLÒ';
        const { morning, afternoon } = byBarber[email];
        
        let display = '';
        if (morning && afternoon) {
          display = '🔴 CHIUSO TUTTO IL GIORNO';
        } else if (morning) {
          display = '🟡 Chiuso solo mattina';
        } else if (afternoon) {
          display = '🟡 Chiuso solo pomeriggio';
        }
        
        console.log(`      ${name}: ${display}`);
      });
      
      if (Object.keys(byBarber).length === 0) {
        console.log('      Nessun barbiere con chiusure');
      }
      console.log('\n');
    }

  } catch (error) {
    console.error('❌ Errore:', error);
  } finally {
    await client.end();
  }
}

verifyCurrentState();
