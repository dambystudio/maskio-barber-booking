import fetch from 'node-fetch';

async function testCacheOptimization() {
  try {
    console.log('🔍 Testing cache optimization effects...\n');
    
    const barberId = 'cm4hgm3jt0000xqlqjzk7d9xd';
    
    // Test with just a few dates to see the difference
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const dates = [];
    for (let i = 0; i < 5; i++) {
      const date = new Date(tomorrow);
      date.setDate(tomorrow.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    
    console.log('📅 Testing with dates:', dates.join(', '));
    console.log('🔍 Watch the server logs for cache optimization messages...\n');
    
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
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    console.log('✅ Request completed successfully!');
    console.log('\n📊 Check your server logs for these optimization indicators:');
    console.log('   • "🔄 Loading barber closures for..." (should appear only once)');
    console.log('   • "✅ Loaded X recurring closures" (should appear only once)');
    console.log('   • "📖 Loaded specific closures for..." (should appear only for dates with closures)');
    console.log('   • No repeated "Loaded closure settings" or "Loaded barber closures" messages');
    
    // Show some results
    console.log('\n📋 Sample results:');
    Object.entries(result.availability).slice(0, 3).forEach(([date, info]) => {
      console.log(`   ${date}: ${info.hasSlots ? '✅' : '❌'} (${info.availableCount}/${info.totalSlots} slots)`);
    });
    
  } catch (error) {
    console.error('❌ Error testing cache optimization:', error);
  }
}

// Run the test
testCacheOptimization();
