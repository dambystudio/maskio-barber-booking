import fetch from 'node-fetch';

async function testSaturdayAPI() {
    console.log('🧪 Testing Saturday API directly...');
    
    try {
        // Test API for Saturday
        const response = await fetch('http://localhost:3005/api/bookings/slots?barberId=fabio&date=2025-06-07');
        
        if (!response.ok) {
            console.error('❌ API Error:', response.status, response.statusText);
            return;
        }
        
        const slots = await response.json();
        console.log(`📅 API returned ${slots.length} slots for Saturday`);
        
        const availableSlots = slots.filter(slot => slot.available);
        const unavailableSlots = slots.filter(slot => !slot.available);
        
        console.log(`✅ Available: ${availableSlots.length}`);
        console.log(`❌ Unavailable: ${unavailableSlots.length}`);
        
        if (availableSlots.length === 0) {
            console.log('\n🔍 All slots unavailable - database issue confirmed');
            console.log('📋 Generated slots:', slots.map(s => s.time).join(', '));
        } else {
            console.log('🎉 Saturday working correctly!');
        }
        
    } catch (error) {
        console.error('❌ Error testing API:', error.message);
    }
}

testSaturdayAPI();
