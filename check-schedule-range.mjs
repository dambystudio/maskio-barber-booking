import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL
});

async function checkScheduleRange() {
  try {
    console.log('Checking current schedule range...');
    
    // Check date range
    const rangeResult = await pool.query(`
      SELECT 
        MIN(date) as min_date, 
        MAX(date) as max_date, 
        COUNT(*) as total_records 
      FROM barber_schedules
    `);
    
    console.log('Current schedule range:', rangeResult.rows[0]);
    
    // Check some specific dates
    const today = new Date().toISOString().split('T')[0];
    const july1 = '2025-07-01';
    const july15 = '2025-07-15';
    
    console.log('\nChecking specific dates:');
    console.log('Today:', today);
    
    for (const date of [today, july1, july15]) {
      const result = await pool.query(`
        SELECT date, barber_name, 
               CASE 
                 WHEN available_slots IS NULL THEN 'NULL'
                 ELSE array_length(available_slots, 1)::text
               END as slot_count
        FROM barber_schedules 
        WHERE date = $1
        ORDER BY barber_name
      `, [date]);
      
      console.log(`${date}: ${result.rows.length} records`);
      result.rows.forEach(row => {
        console.log(`  - ${row.barber_name}: ${row.slot_count} slots`);
      });
    }
    
    await pool.end();
  } catch (error) {
    console.error('Error:', error);
    await pool.end();
  }
}

checkScheduleRange();
