import fetch from 'node-fetch';

async function testBookingsWithDate() {
  try {
    console.log('🧪 Testing bookings API with specific dates...\n');
    
    // Test con oggi
    const today = new Date().toISOString().split('T')[0];
    console.log(`📡 Testing today (${today}):`);
    
    const response1 = await fetch(`http://localhost:3000/api/bookings?date=${today}`);
    if (response1.ok) {
      const data1 = await response1.json();
      console.log(`✅ Today: ${data1.bookings.length} bookings`);
    } else {
      console.log(`❌ Today: Error ${response1.status}`);
    }
    
    // Test con domani
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    console.log(`📡 Testing tomorrow (${tomorrowStr}):`);
    
    const response2 = await fetch(`http://localhost:3000/api/bookings?date=${tomorrowStr}`);
    if (response2.ok) {
      const data2 = await response2.json();
      console.log(`✅ Tomorrow: ${data2.bookings.length} bookings`);
      if (data2.bookings.length > 0) {
        console.log('📋 Sample booking:', {
          customer: data2.bookings[0].customer_name,
          time: data2.bookings[0].booking_time,
          barber: data2.bookings[0].barber_name,
          service: data2.bookings[0].service_name
        });
      }
    } else {
      console.log(`❌ Tomorrow: Error ${response2.status}`);
    }
    
    // Test senza parametri (tutte le prenotazioni)
    console.log(`📡 Testing all bookings:`);
    
    const response3 = await fetch(`http://localhost:3000/api/bookings`);
    if (response3.ok) {
      const data3 = await response3.json();
      console.log(`✅ All bookings: ${data3.bookings.length} total`);
      
      // Raggruppa per data
      const byDate = {};
      data3.bookings.forEach(booking => {
        const date = booking.booking_date;
        if (!byDate[date]) byDate[date] = 0;
        byDate[date]++;
      });
      
      console.log('📊 Bookings by date:');
      Object.entries(byDate).sort().forEach(([date, count]) => {
        console.log(`   ${date}: ${count} bookings`);
      });
    } else {
      console.log(`❌ All bookings: Error ${response3.status}`);
    }
    
  } catch (error) {
    console.error('❌ Error testing bookings:', error);
  }
}

// Run the test
testBookingsWithDate();
