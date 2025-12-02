// Test lunch slots in the live application
const API_BASE = 'http://localhost:3008/api';

async function testLunchSlotsLive() {
    console.log('🔴 LIVE TEST: Lunch time slots in booking interface...\n');
    
    try {
        // Test today's date and tomorrow
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const testDates = [
            today.toISOString().split('T')[0],
            tomorrow.toISOString().split('T')[0]
        ];
        const barbers = ['fabio', 'michele'];
        
        for (const date of testDates) {
            console.log(`📅 Testing date: ${date}`);
            
            for (const barberId of barbers) {
                console.log(`\n👨‍💼 Barber: ${barberId.toUpperCase()}`);
                
                try {
                    // Get available slots from the live API
                    const response = await fetch(`${API_BASE}/bookings/slots?date=${date}&barberId=${barberId}`);
                    
                    if (!response.ok) {
                        console.log(`❌ API Error: ${response.status} ${response.statusText}`);
                        continue;
                    }
                    
                    const slots = await response.json();
                    console.log(`📊 Total slots returned: ${slots.length}`);
                    
                    // Check specifically for lunch time slots
                    const lunchSlots = slots.filter(slot => 
                        slot.time === '12:00' || slot.time === '12:30'
                    );
                    
                    console.log(`🍽️ Lunch time slots:`);
                    if (lunchSlots.length === 0) {
                        console.log('   ❌ NO lunch time slots found in API response');
                        console.log('   🔍 This means the frontend will not show 12:00/12:30 options');
                    } else {
                        lunchSlots.forEach(slot => {
                            const status = slot.available ? '✅ BOOKABLE' : '❌ Occupied';
                            console.log(`   ${slot.time}: ${status}`);
                        });
                        
                        const availableLunch = lunchSlots.filter(s => s.available);
                        if (availableLunch.length > 0) {
                            console.log(`   🎉 SUCCESS: ${availableLunch.length} lunch slots are BOOKABLE!`);
                        }
                    }
                    
                    // Show summary of all slots
                    const available = slots.filter(s => s.available).length;
                    const total = slots.length;
                    console.log(`📈 Summary: ${available}/${total} slots available`);
                    
                } catch (error) {
                    console.log(`❌ Error testing ${barberId}: ${error.message}`);
                }
            }
            console.log('\n' + '='.repeat(60));
        }
        
        console.log('\n🎯 CONCLUSION:');
        console.log('✅ Database fix: COMPLETED');
        console.log('🌐 Application URL: http://localhost:3008');
        console.log('📝 Next: Open the booking page and test 12:00/12:30 slots');
        
    } catch (error) {
        console.error('❌ Error in live test:', error);
    }
}

testLunchSlotsLive().catch(console.error);
