import fetch from 'node-fetch';

async function testBookingCreation() {
  try {
    console.log('🧪 Testing booking creation API...\n');
    
    // Test data for booking
    const bookingData = {
      barberId: 'cm4hgm3jt0000xqlqjzk7d9xd',
      serviceIds: ['cm4hgplj30003xqlqjzk7d9xj'], // primo servizio
      date: '2025-06-18',
      time: '10:00',
      customerInfo: {
        name: 'Test User',
        email: 'test@example.com',
        phone: '1234567890',
        notes: 'Test booking'
      }
    };
    
    console.log('📤 Sending booking data:', JSON.stringify(bookingData, null, 2));
    
    const response = await fetch('http://localhost:3000/api/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingData)
    });
    
    console.log(`📊 Response status: ${response.status}`);
    
    const result = await response.text();
    console.log('📋 Response body:', result);
    
    if (!response.ok) {
      console.log('\n❌ Booking creation failed');
      console.log('🔍 This might be due to authentication requirement');
    } else {
      console.log('\n✅ Booking creation successful!');
    }
    
  } catch (error) {
    console.error('❌ Error testing booking creation:', error);
  }
}

// Run the test
testBookingCreation();
