/**
 * Test per verificare il funzionamento della cancellazione su Vercel
 */

// Test la produzione usando l'URL di Vercel
const VERCEL_URL = 'https://maskio-barber-booking-43r0qmz3x-davide-dambrosios-projects.vercel.app';

async function testDeleteOnVercel() {
  console.log('🧪 Testing DELETE API on Vercel...');
  
  try {
    // Prima, creiamo una prenotazione di test
    const testBooking = {
      customerName: 'Test Delete User',
      customerEmail: 'test@example.com',
      customerPhone: '1234567890',
      barberId: '1',
      service: 'Test Service',
      price: 25,
      date: '2025-05-28',
      time: '10:00',
      duration: 30,
      notes: 'Test booking for deletion'
    };

    console.log('📝 Creating test booking...');
    const createResponse = await fetch(`${VERCEL_URL}/api/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testBooking)
    });

    if (!createResponse.ok) {
      throw new Error(`Failed to create test booking: ${createResponse.status}`);
    }

    const newBooking = await createResponse.json();
    console.log('✅ Test booking created:', newBooking.id);

    // Ora testiamo la cancellazione
    console.log('🗑️ Testing DELETE request...');
    const deleteResponse = await fetch(`${VERCEL_URL}/api/bookings?id=${newBooking.id}`, {
      method: 'DELETE',
    });

    console.log('DELETE response status:', deleteResponse.status);
    console.log('DELETE response headers:', Object.fromEntries(deleteResponse.headers.entries()));

    if (deleteResponse.ok) {
      const result = await deleteResponse.json();
      console.log('✅ DELETE successful:', result);
    } else {
      const errorText = await deleteResponse.text();
      console.error('❌ DELETE failed:');
      console.error('Status:', deleteResponse.status);
      console.error('Status Text:', deleteResponse.statusText);
      console.error('Response Body:', errorText);
    }

  } catch (error) {
    console.error('❌ Network Error:', error.message);
    console.error('Full error:', error);
  }
}

testDeleteOnVercel();
