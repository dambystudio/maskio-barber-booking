import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

const sql = neon(process.env.DATABASE_URL);

async function addThursdayClosureForMichele() {
  try {
    console.log('🔧 Adding Thursday closure for Michele...\n');
    
    // Check current closures for Michele
    const currentClosures = await sql`
      SELECT * FROM barber_recurring_closures 
      WHERE barber_email = 'michelebiancofiore0230@gmail.com'
    `;
    
    console.log('📋 Current recurring closures for Michele:');
    currentClosures.forEach(closure => {
      const closedDays = JSON.parse(closure.closed_days);
      const dayNames = closedDays.map(day => ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day]);
      console.log(`  - Closed days: ${dayNames.join(', ')} (${closure.closed_days})`);
    });
    
    if (currentClosures.length > 0) {
      // Update existing record to include Thursday (day 4)
      const currentClosedDays = JSON.parse(currentClosures[0].closed_days);
      if (!currentClosedDays.includes(4)) {
        currentClosedDays.push(4);
        currentClosedDays.sort(); // Keep it sorted
        
        await sql`
          UPDATE barber_recurring_closures 
          SET closed_days = ${JSON.stringify(currentClosedDays)}, 
              updated_at = NOW()
          WHERE barber_email = 'michelebiancofiore0230@gmail.com'
        `;
        
        console.log('✅ Updated Michele\'s recurring closures to include Thursday');
        console.log(`   New closed days: ${JSON.stringify(currentClosedDays)}`);
      } else {
        console.log('✅ Michele already has Thursday in his recurring closures');
      }
    } else {
      // Create new record
      await sql`
        INSERT INTO barber_recurring_closures (barber_email, closed_days, created_by)
        VALUES ('michelebiancofiore0230@gmail.com', '[0,4]', 'admin')
      `;
      
      console.log('✅ Created new recurring closures for Michele: Sunday and Thursday');
    }
    
    // Verify the update
    const updatedClosures = await sql`
      SELECT * FROM barber_recurring_closures 
      WHERE barber_email = 'michelebiancofiore0230@gmail.com'
    `;
    
    console.log('\n📊 Updated recurring closures for Michele:');
    updatedClosures.forEach(closure => {
      const closedDays = JSON.parse(closure.closed_days);
      const dayNames = closedDays.map(day => ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day]);
      console.log(`  - Closed days: ${dayNames.join(', ')} (${closure.closed_days})`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

addThursdayClosureForMichele();
