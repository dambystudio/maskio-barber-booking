import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

const sql = neon(process.env.DATABASE_URL);

async function checkRecurringClosuresCorrect() {
  try {
    console.log('🔍 Checking barber_recurring_closures table (corrected)...\n');
    
    // Check all recurring closures
    const closures = await sql`SELECT * FROM barber_recurring_closures ORDER BY barber_email`;
    
    console.log(`📊 Found ${closures.length} recurring closures:`);
    closures.forEach(closure => {
      console.log(`  - Barber: ${closure.barber_email}`);
      console.log(`    Closed days: ${closure.closed_days}`);
      console.log(`    Created by: ${closure.created_by || 'N/A'}`);
      console.log(`    Created at: ${closure.created_at}`);
      console.log('---');
    });
    
    // Check specifically for Michele
    const micheleClosures = await sql`
      SELECT * FROM barber_recurring_closures 
      WHERE barber_email = 'michelebiancofiore0230@gmail.com'
    `;
    
    console.log(`\n🎯 Michele's recurring closures (${micheleClosures.length}):`);
    micheleClosures.forEach(closure => {
      try {
        const closedDays = JSON.parse(closure.closed_days);
        const dayNames = closedDays.map(day => ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day]);
        console.log(`  - Closed days: ${dayNames.join(', ')} (${closure.closed_days})`);
        console.log(`  - Created by: ${closure.created_by || 'N/A'}`);
      } catch (e) {
        console.log(`  - Raw closed_days: ${closure.closed_days}`);
      }
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkRecurringClosuresCorrect();
