// Test script per verificare l'API degli slot di prenotazione
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function testSlotsAPI() {
    console.log('🧪 Testing Slots API...\n');
    
    try {
        // Get barbers first to have a valid barberId
        console.log('1. Getting barbers...');
        const barbersResponse = await fetch('http://localhost:3002/api/barbers');
        const barbers = await barbersResponse.json();
        
        if (!barbers || barbers.length === 0) {
            console.log('❌ No barbers found');
            return;
        }
        
        const barberId = barbers[0].id;
        console.log(`✅ Found barber: ${barbers[0].name} (ID: ${barberId})`);
        
        // Test date - tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const testDate = tomorrow.toISOString().split('T')[0]; // YYYY-MM-DD format
        
        console.log(`\n2. Testing slots for date: ${testDate}`);
        
        // Test slots API
        const slotsUrl = `http://localhost:3002/api/bookings/slots?barberId=${barberId}&date=${testDate}`;
        console.log(`📡 Calling: ${slotsUrl}`);
        
        const slotsResponse = await fetch(slotsUrl);
        
        if (!slotsResponse.ok) {
            const errorText = await slotsResponse.text();
            console.log(`❌ API Error (${slotsResponse.status}): ${errorText}`);
            return;
        }
        
        const slots = await slotsResponse.json();
        console.log(`✅ API Response received`);
        
        // Check response format
        if (!Array.isArray(slots)) {
            console.log('❌ Response is not an array:', typeof slots);
            console.log('Response:', slots);
            return;
        }
        
        console.log(`\n📊 RESULTS:`);
        console.log(`Total slots: ${slots.length}`);
        
        if (slots.length > 0) {
            // Check first slot format
            const firstSlot = slots[0];
            console.log(`First slot format:`, firstSlot);
            
            if (firstSlot.time && typeof firstSlot.available === 'boolean') {
                console.log('✅ Correct TimeSlot format');
            } else {
                console.log('❌ Invalid TimeSlot format');
                return;
            }
            
            // Count available vs unavailable
            const availableSlots = slots.filter(s => s.available);
            const unavailableSlots = slots.filter(s => !s.available);
            
            console.log(`Available slots: ${availableSlots.length}`);
            console.log(`Unavailable slots: ${unavailableSlots.length}`);
            
            // Show some examples
            console.log(`\n🌅 Morning available slots:`);
            const morningAvailable = availableSlots.filter(s => s.time.startsWith('09') || s.time.startsWith('10') || s.time.startsWith('11') || s.time.startsWith('12'));
            morningAvailable.slice(0, 5).forEach(slot => console.log(`  ${slot.time}`));
            
            console.log(`\n🌆 Afternoon available slots:`);
            const afternoonAvailable = availableSlots.filter(s => s.time.startsWith('15') || s.time.startsWith('16') || s.time.startsWith('17'));
            afternoonAvailable.slice(0, 5).forEach(slot => console.log(`  ${slot.time}`));
            
            // Check for specific expected slots
            const has1230 = slots.find(s => s.time === '12:30');
            const has1730 = slots.find(s => s.time === '17:30');
            
            console.log(`\n🎯 Specific slot checks:`);
            if (has1230) {
                console.log(`✅ 12:30 slot present (available: ${has1230.available})`);
            } else {
                console.log('❌ 12:30 slot missing');
            }
            
            if (has1730) {
                console.log(`✅ 17:30 slot present (available: ${has1730.available})`);
            } else {
                console.log('❌ 17:30 slot missing');
            }
            
        } else {
            console.log('⚠️ No slots returned (could be Sunday or barber off day)');
        }
        
        console.log('\n✅ Slots API test completed successfully!');
        
    } catch (error) {
        console.error('❌ Error testing slots API:', error);
    }
}

testSlotsAPI();
