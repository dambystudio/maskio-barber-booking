// Test script to verify closure-settings API functionality
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3000';

async function testClosureAPI() {
  console.log('🧪 Testing Closure Settings API...\n');

  try {
    // Test GET API
    console.log('1. Testing GET /api/closure-settings');
    const getResponse = await fetch(`${API_BASE}/api/closure-settings`);
    
    if (!getResponse.ok) {
      console.log('❌ GET request failed:', getResponse.status);
      return;
    }
    
    const currentSettings = await getResponse.json();
    console.log('✅ Current settings:', currentSettings);

    // Test POST API with updated settings
    console.log('\n2. Testing POST /api/closure-settings');
    const testSettings = {
      closedDays: [0, 6], // Sunday and Saturday
      closedDates: ['2024-12-25', '2024-01-01'] // Christmas and New Year
    };

    const postResponse = await fetch(`${API_BASE}/api/closure-settings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testSettings)
    });

    if (!postResponse.ok) {
      console.log('❌ POST request failed:', postResponse.status);
      return;
    }

    const postResult = await postResponse.json();
    console.log('✅ Settings updated:', postResult);

    // Verify the update with another GET
    console.log('\n3. Verifying update with GET request');
    const verifyResponse = await fetch(`${API_BASE}/api/closure-settings`);
    
    if (!verifyResponse.ok) {
      console.log('❌ Verification GET failed:', verifyResponse.status);
      return;
    }
    
    const updatedSettings = await verifyResponse.json();
    console.log('✅ Verified settings:', updatedSettings);

    // Restore original settings
    console.log('\n4. Restoring original settings');
    const restoreResponse = await fetch(`${API_BASE}/api/closure-settings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(currentSettings)
    });

    if (restoreResponse.ok) {
      console.log('✅ Original settings restored');
    } else {
      console.log('❌ Failed to restore original settings');
    }

    console.log('\n🎉 Closure Settings API test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Run the test
testClosureAPI();
