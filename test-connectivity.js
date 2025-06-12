// Test di connessione per verificare l'autenticazione
console.log('🧪 Testing authentication flow...\n');

async function testAuthFlow() {
  try {
    // Test 1: Check if session endpoint is working
    console.log('1️⃣ Testing session endpoint...');
    const sessionResponse = await fetch('http://localhost:3000/api/auth/session');
    
    console.log('Session endpoint status:', sessionResponse.status);
    if (sessionResponse.ok) {
      const sessionData = await sessionResponse.text();
      console.log('Session data:', sessionData);
    } else {
      console.log('Session endpoint not accessible');
    }
    
    // Test 2: Check if services endpoint is working
    console.log('\n2️⃣ Testing services endpoint...');
    const servicesResponse = await fetch('http://localhost:3000/api/services');
    
    console.log('Services endpoint status:', servicesResponse.status);
    if (servicesResponse.ok) {
      const servicesData = await servicesResponse.json();
      console.log('Services found:', servicesData.length);
    } else {
      console.log('Services endpoint failed');
    }
    
    // Test 3: Check if barbers endpoint is working
    console.log('\n3️⃣ Testing barbers endpoint...');
    const barbersResponse = await fetch('http://localhost:3000/api/barbers');
    
    console.log('Barbers endpoint status:', barbersResponse.status);
    if (barbersResponse.ok) {
      const barbersData = await barbersResponse.json();
      console.log('Barbers found:', barbersData.length);
    } else {
      console.log('Barbers endpoint failed');
    }
    
    console.log('\n✅ Basic connectivity test complete!');
    console.log('🔗 Next: Open browser and go to http://localhost:3000/auth/signin');
    
  } catch (error) {
    console.error('💥 Test failed:', error);
  }
}

// Use dynamic import for fetch in Node.js
if (typeof fetch === 'undefined') {
  console.log('📦 Loading fetch for Node.js...');
  import('node-fetch').then(({ default: fetch }) => {
    globalThis.fetch = fetch;
    testAuthFlow();
  }).catch(() => {
    console.log('❌ node-fetch not available. Test manually in browser.');
    console.log('🔗 Go to: http://localhost:3000/auth/signin');
  });
} else {
  testAuthFlow();
}
