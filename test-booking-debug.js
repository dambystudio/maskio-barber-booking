// Test debug per il sistema di prenotazione
const API_BASE = 'http://localhost:3000/api';

async function testBookingAPI() {
  console.log('🧪 Testing Booking API Debug...\n');
  
  try {
    // 1. Test services API
    console.log('1️⃣ Testing Services API...');
    const servicesResponse = await fetch(`${API_BASE}/services`);
    console.log('Services Response Status:', servicesResponse.status);
    
    if (servicesResponse.ok) {
      const services = await servicesResponse.json();
      console.log('✅ Services found:', services.length);
      console.log('First service:', services[0]);
    } else {
      console.log('❌ Services API failed');
      return;
    }
    
    // 2. Test barbers API
    console.log('\n2️⃣ Testing Barbers API...');
    const barbersResponse = await fetch(`${API_BASE}/barbers`);
    console.log('Barbers Response Status:', barbersResponse.status);
    
    if (barbersResponse.ok) {
      const barbers = await barbersResponse.json();
      console.log('✅ Barbers found:', barbers.length);
      console.log('First barber:', barbers[0]);
    } else {
      console.log('❌ Barbers API failed');
      return;
    }
    
    // 3. Test booking creation with minimal data
    console.log('\n3️⃣ Testing Booking Creation...');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const testDate = tomorrow.toISOString().split('T')[0];
    
    const testBooking = {
      userId: 'test-user-id',
      barberId: 'fabio',
      serviceIds: ['taglio'],
      customerInfo: {
        name: 'Test User',
        email: 'test@example.com',
        phone: '+39 333 1234567',
        notes: 'Test booking debug'
      },
      date: testDate,
      time: '10:00',
      totalPrice: 25,
      totalDuration: 30
    };
    
    console.log('📤 Sending booking data:');
    console.log(JSON.stringify(testBooking, null, 2));
    
    const bookingResponse = await fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testBooking)
    });
    
    console.log('📥 Booking Response Status:', bookingResponse.status);
    console.log('📥 Booking Response OK:', bookingResponse.ok);
    
    const bookingResult = await bookingResponse.text();
    console.log('📥 Booking Response Body:', bookingResult);
    
    if (!bookingResponse.ok) {
      console.log('❌ Booking creation failed');
      try {
        const errorData = JSON.parse(bookingResult);
        console.log('Error details:', errorData);
      } catch (e) {
        console.log('Raw error response:', bookingResult);
      }
    } else {
      console.log('✅ Booking created successfully!');
      try {
        const successData = JSON.parse(bookingResult);
        console.log('Success details:', successData);
      } catch (e) {
        console.log('Raw success response:', bookingResult);
      }
    }
    
  } catch (error) {
    console.error('💥 Test failed with error:', error);
  }
}

// Run in browser console or Node.js
if (typeof window !== 'undefined') {
  // Browser environment
  testBookingAPI();
} else {
  // Node.js environment
  const fetch = require('node-fetch');
  testBookingAPI();
}
