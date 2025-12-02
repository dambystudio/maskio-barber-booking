import fetch from 'node-fetch';

async function testProductionOptimizedAPI() {
  try {
    console.log('🌐 Testing optimized batch API in production...\n');
    
    const barberId = 'cm4hgm3jt0000xqlqjzk7d9xd';
    
    // Test with several dates
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const dates = [];
    for (let i = 0; i < 10; i++) {
      const date = new Date(tomorrow);
      date.setDate(tomorrow.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    
    console.log(`📅 Testing with ${dates.length} dates: ${dates[0]} to ${dates[dates.length - 1]}`);
    console.log(`👨‍💼 Barber ID: ${barberId}\n`);
    
    const startTime = Date.now();
    
    const response = await fetch('https://maskio-barber-booking-rabmgozqe-davide-dambrosios-projects.vercel.app/api/bookings/batch-availability', {
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
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
    }
    
    const result = await response.json();
    
    console.log(`⏱️  Production request completed in ${duration}ms\n`);
    
    // Analyze results
    const availableDates = Object.entries(result.availability)
      .filter(([date, info]) => info.hasSlots)
      .length;
    
    const totalSlots = Object.values(result.availability)
      .reduce((sum, info) => sum + info.availableCount, 0);
    
    console.log('📊 Production Results Summary:');
    console.log(`   • Total dates checked: ${dates.length}`);
    console.log(`   • Available dates: ${availableDates}`);
    console.log(`   • Total available slots: ${totalSlots}`);
    console.log(`   • Response time: ${duration}ms`);
    
    // Show results
    console.log('\n📋 Results:');
    Object.entries(result.availability).forEach(([date, info]) => {
      console.log(`   ${date}: ${info.hasSlots ? '✅' : '❌'} (${info.availableCount}/${info.totalSlots} slots)`);
    });
    
    console.log('\n✅ Production optimized batch API test completed!');
    console.log('🚀 Cache optimizations are now live in production.');
    console.log('💡 The optimizations should significantly reduce database queries and improve performance.');
    
  } catch (error) {
    console.error('❌ Error testing production optimized API:', error);
  }
}

// Run the test
testProductionOptimizedAPI();
