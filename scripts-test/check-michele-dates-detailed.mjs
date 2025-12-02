import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function checkSpecificDates() {
  try {
    console.log('🔍 VERIFICA DETTAGLIATA DATE MICHELE\n');
    
    // Trova Michele
    const micheleResult = await sql`
      SELECT id, name FROM barbers WHERE name ILIKE '%michele%'
    `;
    
    if (micheleResult.length === 0) {
      console.log('❌ Michele non trovato');
      return;
    }
    
    const michele = micheleResult[0];
    console.log(`✅ Michele: ${michele.name} (${michele.id})\n`);
    
    // Chiedi date specifiche o scansiona i prossimi 60 giorni
    console.log('📅 Scansione prossimi 60 giorni per giorni con problemi...\n');
    console.log('=' .repeat(80));
    
    const today = new Date();
    const problemDates = [];
    
    for (let i = 0; i < 60; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;
      
      // Prendi schedule
      const schedules = await sql`
        SELECT available_slots, unavailable_slots, day_off
        FROM barber_schedules
        WHERE barber_id = ${michele.id} AND date = ${dateString}
      `;
      
      let availableSlots = [];
      
      if (schedules.length > 0 && !schedules[0].day_off) {
        const available = JSON.parse(schedules[0].available_slots || '[]');
        const unavailable = JSON.parse(schedules[0].unavailable_slots || '[]');
        availableSlots = available.filter(slot => !unavailable.includes(slot));
      }
      
      // Prendi bookings
      const bookings = await sql`
        SELECT time, status
        FROM bookings
        WHERE barber_id = ${michele.id} AND date = ${dateString} AND status != 'cancelled'
      `;
      
      const bookedSlots = bookings.map(b => b.time);
      const freeSlots = availableSlots.filter(slot => !bookedSlots.includes(slot));
      
      // Controlla se slot liberi sono consecutivi
      const hasConsecutiveFreeSlots = checkConsecutiveSlots(freeSlots);
      
      // Problema: ha slot liberi ma non consecutivi, quindi non prenotabile per servizi lunghi
      if (freeSlots.length > 0 && !hasConsecutiveFreeSlots) {
        problemDates.push({
          date: dateString,
          dayName: ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'][date.getDay()],
          totalSlots: availableSlots.length,
          bookedCount: bookedSlots.length,
          freeCount: freeSlots.length,
          freeSlots: freeSlots,
          hasConsecutive: false
        });
      } else if (freeSlots.length > 0 && freeSlots.length <= 3) {
        // Anche se consecutivi, se sono pochi potrebbero essere problematici
        problemDates.push({
          date: dateString,
          dayName: ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'][date.getDay()],
          totalSlots: availableSlots.length,
          bookedCount: bookedSlots.length,
          freeCount: freeSlots.length,
          freeSlots: freeSlots,
          hasConsecutive: hasConsecutiveFreeSlots
        });
      }
    }
    
    if (problemDates.length === 0) {
      console.log('\n✅ Nessun giorno problematico trovato!\n');
      return;
    }
    
    console.log(`\n⚠️  Trovati ${problemDates.length} giorni con pochi slot o slot non consecutivi:\n`);
    
    problemDates.forEach((d, i) => {
      console.log(`${i + 1}. ${d.date} (${d.dayName})`);
      console.log(`   📊 Total: ${d.totalSlots} | Booked: ${d.bookedCount} | Free: ${d.freeCount}`);
      console.log(`   🕒 Free slots: ${d.freeSlots.join(', ')}`);
      console.log(`   ${d.hasConsecutive ? '✅' : '❌'} Ha slot consecutivi per servizio 60min`);
      console.log('');
    });
    
    // Chiamata API per verificare cosa vede il frontend
    console.log('\n' + '='.repeat(80));
    console.log('🌐 VERIFICA API /api/bookings/batch-availability:\n');
    
    const testDates = problemDates.slice(0, 5).map(d => d.date);
    
    const response = await fetch('http://localhost:3001/api/bookings/batch-availability', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        barberId: michele.id,
        dates: testDates
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      
      testDates.forEach(dateString => {
        const availability = data.availability[dateString];
        const problemData = problemDates.find(d => d.date === dateString);
        
        console.log(`📅 ${dateString}:`);
        console.log(`   API dice: hasSlots=${availability.hasSlots}, available=${availability.availableCount}`);
        console.log(`   DB reale: ${problemData.freeCount} slot liberi: ${problemData.freeSlots.join(', ')}`);
        console.log(`   ${problemData.hasConsecutive ? '✅' : '❌'} Consecutivi per 60min`);
        
        if (availability.hasSlots && !problemData.hasConsecutive) {
          console.log(`   ⚠️  BUG: API dice disponibile MA slot non consecutivi!`);
          console.log(`       → Frontend mostra come prenotabile ma non lo è`);
        } else if (availability.hasSlots && problemData.freeCount <= 2) {
          console.log(`   ⚠️  WARNING: Solo ${problemData.freeCount} slot disponibili`);
          console.log(`       → Potrebbe non essere sufficiente per servizi lunghi`);
        }
        console.log('');
      });
    }
    
    // Suggerimenti
    console.log('\n' + '='.repeat(80));
    console.log('💡 SOLUZIONI POSSIBILI:\n');
    console.log('1. Modificare API batch-availability per considerare slot consecutivi');
    console.log('2. Frontend: quando availableCount <= 2, mostrare come "Lista d\'attesa"');
    console.log('3. Aggiungere check: se servizio=60min, richiedere 2 slot consecutivi');
    console.log('4. UI: Mostrare "Solo 1 slot libero" invece di giorno verde normale\n');
    
  } catch (error) {
    console.error('❌ Error:', error);
    console.error(error.stack);
  }
}

function checkConsecutiveSlots(slots) {
  if (slots.length < 2) return false;
  
  // Converti slot in minuti
  const slotMinutes = slots.map(slot => {
    const [hours, minutes] = slot.split(':').map(Number);
    return hours * 60 + minutes;
  }).sort((a, b) => a - b);
  
  // Cerca almeno 2 slot consecutivi (distanza = 30 minuti)
  for (let i = 0; i < slotMinutes.length - 1; i++) {
    if (slotMinutes[i + 1] - slotMinutes[i] === 30) {
      return true;
    }
  }
  
  return false;
}

checkSpecificDates();
