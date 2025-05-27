// Test script to verify the panel API is working correctly
// Using built-in fetch (Node.js 18+)

const API_BASE = 'http://localhost:3000/api';

async function testPanelAPI() {
    console.log('🧪 Testing Panel API Server-Side Filtering...\n');
    
    try {
        // Test 1: Get bookings for 2025-05-27 (should have 1 booking)
        console.log('1️⃣ Testing date 2025-05-27 (expected: 1 booking)');
        const response1 = await fetch(`${API_BASE}/bookings?date=2025-05-27`);
        if (response1.ok) {
            const data1 = await response1.json();
            const bookings1 = data1.bookings || [];
            console.log(`   ✅ Found ${bookings1.length} bookings`);
            bookings1.forEach(b => {
                console.log(`     - ${b.customer_name} at ${b.booking_time} (${b.booking_date})`);
            });
        } else {
            console.log(`   ❌ API error: ${response1.status}`);
        }
        
        console.log();
        
        // Test 2: Get bookings for 2025-05-28 (should have 5 bookings)
        console.log('2️⃣ Testing date 2025-05-28 (expected: 5 bookings)');
        const response2 = await fetch(`${API_BASE}/bookings?date=2025-05-28`);
        if (response2.ok) {
            const data2 = await response2.json();
            const bookings2 = data2.bookings || [];
            console.log(`   ✅ Found ${bookings2.length} bookings`);
            bookings2.forEach(b => {
                console.log(`     - ${b.customer_name} at ${b.booking_time} (${b.booking_date})`);
            });
        } else {
            console.log(`   ❌ API error: ${response2.status}`);
        }
        
        console.log();
        
        // Test 3: Get bookings for 2025-05-26 (should have 2 bookings)
        console.log('3️⃣ Testing date 2025-05-26 (expected: 2 bookings)');
        const response3 = await fetch(`${API_BASE}/bookings?date=2025-05-26`);
        if (response3.ok) {
            const data3 = await response3.json();
            const bookings3 = data3.bookings || [];
            console.log(`   ✅ Found ${bookings3.length} bookings`);
            bookings3.forEach(b => {
                console.log(`     - ${b.customer_name} at ${b.booking_time} (${b.booking_date})`);
            });
        } else {
            console.log(`   ❌ API error: ${response3.status}`);
        }
        
        console.log();
        
        // Test 4: Get bookings for a date with no bookings (should have 0 bookings)
        console.log('4️⃣ Testing date 2025-06-01 (expected: 0 bookings)');
        const response4 = await fetch(`${API_BASE}/bookings?date=2025-06-01`);
        if (response4.ok) {
            const data4 = await response4.json();
            const bookings4 = data4.bookings || [];
            console.log(`   ✅ Found ${bookings4.length} bookings`);
        } else {
            console.log(`   ❌ API error: ${response4.status}`);
        }
        
        console.log('\n🎉 API test completed!');
        
    } catch (error) {
        console.error('❌ Error testing API:', error);
    }
}

testPanelAPI();
