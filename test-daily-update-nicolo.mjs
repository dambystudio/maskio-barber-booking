import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

const sql = neon(process.env.DATABASE_URL);

async function testDailyUpdateLogic() {
  try {
    console.log('🧪 TEST LOGICA DAILY-UPDATE PER NICOLÒ\n');
    
    // Simula la funzione getSlotsForBarberAndDay
    const STANDARD_TIME_SLOTS = [
      "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
      "12:00", "12:30",
      "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"
    ];
    
    const MICHELE_MONDAY_SLOTS = [
      "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00"
    ];
    
    const NICOLO_SLOTS_WITH_18 = [
      "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
      "12:00", "12:30",
      "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00"
    ];
    
    function getSlotsForBarberAndDay(barberEmail, dayOfWeek) {
      // Monday (1) special handling
      if (dayOfWeek === 1) {
        if (barberEmail === 'michelebiancofiore0230@gmail.com') {
          return MICHELE_MONDAY_SLOTS;
        } else if (barberEmail === 'fabio.cassano97@icloud.com') {
          return [];
        } else if (barberEmail === 'giorgiodesa00@gmail.com') {
          return NICOLO_SLOTS_WITH_18;
        }
      }
      
      // Nicolò on all other days: needs 18:00
      if (barberEmail === 'giorgiodesa00@gmail.com') {
        return NICOLO_SLOTS_WITH_18;
      }
      
      // Other barbers on other days
      return STANDARD_TIME_SLOTS;
    }
    
    console.log('1️⃣ TEST SLOT GENERATI DALLA LOGICA');
    console.log('─'.repeat(60));
    
    const testCases = [
      { email: 'giorgiodesa00@gmail.com', name: 'Nicolò', day: 1, dayName: 'Lunedì' },
      { email: 'giorgiodesa00@gmail.com', name: 'Nicolò', day: 2, dayName: 'Martedì' },
      { email: 'giorgiodesa00@gmail.com', name: 'Nicolò', day: 3, dayName: 'Mercoledì' },
      { email: 'giorgiodesa00@gmail.com', name: 'Nicolò', day: 6, dayName: 'Sabato' },
      { email: 'michelebiancofiore0230@gmail.com', name: 'Michele', day: 1, dayName: 'Lunedì' },
      { email: 'michelebiancofiore0230@gmail.com', name: 'Michele', day: 2, dayName: 'Martedì' },
      { email: 'fabio.cassano97@icloud.com', name: 'Fabio', day: 1, dayName: 'Lunedì' },
      { email: 'fabio.cassano97@icloud.com', name: 'Fabio', day: 2, dayName: 'Martedì' },
    ];
    
    for (const test of testCases) {
      const slots = getSlotsForBarberAndDay(test.email, test.day);
      const has18 = slots.includes('18:00');
      const lastSlot = slots.length > 0 ? slots[slots.length - 1] : 'NESSUNO';
      
      console.log(`\n${test.name} - ${test.dayName}:`);
      console.log(`   Slots totali: ${slots.length}`);
      console.log(`   Ultimo slot: ${lastSlot}`);
      console.log(`   Ha 18:00: ${has18 ? '✅' : '❌'}`);
      
      if (test.name === 'Nicolò' && test.day !== 0 && !has18) {
        console.log(`   ⚠️ ERRORE: Nicolò dovrebbe avere 18:00!`);
      }
    }
    
    console.log('\n\n2️⃣ VERIFICA DATABASE - LUNEDÌ NICOLÒ');
    console.log('─'.repeat(60));
    
    const nicoloMondays = await sql`
      SELECT date, available_slots, day_off
      FROM barber_schedules
      WHERE barber_id = 'nicolo'
      AND EXTRACT(DOW FROM date::date) = 1
      AND date::date >= CURRENT_DATE
      ORDER BY date
      LIMIT 5
    `;
    
    console.log(`\nTrovati ${nicoloMondays.length} lunedì nel database:\n`);
    
    for (const schedule of nicoloMondays) {
      const slots = schedule.available_slots ? JSON.parse(schedule.available_slots) : [];
      const has18 = slots.includes('18:00');
      const dateObj = new Date(schedule.date);
      const dateStr = dateObj.toLocaleDateString('it-IT', { 
        weekday: 'long', 
        day: '2-digit', 
        month: 'long' 
      });
      
      console.log(`📅 ${dateStr} (${schedule.date})`);
      console.log(`   Slots: ${slots.length}`);
      console.log(`   Ha 18:00: ${has18 ? '✅' : '❌ PROBLEMA!'}`);
      console.log(`   Ultimo slot: ${slots[slots.length - 1] || 'NESSUNO'}`);
    }
    
    console.log('\n\n3️⃣ VERIFICA ALTRI GIORNI NICOLÒ');
    console.log('─'.repeat(60));
    
    const nicoloOtherDays = await sql`
      SELECT date, available_slots, day_off
      FROM barber_schedules
      WHERE barber_id = 'nicolo'
      AND EXTRACT(DOW FROM date::date) IN (2, 3, 4, 5)
      AND date::date >= CURRENT_DATE
      ORDER BY date
      LIMIT 5
    `;
    
    console.log(`\nTrovati ${nicoloOtherDays.length} giorni infrasettimanali:\n`);
    
    for (const schedule of nicoloOtherDays) {
      const slots = schedule.available_slots ? JSON.parse(schedule.available_slots) : [];
      const has18 = slots.includes('18:00');
      const dateObj = new Date(schedule.date);
      const dateStr = dateObj.toLocaleDateString('it-IT', { 
        weekday: 'long', 
        day: '2-digit', 
        month: 'long' 
      });
      
      console.log(`📅 ${dateStr}`);
      console.log(`   Ha 18:00: ${has18 ? '✅' : '❌ PROBLEMA!'}`);
    }
    
    console.log('\n🏁 Test completato');
    
  } catch (error) {
    console.error('❌ Errore:', error.message);
    console.error(error);
    process.exit(1);
  }
}

testDailyUpdateLogic();
