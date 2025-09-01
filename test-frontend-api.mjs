import fetch from 'node-fetch';

async function testFrontendAPI() {
  console.log('🧪 Testing Frontend API Call...\n');

  try {
    const userEmail = 'prova@gmail.com';
    const url = `http://localhost:3000/api/waitlist?user_email=${encodeURIComponent(userEmail)}`;
    
    console.log('🔍 Making request to:', url);
    
    const response = await fetch(url);
    console.log('🔍 Response status:', response.status);
    console.log('🔍 Response headers:', Object.fromEntries(response.headers));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error response:', errorText);
      return;
    }
    
    const data = await response.json();
    console.log('🔍 Response data:', data);
    console.log('🔍 Response data type:', typeof data);
    console.log('🔍 Is array:', Array.isArray(data));
    console.log('🔍 Data length:', data?.length);
    
    if (Array.isArray(data)) {
      console.log('\n📋 Parsed waitlist entries:');
      data.forEach((entry, index) => {
        console.log(`   ${index + 1}. ${entry.customer_name} - ${entry.barber_name} - ${entry.date} - ${entry.status}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testFrontendAPI();
