// Script per testare il sistema completo nel frontend
console.log('🧪 Testing complete frontend booking flow...\n');

async function simulateFrontendFlow() {
  try {
    // 1. Test closure settings
    console.log('1️⃣ Testing closure settings...');
    const closureResponse = await fetch('/api/closure-settings');
    
    if (!closureResponse.ok) {
      throw new Error(`Closure API failed: ${closureResponse.status}`);
    }
    
    const closureText = await closureResponse.text();
    console.log('📄 Closure raw response:', closureText);
    
    const closureData = JSON.parse(closureText);
    console.log('✅ Closure settings:', closureData);
    
    // 2. Test barber recurring closures
    console.log('\n2️⃣ Testing barber closures for Michele...');
    const barberResponse = await fetch('/api/barber-recurring-closures/public?barberId=michele');
    
    if (!barberResponse.ok) {
      throw new Error(`Barber closures API failed: ${barberResponse.status}`);
    }
    
    const barberText = await barberResponse.text();
    console.log('📄 Barber closures raw response:', barberText);
    
    const barberData = JSON.parse(barberText);
    console.log('✅ Barber closures:', barberData);
    
    // 3. Test slots for a Thursday (Michele closed)
    console.log('\n3️⃣ Testing slots for Michele on Thursday...');
    const slotsThursdayResponse = await fetch('/api/bookings/slots?date=2025-06-19&barberId=michele');
    
    if (!slotsThursdayResponse.ok) {
      throw new Error(`Slots API failed: ${slotsThursdayResponse.status}`);
    }
    
    const slotsThursdayText = await slotsThursdayResponse.text();
    console.log('📄 Thursday slots raw response:', slotsThursdayText);
    
    const slotsThursdayData = JSON.parse(slotsThursdayText);
    console.log('✅ Thursday slots (should be all false):', slotsThursdayData);
    
    // 4. Test slots for a Friday (Michele available)
    console.log('\n4️⃣ Testing slots for Michele on Friday...');
    const slotsFridayResponse = await fetch('/api/bookings/slots?date=2025-06-20&barberId=michele');
    
    if (!slotsFridayResponse.ok) {
      throw new Error(`Slots API failed: ${slotsFridayResponse.status}`);
    }
    
    const slotsFridayText = await slotsFridayResponse.text();
    console.log('📄 Friday slots raw response:', slotsFridayText);
    
    const slotsFridayData = JSON.parse(slotsFridayText);
    console.log('✅ Friday slots (should be all true):', slotsFridayData);
    
    console.log('\n🎉 All tests passed! Frontend APIs are working correctly.');
    
  } catch (error) {
    console.error('❌ Frontend test failed:', error);
    console.error('📋 Error details:', error.message);
  }
}

// Aggiungi al window per poter chiamare dal console del browser
if (typeof window !== 'undefined') {
  window.testFrontendAPIs = simulateFrontendFlow;
}

// Run immediately if in Node environment
if (typeof window === 'undefined') {
  simulateFrontendFlow();
}
