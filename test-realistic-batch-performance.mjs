// Test delle performance con un numero realistico di date (7 giorni)
async function testRealisticBatchPerformance() {
    console.log('🚀 Testing realistic batch availability performance (7 days)...');
    
    try {
        // Genera 7 date per il test (una settimana)
        const dates = [];
        const today = new Date();
        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            const dateString = date.toISOString().split('T')[0];
            dates.push(dateString);
        }
        
        console.log(`📅 Testing with ${dates.length} dates (1 week)`);
        console.log(`📍 Date range: ${dates[0]} to ${dates[dates.length - 1]}`);
        
        const startTime = Date.now();
        
        const response = await fetch('http://localhost:3000/api/bookings/batch-availability', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                barberId: 'fabio',  // Test with Fabio
                dates: dates
            })
        });
        
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        console.log(`⏱️ Request completed in ${duration}ms`);
        
        if (!response.ok) {
            console.error('❌ Request failed:', response.status, response.statusText);
            const errorText = await response.text();
            console.error('Error details:', errorText);
            return;
        }
        
        const data = await response.json();
        
        console.log('\n📊 Performance Analysis:');
        console.log(`- Dates processed: ${dates.length}`);
        console.log(`- Total time: ${duration}ms`);
        console.log(`- Average per date: ${(duration / dates.length).toFixed(2)}ms`);
        console.log(`- Performance rating: ${duration < 1000 ? '🟢 Excellent' : duration < 2000 ? '🟡 Good' : '🔴 Needs improvement'}`);
        
        // Analizza i risultati
        const availability = data.availability;
        const availableDays = Object.values(availability).filter(day => day.hasSlots).length;
        const closedDays = dates.length - availableDays;
        
        console.log('\n📈 Availability Results:');
        console.log(`- Available days: ${availableDays}`);
        console.log(`- Closed days: ${closedDays}`);
        console.log(`- Total slots available: ${Object.values(availability).reduce((sum, day) => sum + day.availableCount, 0)}`);
        
        // Performance target: under 1 second for 7 days
        if (duration < 1000) {
            console.log('\n✅ Performance is excellent for realistic usage!');
        } else if (duration < 2000) {
            console.log('\n🟡 Performance is acceptable for realistic usage.');
        } else {
            console.log(`\n⚠️ Performance needs improvement. Target: <1s, Actual: ${duration}ms`);
        }
        
        // Test anche 14 giorni (2 settimane)
        console.log('\n🔄 Testing with 14 days (2 weeks)...');
        await testTwoWeeks();
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

async function testTwoWeeks() {
    try {
        // Genera 14 date per il test (due settimane)
        const dates = [];
        const today = new Date();
        for (let i = 0; i < 14; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            const dateString = date.toISOString().split('T')[0];
            dates.push(dateString);
        }
        
        const startTime = Date.now();
        
        const response = await fetch('http://localhost:3000/api/bookings/batch-availability', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                barberId: 'fabio',
                dates: dates
            })
        });
        
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        console.log(`⏱️ 14 days completed in ${duration}ms`);
        console.log(`- Average per date: ${(duration / dates.length).toFixed(2)}ms`);
        console.log(`- Performance rating: ${duration < 2000 ? '🟢 Excellent' : duration < 3000 ? '🟡 Good' : '🔴 Needs improvement'}`);
        
    } catch (error) {
        console.error('❌ Two weeks test failed:', error);
    }
}

testRealisticBatchPerformance();
