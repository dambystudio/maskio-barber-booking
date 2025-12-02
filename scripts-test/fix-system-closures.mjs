#!/usr/bin/env node
import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env.local') });

async function fixSystemClosures() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connesso al database\n');

    console.log('🔧 FIX CHIUSURE "system" → "system-auto"\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Aggiorna tutte le chiusure con created_by='system' a 'system-auto'
    const result = await client.query(`
      UPDATE barber_closures
      SET created_by = 'system-auto'
      WHERE created_by = 'system'
      RETURNING barber_email, closure_date, closure_type
    `);

    if (result.rows.length > 0) {
      console.log(`✅ Aggiornate ${result.rows.length} chiusure da 'system' a 'system-auto'\n`);
      
      // Raggruppa per barbiere
      const byBarber = {};
      result.rows.forEach(r => {
        const name = r.barber_email.includes('fabio') ? 'Fabio' :
                     r.barber_email.includes('michele') ? 'Michele' : 'Nicolò';
        if (!byBarber[name]) byBarber[name] = { morning: 0, afternoon: 0, full: 0 };
        byBarber[name][r.closure_type]++;
      });

      Object.keys(byBarber).forEach(name => {
        const counts = byBarber[name];
        console.log(`${name}:`);
        if (counts.morning > 0) console.log(`   - Morning: ${counts.morning}`);
        if (counts.afternoon > 0) console.log(`   - Afternoon: ${counts.afternoon}`);
        if (counts.full > 0) console.log(`   - Full: ${counts.full}`);
      });
    } else {
      console.log('ℹ️  Nessuna chiusura con created_by="system" trovata');
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ FIX COMPLETATO\n');
    console.log('📌 Risultato:');
    console.log('   • Tutte le chiusure automatiche ora hanno created_by="system-auto"');
    console.log('   • Il daily-update può ora gestirle correttamente');
    console.log('   • Se eliminate manualmente, NON verranno ricreate\n');

  } catch (error) {
    console.error('❌ Errore:', error);
  } finally {
    await client.end();
  }
}

fixSystemClosures();
