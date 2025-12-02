const API_BASE = 'http://localhost:3006/api';

async function createTodayBooking() {
    console.log('🔄 Creating a fresh test booking for today...');
    
    try {
        const today = '2025-05-27';
        
        // Create a new booking with a different time slot
        const booking = {
            serviceIds: ['taglio'],
            barberId: 'fabio',
            date: today,
            time: '15:00',
            customerName: 'Test Customer',
            customerEmail: 'test@example.com',
            customerPhone: '+393331111111',
            notes: 'Fresh booking for cancellation test'
        };
        
        console.log('📋 Creating booking:', JSON.stringify(booking, null, 2));
        
        const response = await fetch(`${API_BASE}/bookings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(booking)
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log('✅ Fresh booking created successfully!');
            console.log(`📍 Booking ID: ${result.id || result.booking?.id}`);
            console.log(`👤 Customer: ${result.customerName || result.booking?.customerName}`);
            console.log(`⏰ Time: ${result.time || result.booking?.time}`);
            console.log(`🪑 Barber: ${result.barberName || result.booking?.barberName}`);
            console.log(`📊 Status: ${result.status || result.booking?.status}`);
        } else {
            const error = await response.text();
            console.log('❌ Failed to create booking:', response.status, error);
        }
        
    } catch (error) {
        console.error('❌ Error creating booking:', error);
    }
}

createTodayBooking().catch(console.error);
