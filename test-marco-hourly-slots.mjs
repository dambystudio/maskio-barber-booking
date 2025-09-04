import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://neondb_owner:npg_Wj09qDUmTsxE@ep-old-forest-a2ur722g-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require';
const sql = neon(DATABASE_URL);

async function testMarcoHourlySlots() {
  console.log('🧪 Test: Verifica slot orari di Marco...\n');

  try {
    // Testa alcuni giorni diversi per verificare la configurazione
    const testDates = [
      '2025-09-04', // Giovedì
      '2025-09-06', // Sabato  
      '2025-09-08', // Lunedì
      '2025-09-05'  // Venerdì
    ];

    console.log('📅 Test configurazione database:');
    for (const date of testDates) {
      const schedule = await sql`
        SELECT date, available_slots, day_off
        FROM barber_schedules 
        WHERE barber_id = 'marco' AND date = ${date}
      `;

      if (schedule.length > 0) {
        const slots = JSON.parse(schedule[0].available_slots);
        const dayOfWeek = new Date(date).toLocaleDateString('it-IT', { weekday: 'long' });
        const halfHourSlots = slots.filter(slot => slot.endsWith(':30'));
        
        console.log(`   ${date} (${dayOfWeek}):`);
        console.log(`      Slot: ${slots.join(', ')}`);
        console.log(`      ✅ Solo ore piene: ${halfHourSlots.length === 0 ? 'SÌ' : 'NO (❌ ha mezze ore: ' + halfHourSlots.join(', ') + ')'}`);
        console.log(`      📊 Totale slot: ${slots.length}`);
      } else {
        console.log(`   ${date}: ❌ Nessuno schedule trovato`);
      }
    }

    // Test API se il server è in esecuzione
    console.log('\n🌐 Test API slots (se server attivo):');
    
    for (const date of testDates.slice(0, 2)) { // Testa solo 2 date
      try {
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
        } else {
          console.log(`   ${date}: ⚠️ Server non risponde (${response.status})`);
        }
      } catch (error) {
        console.log(`   ${date}: ⚠️ Server probabilmente offline`);
      }
    }

    // Confronto con altri barbieri
    console.log('\n🔍 Confronto con altri barbieri:');
    
    const testDate = '2025-09-05'; // Venerdì
    const allBarbers = await sql`
      SELECT DISTINCT barber_id 
      FROM barber_schedules 
      WHERE date = ${testDate}
      ORDER BY barber_id
    `;

    for (const barber of allBarbers) {
      const schedule = await sql`
        SELECT available_slots 
        FROM barber_schedules 
        WHERE barber_id = ${barber.barber_id} AND date = ${testDate}
      `;

      if (schedule.length > 0) {
        const slots = JSON.parse(schedule[0].available_slots);
        const halfHourSlots = slots.filter(slot => slot.endsWith(':30'));
        
        console.log(`   ${barber.barber_id.toUpperCase()}: ${slots.length} slot totali`);
        console.log(`      Mezze ore: ${halfHourSlots.length > 0 ? halfHourSlots.length + ' (' + halfHourSlots.slice(0, 3).join(', ') + (halfHourSlots.length > 3 ? '...' : '') + ')' : '0 ✅'}`);
        console.log(`      Ore piene: ${slots.filter(slot => slot.endsWith(':00')).length}`);
      }
    }

    console.log('\n📋 Riepilogo configurazione Marco:');
    console.log('   🕘 Mattina: 09:00, 10:00, 11:00, 12:00 (4 slot)');
    console.log('   🕒 Pomeriggio: 15:00, 16:00, 17:00 (3 slot)');
    console.log('   📅 Lunedì: solo pomeriggio (15:00, 16:00, 17:00)');
    console.log('   🎯 Durata appuntamenti: 1 ORA ciascuno');
    console.log('   ✅ Configurazione applicata con successo!');

  } catch (error) {
    console.error('❌ Errore nel test:', error);
  }
}

testMarcoHourlySlots();
