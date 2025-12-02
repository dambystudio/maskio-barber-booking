import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

const sql = neon(process.env.DATABASE_URL);

async function checkTableStructure() {
  try {
    console.log('🔍 Checking table structures...\n');
    
    // Check closure_settings table structure
    console.log('1️⃣ Closure settings table structure:');
    const closureSettingsStructure = await sql`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'closure_settings'
      ORDER BY ordinal_position
    `;
    console.table(closureSettingsStructure);
    
    // Check current data
    console.log('\n2️⃣ Current closure_settings data:');
    const currentData = await sql`SELECT * FROM closure_settings`;
    console.table(currentData);
    
    // Check barber_recurring_closures structure
    console.log('\n3️⃣ Barber recurring closures table structure:');
    const barberClosuresStructure = await sql`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'barber_recurring_closures'
      ORDER BY ordinal_position
    `;
    console.table(barberClosuresStructure);
    
  } catch (error) {
    console.error('❌ Error checking table structure:', error);
  }
}

checkTableStructure();
