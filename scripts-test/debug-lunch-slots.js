const API_BASE = 'http://localhost:3007/api';

async function debugLunchTimeSlots() {
    console.log('🔍 Debugging lunch time slots (12:00, 12:30)...\n');
    
    try {
        // Test per oggi (2025-05-27) e domani (2025-05-28)
        const testDates = ['2025-05-27', '2025-05-28'];
        const barbers = ['fabio', 'michele'];
        
        for (const date of testDates) {
            console.log(`📅 Testing date: ${date}`);
            
            for (const barberId of barbers) {
                console.log(`\n👨‍💼 Barber: ${barberId.toUpperCase()}`);
                
                // 1. Check available slots from API
                const slotsResponse = await fetch(`${API_BASE}/bookings/slots?date=${date}&barberId=${barberId}`);
                if (slotsResponse.ok) {
                    const slots = await slotsResponse.json();
                    console.log(`📊 Total slots returned: ${slots.length}`);
                    
                    // Check specifically for lunch time slots
                    const lunchSlots = slots.filter(slot => 
                        slot.time === '12:00' || slot.time === '12:30'
                    );
                    
                    console.log(`🍽️ Lunch time slots:`);
                    if (lunchSlots.length === 0) {
                        console.log('   ❌ NO lunch time slots found in response');
                    } else {
                        lunchSlots.forEach(slot => {
                            console.log(`   ${slot.time}: ${slot.available ? '✅ Available' : '❌ Occupied'}`);
                        });
                    }
                    
                    // Show a sample of all available slots for reference
                    const availableSlots = slots.filter(s => s.available);
                    const unavailableSlots = slots.filter(s => !s.available);
                    
                    console.log(`📈 Available slots (${availableSlots.length}): ${availableSlots.map(s => s.time).slice(0, 10).join(', ')}${availableSlots.length > 10 ? '...' : ''}`);
                    console.log(`📉 Unavailable slots (${unavailableSlots.length}): ${unavailableSlots.map(s => s.time).slice(0, 10).join(', ')}${unavailableSlots.length > 10 ? '...' : ''}`);
                    
                } else {
                    console.log(`❌ Failed to get slots: ${slotsResponse.status}`);
                }
            }
            console.log('\n' + '='.repeat(50));
        }
        
        // 2. Check existing bookings for lunch time
        console.log('\n🔍 Checking existing bookings for lunch time slots...');
        const bookingsResponse = await fetch(`${API_BASE}/bookings`);
        if (bookingsResponse.ok) {
            const bookingsData = await bookingsResponse.json();
            const lunchBookings = bookingsData.bookings.filter(booking => 
                (booking.booking_time === '12:00' || booking.booking_time === '12:30') &&
                booking.status === 'confirmed'
            );
            
            console.log(`🍽️ Found ${lunchBookings.length} confirmed lunch time bookings:`);
            lunchBookings.forEach(booking => {
                console.log(`   📅 ${booking.booking_date} ${booking.booking_time} - ${booking.customer_name} with ${booking.barber_name} (${booking.status})`);
            });
        }
        
    } catch (error) {
        console.error('❌ Error debugging lunch time slots:', error);
    }
}

debugLunchTimeSlots().catch(console.error);
