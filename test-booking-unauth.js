// Test API di prenotazione senza autenticazione per verificare il comportamento
console.log('🧪 Testing booking API without authentication...\n');

async function testBookingAPI() {
  try {
    const testBooking = {
      userId: 'test-user-id',
      barberId: 'fabio',
      serviceIds: ['taglio'],
      customerInfo: {
        name: 'Test User',
        email: 'test@example.com',
        phone: '+39 333 1234567',
        notes: 'Test booking'
      },
      date: '2025-06-12',
      time: '10:00',
      totalPrice: 25,
      totalDuration: 30
    };
    
    console.log('📤 Sending booking request without authentication...');
    console.log('Payload:', JSON.stringify(testBooking, null, 2));
    
    const response = await fetch('http://localhost:3000/api/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testBooking)
    });
    
    console.log('📥 Response status:', response.status);
    console.log('📥 Response ok:', response.ok);
    
    const responseText = await response.text();
    console.log('📥 Response body:', responseText);
    
    if (response.status === 401) {
      console.log('✅ Expected: API correctly rejects unauthenticated requests');
    } else if (response.ok) {
      console.log('⚠️ Unexpected: API accepted unauthenticated request');
    } else {
      console.log('ℹ️ API rejected request with status:', response.status);
    }
    
  } catch (error) {
    console.error('💥 Test failed:', error);
  }
}

// Use dynamic import for fetch in Node.js
if (typeof fetch === 'undefined') {
  import('node-fetch').then(({ default: fetch }) => {
    globalThis.fetch = fetch;
    testBookingAPI();
  }).catch(() => {
    console.log('❌ node-fetch not available. Run test manually.');
  });
} else {
  testBookingAPI();
}
