import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function check5Dicembre() {
  try {
    const targetDate = '2025-12-05';
    console.log(`🔍 ANALISI DETTAGLIATA: ${targetDate} (5 Dicembre 2025)\n`);
    console.log('='.repeat(80));
    
    // 1. Trova Michele
    const micheleResult = await sql`
      SELECT id, name FROM barbers WHERE name ILIKE '%michele%'
    `;
    
    if (micheleResult.length === 0) {
      console.log('❌ Michele non trovato');
      return;
    }
    
    const michele = micheleResult[0];
    console.log(`\n✅ Michele: ${michele.name} (${michele.id})\n`);
    
    // 2. Che giorno è?
    const date = new Date(targetDate);
    const dayNames = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];
    console.log(`📅 ${dayNames[date.getDay()]}\n`);
    
    // 3. Schedule
    const schedules = await sql`
      SELECT * FROM barber_schedules
      WHERE barber_id = ${michele.id} AND date = ${targetDate}
    `;
    
    console.log('📋 SCHEDULE DATABASE:\n');
    
    if (schedules.length === 0) {
      console.log('⚠️  Nessun schedule specifico trovato');
      console.log('   → Sistema userà slot standard per il giorno\n');
    } else {
      const schedule = schedules[0];
      console.log(`✅ Schedule trovato:`);
      console.log(`   Day off: ${schedule.day_off}`);
      
      if (!schedule.day_off) {
        const available = JSON.parse(schedule.available_slots || '[]');
        const unavailable = JSON.parse(schedule.unavailable_slots || '[]');
        
        console.log(`   Available slots: ${available.length}`);
        console.log(`   Slots: ${available.join(', ')}`);
        console.log(`   Unavailable slots: ${unavailable.length}`);
        if (unavailable.length > 0) {
          console.log(`   Unavailable: ${unavailable.join(', ')}`);
        }
        console.log('');
      }
    }
    
    // 4. Bookings
    const bookings = await sql`
      SELECT time, customer_name, service, status
      FROM bookings
      WHERE barber_id = ${michele.id} AND date = ${targetDate}
      ORDER BY time
    `;
    
    console.log('📅 BOOKINGS:\n');
    console.log(`   Totale prenotazioni: ${bookings.length}\n`);
    
    const confirmed = bookings.filter(b => b.status !== 'cancelled');
    const cancelled = bookings.filter(b => b.status === 'cancelled');
    
    if (confirmed.length > 0) {
      console.log(`   ✅ Confermate (${confirmed.length}):`);
      confirmed.forEach(b => {
        console.log(`      ${b.time} | ${b.customer_name || 'N/A'} | ${b.service}`);
      });
      console.log('');
    }
    
    if (cancelled.length > 0) {
      console.log(`   ❌ Cancellate (${cancelled.length}):`);
      cancelled.forEach(b => {
        console.log(`      ${b.time} | ${b.customer_name || 'N/A'}`);
      });
      console.log('');
    }
    
    // 5. Calcola slot liberi
    let availableSlots = [];
    
    if (schedules.length > 0 && !schedules[0].day_off) {
      const available = JSON.parse(schedules[0].available_slots || '[]');
      const unavailable = JSON.parse(schedules[0].unavailable_slots || '[]');
      availableSlots = available.filter(slot => !unavailable.includes(slot));
    }
    
    const bookedSlots = confirmed.map(b => b.time);
    const freeSlots = availableSlots.filter(slot => !bookedSlots.includes(slot));
    
    console.log('='.repeat(80));
    console.log('📊 ANALISI DISPONIBILITÀ:\n');
    console.log(`   📊 Slot totali configurati: ${availableSlots.length}`);
    console.log(`   📅 Slot prenotati: ${bookedSlots.length}`);
    console.log(`   ✅ Slot liberi: ${freeSlots.length}`);
    
    if (freeSlots.length > 0) {
      console.log(`   🕒 Slot liberi: ${freeSlots.join(', ')}`);
    }
    console.log('');
    
    // 6. Test API batch-availability
    console.log('='.repeat(80));
    console.log('🌐 TEST API /api/bookings/batch-availability:\n');
    
    const response = await fetch('http://localhost:3001/api/bookings/batch-availability', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        barberId: michele.id,
        dates: [targetDate]
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      const availability = data.availability[targetDate];
      
      console.log(`   API Response:`);
      console.log(`   - hasSlots: ${availability.hasSlots}`);
      console.log(`   - availableCount: ${availability.availableCount}`);
      console.log(`   - totalSlots: ${availability.totalSlots}`);
      console.log('');
      
      // Confronta
      console.log('   🔍 CONFRONTO:\n');
      console.log(`   DB reale: ${freeSlots.length} slot liberi`);
      console.log(`   API dice: ${availability.availableCount} slot disponibili`);
      console.log('');
      
      if (availability.hasSlots && freeSlots.length === 0) {
        console.log('   🐛 BUG TROVATO!');
        console.log('   API dice hasSlots=true MA il DB ha 0 slot liberi');
        console.log('   → Frontend mostrerà giorno come disponibile (SBAGLIATO)\n');
      } else if (!availability.hasSlots && freeSlots.length > 0) {
        console.log('   🐛 BUG TROVATO!');
        console.log('   API dice hasSlots=false MA il DB ha slot liberi');
        console.log('   → Frontend mostrerà "Lista d\'attesa" (SBAGLIATO)\n');
      } else if (!availability.hasSlots && freeSlots.length === 0) {
        console.log('   ✅ CORRETTO!');
        console.log('   API e DB concordano: NESSUN SLOT DISPONIBILE');
        console.log('   → Frontend dovrebbe mostrare "Lista d\'attesa" (arancione)\n');
      } else {
        console.log('   ✅ API e DB sono coerenti');
      }
    } else {
      console.log(`   ❌ Errore API: ${response.status}`);
    }
    
    // 7. Test API slots
    console.log('='.repeat(80));
    console.log('🌐 TEST API /api/bookings/slots:\n');
    
    const slotsResponse = await fetch(`http://localhost:3001/api/bookings/slots?barberId=${michele.id}&date=${targetDate}`);
    
    if (slotsResponse.ok) {
      const slots = await slotsResponse.json();
      const availableFromAPI = slots.filter(s => s.available);
      
      console.log(`   Total slots: ${slots.length}`);
      console.log(`   Available: ${availableFromAPI.length}`);
      console.log(`   Unavailable: ${slots.length - availableFromAPI.length}`);
      
      if (availableFromAPI.length > 0) {
        console.log(`\n   ✅ Slot disponibili:`);
        availableFromAPI.forEach(s => console.log(`      ${s.time}`));
      } else {
        console.log(`\n   ❌ Nessuno slot disponibile`);
      }
      
      if (availableFromAPI.length !== freeSlots.length) {
        console.log(`\n   ⚠️  DISCREPANZA: API dice ${availableFromAPI.length}, DB dice ${freeSlots.length}`);
      }
    } else {
      console.log(`   ❌ Errore API: ${slotsResponse.status}`);
    }
    
    // 8. Conclusioni
    console.log('\n' + '='.repeat(80));
    console.log('📊 CONCLUSIONI:\n');
    
    if (freeSlots.length === 0 && schedules.length > 0) {
      console.log('   ✅ Il 5 dicembre è EFFETTIVAMENTE tutto occupato');
      console.log('   ✅ Tutti gli slot disponibili sono prenotati');
      console.log('');
      console.log('   Se il frontend NON mostra "Lista d\'attesa":');
      console.log('   1. Verifica che unavailableDates includa questa data');
      console.log('   2. Controlla la cache del frontend');
      console.log('   3. Ricarica la pagina (hard refresh: Ctrl+Shift+R)\n');
    } else if (freeSlots.length > 0) {
      console.log(`   ⚠️  Ci sono ancora ${freeSlots.length} slot liberi`);
      console.log('   Il giorno NON è completamente occupato\n');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    console.error(error.stack);
  }
}

check5Dicembre();
