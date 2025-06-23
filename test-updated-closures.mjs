import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

async function testUpdatedClosures() {
  try {
    console.log('🧪 Testing updated closure logic...\n');
    
    // Find next Sunday and Thursday
    const today = new Date();
    
    // Next Sunday
    const nextSunday = new Date(today);
    nextSunday.setDate(today.getDate() + (7 - today.getDay()) % 7 || 7);
    const sundayStr = nextSunday.toISOString().split('T')[0];
    
    // Next Thursday
    const nextThursday = new Date(today);
    const daysUntilThursday = (4 - today.getDay() + 7) % 7 || 7;
    nextThursday.setDate(today.getDate() + daysUntilThursday);
    const thursdayStr = nextThursday.toISOString().split('T')[0];
    
    // Next Monday (should be open)
    const nextMonday = new Date(today);
    const daysUntilMonday = (1 - today.getDay() + 7) % 7 || 7;
    nextMonday.setDate(today.getDate() + daysUntilMonday);
    const mondayStr = nextMonday.toISOString().split('T')[0];
    
    console.log(`📅 Test dates:`);
    console.log(`  Next Sunday: ${sundayStr} (should be closed)`);
    console.log(`  Next Thursday: ${thursdayStr} (should be closed)`);
    console.log(`  Next Monday: ${mondayStr} (should be open)`);
    
    // Test Sunday slots
    console.log('\n🔍 Testing Sunday slots for Michele...');
    const sundayResponse = await fetch(`http://localhost:3000/api/bookings/slots?barberId=michele&date=${sundayStr}`);
    if (sundayResponse.ok) {
      const sundaySlots = await sundayResponse.json();
      const availableSlots = sundaySlots.filter(slot => slot.available);
      console.log(`  📊 Sunday: ${sundaySlots.length} total, ${availableSlots.length} available (expected: 0)`);
      
      if (availableSlots.length === 0) {
        console.log('  ✅ Sunday closure working correctly!');
      } else {
        console.log('  ❌ Sunday should be closed but has available slots');
      }
    } else {
      console.log(`  ❌ Sunday API failed: ${sundayResponse.status}`);
    }
    
    // Test Thursday slots
    console.log('\n🔍 Testing Thursday slots for Michele...');
    const thursdayResponse = await fetch(`http://localhost:3000/api/bookings/slots?barberId=michele&date=${thursdayStr}`);
    if (thursdayResponse.ok) {
      const thursdaySlots = await thursdayResponse.json();
      const availableSlots = thursdaySlots.filter(slot => slot.available);
      console.log(`  📊 Thursday: ${thursdaySlots.length} total, ${availableSlots.length} available (expected: 0)`);
      
      if (availableSlots.length === 0) {
        console.log('  ✅ Thursday closure working correctly!');
      } else {
        console.log('  ❌ Thursday should be closed but has available slots');
      }
    } else {
      console.log(`  ❌ Thursday API failed: ${thursdayResponse.status}`);
    }
    
    // Test Monday slots (should be open)
    console.log('\n🔍 Testing Monday slots for Michele...');
    const mondayResponse = await fetch(`http://localhost:3000/api/bookings/slots?barberId=michele&date=${mondayStr}`);
    if (mondayResponse.ok) {
      const mondaySlots = await mondayResponse.json();
      const availableSlots = mondaySlots.filter(slot => slot.available);
      console.log(`  📊 Monday: ${mondaySlots.length} total, ${availableSlots.length} available (expected: 14)`);
      
      if (availableSlots.length > 0) {
        console.log('  ✅ Monday working correctly (has available slots)!');
      } else {
        console.log('  ❌ Monday should have available slots');
      }
    } else {
      console.log(`  ❌ Monday API failed: ${mondayResponse.status}`);
    }
    
    // Test Fabio for comparison (should not be affected)
    console.log('\n🔍 Testing Fabio on Thursday for comparison...');
    const fabioThursdayResponse = await fetch(`http://localhost:3000/api/bookings/slots?barberId=fabio&date=${thursdayStr}`);
    if (fabioThursdayResponse.ok) {
      const fabioThursdaySlots = await fabioThursdayResponse.json();
      const availableSlots = fabioThursdaySlots.filter(slot => slot.available);
      console.log(`  📊 Fabio on Thursday: ${fabioThursdaySlots.length} total, ${availableSlots.length} available (expected: >0)`);
      
      if (availableSlots.length > 0) {
        console.log('  ✅ Fabio not affected by Michele\'s closures!');
      } else {
        console.log('  ❌ Fabio should have available slots on Thursday');
      }
    } else {
      console.log(`  ❌ Fabio Thursday API failed: ${fabioThursdayResponse.status}`);
    }
    
    console.log('\n🎉 Closure testing completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testUpdatedClosures();
