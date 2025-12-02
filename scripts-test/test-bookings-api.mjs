import fetch from 'node-fetch';

async function testBookingsAPI() {
  try {
    console.log('🧪 Testing bookings API...\n');
    
    // Test base API
    console.log('📡 Testing: GET /api/bookings');
    const response1 = await fetch('http://localhost:3000/api/bookings');
    console.log(`Status: ${response1.status}`);
    
    if (response1.ok) {
      const data1 = await response1.json();
      console.log('📋 Response structure:', typeof data1);
      console.log('📋 Response keys:', Object.keys(data1));
      console.log('📋 Sample data:', JSON.stringify(data1, null, 2).substring(0, 500) + '...');
    } else {
      const error1 = await response1.text();
      console.log('❌ Error:', error1);
    }
    
    console.log('\n---\n');
    
    // Test with date parameter
    const today = new Date().toISOString().split('T')[0];
    console.log(`📡 Testing: GET /api/bookings?date=${today}`);
    const response2 = await fetch(`http://localhost:3000/api/bookings?date=${today}`);
    console.log(`Status: ${response2.status}`);
    
    if (response2.ok) {
      const data2 = await response2.json();
      console.log('📋 Response structure:', typeof data2);
      console.log('📋 Response keys:', Object.keys(data2));
      
      if (data2.bookings) {
        console.log('📋 Bookings array length:', data2.bookings.length);
        if (data2.bookings.length > 0) {
          console.log('📋 Sample booking:', JSON.stringify(data2.bookings[0], null, 2));
        }
      } else {
        console.log('❌ No bookings property found!');
      }
    } else {
      const error2 = await response2.text();
      console.log('❌ Error:', error2);
    }
    
  } catch (error) {
    console.error('❌ Error testing bookings API:', error);
  }
}

// Run the test
testBookingsAPI();
