import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

const sql = neon(process.env.DATABASE_URL);

async function checkBarberClosuresTable() {
  try {
    console.log('🔍 Checking if barber_closures table exists...');
    
    // Check if table exists
    const tableExists = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'barber_closures'
    `;
    
    if (tableExists.length === 0) {
      console.log('❌ Table barber_closures does not exist!');
      console.log('Creating barber_closures table...');
      
      await sql`
        CREATE TABLE barber_closures (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          barber_id VARCHAR(255) NOT NULL,
          closure_date DATE NOT NULL,
          start_time TIME,
          end_time TIME,
          is_full_day BOOLEAN DEFAULT false,
          reason VARCHAR(500),
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `;
      
      console.log('✅ Table barber_closures created successfully!');
    } else {
      console.log('✅ Table barber_closures exists!');
    }
    
    // Get table structure
    const structure = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'barber_closures' 
      ORDER BY ordinal_position
    `;
    
    console.log('\n📋 Table structure:');
    structure.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable}) default: ${col.column_default || 'NULL'}`);
    });
    
    // Check current data
    const data = await sql`SELECT * FROM barber_closures LIMIT 5`;
    console.log(`\n📊 Current records: ${data.length}`);
    if (data.length > 0) {
      console.log('Sample records:');
      data.forEach(record => {
        console.log(`  - Barber: ${record.barber_id}, Date: ${record.closure_date}, Full day: ${record.is_full_day}, Reason: ${record.reason || 'N/A'}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkBarberClosuresTable();
