#!/usr/bin/env node

/**
 * Test script for SMS verification in signup flow
 * Tests the registration process with phone verification
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
const envPath = join(__dirname, '.env.local');
try {
  const envFile = readFileSync(envPath, 'utf8');
  envFile.split('\n').forEach(line => {
    if (line.trim() && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        process.env[key.trim()] = valueParts.join('=').trim();
      }
    }
  });
} catch (error) {
  console.error('❌ Error loading .env.local:', error.message);
  process.exit(1);
}

const BASE_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';
const TEST_PHONE = '+39 333 123 4567'; // Numero di test
const TEST_EMAIL = `test_signup_${Date.now()}@test.com`;

console.log('🧪 Testing SMS Verification in Signup Flow');
console.log('==========================================');
console.log(`Base URL: ${BASE_URL}`);
console.log(`Test Phone: ${TEST_PHONE}`);
console.log(`Test Email: ${TEST_EMAIL}`);
console.log('');

/**
 * Test 1: Try registration without phone verification (should fail)
 */
async function testRegistrationWithoutVerification() {
  console.log('📝 Test 1: Registration without phone verification');
  
  try {
    const response = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test User',
        email: TEST_EMAIL,
        phone: TEST_PHONE,
        password: 'testpass123',
        phoneVerified: false, // Non verificato
      }),
    });

    const data = await response.json();
    
    if (!response.ok && data.error?.includes('verificato')) {
      console.log('✅ Registration correctly rejected without verification');
      console.log(`   Error: ${data.error}`);
      return true;
    } else {
      console.log('❌ Registration should have been rejected');
      console.log(`   Status: ${response.status}`);
      console.log(`   Response:`, data);
      return false;
    }
  } catch (error) {
    console.log('❌ Error testing registration without verification:', error.message);
    return false;
  }
}

/**
 * Test 2: Test SMS sending for verification
 */
async function testSMSSending() {
  console.log('\n📱 Test 2: SMS Verification Sending');
  
  try {
    const response = await fetch(`${BASE_URL}/api/verification/send-sms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone: TEST_PHONE,
      }),
    });

    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log('✅ SMS sent successfully for verification');
      console.log(`   Status: ${data.status}`);
      return true;
    } else {
      console.log('❌ Failed to send SMS');
      console.log(`   Status: ${response.status}`);
      console.log(`   Error: ${data.error || 'Unknown error'}`);
      return false;
    }
  } catch (error) {
    console.log('❌ Error testing SMS sending:', error.message);
    return false;
  }
}

/**
 * Test 3: Test phone number validation
 */
async function testPhoneValidation() {
  console.log('\n📞 Test 3: Phone Number Validation');
  
  const testCases = [
    { phone: '+39 333 123 4567', valid: true, description: 'Valid Italian mobile (+39)' },
    { phone: '333 123 4567', valid: true, description: 'Valid without prefix (should be normalized)' },
    { phone: '+1 555 123 4567', valid: false, description: 'US number (should be rejected)' },
    { phone: '123', valid: false, description: 'Too short' },
    { phone: '+39 02 1234567', valid: false, description: 'Italian landline (should be rejected)' },
  ];

  let allPassed = true;

  for (const testCase of testCases) {
    try {
      const response = await fetch(`${BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Test User',
          email: `test_${Date.now()}@test.com`,
          phone: testCase.phone,
          password: 'testpass123',
          phoneVerified: true,
        }),
      });

      const data = await response.json();
      const isRejected = !response.ok && data.error;
      const shouldBeRejected = !testCase.valid;

      if ((isRejected && shouldBeRejected) || (!isRejected && testCase.valid)) {
        console.log(`✅ ${testCase.description}: ${testCase.valid ? 'Accepted' : 'Rejected'} correctly`);
      } else {
        console.log(`❌ ${testCase.description}: Expected ${testCase.valid ? 'acceptance' : 'rejection'}, got ${isRejected ? 'rejection' : 'acceptance'}`);
        if (data.error) console.log(`     Error: ${data.error}`);
        allPassed = false;
      }
    } catch (error) {
      console.log(`❌ Error testing ${testCase.description}:`, error.message);
      allPassed = false;
    }
  }

  return allPassed;
}

/**
 * Test 4: Test complete registration flow with verification
 */
async function testCompleteRegistrationFlow() {
  console.log('\n🔄 Test 4: Complete Registration Flow');
  
  try {
    // Step 1: Send SMS
    console.log('   Step 1: Sending SMS...');
    const smsResponse = await fetch(`${BASE_URL}/api/verification/send-sms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone: TEST_PHONE,
      }),
    });

    if (!smsResponse.ok) {
      console.log('❌ Failed to send SMS');
      return false;
    }

    console.log('   ✅ SMS sent successfully');

    // In a real scenario, we would get the code from SMS
    // For testing, we can use a test code or check Twilio console
    console.log('   📱 In a real scenario, user would receive SMS with verification code');
    console.log('   🔍 Check Twilio console for the verification code if testing manually');

    // Step 2: Try registration with verification flag
    console.log('   Step 2: Attempting registration with verification...');
    const regResponse = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test User Complete',
        email: `test_complete_${Date.now()}@test.com`,
        phone: TEST_PHONE,
        password: 'testpass123',
        phoneVerified: true, // Simulating verified phone
      }),
    });

    const regData = await regResponse.json();

    if (regResponse.ok) {
      console.log('   ✅ Registration completed successfully');
      console.log(`   User ID: ${regData.user?.id}`);
      console.log(`   User Phone: ${regData.user?.phone}`);
      return true;
    } else {
      console.log('   ❌ Registration failed');
      console.log(`   Error: ${regData.error}`);
      return false;
    }

  } catch (error) {
    console.log('❌ Error in complete registration flow:', error.message);
    return false;
  }
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('Starting SMS verification signup tests...\n');

  const results = [];
  
  results.push(await testRegistrationWithoutVerification());
  results.push(await testSMSSending());
  results.push(await testPhoneValidation());
  results.push(await testCompleteRegistrationFlow());

  console.log('\n==========================================');
  console.log('📊 Test Results Summary:');
  console.log('==========================================');
  
  const passed = results.filter(r => r).length;
  const total = results.length;
  
  console.log(`✅ Passed: ${passed}/${total}`);
  console.log(`❌ Failed: ${total - passed}/${total}`);
  
  if (passed === total) {
    console.log('\n🎉 All tests passed! SMS verification in signup is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the implementation.');
  }

  console.log('\n📝 Next Steps:');
  console.log('1. Test the UI flow manually by visiting /auth/signup');
  console.log('2. Try registering with an Italian phone number');
  console.log('3. Verify that SMS is sent and verification works');
  console.log('4. Ensure user cannot login without phone verification');
  
  process.exit(passed === total ? 0 : 1);
}

// Run tests
runTests().catch(error => {
  console.error('❌ Test runner error:', error);
  process.exit(1);
});
