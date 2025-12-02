import fetch from 'node-fetch';

async function testBookingAPIFix() {
  try {
    console.log('🧪 Testing booking API fix...\n');
    
    // Test data for booking
    const bookingData = {
      barberId: 'cm4hgm3jt0000xqlqjzk7d9xd',
      serviceIds: ['cm4hgplj30003xqlqjzk7d9xj'],
      date: '2025-06-18',
      time: '10:00',
      customerInfo: {
        name: 'Test User',
        email: 'test@example.com',
        phone: '1234567890',
        notes: 'Test booking'
      }
    };
    
    console.log('📤 Testing booking API with authentication fix...');
    
    const response = await fetch('http://localhost:3000/api/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingData)
    });
    
    console.log(`📊 Response status: ${response.status}`);
    
    const result = await response.text();
    console.log('📋 Response:', result);
    
    if (response.status === 401) {
      console.log('\n✅ Auth fix successful! API correctly returns 401 for unauthenticated requests');
      console.log('🔑 Now the error should be proper authentication error instead of function error');
    } else if (response.status === 500) {
      console.log('\n❌ Still getting 500 error - check if there are other issues');
    } else {
      console.log('\n🎉 API working correctly!');
    }
    
  } catch (error) {
    console.error('❌ Error testing booking API:', error);
  }
}

// Run the test
testBookingAPIFix();
