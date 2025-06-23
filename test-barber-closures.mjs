import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

const sql = neon(process.env.DATABASE_URL);

async function testBarberClosures() {
  try {
    console.log('🧪 Testing barber closures functionality...\n');
    
    // Prima otteniamo l'email dei barbieri
    const barbers = await sql`SELECT id, name, email FROM barbers`;
    console.log('📋 Available barbers:');
    barbers.forEach(barber => {
      console.log(`  - ID: ${barber.id}, Name: ${barber.name}, Email: ${barber.email || 'N/A'}`);
    });
    
    if (barbers.length === 0) {
      console.log('❌ No barbers found in database');
      return;
    }
    
    // Prendiamo il primo barbiere per il test
    const testBarber = barbers[0];
    const barberEmail = testBarber.email || `${testBarber.id}@maskiobarber.com`;
    
    console.log(`\n🎯 Testing with barber: ${testBarber.name} (${barberEmail})`);
    
    // Date per i test
    const today = new Date();
    const testDate1 = new Date(today);
    testDate1.setDate(today.getDate() + 1); // Domani
    const testDate2 = new Date(today);
    testDate2.setDate(today.getDate() + 2); // Dopodomani
    
    const testDateStr1 = testDate1.toISOString().split('T')[0];
    const testDateStr2 = testDate2.toISOString().split('T')[0];
    
    console.log(`\n📅 Test dates: ${testDateStr1} and ${testDateStr2}`);
    
    // 1. Inserisci una chiusura di mezza giornata (mattina) per domani
    console.log('\n1. Creating morning closure for tomorrow...');
    await sql`
      INSERT INTO barber_closures (barber_email, closure_date, closure_type, reason, created_by)
      VALUES (${barberEmail}, ${testDateStr1}, 'morning', 'Medical appointment', 'admin')
    `;
    console.log('✅ Morning closure created');
    
    // 2. Inserisci una chiusura intera giornata per dopodomani
    console.log('\n2. Creating full day closure for day after tomorrow...');
    await sql`
      INSERT INTO barber_closures (barber_email, closure_date, closure_type, reason, created_by)
      VALUES (${barberEmail}, ${testDateStr2}, 'full', 'Personal day', 'admin')
    `;
    console.log('✅ Full day closure created');
    
    // 3. Verifica che le chiusure siano state inserite
    console.log('\n3. Verifying closures in database...');
    const closures = await sql`
      SELECT * FROM barber_closures 
      WHERE barber_email = ${barberEmail} 
      ORDER BY closure_date
    `;
    
    console.log(`📊 Found ${closures.length} closures:`);
    closures.forEach(closure => {
      console.log(`  - Date: ${closure.closure_date}, Type: ${closure.closure_type}, Reason: ${closure.reason}`);
    });
    
    // 4. Testa l'API degli slot per vedere l'effetto delle chiusure
    console.log('\n4. Testing slots API with closures...');
    
    // Test per domani (dovrebbe avere solo pomeriggio disponibile)
    console.log(`\n📅 Testing slots for ${testDateStr1} (morning closure):`);
    const response1 = await fetch(`http://localhost:3000/api/bookings/slots?barberId=${testBarber.id}&date=${testDateStr1}`);
    
    if (response1.ok) {
      const slots1 = await response1.json();
      const availableSlots = slots1.filter(slot => slot.available);
      const morningAvailable = availableSlots.filter(slot => {
        const hour = parseInt(slot.time.split(':')[0]);
        return hour < 14;
      });
      const afternoonAvailable = availableSlots.filter(slot => {
        const hour = parseInt(slot.time.split(':')[0]);
        return hour >= 14;
      });
      
      console.log(`  📊 Total available: ${availableSlots.length}`);
      console.log(`  🌅 Morning available: ${morningAvailable.length} (expected: 0)`);
      console.log(`  🌆 Afternoon available: ${afternoonAvailable.length} (expected: 7)`);
      
      if (morningAvailable.length === 0 && afternoonAvailable.length > 0) {
        console.log('  ✅ Morning closure working correctly!');
      } else {
        console.log('  ❌ Morning closure not working as expected');
      }
    } else {
      console.log(`  ❌ API call failed: ${response1.status}`);
    }
    
    // Test per dopodomani (dovrebbe non avere slot disponibili)
    console.log(`\n📅 Testing slots for ${testDateStr2} (full day closure):`);
    const response2 = await fetch(`http://localhost:3000/api/bookings/slots?barberId=${testBarber.id}&date=${testDateStr2}`);
    
    if (response2.ok) {
      const slots2 = await response2.json();
      const availableSlots2 = slots2.filter(slot => slot.available);
      
      console.log(`  📊 Total available: ${availableSlots2.length} (expected: 0)`);
      
      if (availableSlots2.length === 0) {
        console.log('  ✅ Full day closure working correctly!');
      } else {
        console.log('  ❌ Full day closure not working as expected');
        console.log('  Available slots:', availableSlots2.map(s => s.time));
      }
    } else {
      console.log(`  ❌ API call failed: ${response2.status}`);
    }
    
    console.log('\n🧹 Cleaning up test data...');
    await sql`DELETE FROM barber_closures WHERE barber_email = ${barberEmail} AND created_by = 'admin'`;
    console.log('✅ Test data cleaned up');
    
    console.log('\n🎉 Barber closures test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Full error:', error);
  }
}

testBarberClosures();
