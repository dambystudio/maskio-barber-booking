import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

const sql = neon(process.env.DATABASE_URL);

async function checkMicheleClosures() {
  try {
    console.log('🔍 Checking Michele\'s closures...\n');
    
    // Check Michele's email
    const barbers = await sql`SELECT id, name, email FROM barbers WHERE id = 'michele'`;
    if (barbers.length === 0) {
      console.log('❌ Michele not found');
      return;
    }

    const michele = barbers[0];
    console.log('👨‍💼 Michele info:', michele);

    // Check Michele's closures
    const closures = await sql`
      SELECT * FROM barber_closures 
      WHERE barber_email = ${michele.email}
      ORDER BY closure_date
    `;

    console.log(`\n📋 Michele has ${closures.length} closures:`);
    closures.forEach(closure => {
      console.log(`  - Date: ${closure.closure_date}, Type: ${closure.closure_type}, Reason: ${closure.reason}`);
    });

    // Check general closure settings
    console.log('\n🏪 Checking general closure settings...');
    try {
      const response = await fetch('http://localhost:3000/api/closure-settings');
      if (response.ok) {
        const settings = await response.json();
        console.log('✅ General closure settings:');
        console.log('  Closed days (week):', settings.closedDays);
        console.log('  Closed dates (specific):', settings.closedDates);
      } else {
        console.log(`❌ Failed to fetch closure settings: ${response.status}`);
      }
    } catch (fetchError) {
      console.log('❌ Error fetching closure settings:', fetchError.message);
    }

    // Test slots for next Sunday and Thursday
    console.log('\n🧪 Testing slots for Michele on specific days...');
    
    // Find next Sunday
    const today = new Date();
    const nextSunday = new Date(today);
    nextSunday.setDate(today.getDate() + (7 - today.getDay()) % 7 || 7);
    const sundayStr = nextSunday.toISOString().split('T')[0];
    
    // Find next Thursday
    const nextThursday = new Date(today);
    const daysUntilThursday = (4 - today.getDay() + 7) % 7 || 7;
    nextThursday.setDate(today.getDate() + daysUntilThursday);
    const thursdayStr = nextThursday.toISOString().split('T')[0];
    
    console.log(`📅 Testing dates:`);
    console.log(`  Next Sunday: ${sundayStr}`);
    console.log(`  Next Thursday: ${thursdayStr}`);
    
    // Test Sunday
    console.log('\n🔍 Testing Sunday slots...');
    const sundayResponse = await fetch(`http://localhost:3000/api/bookings/slots?barberId=michele&date=${sundayStr}`);
    if (sundayResponse.ok) {
      const sundaySlots = await sundayResponse.json();
      const availableSlots = sundaySlots.filter(slot => slot.available);
      console.log(`  Sunday slots: ${sundaySlots.length} total, ${availableSlots.length} available`);
    } else {
      console.log(`  ❌ Sunday API failed: ${sundayResponse.status}`);
    }
    
    // Test Thursday
    console.log('\n🔍 Testing Thursday slots...');
    const thursdayResponse = await fetch(`http://localhost:3000/api/bookings/slots?barberId=michele&date=${thursdayStr}`);
    if (thursdayResponse.ok) {
      const thursdaySlots = await thursdayResponse.json();
      const availableSlots = thursdaySlots.filter(slot => slot.available);
      console.log(`  Thursday slots: ${thursdaySlots.length} total, ${availableSlots.length} available`);
    } else {
      console.log(`  ❌ Thursday API failed: ${thursdayResponse.status}`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkMicheleClosures();
