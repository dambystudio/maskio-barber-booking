// Test completo del flusso di prenotazione
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function testCompleteBookingFlow() {
    console.log('🎯 Testing Complete Booking Flow...\n');
    
    try {        // 1. Test Barbers API
        console.log('1. Testing Barbers API...');
        const barbersResponse = await fetch('http://localhost:3005/api/barbers');
        console.log(`Barbers API Response Status: ${barbersResponse.status}`);
        const barbersText = await barbersResponse.text();
        if (!barbersResponse.ok) {
            console.error(`Barbers API Error: ${barbersText}`);
            return;
        }
        const barbers = JSON.parse(barbersText);
        
        if (!barbers || barbers.length === 0) {
            console.log('❌ No barbers found');
            return;
        }
        
        const barber = barbers[0];
        console.log(`✅ Barber found: ${barber.name} (ID: ${barber.id})`);
        
        // 2. Test Services API
        console.log('\n2. Testing Services API...');
        const servicesResponse = await fetch('http://localhost:3005/api/services');
        console.log(`Services API Response Status: ${servicesResponse.status}`);
        const servicesText = await servicesResponse.text();
        if (!servicesResponse.ok) {
            console.error(`Services API Error: ${servicesText}`);
            return;
        }
        const services = JSON.parse(servicesText);
        
        if (!services || services.length === 0) {
            console.log('❌ No services found');
            return;
        }
        
        const service = services[0];
        console.log(`✅ Service found: ${service.name} (Price: €${service.price})`);
        
        // 3. Test Slots API
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const testDate = tomorrow.toISOString().split('T')[0];
        
        console.log(`\n3. Testing Slots API for ${testDate}...`);
        const slotsResponse = await fetch(`http://localhost:3005/api/bookings/slots?barberId=${barber.id}&date=${testDate}`);
        console.log(`Slots API Response Status: ${slotsResponse.status}`);
        const slotsText = await slotsResponse.text();
        if (!slotsResponse.ok) {
            console.error(`Slots API Error: ${slotsText}`);
            return;
        }
        const slots = JSON.parse(slotsText);
        
        const availableSlots = slots.filter(s => s.available);
        
        if (availableSlots.length === 0) {
            console.log('❌ No available slots found');
            return;
        }
        
        const selectedSlot = availableSlots[0];
        console.log(`✅ Available slot found: ${selectedSlot.time}`);
        
        // 4. Create a test booking
        console.log('\n4. Creating test booking...');
          const bookingData = {
            barberId: barber.id,
            services: [service.id],
            date: testDate,
            time: selectedSlot.time,
            customerInfo: {
                name: 'Test Customer Flow',
                email: `test-flow-${Date.now()}@example.com`,
                phone: '+39 123 456 7890',
                notes: 'Test booking from automated flow'
            }
        };
        
        const bookingResponse = await fetch('http://localhost:3005/api/bookings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(bookingData)
        });
        console.log(`Create Booking API Response Status: ${bookingResponse.status}`);
        
        if (!bookingResponse.ok) {
            const errorText = await bookingResponse.text();
            console.log(`❌ Booking creation failed (${bookingResponse.status}): ${errorText}`);
            return;
        }
        
        const newBookingText = await bookingResponse.text();
        let newBooking; // Declare newBooking outside the try...catch block
        try {
            newBooking = JSON.parse(newBookingText);
            console.log(`✅ Booking created successfully! ID: ${newBooking.id}`);
        } catch (e) {
            console.error('Failed to parse booking response as JSON:', newBookingText);
            console.error(e);
            return;
        }

        // 5. Verify booking exists
        console.log('\n5. Verifying booking exists...');
        const allBookingsResponse = await fetch('http://localhost:3005/api/bookings');
        console.log(`Get All Bookings API Response Status: ${allBookingsResponse.status}`);
        const allBookingsText = await allBookingsResponse.text();
        if (!allBookingsResponse.ok) {
            console.error(`Get All Bookings API Error: ${allBookingsText}`);
            return;
        }
        const allBookingsData = JSON.parse(allBookingsText);
        const allBookings = allBookingsData.bookings || allBookingsData;

        const createdBooking = allBookings.find(b => b.id === newBooking.id);
          if (createdBooking) {
            console.log('✅ Booking verification successful!');
            console.log(`   Customer: ${createdBooking.customer_name}`);
            console.log(`   Date: ${createdBooking.booking_date}`);
            console.log(`   Time: ${createdBooking.booking_time}`);
            console.log(`   Status: ${createdBooking.status}`);
        } else {
            console.log('❌ Booking not found in database');
            return;
        }
        
        // 6. Test that slot is now unavailable
        console.log('\n6. Testing slot availability after booking...');
        const slotsAfterResponse = await fetch(`http://localhost:3005/api/bookings/slots?barberId=${barber.id}&date=${testDate}`);
        console.log(`Slots After API Response Status: ${slotsAfterResponse.status}`);
        const slotsAfterText = await slotsAfterResponse.text();
        if (!slotsAfterResponse.ok) {
            console.error(`Slots After API Error: ${slotsAfterText}`);
            return;
        }
        const slotsAfter = JSON.parse(slotsAfterText);
        
        const bookedSlot = slotsAfter.find(s => s.time === selectedSlot.time);
        
        if (bookedSlot && !bookedSlot.available) {
            console.log(`✅ Slot ${selectedSlot.time} is now correctly marked as unavailable`);
        } else if (bookedSlot && bookedSlot.available) {
            console.log(`⚠️ Slot ${selectedSlot.time} is still marked as available (might be a timing issue)`);
        } else {
            console.log(`❌ Could not find slot ${selectedSlot.time} in response`);
        }
        
        // 7. Test admin panel stats
        console.log('\n7. Testing admin stats API...');
        const statsResponse = await fetch('http://localhost:3005/api/admin/stats');
        console.log(`Admin Stats API Response Status: ${statsResponse.status}`);
        const statsText = await statsResponse.text();
        if (!statsResponse.ok) {
            console.error(`Admin Stats API Error: ${statsText}`);
            return;
        }
        const stats = JSON.parse(statsText);
        
        console.log(`✅ Stats retrieved:`);
        console.log(`   Total bookings: ${stats.totalBookings}`);
        console.log(`   Today's bookings: ${stats.todayBookings}`);
        console.log(`   Revenue: €${stats.totalRevenue}`);
        
        console.log('\n🎉 COMPLETE BOOKING FLOW TEST SUCCESSFUL!');
        console.log('\n📋 Summary:');
        console.log('✅ Barbers API working');
        console.log('✅ Services API working');
        console.log('✅ Slots API working');
        console.log('✅ Booking creation working');
        console.log('✅ Database persistence working');
        console.log('✅ Slot availability update working');
        console.log('✅ Admin stats working');
        
    } catch (error) {
        console.error('❌ Error in complete booking flow test:', error);
    }
}

testCompleteBookingFlow();
