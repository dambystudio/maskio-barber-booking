// Test specifico per autenticazione e booking
async function testAuthenticatedBooking() {
  console.log('🔐 Testing Authenticated Booking...\n');
  
  try {
    // 1. Check if we have a session
    console.log('1️⃣ Checking user session...');
    const sessionResponse = await fetch('/api/auth/session', {
      credentials: 'include'
    });
    
    console.log('Session Response Status:', sessionResponse.status);
    
    if (sessionResponse.ok) {
      const session = await sessionResponse.json();
      console.log('✅ Session data:', session);
      
      if (!session.user) {
        console.log('❌ No user in session');
        console.log('🔗 You need to login first: /auth/signin');
        return;
      }
      
      console.log('👤 User ID:', session.user.id);
      console.log('📧 User Email:', session.user.email);
      
    } else {
      console.log('❌ Session check failed');
      return;
    }
    
    // 2. Test services API with authentication
    console.log('\n2️⃣ Testing Services API...');
    const servicesResponse = await fetch('/api/services', {
      credentials: 'include'
    });
    
    if (servicesResponse.ok) {
      const services = await servicesResponse.json();
      console.log('✅ Services available:', services.length);
      if (services.length > 0) {
        console.log('Sample service:', services[0]);
      }
    } else {
      console.log('❌ Services API failed');
    }
    
    // 3. Test barbers API with authentication
    console.log('\n3️⃣ Testing Barbers API...');
    const barbersResponse = await fetch('/api/barbers', {
      credentials: 'include'
    });
    
    if (barbersResponse.ok) {
      const barbers = await barbersResponse.json();
      console.log('✅ Barbers available:', barbers.length);
      if (barbers.length > 0) {
        console.log('Sample barber:', barbers[0]);
      }
    } else {
      console.log('❌ Barbers API failed');
    }
    
    // 4. Test booking creation with authentication
    console.log('\n4️⃣ Testing Booking Creation with Authentication...');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const testDate = tomorrow.toISOString().split('T')[0];
    
    const testBooking = {
      userId: 'should-be-ignored-server-uses-session',
      barberId: 'fabio',
      serviceIds: ['taglio'],
      customerInfo: {
        name: 'Test User Auth',
        email: 'test@example.com',
        phone: '+39 333 1234567',
        notes: 'Test with authentication'
      },
      date: testDate,
      time: '11:00',
      totalPrice: 25,
      totalDuration: 30
    };
    
    console.log('📤 Sending authenticated booking:');
    console.log(JSON.stringify(testBooking, null, 2));
    
    const bookingResponse = await fetch('/api/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Important: include session cookies
      body: JSON.stringify(testBooking)
    });
    
    console.log('📥 Booking Response Status:', bookingResponse.status);
    console.log('📥 Booking Response OK:', bookingResponse.ok);
    
    const responseText = await bookingResponse.text();
    console.log('📥 Booking Response:', responseText);
    
    if (bookingResponse.ok) {
      console.log('✅ Authenticated booking successful!');
      try {
        const result = JSON.parse(responseText);
        console.log('Success data:', result);
      } catch (e) {
        console.log('Raw success response:', responseText);
      }
    } else {
      console.log('❌ Authenticated booking failed');
      try {
        const error = JSON.parse(responseText);
        console.log('Error details:', error);
      } catch (e) {
        console.log('Raw error response:', responseText);
      }
    }
    
  } catch (error) {
    console.error('💥 Test failed:', error);
  }
}

// Execute the test
testAuthenticatedBooking();
