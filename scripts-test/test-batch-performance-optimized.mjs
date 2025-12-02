// Test delle performance dell'API batch-availability ottimizzata
async function testOptimizedBatchPerformance() {
    console.log('🚀 Testing optimized batch availability performance...');
    
    try {
        // Genera 30 date per il test
        const dates = [];
        const today = new Date();
        for (let i = 0; i < 30; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            const dateString = date.toISOString().split('T')[0];
            dates.push(dateString);
        }
        
        console.log(`📅 Testing with ${dates.length} dates`);
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
        console.log(`- Performance rating: ${duration < 2000 ? '🟢 Excellent' : duration < 5000 ? '🟡 Good' : '🔴 Needs improvement'}`);
          // Analizza i risultati
        const availability = data.availability;
        const availableDays = Object.values(availability).filter(day => day.hasSlots).length;
        const closedDays = dates.length - availableDays;
        
        console.log('\n📈 Availability Results:');
        console.log(`- Available days: ${availableDays}`);
        console.log(`- Closed days: ${closedDays}`);
        console.log(`- Total slots available: ${Object.values(availability).reduce((sum, day) => sum + day.availableCount, 0)}`);
        
        // Performance target: under 2 seconds for 30 dates
        if (duration < 2000) {
            console.log('\n✅ Performance optimization successful! API is fast enough.');
        } else {
            console.log(`\n⚠️ Performance still needs improvement. Target: <2s, Actual: ${duration}ms`);
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

testOptimizedBatchPerformance();
