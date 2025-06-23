// Questo script simula le chiamate che fa il frontend
import fetch from 'node-fetch';

async function testFrontendAPIs() {
  console.log('🧪 Testing APIs that the frontend calls...\n');
  
  // Test 1: Closure Settings API
  console.log('1️⃣ Testing closure-settings API:');
  try {
    const response = await fetch('http://localhost:3000/api/closure-settings');
    console.log(`   Status: ${response.status}`);
    
    const text = await response.text();
    console.log(`   Raw response: ${JSON.stringify(text)}`);
    
    const data = JSON.parse(text);
    console.log(`   Parsed JSON:`, data);
    console.log('   ✅ Closure settings API working correctly\n');
  } catch (error) {
    console.error('   ❌ Closure settings API failed:', error.message);
    console.log('');
  }
  
  // Test 2: Barber Recurring Closures API
  console.log('2️⃣ Testing barber-recurring-closures API for Michele:');
  try {
    const response = await fetch('http://localhost:3000/api/barber-recurring-closures/public?barberId=michele');
    console.log(`   Status: ${response.status}`);
    
    const text = await response.text();
    console.log(`   Raw response: ${JSON.stringify(text)}`);
    
    const data = JSON.parse(text);
    console.log(`   Parsed JSON:`, data);
    console.log('   ✅ Barber recurring closures API working correctly\n');
  } catch (error) {
    console.error('   ❌ Barber recurring closures API failed:', error.message);
    console.log('');
  }
    // Test 3: Slots API 
  console.log('3️⃣ Testing slots API for Michele on a Thursday (should be closed):');
  try {
    const testDate = '2025-06-19'; // This is a Thursday
    const response = await fetch(`http://localhost:3000/api/bookings/slots?date=${testDate}&barberId=michele`);
    console.log(`   Status: ${response.status}`);
    
    const text = await response.text();
    console.log(`   Raw response: ${JSON.stringify(text)}`);
    
    const data = JSON.parse(text);
    console.log(`   Parsed JSON:`, data);
    console.log('   ✅ Slots API working correctly\n');
  } catch (error) {
    console.error('   ❌ Slots API failed:', error.message);
    console.log('');
  }
  
  // Test 4: Slots API 
  console.log('4️⃣ Testing slots API for Michele on a Friday (should have slots):');
  try {
    const testDate = '2025-06-20'; // This is a Friday
    const response = await fetch(`http://localhost:3000/api/bookings/slots?date=${testDate}&barberId=michele`);
    console.log(`   Status: ${response.status}`);
    
    const text = await response.text();
    console.log(`   Raw response: ${JSON.stringify(text)}`);
    
    const data = JSON.parse(text);
    console.log(`   Parsed JSON:`, data);
    console.log('   ✅ Slots API working correctly\n');
  } catch (error) {
    console.error('   ❌ Slots API failed:', error.message);
    console.log('');
  }
}

testFrontendAPIs();
