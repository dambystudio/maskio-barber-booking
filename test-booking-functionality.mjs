import fetch from 'node-fetch';

async function testBookingSystem() {
  try {
    console.log('🧪 Testing booking system functionality...\n');
    
    // Test 1: Check if bookings API is accessible
    console.log('📋 1. Testing bookings API access...');
    try {
      const slotsResponse = await fetch('http://localhost:3000/api/bookings/slots?barberId=cm4hgm3jt0000xqlqjzk7d9xd&date=2025-06-17', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (slotsResponse.ok) {
        const slots = await slotsResponse.json();
        console.log('✅ Slots API working, slots found:', slots.length || 0);
      } else {
        console.log('❌ Slots API error:', slotsResponse.status);
      }
    } catch (error) {
      console.log('❌ Slots API connection error:', error.message);
    }
    
    // Test 2: Check batch availability API
    console.log('\n📊 2. Testing batch availability API...');
    try {
      const batchResponse = await fetch('http://localhost:3000/api/bookings/batch-availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          barberId: 'cm4hgm3jt0000xqlqjzk7d9xd',
          dates: ['2025-06-17', '2025-06-18']
        })
      });
      
      if (batchResponse.ok) {
        const batchResult = await batchResponse.json();
        console.log('✅ Batch availability API working');
        console.log('📊 Results:', Object.keys(batchResult.availability).length, 'dates checked');
      } else {
        console.log('❌ Batch availability API error:', batchResponse.status);
      }
    } catch (error) {
      console.log('❌ Batch availability API connection error:', error.message);
    }
    
    // Test 3: Check barbers API
    console.log('\n👨‍💼 3. Testing barbers API...');
    try {
      const barbersResponse = await fetch('http://localhost:3000/api/barbers', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (barbersResponse.ok) {
        const barbers = await barbersResponse.json();
        console.log('✅ Barbers API working, barbers found:', barbers.length || 0);
        if (barbers.length > 0) {
          console.log('📋 First barber:', barbers[0].name, '-', barbers[0].id);
        }
      } else {
        console.log('❌ Barbers API error:', barbersResponse.status);
      }
    } catch (error) {
      console.log('❌ Barbers API connection error:', error.message);
    }
    
    // Test 4: Check services API
    console.log('\n✂️ 4. Testing services API...');
    try {
      const servicesResponse = await fetch('http://localhost:3000/api/services', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (servicesResponse.ok) {
        const services = await servicesResponse.json();
        console.log('✅ Services API working, services found:', services.length || 0);
      } else {
        console.log('❌ Services API error:', servicesResponse.status);
      }
    } catch (error) {
      console.log('❌ Services API connection error:', error.message);
    }
    
    console.log('\n📋 Summary:');
    console.log('- If all APIs show ✅, the backend is working correctly');
    console.log('- If you see ❌, there might be a server or database issue');
    console.log('- Check the browser console for frontend errors');
    console.log('- Verify the server is running on http://localhost:3000');
    
  } catch (error) {
    console.error('❌ Error testing booking system:', error);
  }
}

// Run the test
testBookingSystem();
