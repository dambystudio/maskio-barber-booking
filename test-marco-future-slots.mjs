import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://neondb_owner:npg_Wj09qDUmTsxE@ep-old-forest-a2ur722g-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require';
const sql = neon(DATABASE_URL);

async function testMarcoFutureSlots() {
  console.log('🧪 Test: Verifica slot di Marco per date future...\n');

  try {
    // Cancella alcuni schedule futuri per testare la generazione automatica
    const futureDates = [
      '2025-11-05', // Mercoledì
      '2025-11-10', // Lunedì  
      '2025-11-15'  // Sabato
    ];

    console.log('🗑️ Rimozione schedule di test per date future:');
    for (const date of futureDates) {
      const deleted = await sql`
        DELETE FROM barber_schedules 
        WHERE barber_id = 'marco' AND date = ${date}
      `;
      console.log(`   ${date}: ${deleted.rowCount || 0} record cancellati`);
    }

    // Simula una richiesta API per verificare la generazione automatica
    console.log('\n🌐 Test generazione automatica slot per Marco:');
    
    for (const date of futureDates) {
      try {
        // Test direct API call (se server è attivo)
        const response = await fetch(`http://localhost:3000/api/bookings/slots?barberId=marco&date=${date}`);
        
        if (response.ok) {
          const apiSlots = await response.json();
          const availableSlots = apiSlots.filter(slot => slot.available).map(slot => slot.time);
          const halfHourSlots = availableSlots.filter(slot => slot.endsWith(':30'));
          const dayOfWeek = new Date(date).toLocaleDateString('it-IT', { weekday: 'long' });
          
          console.log(`   ${date} (${dayOfWeek}) API:`);
          console.log(`      Slot disponibili: ${availableSlots.join(', ')}`);
          console.log(`      ✅ Solo ore piene: ${halfHourSlots.length === 0 ? 'SÌ' : 'NO (❌ ha mezze ore: ' + halfHourSlots.join(', ') + ')'}`);
          console.log(`      📊 Totale disponibili: ${availableSlots.length}`);
          
          // Verifica che sia conforme al pattern di Marco
          const expectedSlots = getExpectedMarcoSlots(date);
          const slotsMatch = JSON.stringify(availableSlots.sort()) === JSON.stringify(expectedSlots.sort());
          console.log(`      🎯 Pattern corretto: ${slotsMatch ? '✅ SÌ' : '❌ NO'}`);
          if (!slotsMatch) {
            console.log(`      Aspettati: ${expectedSlots.join(', ')}`);
          }
        } else {
          console.log(`   ${date}: ⚠️ Server non risponde (${response.status})`);
          
          // Test diretto della funzione di database se il server non risponde
          console.log(`      📝 Test diretto database...`);
          await testDirectDatabaseCall(date);
        }
      } catch (error) {
        console.log(`   ${date}: ⚠️ Server offline, test diretto database...`);
        await testDirectDatabaseCall(date);
      }
    }

    console.log('\n✅ Test completato!');
    console.log('💡 Nota: Se hai visto solo ore piene per Marco, la configurazione funziona correttamente.');

  } catch (error) {
    console.error('❌ Errore nel test:', error);
  }
}

function getExpectedMarcoSlots(dateString) {
  const date = new Date(dateString);
  const dayOfWeek = date.getDay();
  
  // Domenica - chiuso
  if (dayOfWeek === 0) {
    return [];
  }
  
  // Lunedì - solo pomeriggio (15:00-17:00) 
  if (dayOfWeek === 1) {
    return ['15:00', '16:00', '17:00'];
  }
  
  // Sabato - orari modificati (9:00-12:00, 15:00-17:00)
  if (dayOfWeek === 6) {
    return ['09:00', '10:00', '11:00', '12:00', '15:00', '16:00', '17:00'];
  }
  
  // Martedì-Venerdì - orari completi (9:00-12:00, 15:00-17:00)
  return ['09:00', '10:00', '11:00', '12:00', '15:00', '16:00', '17:00'];
}

async function testDirectDatabaseCall(date) {
  // Simula quello che farebbe il DatabaseService.getAvailableSlots
  const schedule = await sql`
    SELECT available_slots, day_off
    FROM barber_schedules 
    WHERE barber_id = 'marco' AND date = ${date}
  `;

  if (schedule.length === 0) {
    console.log(`         Nessun schedule trovato → verrà usata generazione automatica`);
    console.log(`         Pattern atteso: slot orari per Marco`);
    
    const expectedSlots = getExpectedMarcoSlots(date);
    const dayOfWeek = new Date(date).toLocaleDateString('it-IT', { weekday: 'long' });
    console.log(`         Slot attesi (${dayOfWeek}): ${expectedSlots.join(', ')}`);
  } else {
    const slots = JSON.parse(schedule[0].available_slots);
    const halfHourSlots = slots.filter(slot => slot.endsWith(':30'));
    console.log(`         Schedule esistente: ${slots.join(', ')}`);
    console.log(`         ✅ Solo ore piene: ${halfHourSlots.length === 0 ? 'SÌ' : 'NO'}`);
  }
}

testMarcoFutureSlots();
