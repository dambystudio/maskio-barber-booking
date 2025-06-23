import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config } from 'dotenv';

// Configura il percorso del file .env.local
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '.env.local');

console.log('📁 Loading environment from:', envPath);
config({ path: envPath });

import pkg from 'pg';
const { Client } = pkg;

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function cleanAllBookings() {
  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Prima mostra il conteggio attuale degli appuntamenti
    console.log('\n📊 Current bookings status:');
    const countResult = await client.query('SELECT COUNT(*) as total FROM bookings');
    console.log(`Total bookings: ${countResult.rows[0].total}`);

    if (countResult.rows[0].total > 0) {
      // Mostra un campione degli appuntamenti per mese
      const monthlyBookings = await client.query(`
        SELECT 
          DATE_TRUNC('month', CAST(date AS DATE)) as month,
          COUNT(*) as count
        FROM bookings 
        GROUP BY DATE_TRUNC('month', CAST(date AS DATE))
        ORDER BY month
      `);
      
      console.log('\n📅 Bookings by month:');
      monthlyBookings.rows.forEach(row => {
        const monthName = new Date(row.month).toLocaleDateString('it-IT', { year: 'numeric', month: 'long' });
        console.log(`  ${monthName}: ${row.count} bookings`);
      });

      // Mostra le date più lontane
      const dateRange = await client.query(`
        SELECT 
          MIN(CAST(date AS DATE)) as earliest_date,
          MAX(CAST(date AS DATE)) as latest_date
        FROM bookings
      `);
      
      if (dateRange.rows[0].earliest_date) {
        console.log('\n📍 Date range:');
        console.log(`  Earliest: ${dateRange.rows[0].earliest_date}`);
        console.log(`  Latest: ${dateRange.rows[0].latest_date}`);
      }

      // Conferma prima di cancellare
      console.log('\n🗑️ Deleting ALL bookings...');
      
      // Cancella tutti gli appuntamenti
      const deleteResult = await client.query('DELETE FROM bookings');
      console.log(`✅ Deleted ${deleteResult.rowCount} bookings`);
    } else {
      console.log('ℹ️ No bookings to delete');
    }

    // Verifica che siano stati cancellati
    const finalCount = await client.query('SELECT COUNT(*) as total FROM bookings');
    console.log(`\n✅ Final count: ${finalCount.rows[0].total} bookings remaining`);

    // Controlla anche le date disponibili negli slot (se esistono)
    console.log('\n🔍 Checking available slots configuration...');
    
    // Verifica se esiste la tabella schedules
    const scheduleCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'schedules'
      );
    `);
    
    if (scheduleCheck.rows[0].exists) {
      const scheduleCount = await client.query('SELECT COUNT(*) as total FROM schedules');
      console.log(`📋 Schedule entries: ${scheduleCount.rows[0].total}`);
      
      if (scheduleCount.rows[0].total > 0) {
        const scheduleRange = await client.query(`
          SELECT 
            MIN(CAST(date AS DATE)) as earliest_schedule,
            MAX(CAST(date AS DATE)) as latest_schedule
          FROM schedules
        `);
        
        if (scheduleRange.rows[0].earliest_schedule) {
          console.log(`📅 Schedule range: ${scheduleRange.rows[0].earliest_schedule} to ${scheduleRange.rows[0].latest_schedule}`);
        }
      }
    } else {
      console.log('⚠️ No schedules table found');
    }

    console.log('\n🧹 Database cleanup completed!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.end();
    console.log('\n🔚 Database connection closed');
  }
}

cleanAllBookings();
