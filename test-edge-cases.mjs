import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

const sql = neon(process.env.DATABASE_URL);

async function testEdgeCases() {
  try {
    console.log('🧪 Testing edge cases and error handling...\n');
    
    // Test 1: API con parametri mancanti
    console.log('1. Testing API with missing parameters...');
    
    const response1 = await fetch('http://localhost:3000/api/bookings/slots?barberId=fabio');
    console.log(`   Missing date - Status: ${response1.status} (expected: 400)`);
    
    const response2 = await fetch('http://localhost:3000/api/bookings/slots?date=2025-06-17');
    console.log(`   Missing barberId - Status: ${response2.status} (expected: 400)`);
    
    // Test 2: API con barbiere inesistente
    console.log('\n2. Testing API with non-existent barber...');
    const response3 = await fetch('http://localhost:3000/api/bookings/slots?barberId=nonexistent&date=2025-06-17');
    const result3 = await response3.json();
    console.log(`   Non-existent barber - Status: ${response3.status}`);
    console.log(`   Response: ${JSON.stringify(result3)}`);
    
    // Test 3: Chiusura pomeridiana
    console.log('\n3. Testing afternoon closure...');
    const testDate = new Date();
    testDate.setDate(testDate.getDate() + 3);
    const testDateStr = testDate.toISOString().split('T')[0];
    
    await sql`
      INSERT INTO barber_closures (barber_email, closure_date, closure_type, reason, created_by)
      VALUES ('fabio.cassano97@icloud.com', ${testDateStr}, 'afternoon', 'Afternoon off', 'test')
    `;
    
    const response4 = await fetch(`http://localhost:3000/api/bookings/slots?barberId=fabio&date=${testDateStr}`);
    const slots4 = await response4.json();
    
    const availableSlots = slots4.filter(slot => slot.available);
    const morningAvailable = availableSlots.filter(slot => {
      const hour = parseInt(slot.time.split(':')[0]);
      return hour < 14;
    });
    const afternoonAvailable = availableSlots.filter(slot => {
      const hour = parseInt(slot.time.split(':')[0]);
      return hour >= 14;
    });
    
    console.log(`   📅 Date: ${testDateStr}`);
    console.log(`   🌅 Morning available: ${morningAvailable.length} (expected: 7)`);
    console.log(`   🌆 Afternoon available: ${afternoonAvailable.length} (expected: 0)`);
    
    if (morningAvailable.length > 0 && afternoonAvailable.length === 0) {
      console.log('   ✅ Afternoon closure working correctly!');
    } else {
      console.log('   ❌ Afternoon closure not working as expected');
    }
    
    // Test 4: Data passata (dovrebbe comunque funzionare)
    console.log('\n4. Testing with past date...');
    const pastDate = '2025-01-01';
    const response5 = await fetch(`http://localhost:3000/api/bookings/slots?barberId=fabio&date=${pastDate}`);
    const slots5 = await response5.json();
    console.log(`   Past date response - Status: ${response5.status}`);
    console.log(`   Slots returned: ${Array.isArray(slots5) ? slots5.length : 'N/A'}`);
    
    // Test 5: Chiusure multiple per lo stesso barbiere
    console.log('\n5. Testing multiple closures for same barber...');
    const multiTestDate = new Date();
    multiTestDate.setDate(multiTestDate.getDate() + 4);
    const multiTestDateStr = multiTestDate.toISOString().split('T')[0];
    
    // Inserisci due chiusure diverse (non dovrebbe essere possibile, ma testiamo)
    await sql`
      INSERT INTO barber_closures (barber_email, closure_date, closure_type, reason, created_by)
      VALUES ('fabio.cassano97@icloud.com', ${multiTestDateStr}, 'morning', 'First closure', 'test')
    `;
    
    await sql`
      INSERT INTO barber_closures (barber_email, closure_date, closure_type, reason, created_by)
      VALUES ('fabio.cassano97@icloud.com', ${multiTestDateStr}, 'afternoon', 'Second closure', 'test')
    `;
    
    const response6 = await fetch(`http://localhost:3000/api/bookings/slots?barberId=fabio&date=${multiTestDateStr}`);
    const slots6 = await response6.json();
    const availableSlots6 = slots6.filter(slot => slot.available);
    
    console.log(`   📅 Date with multiple closures: ${multiTestDateStr}`);
    console.log(`   Available slots: ${availableSlots6.length} (expected: 0)`);
    
    if (availableSlots6.length === 0) {
      console.log('   ✅ Multiple closures handled correctly!');
    } else {
      console.log('   ❌ Multiple closures not working as expected');
    }
    
    // Test 6: Verifica che altri barbieri non siano influenzati
    console.log('\n6. Testing that other barbers are not affected...');
    const response7 = await fetch(`http://localhost:3000/api/bookings/slots?barberId=michele&date=${testDateStr}`);
    const slots7 = await response7.json();
    const availableSlots7 = slots7.filter(slot => slot.available);
    
    console.log(`   Michele's available slots on ${testDateStr}: ${availableSlots7.length} (expected: 14)`);
    
    if (availableSlots7.length === 14) {
      console.log('   ✅ Other barbers not affected by closures!');
    } else {
      console.log('   ❌ Other barbers seem to be affected');
    }
    
    // Cleanup
    console.log('\n🧹 Cleaning up test data...');
    await sql`DELETE FROM barber_closures WHERE created_by = 'test'`;
    console.log('✅ Test data cleaned up');
    
    console.log('\n🎉 Edge cases testing completed!');
    
  } catch (error) {
    console.error('❌ Edge cases test failed:', error.message);
    console.error('Full error:', error);
  }
}

testEdgeCases();
