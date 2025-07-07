// Test script per verificare la fix degli slot
import fetch from 'node-fetch';

const SITE_URL = 'https://www.maskiobarberconcept.it';
// const SITE_URL = 'http://localhost:3000'; // Per test locale

async function testSlotsAvailability() {
  console.log('🧪 Testing slots availability fix...\n');
  
  // Test barbiere ID (Fabio)
  const barberId = 'fabio';
  
  // Date da testare - dal 5 settembre in poi
  const testDates = [
    '2024-09-05',
    '2024-09-06',
    '2024-09-07',
    '2024-09-09', // Lunedì
    '2024-09-10', // Martedì
    '2024-09-11', // Mercoledì
    '2024-09-12', // Giovedì
    '2024-09-13', // Venerdì
    '2024-09-14', // Sabato
  ];
  
  for (const date of testDates) {
    try {
      console.log(`📅 Testing date: ${date}`);
      
      const url = `${SITE_URL}/api/bookings/slots?barberId=${barberId}&date=${date}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        console.log(`❌ Error: ${response.status} ${response.statusText}`);
        continue;
      }
      
      const slots = await response.json();
      console.log(`📊 Total slots: ${slots.length}`);
      
      const availableSlots = slots.filter(slot => slot.available);
      console.log(`✅ Available slots: ${availableSlots.length}`);
      
      if (availableSlots.length > 0) {
        console.log(`   First available: ${availableSlots[0].time}`);
        console.log(`   Last available: ${availableSlots[availableSlots.length - 1].time}`);
      } else {
        console.log('⚠️  No available slots found');
      }
      
      console.log(''); // Riga vuota
      
    } catch (error) {
      console.log(`❌ Error testing ${date}:`, error.message);
    }
  }
}

// Esegui il test
testSlotsAvailability().then(() => {
  console.log('✅ Test completed!');
}).catch(error => {
  console.error('❌ Test failed:', error);
}); 