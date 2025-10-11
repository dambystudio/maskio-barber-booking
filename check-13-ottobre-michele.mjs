import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function check13Ottobre() {
  try {
    const targetDate = '2025-10-13';
    console.log(`🔍 ANALISI DETTAGLIATA: ${targetDate} (13 Ottobre 2025)\n`);
    console.log('='.repeat(80));
    
    // 1. Trova Michele
    const micheleResult = await sql`
      SELECT id, name, email FROM barbers WHERE name ILIKE '%michele%'
    `;
    
    if (micheleResult.length === 0) {
      console.log('❌ Michele non trovato');
      return;
    }
    
    const michele = micheleResult[0];
    console.log(`\n✅ Michele: ${michele.name} (${michele.id})`);
    console.log(`   Email: ${michele.email}\n`);
    
    // 2. Verifica schedule del giorno
    console.log('📅 SCHEDULE DATABASE:\n');
    
    const schedules = await sql`
      SELECT * FROM barber_schedules
      WHERE barber_id = ${michele.id} AND date = ${targetDate}
    `;
    
    if (schedules.length === 0) {
      console.log('❌ Nessun schedule trovato per questa data');
      console.log('   → Sistema userà slot standard per lunedì\n');
    } else {
      const schedule = schedules[0];
      console.log(`✅ Schedule trovato:`);
      console.log(`   Day off: ${schedule.day_off}`);
      console.log(`   Available slots (raw): ${schedule.available_slots ? schedule.available_slots.substring(0, 100) + '...' : 'null'}`);
      console.log(`   Unavailable slots: ${schedule.unavailable_slots || 'null'}\n`);
      
      if (schedule.day_off) {
        console.log('⚠️  Giorno marcato come DAY OFF nel database');
        return;
      }
      
      try {
        const available = JSON.parse(schedule.available_slots || '[]');
        const unavailable = JSON.parse(schedule.unavailable_slots || '[]');
        const finalAvailable = available.filter(slot => !unavailable.includes(slot));
        
        console.log(`   Parsed available slots: ${available.length}`);
        console.log(`   Slots: ${available.join(', ')}`);
        console.log(`   Unavailable slots: ${unavailable.length}`);
        console.log(`   Final available (dopo filtro): ${finalAvailable.length}\n`);
      } catch (error) {
        console.error('   ❌ Error parsing slots:', error.message);
      }
    }
    
    // 3. Verifica bookings
    console.log('📋 BOOKINGS:\n');
    
    const bookings = await sql`
      SELECT id, time, status, customer_name, service, created_at
      FROM bookings
      WHERE barber_id = ${michele.id} AND date = ${targetDate}
      ORDER BY time
    `;
    
    console.log(`   Trovate ${bookings.length} prenotazioni:\n`);
    
    const confirmedBookings = bookings.filter(b => b.status !== 'cancelled');
    const cancelledBookings = bookings.filter(b => b.status === 'cancelled');
    
    if (confirmedBookings.length > 0) {
      console.log(`   ✅ Prenotazioni confermate (${confirmedBookings.length}):`);
      confirmedBookings.forEach(b => {
        console.log(`      - ${b.time} | ${b.customer_name || 'N/A'} | ${b.service} | ${b.status}`);
      });
      console.log('');
    }
    
    if (cancelledBookings.length > 0) {
      console.log(`   ❌ Prenotazioni cancellate (${cancelledBookings.length}):`);
      cancelledBookings.forEach(b => {
        console.log(`      - ${b.time} | ${b.customer_name || 'N/A'} | ${b.status}`);
      });
      console.log('');
    }
    
    // 4. Calcola slot realmente disponibili
    console.log('🔍 ANALISI DISPONIBILITÀ:\n');
    
    // Determina slot disponibili dal schedule o usa standard per lunedì
    let availableSlots = [];
    
    if (schedules.length > 0 && !schedules[0].day_off) {
      try {
        const available = JSON.parse(schedules[0].available_slots || '[]');
        const unavailable = JSON.parse(schedules[0].unavailable_slots || '[]');
        availableSlots = available.filter(slot => !unavailable.includes(slot));
      } catch (error) {
        console.log('   ⚠️  Error parsing, usando slot standard lunedì');
        // Lunedì standard: 15:00-17:30
        availableSlots = ['15:00', '15:30', '16:00', '16:30', '17:00', '17:30'];
      }
    } else {
      // Slot standard per lunedì
      console.log('   📝 Usando slot standard per lunedì (15:00-17:30)');
      availableSlots = ['15:00', '15:30', '16:00', '16:30', '17:00', '17:30'];
    }
    
    const bookedSlots = confirmedBookings.map(b => b.time);
    const freeSlots = availableSlots.filter(slot => !bookedSlots.includes(slot));
    
    console.log(`   📊 Slot totali configurati: ${availableSlots.length}`);
    console.log(`   📅 Slot prenotati: ${bookedSlots.length}`);
    console.log(`   ✅ Slot liberi: ${freeSlots.length}`);
    
    if (freeSlots.length > 0) {
      console.log(`   🕒 Slot liberi: ${freeSlots.join(', ')}`);
    }
    console.log('');
    
    // 5. Test API batch-availability
    console.log('='.repeat(80));
    console.log('🌐 TEST API /api/bookings/batch-availability:\n');
    
    const apiResponse = await fetch('http://localhost:3001/api/bookings/batch-availability', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        barberId: michele.id,
        dates: [targetDate]
      })
    });
    
    if (apiResponse.ok) {
      const apiData = await apiResponse.json();
      const availability = apiData.availability[targetDate];
      
      console.log(`   API Response:`);
      console.log(`   - hasSlots: ${availability.hasSlots}`);
      console.log(`   - availableCount: ${availability.availableCount}`);
      console.log(`   - totalSlots: ${availability.totalSlots}`);
      console.log('');
      
      // Confronta con realtà
      console.log('   🔍 CONFRONTO CON DATABASE:\n');
      console.log(`   DB dice: ${freeSlots.length} slot liberi`);
      console.log(`   API dice: ${availability.availableCount} slot disponibili`);
      console.log('');
      
      if (availability.hasSlots && freeSlots.length === 0) {
        console.log('   🐛 BUG TROVATO!');
        console.log('   API dice hasSlots=true MA database ha 0 slot liberi');
        console.log('   → Frontend mostrerà giorno come disponibile (verde)');
        console.log('   → Ma quando clicchi, non ci saranno orari selezionabili\n');
      } else if (!availability.hasSlots && freeSlots.length > 0) {
        console.log('   🐛 BUG TROVATO!');
        console.log('   API dice hasSlots=false MA database ha slot liberi');
        console.log('   → Frontend mostrerà giorno come "Lista d\'attesa"');
        console.log('   → Ma ci sono orari disponibili!\n');
      } else if (availability.hasSlots && freeSlots.length === 0) {
        console.log('   ✅ Coerente ma SBAGLIATO per il problema segnalato');
      } else if (!availability.hasSlots && freeSlots.length === 0) {
        console.log('   ✅ CORRETTO: API e DB concordano (nessun slot disponibile)');
      } else {
        console.log('   ✅ API e DB sono coerenti');
      }
      
    } else {
      console.log(`   ❌ Errore API: ${apiResponse.status}`);
    }
    
    // 6. Test API slots diretta
    console.log('\n' + '='.repeat(80));
    console.log('🌐 TEST API /api/bookings/slots:\n');
    
    const slotsResponse = await fetch(`http://localhost:3001/api/bookings/slots?barberId=${michele.id}&date=${targetDate}`);
    
    if (slotsResponse.ok) {
      const slotsData = await slotsResponse.json();
      console.log(`   Slots totali ritornati: ${slotsData.slots?.length || 0}`);
      
      if (slotsData.slots && slotsData.slots.length > 0) {
        const availableFromAPI = slotsData.slots.filter(s => s.available);
        const unavailableFromAPI = slotsData.slots.filter(s => !s.available);
        
        console.log(`   - Disponibili: ${availableFromAPI.length}`);
        console.log(`   - Non disponibili: ${unavailableFromAPI.length}`);
        
        if (availableFromAPI.length > 0) {
          console.log(`\n   ✅ Slot disponibili dall'API:`);
          availableFromAPI.forEach(s => console.log(`      - ${s.time}`));
        }
        
        if (availableFromAPI.length > 0 && freeSlots.length === 0) {
          console.log('\n   🐛 DISCREPANZA: API slots dice disponibili, ma DB non ne ha!');
        }
      }
    } else {
      console.log(`   ❌ Errore API: ${slotsResponse.status}`);
    }
    
    // 7. Conclusioni
    console.log('\n' + '='.repeat(80));
    console.log('📊 CONCLUSIONI:\n');
    
    if (freeSlots.length === 0) {
      console.log('   ✅ Il 13 ottobre è EFFETTIVAMENTE tutto occupato (database)');
      console.log('   ❓ Se il frontend non mostra "Tutto occupato", il bug è in:');
      console.log('      1. API batch-availability ritorna hasSlots=true (sbagliato)');
      console.log('      2. Frontend non aggiorna unavailableDates correttamente');
      console.log('      3. Cache frontend tiene vecchi dati\n');
    } else {
      console.log(`   ⚠️  Ci sono ancora ${freeSlots.length} slot liberi`);
      console.log('   Il giorno NON dovrebbe mostrare "Tutto occupato"\n');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    console.error(error.stack);
  }
}

check13Ottobre();
