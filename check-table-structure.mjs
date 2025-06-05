import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://neondb_owner:npg_Wj09qDUmTsxE@ep-old-forest-a2ur722g-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require';
const sql = neon(DATABASE_URL);

async function checkTableStructure() {
  try {
    console.log('🔍 Checking barber_schedules table structure...');
    
    // Check table structure
    const columns = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'barber_schedules'
      ORDER BY ordinal_position
    `;
    
    console.log('Table columns:');
    columns.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable}) `);
    });
    
    // Check some existing records to see the actual column names
    console.log('\n📋 Sample records:');
    const sample = await sql`
      SELECT * FROM barber_schedules 
      LIMIT 3
    `;
    
    if (sample.length > 0) {
      console.log('Column names in actual data:', Object.keys(sample[0]));
      sample.forEach(record => {
        console.log(`  - Date: ${record.date}, Barber: ${Object.values(record)[1]}, Slots: ${Array.isArray(Object.values(record)[2]) ? Object.values(record)[2].length : 'N/A'}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error checking table structure:', error);
  }
}

checkTableStructure();
