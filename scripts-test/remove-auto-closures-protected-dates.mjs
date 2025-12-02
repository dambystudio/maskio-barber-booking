#!/usr/bin/env node
import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env.local') });

async function removeAutoClosures() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connesso al database\n');

    const nicoloEmail = 'nicolodesantis069@gmail.com';
    const dates = ['2024-12-22', '2024-12-23', '2024-12-24', '2024-12-30', '2024-12-31'];

    console.log('🗑️  Rimozione chiusure automatiche per date protette...\n');

    let totalRemoved = 0;

    for (const date of dates) {
      // Elimina TUTTE le chiusure per quella data (sia morning che afternoon/full)
      const result = await client.query(
        `DELETE FROM barber_closures 
         WHERE barber_email = $1 AND closure_date = $2
         RETURNING id, closure_type, created_by`,
        [nicoloEmail, date]
      );

      if (result.rows.length > 0) {
        console.log(`✅ ${date}: rimosso ${result.rows.length} chiusure`);
        result.rows.forEach(row => {
          console.log(`   - Tipo: ${row.closure_type}, Creata da: ${row.created_by}`);
        });
        totalRemoved += result.rows.length;
      } else {
        console.log(`   ${date}: nessuna chiusura trovata`);
      }
    }

    console.log(`\n✅ Totale chiusure rimosse: ${totalRemoved}`);

    // Verifica che non ci siano più chiusure
    console.log('\n🔍 Verifica finale...\n');
    for (const date of dates) {
      const check = await client.query(
        `SELECT COUNT(*) as count FROM barber_closures 
         WHERE barber_email = $1 AND closure_date = $2`,
        [nicoloEmail, date]
      );

      const count = parseInt(check.rows[0].count);
      if (count === 0) {
        console.log(`✅ ${date}: 0 chiusure (corretto)`);
      } else {
        console.log(`⚠️ ${date}: ${count} chiusure ancora presenti!`);
      }
    }

  } catch (error) {
    console.error('❌ Errore:', error);
  } finally {
    await client.end();
  }
}

removeAutoClosures();
