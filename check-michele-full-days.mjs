import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function checkMicheleFullDays() {
  try {
    console.log('🔍 ANALISI GIORNI PIENI PER MICHELE\n');
    console.log('=' .repeat(70));
    
    // 1. Trova Michele nel database
    const micheleResult = await sql`
      SELECT id, name, email 
      FROM barbers 
      WHERE name ILIKE '%michele%'
    `;
    
    if (micheleResult.length === 0) {
      console.log('❌ Michele non trovato nel database');
      return;
    }
    
    const michele = micheleResult[0];
    console.log(`\n✅ Michele trovato:`);
    console.log(`   ID: ${michele.id}`);
    console.log(`   Nome: ${michele.name}`);
    console.log(`   Email: ${michele.email}`);
    
    // 2. Analizza i prossimi 30 giorni
    console.log('\n\n📅 ANALISI PROSSIMI 30 GIORNI:\n');
    console.log('=' .repeat(70));
    
    const today = new Date();
    const results = [];
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;
      
      // Prendi schedule per quel giorno
      const schedules = await sql`
        SELECT available_slots, unavailable_slots, day_off
        FROM barber_schedules
        WHERE barber_id = ${michele.id}
        AND date = ${dateString}
      `;
      
      let availableSlots = [];
      
      if (schedules.length > 0 && !schedules[0].day_off) {
        try {
          const available = JSON.parse(schedules[0].available_slots || '[]');
          const unavailable = JSON.parse(schedules[0].unavailable_slots || '[]');
          availableSlots = available.filter(slot => !unavailable.includes(slot));
        } catch (error) {
          console.error(`Error parsing slots for ${dateString}:`, error);
        }
      }
      
      // Prendi bookings per quel giorno
      const bookings = await sql`
        SELECT time, status
        FROM bookings
        WHERE barber_id = ${michele.id}
        AND date = ${dateString}
        AND status != 'cancelled'
      `;
      
      const bookedSlots = bookings.map(b => b.time);
      const freeSlots = availableSlots.filter(slot => !bookedSlots.includes(slot));
      
      // Determina se è un giorno con pochi slot liberi
      const isSuspicious = freeSlots.length > 0 && freeSlots.length <= 2;
      
      if (isSuspicious || freeSlots.length === 0) {
        const dayNames = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
        const dayName = dayNames[date.getDay()];
        
        results.push({
          date: dateString,
          dayName,
          totalSlots: availableSlots.length,
          bookedCount: bookedSlots.length,
          freeCount: freeSlots.length,
          freeSlots: freeSlots,
          status: freeSlots.length === 0 ? '❌ TUTTO OCCUPATO' : '⚠️ QUASI PIENO'
        });
      }
    }
    
    // 3. Mostra risultati
    if (results.length === 0) {
      console.log('\n✅ Nessun giorno completamente pieno o quasi pieno trovato nei prossimi 30 giorni');
    } else {
      console.log(`\n⚠️  Trovati ${results.length} giorni con problemi:\n`);
      
      results.forEach((result, index) => {
        console.log(`${index + 1}. ${result.status} - ${result.date} (${result.dayName})`);
        console.log(`   📊 Total slots: ${result.totalSlots}`);
        console.log(`   📅 Booked: ${result.bookedCount}`);
        console.log(`   ✅ Free: ${result.freeCount}`);
        
        if (result.freeSlots.length > 0) {
          console.log(`   🕒 Free slots: ${result.freeSlots.join(', ')}`);
        }
        console.log('');
      });
      
      // 4. Analisi pattern
      console.log('\n' + '='.repeat(70));
      console.log('📊 ANALISI PATTERN:\n');
      
      const fullyBooked = results.filter(r => r.freeCount === 0);
      const almostFull = results.filter(r => r.freeCount > 0 && r.freeCount <= 2);
      
      console.log(`   ❌ Giorni completamente occupati: ${fullyBooked.length}`);
      console.log(`   ⚠️  Giorni quasi pieni (1-2 slot): ${almostFull.length}`);
      
      if (almostFull.length > 0) {
        console.log('\n   🔍 PROBLEMA IDENTIFICATO:');
        console.log('   Giorni con solo 1-2 slot liberi potrebbero essere non prenotabili');
        console.log('   se il servizio richiede slot consecutivi (60min = 2 slot)');
        console.log('\n   Esempio:');
        almostFull.slice(0, 3).forEach(r => {
          console.log(`   - ${r.date}: ${r.freeSlots.join(', ')} liberi`);
          console.log(`     → Se servizio = 60min e slot non consecutivi → NON PRENOTABILE`);
        });
      }
    }
    
    // 5. Simula chiamata API batch-availability
    console.log('\n\n' + '='.repeat(70));
    console.log('🚀 SIMULAZIONE API /api/bookings/batch-availability:\n');
    
    const dates = results.slice(0, 5).map(r => r.date);
    if (dates.length > 0) {
      console.log(`Testing ${dates.length} date(s): ${dates.join(', ')}\n`);
      
      for (const dateString of dates) {
        const response = await fetch('http://localhost:3001/api/bookings/batch-availability', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            barberId: michele.id,
            dates: [dateString]
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          const availability = data.availability[dateString];
          
          console.log(`📅 ${dateString}:`);
          console.log(`   hasSlots: ${availability.hasSlots}`);
          console.log(`   availableCount: ${availability.availableCount}`);
          console.log(`   totalSlots: ${availability.totalSlots}`);
          
          const actualFree = results.find(r => r.date === dateString);
          if (actualFree) {
            console.log(`   🔍 Free slots from DB: ${actualFree.freeSlots.join(', ')}`);
          }
          
          // Problema: API dice hasSlots=true ma potrebbero non essere prenotabili
          if (availability.hasSlots && availability.availableCount <= 2) {
            console.log(`   ⚠️  ATTENZIONE: Solo ${availability.availableCount} slot(s) disponibile(i)`);
            console.log(`      Se servizio = 60min, giorno potrebbe essere NON prenotabile`);
          }
          console.log('');
        } else {
          console.log(`❌ Error calling API for ${dateString}: ${response.status}`);
        }
      }
    } else {
      console.log('Nessun giorno da testare (tutti liberi!)');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    console.error(error.stack);
  }
}

checkMicheleFullDays();
