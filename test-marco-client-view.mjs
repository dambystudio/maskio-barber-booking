import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3000/api';

async function testMarcoClientView() {
  console.log('🧪 Test visualizzazione cliente per Marco...\n');

  try {
    // Test per oggi (se fosse disponibile) e domani
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    const testDate = tomorrow.toISOString().split('T')[0];
    console.log(`📅 Test per data: ${testDate}`);

    // Chiama l'API degli slot come farebbe il frontend
    const response = await fetch(`${API_BASE}/bookings/slots?barberId=marco&date=${testDate}`);
    
    if (response.ok) {
      const slots = await response.json();
      const availableSlots = slots.filter(slot => slot.available);
      const unavailableSlots = slots.filter(slot => !slot.available);
      
      console.log(`\n📊 Risultati API per Marco:`);
      console.log(`   📍 Slot totali restituiti: ${slots.length}`);
      console.log(`   ✅ Slot disponibili: ${availableSlots.length}`);
      console.log(`   ❌ Slot non disponibili: ${unavailableSlots.length}`);
      
      console.log(`\n🕐 Slot disponibili mostrati al cliente:`);
      availableSlots.forEach((slot, index) => {
        const isHalfHour = slot.time.endsWith(':30');
        const hourType = isHalfHour ? '❌ MEZZ\'ORA' : '✅ ORA PIENA';
        console.log(`   ${index + 1}. ${slot.time} ${hourType}`);
      });
      
      // Controlla se ci sono mezze ore
      const halfHourSlots = availableSlots.filter(slot => slot.time.endsWith(':30'));
      const fullHourSlots = availableSlots.filter(slot => slot.time.endsWith(':00'));
      
      console.log(`\n🎯 Analisi orari Marco:`);
      console.log(`   ⚠️ Mezze ore mostrate: ${halfHourSlots.length} (NON dovrebbero esserci!)`);
      console.log(`   ✅ Ore piene mostrate: ${fullHourSlots.length}`);
      
      if (halfHourSlots.length > 0) {
        console.log(`\n❌ PROBLEMA RILEVATO!`);
        console.log(`   I clienti vedono questi orari mezz'ora per Marco:`);
        halfHourSlots.forEach(slot => {
          console.log(`   - ${slot.time}`);
        });
      } else {
        console.log(`\n✅ TUTTO OK! Marco mostra solo ore piene.`);
      }
      
      // Test specifico per sabato se è quello
      const dayOfWeek = new Date(testDate).getDay();
      if (dayOfWeek === 6) {
        console.log(`\n🌅 Test specifico sabato:`);
        const afternoonSlots = availableSlots.filter(slot => {
          const hour = parseInt(slot.time.split(':')[0]);
          return hour >= 14;
        });
        console.log(`   Pomeriggio: ${afternoonSlots.map(s => s.time).join(', ')}`);
        const expectedSatAfternoon = ['14:30', '15:30', '16:30'];
        const hasCorrectAfternoon = JSON.stringify(afternoonSlots.map(s => s.time).sort()) === 
                                   JSON.stringify(expectedSatAfternoon.sort());
        console.log(`   ✅ Pomeriggio sabato corretto: ${hasCorrectAfternoon ? 'SÌ' : 'NO'}`);
      }
      
    } else {
      console.log(`❌ Errore API: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.log(`Dettagli: ${errorText}`);
    }

  } catch (error) {
    console.error('❌ Errore durante il test:', error);
  }
}

testMarcoClientView();
