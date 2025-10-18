console.log('🧪 TEST API BATCH-AVAILABILITY - Michele 30 Ottobre');
console.log('Copiare e incollare questo comando nella console del browser:\n');

console.log(`
fetch('https://www.maskiobarberconcept.it/api/bookings/batch-availability', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    barberId: 'michele',
    dates: ['2025-10-30']
  })
})
.then(r => r.json())
.then(data => {
  console.log('🧪 API TEST RESULT:');
  console.log('hasSlots:', data.availability['2025-10-30'].hasSlots);
  console.log('availableCount:', data.availability['2025-10-30'].availableCount);
  console.log('totalSlots:', data.availability['2025-10-30'].totalSlots);
  console.log('Full response:', data.availability['2025-10-30']);
  
  if (data.availability['2025-10-30'].hasSlots && data.availability['2025-10-30'].availableCount === 14) {
    console.log('✅ FIX FUNZIONA! 14 slot disponibili');
  } else if (data.availability['2025-10-30'].hasSlots && data.availability['2025-10-30'].availableCount > 0) {
    console.log('⚠️ Fix parziale - alcuni slot disponibili ma non tutti');
  } else {
    console.log('❌ Fix non ancora attivo - deployment in corso...');
  }
});
`);
