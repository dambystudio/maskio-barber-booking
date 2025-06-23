import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

const sql = neon(process.env.DATABASE_URL);

async function checkRecurringClosures() {
  try {
    console.log('🔍 Checking barber_recurring_closures table...\n');
    
    // Check table structure
    const structure = await sql`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'barber_recurring_closures' 
      ORDER BY ordinal_position
    `;
    
    console.log('📋 Table structure:');
    structure.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
    // Check all recurring closures
    const closures = await sql`SELECT * FROM barber_recurring_closures ORDER BY barber_email, day_of_week`;
    
    console.log(`\n📊 Found ${closures.length} recurring closures:`);
    closures.forEach(closure => {
      const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][closure.day_of_week];
      console.log(`  - Barber: ${closure.barber_email}, Day: ${dayName} (${closure.day_of_week}), Type: ${closure.closure_type}, Reason: ${closure.reason || 'N/A'}`);
    });
    
    // Check specifically for Michele
    const micheleClosures = await sql`
      SELECT * FROM barber_recurring_closures 
      WHERE barber_email = 'michelebiancofiore0230@gmail.com'
      ORDER BY day_of_week
    `;
    
    console.log(`\n🎯 Michele's recurring closures (${micheleClosures.length}):`);
    micheleClosures.forEach(closure => {
      const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][closure.day_of_week];
      console.log(`  - ${dayName} (${closure.day_of_week}): ${closure.closure_type} - ${closure.reason || 'No reason'}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkRecurringClosures();
