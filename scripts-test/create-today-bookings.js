const API_BASE = 'http://localhost:3006/api';

async function createTodayBookings() {
    console.log('🔄 Creating test bookings for today (May 27, 2025)...');
    
    try {
        // Get current date in YYYY-MM-DD format (May 27, 2025)
        const today = '2025-05-27';
        console.log(`📅 Using date: ${today}`);
        
        // Test booking 1 - Fabio, Taglio
        const booking1 = {
            serviceIds: ['taglio'],
            barberId: 'fabio',
            date: today,
            time: '09:30',
            customerName: 'Mario Rossi',
            customerEmail: 'mario@test.com',
            customerPhone: '+393331234567',
            notes: 'Test booking for cancellation'
        };
        
        console.log('\n📋 Creating booking 1:', JSON.stringify(booking1, null, 2));
        
        const response1 = await fetch(`${API_BASE}/bookings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(booking1)
        });
          if (response1.ok) {
            const result1 = await response1.json();
            console.log('✅ Booking 1 created successfully:', JSON.stringify(result1, null, 2));
        } else {
            const error1 = await response1.text();
            console.log('❌ Failed to create booking 1:', response1.status, error1);
        }
        
        // Test booking 2 - Michele, Barba
        const booking2 = {
            serviceIds: ['barba'],
            barberId: 'michele',
            date: today,
            time: '10:30',
            customerName: 'Luigi Verdi',
            customerEmail: 'luigi@test.com',
            customerPhone: '+393339876543',
            notes: 'Another test booking'
        };
        
        console.log('\n📋 Creating booking 2:', JSON.stringify(booking2, null, 2));
        
        const response2 = await fetch(`${API_BASE}/bookings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(booking2)
        });
          if (response2.ok) {
            const result2 = await response2.json();
            console.log('✅ Booking 2 created successfully:', JSON.stringify(result2, null, 2));
        } else {
            const error2 = await response2.text();
            console.log('❌ Failed to create booking 2:', response2.status, error2);
        }
          // Verify bookings exist
        console.log('\n🔍 Fetching all bookings to verify...');
        const fetchResponse = await fetch(`${API_BASE}/bookings`);
        if (fetchResponse.ok) {
            const allBookings = await fetchResponse.json();
            console.log('All bookings response:', JSON.stringify(allBookings, null, 2));
            if (Array.isArray(allBookings)) {
                const todayBookings = allBookings.filter(b => b.date === today);
                console.log(`✅ Found ${todayBookings.length} bookings for today`);
                todayBookings.forEach(booking => {
                    console.log(`- ${booking.id}: ${booking.customerName} at ${booking.time} with ${booking.barberId} (${booking.status})`);
                });
            } else {
                console.log('❌ Response is not an array:', typeof allBookings);
            }
        }
        
    } catch (error) {
        console.error('❌ Error creating test bookings:', error);
    }
}

createTodayBookings().catch(console.error);
