const API_BASE = 'http://localhost:3006/api';

async function testCancellation() {
    console.log('🔄 Testing booking cancellation API...');
    
    try {
        // First, get all bookings to find a confirmed one for today
        console.log('\n1. Fetching current bookings...');
        const fetchResponse = await fetch(`${API_BASE}/bookings`);
        
        if (!fetchResponse.ok) {
            console.log('❌ Failed to fetch bookings:', fetchResponse.status);
            return;
        }
        
        const bookingsData = await fetchResponse.json();
        console.log('✅ Bookings fetched successfully');
        
        // Find a confirmed booking for today (2025-05-27)
        const todayBookings = bookingsData.bookings.filter(b => 
            b.booking_date === '2025-05-27' && b.status === 'confirmed'
        );
        
        if (todayBookings.length === 0) {
            console.log('❌ No confirmed bookings found for today');
            return;
        }
        
        const testBooking = todayBookings[0];
        console.log(`\n2. Found test booking: ${testBooking.id} - ${testBooking.customer_name} at ${testBooking.booking_time}`);
        
        // Test the PATCH API to cancel the booking
        console.log(`\n3. Attempting to cancel booking ${testBooking.id}...`);
        
        const cancelResponse = await fetch(`${API_BASE}/bookings`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: testBooking.id,
                status: 'cancelled'
            })
        });
        
        console.log(`PATCH response status: ${cancelResponse.status}`);
        
        if (cancelResponse.ok) {
            const result = await cancelResponse.json();
            console.log('✅ Booking cancelled successfully:', JSON.stringify(result, null, 2));
        } else {
            const error = await cancelResponse.text();
            console.log('❌ Failed to cancel booking:', error);
        }
        
        // Verify the cancellation
        console.log('\n4. Verifying cancellation...');
        const verifyResponse = await fetch(`${API_BASE}/bookings`);
        if (verifyResponse.ok) {
            const updatedBookings = await verifyResponse.json();
            const updatedBooking = updatedBookings.bookings.find(b => b.id === testBooking.id);
            if (updatedBooking) {
                console.log(`✅ Booking status updated to: ${updatedBooking.status}`);
            } else {
                console.log('❌ Booking not found after update');
            }
        }
        
    } catch (error) {
        console.error('❌ Error testing cancellation:', error);
    }
}

testCancellation().catch(console.error);
