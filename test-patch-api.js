// Test the PATCH API for booking cancellation
const API_BASE = 'http://localhost:3004';

async function testCancelBooking() {
  console.log('🚀 Testing booking cancellation...');
  
  try {
    // 1. Get all bookings first
    console.log('📋 Getting all bookings...');
    const getResponse = await fetch(`${API_BASE}/api/bookings`);
    
    if (!getResponse.ok) {
      const errorText = await getResponse.text();
      console.log('❌ GET Request failed:', errorText);
      return;
    }
    
    const getData = await getResponse.json();
    console.log(`✅ Found ${getData.bookings?.length || 0} bookings`);
    
    if (!getData.bookings || getData.bookings.length === 0) {
      console.log('⚠️ No bookings found to test cancellation');
      return;
    }
    
    // 2. Find a confirmed booking to cancel
    const confirmedBooking = getData.bookings.find(b => b.status === 'confirmed');
    
    if (!confirmedBooking) {
      console.log('⚠️ No confirmed bookings found. Testing with first available booking...');
      const firstBooking = getData.bookings[0];
      console.log(`📋 Testing with booking ID: ${firstBooking.id}`);
      console.log(`   Customer: ${firstBooking.customer_name}`);
      console.log(`   Status: ${firstBooking.status}`);
      
      // 3. Test PATCH API to cancel
      console.log('\n🔄 Testing PATCH API to cancel...');
      const patchResponse = await fetch(`${API_BASE}/api/bookings`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: firstBooking.id,
          status: 'cancelled'
        }),
      });
      
      const patchResult = await patchResponse.json();
      console.log(`PATCH Response Status: ${patchResponse.status}`);
      console.log('PATCH Response Body:', JSON.stringify(patchResult, null, 2));
      
      if (patchResponse.ok) {
        console.log('✅ Booking cancellation successful!');
      } else {
        console.log('❌ Booking cancellation failed');
      }
    } else {
      console.log(`📋 Found confirmed booking: ${confirmedBooking.id}`);
      console.log(`   Customer: ${confirmedBooking.customer_name}`);
      console.log(`   Date: ${confirmedBooking.booking_date} ${confirmedBooking.booking_time}`);
      
      // 3. Test PATCH API to cancel
      console.log('\n🔄 Testing PATCH API to cancel...');
      const patchResponse = await fetch(`${API_BASE}/api/bookings`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: confirmedBooking.id,
          status: 'cancelled'
        }),
      });
      
      const patchResult = await patchResponse.json();
      console.log(`PATCH Response Status: ${patchResponse.status}`);
      console.log('PATCH Response Body:', JSON.stringify(patchResult, null, 2));
      
      if (patchResponse.ok) {
        console.log('✅ Booking cancellation successful!');
        
        // 4. Verify the status was updated
        console.log('\n🔍 Verifying status update...');
        const verifyResponse = await fetch(`${API_BASE}/api/bookings`);
        if (verifyResponse.ok) {
          const verifyData = await verifyResponse.json();
          const updatedBooking = verifyData.bookings.find(b => b.id === confirmedBooking.id);
          if (updatedBooking && updatedBooking.status === 'cancelled') {
            console.log('✅ Verification: Status updated correctly in database');
          } else {
            console.log('❌ Verification: Status NOT updated in database');
            console.log(`   Expected: cancelled, Got: ${updatedBooking?.status}`);
          }
        }
      } else {
        console.log('❌ Booking cancellation failed');
      }
    }
    
  } catch (error) {
    console.error('💥 Test failed:', error);
  }
}

testCancelBooking();
