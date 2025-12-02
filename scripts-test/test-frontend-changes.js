// Test per verificare le modifiche al frontend
async function testFrontendChanges() {
  console.log('🧪 Testing frontend changes...\n');
  
  try {
    // Test API for barber recurring closures
    console.log('1. Testing barber recurring closures API...');
    
    const micheleResponse = await fetch('http://localhost:3000/api/barber-recurring-closures/public?barberId=michele');
    if (micheleResponse.ok) {
      const micheleData = await micheleResponse.json();
      console.log('✅ Michele closures:', micheleData);
    } else {
      console.log('❌ Michele API failed:', micheleResponse.status);
    }
    
    const fabioResponse = await fetch('http://localhost:3000/api/barber-recurring-closures/public?barberId=fabio');
    if (fabioResponse.ok) {
      const fabioData = await fabioResponse.json();
      console.log('✅ Fabio closures:', fabioData);
    } else {
      console.log('❌ Fabio API failed:', fabioResponse.status);
    }
    
    // Test slots for verification
    console.log('\n2. Testing slots to verify integration...');
    
    const today = new Date();
    const nextThursday = new Date(today);
    const daysUntilThursday = (4 - today.getDay() + 7) % 7 || 7;
    nextThursday.setDate(today.getDate() + daysUntilThursday);
    const thursdayStr = nextThursday.toISOString().split('T')[0];
    
    console.log(`Testing Thursday ${thursdayStr}:`);
    
    // Michele should have no available slots on Thursday
    const micheleThursdayResponse = await fetch(`http://localhost:3000/api/bookings/slots?barberId=michele&date=${thursdayStr}`);
    if (micheleThursdayResponse.ok) {
      const micheleThursdaySlots = await micheleThursdayResponse.json();
      const availableSlots = micheleThursdaySlots.filter(slot => slot.available);
      console.log(`  Michele: ${availableSlots.length} available slots (expected: 0)`);
    }
    
    // Fabio should have available slots on Thursday
    const fabioThursdayResponse = await fetch(`http://localhost:3000/api/bookings/slots?barberId=fabio&date=${thursdayStr}`);
    if (fabioThursdayResponse.ok) {
      const fabioThursdaySlots = await fabioThursdayResponse.json();
      const availableSlots = fabioThursdaySlots.filter(slot => slot.available);
      console.log(`  Fabio: ${availableSlots.length} available slots (expected: >0)`);
    }
    
    console.log('\n✅ Frontend API tests completed!');
    console.log('\n📱 Now test the frontend at: http://localhost:3000');
    console.log('🔍 Steps to test:');
    console.log('1. Select Michele as barber');
    console.log('2. Check that Thursday shows "Chiuso" (pink color)');
    console.log('3. Check that Sunday shows "Chiuso" (red color)');
    console.log('4. Check that the loading is faster (300ms instead of 1s)');
    console.log('5. Select Fabio and verify Thursday is available');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testFrontendChanges();
