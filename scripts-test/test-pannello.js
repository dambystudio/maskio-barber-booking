// Test del Pannello Prenotazioni
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3001/api';

async function testBookingsAPI() {
  console.log('🧪 Testing Bookings API...');
  
  try {
    // Test GET bookings
    const response = await fetch(`${API_BASE}/bookings`);
    if (response.ok) {
      const data = await response.json();
      console.log('✅ GET /api/bookings successful');
      console.log('📊 Bookings data:', data);
      
      if (data.bookings && data.bookings.length > 0) {
        console.log(`📋 Found ${data.bookings.length} bookings`);
        
        // Test PATCH (update status)
        const firstBooking = data.bookings[0];
        console.log('🔄 Testing status update...');
        
        const patchResponse = await fetch(`${API_BASE}/bookings`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: firstBooking.id,
            status: firstBooking.status === 'confirmed' ? 'pending' : 'confirmed'
          }),
        });
        
        if (patchResponse.ok) {
          const updatedBooking = await patchResponse.json();
          console.log('✅ PATCH status update successful');
          console.log('📝 Updated booking:', updatedBooking);
        } else {
          console.log('❌ PATCH failed:', patchResponse.status);
        }
      } else {
        console.log('📭 No bookings found');
      }
    } else {
      console.log('❌ GET failed:', response.status);
    }
  } catch (error) {
    console.error('💥 API test failed:', error);
  }
}

async function testStatsAPI() {
  console.log('📈 Testing Stats API...');
  
  try {
    const response = await fetch(`${API_BASE}/admin/stats`);
    if (response.ok) {
      const stats = await response.json();
      console.log('✅ GET /api/admin/stats successful');
      console.log('📊 Stats:', stats);
    } else {
      console.log('❌ Stats API failed:', response.status);
    }
  } catch (error) {
    console.error('💥 Stats API test failed:', error);
  }
}

// Esegui i test
console.log('🚀 Starting Pannello Prenotazioni API Tests...');
console.log('');

testBookingsAPI()
  .then(() => testStatsAPI())
  .then(() => {
    console.log('');
    console.log('🎉 All tests completed!');
    console.log('');
    console.log('🔗 Access the panel at: http://localhost:3001/pannello-prenotazioni');
    console.log('🔑 Credentials: admin / barber2025');
  });
