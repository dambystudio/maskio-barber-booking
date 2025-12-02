import fetch from 'node-fetch';

async function testAuthStatus() {
  try {
    console.log('🔐 Testing authentication status...\n');
    
    // Test session endpoint
    const sessionResponse = await fetch('http://localhost:3000/api/auth/session', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    console.log(`📊 Session endpoint status: ${sessionResponse.status}`);
    
    const sessionData = await sessionResponse.text();
    console.log('📋 Session data:', sessionData);
    
    // Test user profile endpoint (requires auth)
    const profileResponse = await fetch('http://localhost:3000/api/user/profile', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    console.log(`\n📊 Profile endpoint status: ${profileResponse.status}`);
    
    const profileData = await profileResponse.text();
    console.log('📋 Profile data:', profileData);
    
    if (sessionResponse.status === 200 && sessionData && sessionData !== '{}') {
      console.log('\n✅ Authentication seems to be working');
    } else {
      console.log('\n❌ No active session found');
      console.log('💡 This explains why booking creation fails');
    }
    
  } catch (error) {
    console.error('❌ Error testing auth status:', error);
  }
}

// Run the test
testAuthStatus();
