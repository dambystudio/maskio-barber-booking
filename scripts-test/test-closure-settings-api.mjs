import fetch from 'node-fetch';

async function testClosureSettingsAPI() {
  try {
    console.log('🧪 Testing closure settings API...');
    
    const response = await fetch('http://localhost:3000/api/closure-settings');
    console.log('📡 Response status:', response.status);
    console.log('📋 Response headers:', Object.fromEntries(response.headers.entries()));
    
    const text = await response.text();
    console.log('📄 Raw response text:', JSON.stringify(text));
    
    try {
      const json = JSON.parse(text);
      console.log('✅ Parsed JSON:', json);
    } catch (parseError) {
      console.error('❌ JSON parsing failed:', parseError.message);
      console.log('🔍 Response was not valid JSON');
    }
    
  } catch (error) {
    console.error('❌ API test failed:', error);
  }
}

testClosureSettingsAPI();
