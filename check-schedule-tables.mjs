import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

const sql = neon(process.env.DATABASE_URL);

async function checkTables() {
  try {
    const tables = await sql`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND (table_name LIKE '%schedule%' OR table_name LIKE '%closure%' OR table_name LIKE '%availability%')
    `;
    
    console.log('📋 Tables related to schedules/closures/availability:');
    tables.forEach(table => {
      console.log(`  - ${table.table_name}`);
    });
    
    // Check barber_schedules table for Michele
    console.log('\n🔍 Checking barber_schedules for Michele...');
    const schedules = await sql`
      SELECT * FROM barber_schedules 
      WHERE barber_id = 'michele' 
      ORDER BY date 
      LIMIT 10
    `;
    
    console.log(`Found ${schedules.length} schedule records for Michele:`);
    schedules.forEach(schedule => {
      console.log(`  - Date: ${schedule.date}, Day off: ${schedule.day_off}, Available slots: ${schedule.available_slots ? 'Yes' : 'No'}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkTables();
