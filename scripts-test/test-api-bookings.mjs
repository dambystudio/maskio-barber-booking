#!/usr/bin/env node

console.log('🧪 TEST API /api/bookings Response\n');

const API_URL = 'http://localhost:3000/api/bookings';

async function testAPI() {
  try {
    console.log('📡 Fetching:', API_URL);
    
    const response = await fetch(API_URL);
    
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    
    if (!response.ok) {
      console.error('❌ Response not OK');
      const text = await response.text();
      console.error('Body:', text);
      return;
    }
    
    const data = await response.json();
    
    console.log('\n✅ Response successful');
    console.log('Keys:', Object.keys(data));
    
    if (data.bookings) {
      console.log(`\nBookings found: ${data.bookings.length}`);
      
      if (data.bookings.length > 0) {
        console.log('\nFirst 3 bookings:');
        data.bookings.slice(0, 3).forEach((booking, index) => {
          console.log(`\n📋 Booking ${index + 1}:`);
          console.log('  Keys:', Object.keys(booking));
          console.log(`  Barber: ${booking.barber_name || 'N/A'}`);
          console.log(`  Customer: ${booking.customer_name || 'N/A'}`);
          console.log(`  Date: ${booking.booking_date || booking.date || 'N/A'}`);
          console.log(`  Time: ${booking.booking_time || booking.time || 'N/A'}`);
          console.log(`  Service: ${booking.service_name || booking.service || 'N/A'}`);
        });
        
        // Raggruppa per barbiere
        const byBarber = {};
        data.bookings.forEach(b => {
          const barberName = b.barber_name;
          if (!byBarber[barberName]) {
            byBarber[barberName] = 0;
          }
          byBarber[barberName]++;
        });
        
        console.log('\n\n📊 Bookings per barbiere:');
        Object.keys(byBarber).forEach(name => {
          console.log(`  💈 ${name}: ${byBarber[name]} prenotazioni`);
        });
      }
    } else {
      console.log('\n⚠️  No bookings array in response');
      console.log('Response:', JSON.stringify(data, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  }
}

testAPI();
