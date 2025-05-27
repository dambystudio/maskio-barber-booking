// Test script to verify the booking fix works correctly
import fetch from 'node-fetch';

async function testBookingCreation() {
  const testBooking = {
    customerName: "Mario Rossi",
    customerEmail: "mario.rossi@test.com", 
    customerPhone: "123-456-7890",
    barberId: "barber1",
    date: "2025-05-28",
    timeSlot: "10:00",
    serviceIds: ["10c87b32-3588-439b-9627-b96578ad1116"], // Using actual service ID from database (Taglio & Styling)
    totalPrice: 25,
    notes: "Test booking after fix"
  };

  try {
    console.log('Testing booking creation with serviceIds...');
    console.log('Payload:', JSON.stringify(testBooking, null, 2));
    
    const response = await fetch('http://localhost:3001/api/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testBooking),
    });

    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      return;
    }

    const result = await response.json();
    console.log('✅ Success! Booking created:', result);
    
    // Verify the services were properly fetched
    if (result.services && result.services.length > 0) {
      console.log('✅ Services were properly fetched from serviceIds:');
      result.services.forEach(service => {
        console.log(`- ${service.name}: €${service.price}`);
      });
    } else {
      console.log('⚠️ Warning: No services found in response');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testBookingCreation();
