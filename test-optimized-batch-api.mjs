import fetch from 'node-fetch';

async function testOptimizedBatchAPI() {
  try {
    console.log('🧪 Testing optimized batch availability API...\n');
    
    // Test with a barber and multiple dates
    const barberId = 'cm4hgm3jt0000xqlqjzk7d9xd'; // primo barbiere
    
    // Generate 30 consecutive dates starting from tomorrow  
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const dates = [];
    for (let i = 0; i < 30; i++) {
      const date = new Date(tomorrow);
      date.setDate(tomorrow.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    
    console.log(`📅 Testing with ${dates.length} dates: ${dates[0]} to ${dates[dates.length - 1]}`);
    console.log(`👨‍💼 Barber ID: ${barberId}\n`);
    
    const startTime = Date.now();
    
    const response = await fetch('http://localhost:3000/api/bookings/batch-availability', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        barberId,
        dates
      })
    });
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    console.log(`⏱️  Request completed in ${duration}ms\n`);
    
    // Analyze results
    const availableDates = Object.entries(result.availability)
      .filter(([date, info]) => info.hasSlots)
      .length;
    
    const totalSlots = Object.values(result.availability)
      .reduce((sum, info) => sum + info.availableCount, 0);
    
    console.log('📊 Results Summary:');
    console.log(`   • Total dates checked: ${dates.length}`);
    console.log(`   • Available dates: ${availableDates}`);
    console.log(`   • Total available slots: ${totalSlots}`);
    console.log(`   • Average response time: ${duration}ms`);
    
    // Show first few results as example
    console.log('\n📋 Sample results:');
    Object.entries(result.availability).slice(0, 5).forEach(([date, info]) => {
      console.log(`   ${date}: ${info.hasSlots ? '✅' : '❌'} (${info.availableCount}/${info.totalSlots} slots)`);
    });
    
    if (availableDates > 0) {
      console.log('\n✅ Optimized batch API test completed successfully!');
      console.log('🚀 Cache optimizations should have reduced database queries significantly.');
    } else {
      console.log('\n⚠️  No available slots found - this might be expected if all dates are booked or closed.');
    }
    
  } catch (error) {
    console.error('❌ Error testing optimized batch API:', error);
  }
}

// Run the test
testOptimizedBatchAPI();
