// Test del pannello di annullamento usando fetch nativo
async function testCancelBooking() {
  console.log('🚀 Starting booking cancellation test...');
  
  try {
    console.log('🔍 Fetching bookings from http://localhost:3003/api/bookings...');
    
    // Prima ottieni tutte le prenotazioni
    const getResponse = await fetch('http://localhost:3003/api/bookings', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    console.log('📋 GET Response status:', getResponse.status);
    console.log('📋 GET Response ok:', getResponse.ok);
    
    if (!getResponse.ok) {
      const errorText = await getResponse.text();
      console.log('❌ GET Request failed:', errorText);
      return;
    }
    
    const getData = await getResponse.json();
    console.log('📋 GET Response data:', JSON.stringify(getData, null, 2));
    
    if (!getData.bookings || getData.bookings.length === 0) {
      console.log('❌ No bookings found to cancel');
      return;
    }
    
    console.log('📋 Found', getData.bookings.length, 'bookings');
    
    // Prendi la prima prenotazione confermata
    const bookingToCancel = getData.bookings.find(b => b.status === 'confirmed');
    
    if (!bookingToCancel) {
      console.log('❌ No confirmed bookings found to cancel');
      console.log('Available bookings:', getData.bookings.map(b => ({
        id: b.id,
        status: b.status,
        customer: b.customer_name
      })));
      return;
    }
    
    console.log('🎯 Found booking to cancel:', {
      id: bookingToCancel.id,
      customer: bookingToCancel.customer_name,
      date: bookingToCancel.booking_date,
      time: bookingToCancel.booking_time,
      status: bookingToCancel.status
    });
    
    // Ora prova ad annullare la prenotazione
    console.log('\n🚫 Attempting to cancel booking with PATCH request...');
    console.log('Request body:', JSON.stringify({
      id: bookingToCancel.id,
      status: 'cancelled'
    }, null, 2));
    
    const cancelResponse = await fetch('http://localhost:3003/api/bookings', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: bookingToCancel.id,
        status: 'cancelled'
      })
    });
    
    console.log('📱 PATCH Response status:', cancelResponse.status);
    console.log('📱 PATCH Response ok:', cancelResponse.ok);
    
    const cancelData = await cancelResponse.json();
    console.log('📱 PATCH Response data:', JSON.stringify(cancelData, null, 2));
    
    if (cancelResponse.ok) {
      console.log('✅ Successfully cancelled booking!');
      console.log('Updated booking:', {
        id: cancelData.id,
        status: cancelData.status,
        customer: cancelData.customerName
      });
    } else {
      console.log('❌ Failed to cancel booking');
      console.log('Error:', cancelData.error || 'Unknown error');
    }
    
  } catch (error) {
    console.error('💥 Test failed with error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
  }
}

console.log('📋 Test script starting...');
testCancelBooking()
  .then(() => {
    console.log('🏁 Test completed');
  })
  .catch((error) => {
    console.error('🚨 Unhandled error:', error);
  });
