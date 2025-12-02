import fetch from 'node-fetch';

async function testPannelloPrenotazioniFlow() {
  try {
    console.log('🧪 Simulating pannello prenotazioni data flow...\n');
    
    // Test con una data che ha prenotazioni
    const testDate = '2025-06-18'; // Sappiamo che questa data ha 1 prenotazione
    console.log(`📡 Testing pannello with date: ${testDate}`);
    
    const response = await fetch(`http://localhost:3000/api/bookings?date=${testDate}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('📋 Raw API response:', typeof data, Object.keys(data));
      
      // Simula il nuovo codice del frontend
      const bookingsArray = data.bookings || [];
      console.log(`✅ Extracted bookings array: ${bookingsArray.length} items`);
      
      if (bookingsArray.length > 0) {
        console.log('🎉 SUCCESS! Bookings would be displayed in pannello:');
        bookingsArray.forEach((booking, index) => {
          console.log(`  ${index + 1}. ${booking.customer_name} - ${booking.booking_time} con ${booking.barber_name} (${booking.service_name})`);
        });
      } else {
        console.log('ℹ️  No bookings for this date (this is expected for some dates)');
      }
      
      // Test anche status filtering
      console.log(`\n📡 Testing with status filter (confirmed):`);
      const statusResponse = await fetch(`http://localhost:3000/api/bookings?date=${testDate}&status=confirmed`);
      
      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        const statusBookings = statusData.bookings || [];
        console.log(`✅ Confirmed bookings: ${statusBookings.length} items`);
      }
      
    } else {
      console.log(`❌ API Error: ${response.status}`);
      const errorText = await response.text();
      console.log('Error details:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Error testing pannello flow:', error);
  }
}

// Run the test
testPannelloPrenotazioniFlow();
