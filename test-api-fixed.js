// Test script for the fixed API
async function testAPI() {
    console.log('🧪 Testing fixed booking API...\n');
    
    // Test 1: GET bookings (should work even if empty)
    console.log('1️⃣ Testing GET /api/bookings...');
    try {
        const response = await fetch('http://localhost:3002/api/bookings');
        const result = await response.json();
        
        if (response.ok) {
            console.log('✅ GET bookings successful');
            console.log(`📋 Found ${Array.isArray(result) ? result.length : 0} bookings`);
        } else {
            console.log('❌ GET bookings failed:', result);
        }
    } catch (error) {
        console.log('❌ GET bookings error:', error.message);
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Test 2: POST booking (create new booking)
    console.log('2️⃣ Testing POST /api/bookings...');
    
    const testBookingData = {
        userId: 'test_user_123',
        customerName: 'Test User Fixed',
        customerEmail: 'test-fixed@example.com',
        customerPhone: '+39 123 456 7890',
        barberId: 'fabio',
        barberName: 'Fabio',
        service: 'Taglio Classico',
        price: 25,
        date: '2025-05-27',
        time: '14:30',
        duration: 30,
        status: 'confirmed',
        notes: 'Test booking with fixed API'
    };
    
    try {
        const response = await fetch('http://localhost:3002/api/bookings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testBookingData)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            console.log('✅ POST booking successful');
            console.log(`📅 Booking created with ID: ${result.id}`);
            console.log(`👤 Customer: ${result.customerName}`);
            console.log(`📧 Email: ${result.customerEmail}`);
            console.log(`💰 Price: €${result.price}`);
            console.log(`📅 Date: ${result.date} at ${result.time}`);
        } else {
            console.log('❌ POST booking failed:', result);
        }
    } catch (error) {
        console.log('❌ POST booking error:', error.message);
    }
    
    console.log('\n🎉 API testing complete!');
}

// Run the test
testAPI().catch(console.error);
