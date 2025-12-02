console.log('🚀 Test starting...');

async function testAPI() {
  console.log('Making request...');
  
  try {
    const response = await fetch('http://localhost:3003/api/bookings');
    console.log('Response status:', response.status);
    
    const data = await response.json();
    console.log('Data received:', data);
  } catch (error) {
    console.log('Error:', error.message);
  }
}

testAPI();
