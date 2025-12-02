// Test semplice per lunch slots
console.log('🔴 TESTING LUNCH SLOTS...');

async function quickTest() {
    try {
        console.log('1. Testing API connection...');
        
        const response = await fetch('http://localhost:3009/api/bookings/slots?date=2025-05-28&barberId=fabio', {
            signal: AbortSignal.timeout(5000)
        });
        
        console.log('2. Response status:', response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log('3. Total slots:', data.length);
            
            const lunchSlots = data.filter(slot => slot.time === '12:00' || slot.time === '12:30');
            console.log('4. Lunch slots found:', lunchSlots.length);
            
            lunchSlots.forEach(slot => {
                console.log(`   ${slot.time}: ${slot.available ? 'AVAILABLE ✅' : 'OCCUPIED ❌'}`);
            });
            
            if (lunchSlots.filter(s => s.available).length > 0) {
                console.log('🎉 SUCCESS: Lunch slots are now bookable!');
            } else {
                console.log('❌ PROBLEM: Lunch slots still not available');
            }
        } else {
            console.log('❌ API Error:', response.status);
        }
    } catch (error) {
        console.log('❌ Error:', error.message);
    }
}

quickTest();
