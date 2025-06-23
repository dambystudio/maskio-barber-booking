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

async function analyzeScheduleRange() {
  try {
    await client.connect();
    console.log('✅ Connected to database');

    console.log('\n📊 DETAILED SCHEDULE ANALYSIS');
    console.log('=' .repeat(50));

    // 1. Range completo delle date
    const rangeQuery = await client.query(`
      SELECT 
        MIN(CAST(date AS DATE)) as earliest_date,
        MAX(CAST(date AS DATE)) as latest_date,
        COUNT(*) as total_records,
        COUNT(DISTINCT barber_id) as unique_barbers,
        COUNT(DISTINCT date) as unique_dates
      FROM barber_schedules
    `);
    
    const range = rangeQuery.rows[0];
    console.log('\n📅 SCHEDULE RANGE:');
    console.log(`  From: ${range.earliest_date}`);
    console.log(`  To: ${range.latest_date}`);
    console.log(`  Total records: ${range.total_records}`);
    console.log(`  Unique dates: ${range.unique_dates}`);
    console.log(`  Barbers: ${range.unique_barbers}`);

    // 2. Analisi per mese
    const monthlyQuery = await client.query(`
      SELECT 
        DATE_TRUNC('month', CAST(date AS DATE)) as month,
        COUNT(*) as records,
        COUNT(DISTINCT date) as unique_dates,
        COUNT(DISTINCT barber_id) as barbers
      FROM barber_schedules 
      GROUP BY DATE_TRUNC('month', CAST(date AS DATE))
      ORDER BY month
    `);
    
    console.log('\n📈 MONTHLY BREAKDOWN:');
    monthlyQuery.rows.forEach(row => {
      const monthName = new Date(row.month).toLocaleDateString('it-IT', { 
        year: 'numeric', 
        month: 'long' 
      });
      const expectedDays = getDaysInMonth(row.month, true); // Escludi domeniche
      const coverage = ((row.unique_dates / expectedDays) * 100).toFixed(1);
      
      console.log(`  ${monthName}:`);
      console.log(`    Records: ${row.records}`);
      console.log(`    Dates: ${row.unique_dates}/${expectedDays} (${coverage}% coverage)`);
      console.log(`    Barbers: ${row.barbers}`);
    });

    // 3. Analisi per barbiere
    const barberQuery = await client.query(`
      SELECT 
        barber_id,
        COUNT(*) as total_records,
        MIN(CAST(date AS DATE)) as from_date,
        MAX(CAST(date AS DATE)) as to_date,
        COUNT(DISTINCT date) as unique_dates
      FROM barber_schedules 
      GROUP BY barber_id
      ORDER BY barber_id
    `);
    
    console.log('\n👥 BARBER BREAKDOWN:');
    barberQuery.rows.forEach(row => {
      console.log(`  ${row.barber_id.toUpperCase()}:`);
      console.log(`    Records: ${row.total_records}`);
      console.log(`    Date range: ${row.from_date} to ${row.to_date}`);
      console.log(`    Unique dates: ${row.unique_dates}`);
    });

    // 4. Controlla se arriva ad agosto
    const augustCheck = await client.query(`
      SELECT 
        COUNT(*) as august_records,
        COUNT(DISTINCT date) as august_dates,
        MIN(CAST(date AS DATE)) as first_august,
        MAX(CAST(date AS DATE)) as last_august
      FROM barber_schedules 
      WHERE EXTRACT(year FROM CAST(date AS DATE)) = 2025 
        AND EXTRACT(month FROM CAST(date AS DATE)) = 8
    `);
    
    console.log('\n🗓️ AUGUST 2025 CHECK:');
    if (augustCheck.rows[0].august_records > 0) {
      console.log(`  ✅ August data found!`);
      console.log(`  Records: ${augustCheck.rows[0].august_records}`);
      console.log(`  Dates: ${augustCheck.rows[0].august_dates}`);
      console.log(`  Range: ${augustCheck.rows[0].first_august} to ${augustCheck.rows[0].last_august}`);
    } else {
      console.log(`  ❌ No August 2025 data found`);
    }

    // 5. Ultimi 10 giorni disponibili
    const lastDaysQuery = await client.query(`
      SELECT DISTINCT 
        date,
        COUNT(*) as barber_count
      FROM barber_schedules 
      ORDER BY CAST(date AS DATE) DESC
      LIMIT 10
    `);
    
    console.log('\n📅 LAST 10 AVAILABLE DATES:');
    lastDaysQuery.rows.forEach(row => {
      const dayName = new Date(row.date + 'T00:00:00').toLocaleDateString('it-IT', { 
        weekday: 'long',
        day: '2-digit',
        month: 'short'
      });
      console.log(`  ${row.date} (${dayName}) - ${row.barber_count} barbers`);
    });

    console.log('\n✅ Analysis completed!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.end();
    console.log('\n🔚 Database connection closed');
  }
}

// Helper function per calcolare i giorni in un mese escludendo le domeniche
function getDaysInMonth(monthDate, excludeSundays = false) {
  const date = new Date(monthDate);
  const year = date.getFullYear();
  const month = date.getMonth();
  
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  if (!excludeSundays) {
    return daysInMonth;
  }
  
  let workingDays = 0;
  for (let day = 1; day <= daysInMonth; day++) {
    const dayOfWeek = new Date(year, month, day).getDay();
    if (dayOfWeek !== 0) { // Non domenica
      workingDays++;
    }
  }
  
  return workingDays;
}

analyzeScheduleRange();
