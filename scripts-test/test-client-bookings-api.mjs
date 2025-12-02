// Test per verificare se l'API bookings per i clienti include barber_phone
import { createReadStream } from 'fs';

async function testClientBookingsAPI() {
    try {
        console.log('🔍 Testing client bookings API...');
        
        // Simula una chiamata dell'API come cliente
        const response = await fetch('http://localhost:3000/api/bookings', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        const data = await response.json();
        
        console.log('📋 API Response Status:', response.status);
        console.log('📋 API Response Data:', data);
        
        if (data.bookings && data.bookings.length > 0) {
            const firstBooking = data.bookings[0];
            console.log('\n📝 First booking structure:');
            console.log('- ID:', firstBooking.id);
            console.log('- Service:', firstBooking.service_name);
            console.log('- Barber Name:', firstBooking.barber_name);
            console.log('- Barber Phone:', firstBooking.barber_phone);
            console.log('- Date:', firstBooking.booking_date);
            console.log('- Time:', firstBooking.booking_time);
            
            if (firstBooking.barber_phone) {
                console.log('\n✅ barber_phone is included in client API!');
                console.log('📞 Phone number:', firstBooking.barber_phone);
            } else {
                console.log('\n❌ barber_phone is NOT included in client API');
            }
        } else {
            console.log('⚠️ No bookings found in response');
        }
        
    } catch (error) {
        console.error('❌ Error testing client bookings API:', error);
    }
}

testClientBookingsAPI();
