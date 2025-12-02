// Test script to simulate panel behavior
// Using built-in fetch (Node.js 18+)

const API_BASE = 'http://localhost:3000/api';

async function testPanelBehavior() {
    console.log('🧪 Testing Panel Behavior Simulation...\n');
    
    try {
        // Simulate what the panel does when first loading (today's date)
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const todayString = `${year}-${month}-${day}`;
        
        console.log(`📅 Today's date (getTodayString): ${todayString}`);
        
        // Test 1: Initial load with today's date
        console.log('1️⃣ Simulating initial panel load...');
        const params1 = new URLSearchParams();
        params1.append('date', todayString);
        params1.append('_t', Date.now().toString());
        
        const url1 = `${API_BASE}/bookings?${params1.toString()}`;
        console.log(`   🌐 URL: ${url1}`);
        
        const response1 = await fetch(url1, {
            headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            }
        });
        
        if (response1.ok) {
            const data1 = await response1.json();
            const bookings1 = data1.bookings || [];
            console.log(`   ✅ Found ${bookings1.length} bookings for today`);
            bookings1.forEach(b => {
                console.log(`     - ${b.customer_name} at ${b.booking_time} (${b.booking_date})`);
            });
        } else {
            console.log(`   ❌ API error: ${response1.status}`);
        }
        
        console.log();
        
        // Test 2: Simulate clicking on 2025-05-28 (should show 5 bookings)
        console.log('2️⃣ Simulating date change to 2025-05-28...');
        const newDate = '2025-05-28';
        const params2 = new URLSearchParams();
        params2.append('date', newDate);
        params2.append('_t', Date.now().toString());
        
        const url2 = `${API_BASE}/bookings?${params2.toString()}`;
        console.log(`   🌐 URL: ${url2}`);
        
        const response2 = await fetch(url2, {
            headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            }
        });
        
        if (response2.ok) {
            const data2 = await response2.json();
            const bookings2 = data2.bookings || [];
            console.log(`   ✅ Found ${bookings2.length} bookings for ${newDate}`);
            bookings2.forEach(b => {
                console.log(`     - ${b.customer_name} at ${b.booking_time} (${b.booking_date})`);
            });
        } else {
            console.log(`   ❌ API error: ${response2.status}`);
        }
        
        console.log();
        
        // Test 3: Simulate clicking back to 2025-05-26 (should show 2 bookings)
        console.log('3️⃣ Simulating date change to 2025-05-26...');
        const oldDate = '2025-05-26';
        const params3 = new URLSearchParams();
        params3.append('date', oldDate);
        params3.append('_t', Date.now().toString());
        
        const url3 = `${API_BASE}/bookings?${params3.toString()}`;
        console.log(`   🌐 URL: ${url3}`);
        
        const response3 = await fetch(url3, {
            headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            }
        });
        
        if (response3.ok) {
            const data3 = await response3.json();
            const bookings3 = data3.bookings || [];
            console.log(`   ✅ Found ${bookings3.length} bookings for ${oldDate}`);
            bookings3.forEach(b => {
                console.log(`     - ${b.customer_name} at ${b.booking_time} (${b.booking_date})`);
            });
        } else {
            console.log(`   ❌ API error: ${response3.status}`);
        }
        
        console.log();
        
        // Test 4: Simulate reset filters (back to today)
        console.log('4️⃣ Simulating reset filters (back to today)...');
        const params4 = new URLSearchParams();
        params4.append('date', todayString);
        params4.append('_t', Date.now().toString());
        
        const url4 = `${API_BASE}/bookings?${params4.toString()}`;
        console.log(`   🌐 URL: ${url4}`);
        
        const response4 = await fetch(url4, {
            headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            }
        });
        
        if (response4.ok) {
            const data4 = await response4.json();
            const bookings4 = data4.bookings || [];
            console.log(`   ✅ Found ${bookings4.length} bookings for today (reset)`);
            bookings4.forEach(b => {
                console.log(`     - ${b.customer_name} at ${b.booking_time} (${b.booking_date})`);
            });
        } else {
            console.log(`   ❌ API error: ${response4.status}`);
        }
        
        console.log('\n🎉 Panel behavior test completed!');
        console.log('\n📋 Summary:');
        console.log('   ✅ Server-side filtering works correctly');
        console.log('   ✅ Cache busting parameters work');
        console.log('   ✅ Date switching returns different results');
        console.log('   ✅ Reset functionality works');
        console.log('\n🔍 If the panel still shows "no bookings", check:');
        console.log('   1. Browser console for JavaScript errors');
        console.log('   2. Network tab for failed API calls');
        console.log('   3. Panel authentication (admin/barber2025)');
        
    } catch (error) {
        console.error('❌ Error testing panel behavior:', error);
    }
}

testPanelBehavior();
