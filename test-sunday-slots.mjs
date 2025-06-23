import fetch from 'node-fetch';

async function testSundaySlots() {
  console.log('🧪 Testing Sunday slots (should be empty because both shop and barber are closed)...\n');
  
  try {
    // Test Sunday for Michele
    const testDate = '2025-06-15'; // This is a Sunday
    const response = await fetch(`http://localhost:3000/api/bookings/slots?date=${testDate}&barberId=michele`);
    console.log(`📅 Testing Sunday ${testDate} for Michele:`);
    console.log(`   Status: ${response.status}`);
    
    const text = await response.text();
    console.log(`   Raw response: ${JSON.stringify(text)}`);
    
    const data = JSON.parse(text);
    console.log(`   Parsed JSON:`, data);
    console.log(`   Expected: [] (empty array because it's Sunday)`);
    
    if (Array.isArray(data) && data.length === 0) {
      console.log('   ✅ Correctly showing no slots for Sunday');
    } else {
      console.log('   ❌ Expected empty array for Sunday');
    }
    
    // Test Sunday for Fabio
    const response2 = await fetch(`http://localhost:3000/api/bookings/slots?date=${testDate}&barberId=fabio`);
    console.log(`\n📅 Testing Sunday ${testDate} for Fabio:`);
    console.log(`   Status: ${response2.status}`);
    
    const text2 = await response2.text();
    console.log(`   Raw response: ${JSON.stringify(text2)}`);
    
    const data2 = JSON.parse(text2);
    console.log(`   Parsed JSON:`, data2);
    
    if (Array.isArray(data2) && data2.length === 0) {
      console.log('   ✅ Correctly showing no slots for Sunday');
    } else {
      console.log('   ❌ Expected empty array for Sunday');
    }
    
  } catch (error) {
    console.error('❌ Sunday test failed:', error.message);
  }
}

testSundaySlots();
