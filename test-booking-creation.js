// Test booking creation with correct port
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function testBookingCreation() {
    console.log('🧪 Testing Booking Creation...\n');
    
    try {
        const BASE_URL = 'http://localhost:3004';
        
        // 1. Test Barbers API
        console.log('1. Testing Barbers API...');
        const barbersResponse = await fetch(`${BASE_URL}/api/barbers`);
        const barbers = await barbersResponse.json();
        
        if (!barbers || barbers.length === 0) {
            console.log('❌ No barbers found');
            return;
        }
        
        const barber = barbers[0];
        console.log(`✅ Barber found: ${barber.name} (ID: ${barber.id})`);
        
        // 2. Test Services API
        console.log('\n2. Testing Services API...');
        const servicesResponse = await fetch(`${BASE_URL}/api/services`);
        const services = await servicesResponse.json();
        
        if (!services || services.length === 0) {
            console.log('❌ No services found');
            return;
        }
        
        const service = services[0];
        console.log(`✅ Service found: ${service.name} (ID: ${service.id}, Price: €${service.price})`);
        
        // 3. Test booking creation
        console.log('\n3. Creating test booking...');
        
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const testDate = tomorrow.toISOString().split('T')[0];
        
        const bookingData = {
            barberId: barber.id,
            services: [service.id],
            date: testDate,
            time: "10:00",
            customerInfo: {
                name: 'Test Customer',
                email: 'test@example.com',
                phone: '+39 123 456 7890',
                notes: 'Test booking from automated flow'
            }
        };
        
        console.log('📋 Booking data to send:');
        console.log(JSON.stringify(bookingData, null, 2));
        
        const bookingResponse = await fetch(`${BASE_URL}/api/bookings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(bookingData)
        });
        
        if (!bookingResponse.ok) {
            const errorText = await bookingResponse.text();
            console.log(`❌ Booking creation failed (${bookingResponse.status}): ${errorText}`);
            return;
        }
        
        const newBooking = await bookingResponse.json();
        console.log(`✅ Booking created successfully!`);
        console.log('📝 Booking details:');
        console.log(`   - ID: ${newBooking.id}`);
        console.log(`   - Customer: ${newBooking.customerName}`);
        console.log(`   - Service: ${newBooking.service}`);
        console.log(`   - Date: ${newBooking.date}`);
        console.log(`   - Time: ${newBooking.time}`);
        console.log(`   - Price: €${newBooking.price}`);
        console.log(`   - Status: ${newBooking.status}`);
        
        console.log('\n🎉 BOOKING CREATION TEST SUCCESSFUL!');
        
    } catch (error) {
        console.error('❌ Error in booking creation test:', error);
    }
}

testBookingCreation();
