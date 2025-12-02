// Test script to verify slots API with closure system integration
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3000';

async function testSlotsWithClosures() {
  console.log('🧪 Testing Slots API with Closure System Integration...\n');

  try {
    // First, set some closure settings for testing
    console.log('1. Setting up test closure settings');
    const testClosureSettings = {
      closedDays: [0], // Sunday closed
      closedDates: ['2024-12-25', '2024-01-01'] // Test specific dates
    };

    const closureResponse = await fetch(`${API_BASE}/api/closure-settings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testClosureSettings)
    });

    if (!closureResponse.ok) {
      console.log('❌ Failed to set closure settings:', closureResponse.status);
      return;
    }
    console.log('✅ Test closure settings applied');

    // Test slots for different scenarios
    const testDates = [
      '2024-01-07', // Sunday (should be closed)
      '2024-01-08', // Monday (should be open)
      '2024-12-25', // Christmas (should be closed)
      '2024-01-15'  // Regular weekday (should be open)
    ];

    for (const date of testDates) {
      console.log(`\n2. Testing slots for ${date}`);
      
      const slotsResponse = await fetch(`${API_BASE}/api/bookings/slots?date=${date}&barberId=1`);
      
      if (!slotsResponse.ok) {
        console.log(`❌ Slots request failed for ${date}:`, slotsResponse.status);
        continue;
      }

      const slotsData = await slotsResponse.json();
      
      const dayOfWeek = new Date(date + 'T00:00:00').getDay();
      const isClosedDay = testClosureSettings.closedDays.includes(dayOfWeek);
      const isClosedDate = testClosureSettings.closedDates.includes(date);
      const shouldBeClosed = isClosedDay || isClosedDate;

      if (shouldBeClosed) {
        // Check if all slots show as "Chiuso"
        const allClosed = slotsData.slots && slotsData.slots.every(slot => !slot.available && slot.reason === 'Chiuso');
        if (allClosed || slotsData.message === 'Chiuso') {
          console.log(`✅ ${date} correctly shows as closed`);
        } else {
          console.log(`❌ ${date} should be closed but shows available slots:`, slotsData);
        }
      } else {
        // Check if some slots are available
        const hasAvailableSlots = slotsData.slots && slotsData.slots.some(slot => slot.available);
        if (hasAvailableSlots) {
          console.log(`✅ ${date} correctly shows available slots`);
        } else {
          console.log(`⚠️ ${date} should have available slots but all are occupied:`, slotsData);
        }
      }
    }

    // Test edge cases
    console.log('\n3. Testing edge cases');
    
    // Test invalid date
    const invalidDateResponse = await fetch(`${API_BASE}/api/bookings/slots?date=invalid-date&barberId=1`);
    console.log(`Invalid date test: ${invalidDateResponse.ok ? '⚠️ Should have failed' : '✅ Correctly rejected'}`);

    // Test missing barberId
    const missingBarberResponse = await fetch(`${API_BASE}/api/bookings/slots?date=2024-01-15`);
    if (missingBarberResponse.ok) {
      const data = await missingBarberResponse.json();
      console.log(`Missing barberId test: ${data.slots ? '✅ Handled gracefully' : '⚠️ Unexpected response'}`);
    }

    console.log('\n🎉 Slots API with closure system test completed!');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Helper function to get current formatted date
function getCurrentDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Additional test for today's slots
async function testTodaySlots() {
  console.log('\n🧪 Testing today\'s slots...');
  
  try {
    const today = getCurrentDate();
    const response = await fetch(`${API_BASE}/api/bookings/slots?date=${today}&barberId=1`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Today (${today}) slots loaded:`, {
        totalSlots: data.slots?.length || 0,
        availableSlots: data.slots?.filter(s => s.available).length || 0,
        message: data.message || 'Normal operation'
      });
    } else {
      console.log(`❌ Failed to load today's slots:`, response.status);
    }
  } catch (error) {
    console.error('❌ Today slots test failed:', error.message);
  }
}

// Run all tests
async function runAllTests() {
  await testSlotsWithClosures();
  await testTodaySlots();
}

runAllTests();
