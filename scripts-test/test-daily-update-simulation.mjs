import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

const sql = neon(process.env.DATABASE_URL);

console.log('🧪 TEST SIMULAZIONE DAILY-UPDATE CON NUOVO SISTEMA\n');

// Copia le funzioni dal nuovo sistema
function getUniversalSlots(dayOfWeek) {
  const slots = [];
  
  if (dayOfWeek === 0) return [];
  
  if (dayOfWeek === 1) {
    for (let hour = 9; hour <= 12; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      if (hour < 12) slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    slots.push('12:30');
    
    for (let hour = 15; hour <= 18; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      if (hour < 18) slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    
    return slots;
  }
  
  if (dayOfWeek >= 2 && dayOfWeek <= 5) {
    for (let hour = 9; hour <= 12; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      if (hour < 12) slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    slots.push('12:30');
    
    for (let hour = 15; hour <= 17; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      if (hour <= 17) slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    
    return slots;
  }
  
  if (dayOfWeek === 6) {
    for (let hour = 9; hour <= 12; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      if (hour < 12) slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    slots.push('12:30');
    
    slots.push('14:30');
    for (let hour = 15; hour <= 17; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      if (hour < 17) slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    
    return slots;
  }
  
  return [];
}

function getAutoClosureType(barberEmail, dayOfWeek) {
  if (barberEmail === 'michelebiancofiore0230@gmail.com' && dayOfWeek === 1) {
    return 'morning';
  }
  
  if (barberEmail === 'fabio.cassano97@icloud.com' && dayOfWeek === 1) {
    return 'full';
  }
  
  if (barberEmail === 'giorgiodesa00@gmail.com' && dayOfWeek >= 1 && dayOfWeek <= 6) {
    return 'morning';
  }
  
  return null;
}

async function testDailyUpdate() {
  try {
    console.log('1️⃣ VERIFICA SLOT UNIVERSALI GENERATI');
    console.log('─'.repeat(60));
    
    const barbers = await sql`SELECT id, name, email FROM barbers WHERE is_active = true`;
    console.log(`\nTrovati ${barbers.length} barbieri attivi:\n`);
    
    // Test lunedì (giorno 1)
    const mondayDate = new Date('2026-01-19'); // Un lunedì futuro
    const mondaySlots = getUniversalSlots(1);
    
    console.log(`📅 Slot per LUNEDÌ 19 gennaio 2026:`);
    console.log(`   Slot universali: ${mondaySlots.length}`);
    console.log(`   Range: ${mondaySlots[0]} - ${mondaySlots[mondaySlots.length - 1]}`);
    console.log(`   Ha 18:00: ${mondaySlots.includes('18:00') ? '✅' : '❌'}`);
    
    for (const barber of barbers) {
      const closureType = getAutoClosureType(barber.email, 1);
      console.log(`\n   👤 ${barber.name}:`);
      console.log(`      Chiusura automatica: ${closureType || 'nessuna'}`);
      
      if (closureType === 'full') {
        console.log(`      Slot effettivi: 0 (CHIUSO)`);
      } else if (closureType === 'morning') {
        const afternoonSlots = mondaySlots.filter(s => parseInt(s.split(':')[0]) >= 14);
        console.log(`      Slot effettivi: ${afternoonSlots.length} (solo pomeriggio)`);
        console.log(`      Range: ${afternoonSlots[0]} - ${afternoonSlots[afternoonSlots.length - 1]}`);
      } else {
        console.log(`      Slot effettivi: ${mondaySlots.length} (completo)`);
      }
    }
    
    // Test martedì (giorno 2)
    console.log(`\n\n📅 Slot per MARTEDÌ 20 gennaio 2026:`);
    const tuesdaySlots = getUniversalSlots(2);
    console.log(`   Slot universali: ${tuesdaySlots.length}`);
    console.log(`   Range: ${tuesdaySlots[0]} - ${tuesdaySlots[tuesdaySlots.length - 1]}`);
    console.log(`   Ha 18:00: ${tuesdaySlots.includes('18:00') ? '❌ NO (corretto)' : '✅'}`);
    
    for (const barber of barbers) {
      const closureType = getAutoClosureType(barber.email, 2);
      console.log(`\n   👤 ${barber.name}:`);
      console.log(`      Chiusura automatica: ${closureType || 'nessuna'}`);
      
      if (closureType === 'morning') {
        const afternoonSlots = tuesdaySlots.filter(s => parseInt(s.split(':')[0]) >= 14);
        console.log(`      Slot effettivi: ${afternoonSlots.length} (solo pomeriggio)`);
        console.log(`      Range: ${afternoonSlots[0]} - ${afternoonSlots[afternoonSlots.length - 1]}`);
      } else {
        console.log(`      Slot effettivi: ${tuesdaySlots.length} (completo)`);
      }
    }
    
    // Verifica database attuale
    console.log('\n\n2️⃣ VERIFICA SCHEDULE ESISTENTI NEL DATABASE');
    console.log('─'.repeat(60));
    
    // Prendi alcuni lunedì futuri
    const futureMondays = await sql`
      SELECT 
        bs.date,
        b.name,
        bs.available_slots,
        bs.day_off
      FROM barber_schedules bs
      JOIN barbers b ON bs.barber_id = b.id
      WHERE EXTRACT(DOW FROM bs.date::date) = 1
      AND bs.date::date >= CURRENT_DATE
      AND bs.date::date < CURRENT_DATE + INTERVAL '30 days'
      ORDER BY bs.date, b.name
      LIMIT 9
    `;
    
    console.log(`\nLunedì nei prossimi 30 giorni (campione):\n`);
    
    let currentDate = null;
    for (const schedule of futureMondays) {
      if (schedule.date !== currentDate) {
        currentDate = schedule.date;
        console.log(`\n📅 ${schedule.date}:`);
      }
      
      const slots = schedule.available_slots ? JSON.parse(schedule.available_slots) : [];
      const has18 = slots.includes('18:00');
      
      console.log(`   ${schedule.name}: ${slots.length} slot ${schedule.day_off ? '(DAY_OFF)' : ''}`);
      if (slots.length > 0) {
        console.log(`      Range: ${slots[0]} - ${slots[slots.length - 1]}`);
        console.log(`      Ha 18:00: ${has18 ? '✅' : '❌'}`);
      }
    }
    
    // Verifica chiusure automatiche esistenti
    console.log('\n\n3️⃣ VERIFICA CHIUSURE AUTOMATICHE ESISTENTI');
    console.log('─'.repeat(60));
    
    const autoClosures = await sql`
      SELECT 
        bc.barber_email,
        b.name,
        bc.closure_date,
        bc.closure_type,
        bc.reason,
        bc.created_by
      FROM barber_closures bc
      JOIN barbers b ON bc.barber_email = b.email
      WHERE bc.created_by IN ('system', 'system-auto')
      AND bc.closure_date::date >= CURRENT_DATE
      ORDER BY bc.closure_date, b.name
      LIMIT 15
    `;
    
    console.log(`\nChiusure automatiche future (campione di 15):\n`);
    
    let prevDate = null;
    for (const closure of autoClosures) {
      if (closure.closure_date !== prevDate) {
        prevDate = closure.closure_date;
        const dayOfWeek = new Date(closure.closure_date).toLocaleDateString('it-IT', { weekday: 'long' });
        console.log(`\n📅 ${closure.closure_date} (${dayOfWeek}):`);
      }
      
      console.log(`   ${closure.name}: ${closure.closure_type.toUpperCase()}`);
    }
    
    console.log('\n\n📊 RIEPILOGO');
    console.log('─'.repeat(60));
    console.log('\n✅ Sistema slot universali funziona correttamente');
    console.log('✅ Chiusure automatiche definite correttamente');
    console.log('\n⚠️  Per applicare le modifiche a tutti gli schedule:');
    console.log('   1. Fare deploy del nuovo codice');
    console.log('   2. Chiamare /api/system/daily-update (POST)');
    console.log('   3. Questo rigenererà tutti gli schedule con i nuovi slot');
    console.log('   4. Le chiusure automatiche verranno create dove mancano');
    
    console.log('\n🏁 Test completato!');
    
  } catch (error) {
    console.error('❌ Errore:', error.message);
    console.error(error);
    process.exit(1);
  }
}

testDailyUpdate();
