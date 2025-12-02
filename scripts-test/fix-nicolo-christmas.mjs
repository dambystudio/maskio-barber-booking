#!/usr/bin/env node
import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env.local') });

async function fixNicoloChristmas() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connesso al database\n');

    const nicoloEmail = 'nicolodesantis069@gmail.com';

    console.log('🔧 CORREZIONE DATE NATALIZIE NICOLÒ\n');
    console.log('=' .repeat(80));

    // 1. Elimina TUTTE le chiusure esistenti per queste date
    console.log('\n🗑️  STEP 1: Elimina chiusure esistenti...');
    const deleteDates = ['2025-12-23', '2025-12-24', '2025-12-30', '2025-12-31'];
    
    for (const date of deleteDates) {
      const deleteResult = await client.query(
        `DELETE FROM barber_closures 
         WHERE barber_email = $1 AND closure_date = $2`,
        [nicoloEmail, date]
      );
      console.log(`   ${date}: ${deleteResult.rowCount} chiusure eliminate`);
    }

    // 2. Crea le nuove chiusure CORRETTE
    console.log('\n✅ STEP 2: Crea nuove chiusure corrette...');

    // 23 dicembre: APERTO MATTINA, CHIUSO POMERIGGIO
    await client.query(
      `INSERT INTO barber_closures (id, barber_email, closure_date, closure_type, reason, created_by, created_at, updated_at)
       VALUES (gen_random_uuid(), $1, '2025-12-23', 'afternoon', 'Chiusura pomeridiana pre-Natale', 'admin', NOW(), NOW())`,
      [nicoloEmail]
    );
    console.log('   ✅ 23 dicembre: APERTO MATTINA (chiuso pomeriggio)');

    // 24 dicembre: APERTO MATTINA, CHIUSO POMERIGGIO
    await client.query(
      `INSERT INTO barber_closures (id, barber_email, closure_date, closure_type, reason, created_by, created_at, updated_at)
       VALUES (gen_random_uuid(), $1, '2025-12-24', 'afternoon', 'Chiusura pomeridiana Vigilia di Natale', 'admin', NOW(), NOW())`,
      [nicoloEmail]
    );
    console.log('   ✅ 24 dicembre: APERTO MATTINA (chiuso pomeriggio)');

    // 30 dicembre: APERTO TUTTO IL GIORNO (nessuna chiusura)
    console.log('   ✅ 30 dicembre: APERTO TUTTO IL GIORNO (nessuna chiusura)');

    // 31 dicembre: APERTO MATTINA, CHIUSO POMERIGGIO
    await client.query(
      `INSERT INTO barber_closures (id, barber_email, closure_date, closure_type, reason, created_by, created_at, updated_at)
       VALUES (gen_random_uuid(), $1, '2025-12-31', 'afternoon', 'Chiusura pomeridiana San Silvestro', 'admin', NOW(), NOW())`,
      [nicoloEmail]
    );
    console.log('   ✅ 31 dicembre: APERTO MATTINA (chiuso pomeriggio)');

    // 3. Verifica finale
    console.log('\n🔍 STEP 3: Verifica finale...\n');
    
    for (const date of deleteDates) {
      const closureResult = await client.query(
        `SELECT closure_type, reason, created_by FROM barber_closures 
         WHERE barber_email = $1 AND closure_date = $2
         ORDER BY closure_type`,
        [nicoloEmail, date]
      );

      console.log(`   ${date}:`);
      if (closureResult.rows.length > 0) {
        closureResult.rows.forEach(c => {
          const disponibilita = c.closure_type === 'afternoon' ? 'APERTO MATTINA' : 
                                c.closure_type === 'morning' ? 'APERTO POMERIGGIO' : 
                                'CHIUSO TUTTO IL GIORNO';
          console.log(`      - ${c.closure_type}: ${disponibilita}`);
          console.log(`        Motivo: ${c.reason}`);
        });
      } else {
        console.log('      ✅ APERTO TUTTO IL GIORNO');
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('\n✅ CORREZIONE COMPLETATA!\n');
    console.log('📅 RIEPILOGO FINALE:');
    console.log('   23 dicembre: ✅ APERTO MATTINA (09:00-12:30)');
    console.log('   24 dicembre: ✅ APERTO MATTINA (09:00-12:30)');
    console.log('   30 dicembre: ✅ APERTO TUTTO IL GIORNO (09:00-17:30)');
    console.log('   31 dicembre: ✅ APERTO MATTINA (09:00-12:30)');

  } catch (error) {
    console.error('❌ Errore:', error.message);
    throw error;
  } finally {
    await client.end();
  }
}

fixNicoloChristmas();
