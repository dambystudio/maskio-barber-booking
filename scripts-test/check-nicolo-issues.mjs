import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

const sql = neon(process.env.DATABASE_URL);

async function checkNicoloIssues() {
  try {
    console.log('🔍 VERIFICA PROBLEMI NICOLÒ\n');
    
    // 1. Check Monday 18:00 slots for Nicolò
    console.log('1️⃣ SLOT LUNEDÌ 18:00 PER NICOLÒ');
    console.log('─'.repeat(60));
    
    const nicoloMondays = await sql`
      SELECT 
        date,
        available_slots,
        day_off
      FROM barber_schedules
      WHERE barber_id = 'nicolo'
      AND EXTRACT(DOW FROM date::date) = 1
      AND date::date >= CURRENT_DATE
      ORDER BY date
      LIMIT 5
    `;
    
    console.log(`\nTrovati ${nicoloMondays.length} lunedì futuri per Nicolò:\n`);
    
    for (const schedule of nicoloMondays) {
      const slots = schedule.available_slots ? JSON.parse(schedule.available_slots) : [];
      const has18 = slots.includes('18:00');
      const dateStr = new Date(schedule.date).toLocaleDateString('it-IT', { 
        weekday: 'long', 
        day: '2-digit', 
        month: 'long', 
        year: 'numeric' 
      });
      
      console.log(`📆 ${dateStr}`);
      console.log(`   Day off: ${schedule.day_off}`);
      console.log(`   Has 18:00: ${has18 ? '✅' : '❌'}`);
      console.log(`   Slots (${slots.length}): ${slots.join(', ')}`);
      console.log('');
    }
    
    // 2. Check December 29 specifically
    console.log('\n2️⃣ DETTAGLI 29 DICEMBRE (LUNEDÌ)');
    console.log('─'.repeat(60));
    
    const dec29 = await sql`
      SELECT 
        bs.barber_id,
        b.name,
        bs.date,
        bs.available_slots,
        bs.day_off
      FROM barber_schedules bs
      JOIN barbers b ON bs.barber_id = b.id
      WHERE bs.date = '2025-12-29'
      ORDER BY b.name
    `;
    
    console.log(`\nSchedule per lunedì 29 dicembre 2025:\n`);
    
    for (const schedule of dec29) {
      const slots = schedule.available_slots ? JSON.parse(schedule.available_slots) : [];
      console.log(`👤 ${schedule.name} (${schedule.barber_id})`);
      console.log(`   Day off: ${schedule.day_off}`);
      console.log(`   Slots (${slots.length}): ${slots.length > 0 ? slots.join(', ') : 'NESSUNO'}`);
      console.log('');
    }
    
    // 3. Check December 22 (Sunday) - why waitlist?
    console.log('\n3️⃣ VERIFICA 22 DICEMBRE (DOMENICA) - LISTA D\'ATTESA');
    console.log('─'.repeat(60));
    
    const dec22 = await sql`
      SELECT 
        bs.barber_id,
        b.name,
        bs.date,
        bs.available_slots,
        bs.day_off
      FROM barber_schedules bs
      JOIN barbers b ON bs.barber_id = b.id
      WHERE bs.date = '2025-12-22'
      ORDER BY b.name
    `;
    
    if (dec22.length === 0) {
      console.log('❌ Nessuno schedule trovato per il 22 dicembre');
    } else {
      console.log(`\nSchedule per domenica 22 dicembre 2025:\n`);
      
      for (const schedule of dec22) {
        const slots = schedule.available_slots ? JSON.parse(schedule.available_slots) : [];
        console.log(`👤 ${schedule.name} (${schedule.barber_id})`);
        console.log(`   Day off: ${schedule.day_off}`);
        console.log(`   Slots (${slots.length}): ${slots.length > 0 ? slots.join(', ') : 'NESSUNO'}`);
        console.log('');
      }
    }
    
    // Check closure settings for Sunday
    const sundayClosures = await sql`
      SELECT * FROM closure_settings
      WHERE closed_days @> '[0]'
    `;
    
    console.log(`\nDomenica nei giorni chiusi: ${sundayClosures.length > 0 ? '✅ SÌ' : '❌ NO'}`);
    
    // Check if there are specific closures for Dec 22
    const dec22Closures = await sql`
      SELECT 
        bc.barber_id,
        b.name,
        bc.closure_date,
        bc.closure_type,
        bc.reason
      FROM barber_closures bc
      JOIN barbers b ON bc.barber_id = b.id
      WHERE bc.closure_date = '2025-12-22'
    `;
    
    if (dec22Closures.length > 0) {
      console.log(`\nChiusure specifiche per il 22 dicembre:`);
      for (const closure of dec22Closures) {
        console.log(`   ${closure.name}: ${closure.closure_type} - ${closure.reason || 'Nessun motivo'}`);
      }
    }
    
    // 4. Check existing schedules for Dec 22-24
    console.log('\n4️⃣ SCHEDULE ESISTENTI 22-24 DICEMBRE');
    console.log('─'.repeat(60));
    
    const christmasPeriod = await sql`
      SELECT 
        bs.date,
        b.name,
        bs.available_slots,
        bs.day_off
      FROM barber_schedules bs
      JOIN barbers b ON bs.barber_id = b.id
      WHERE bs.date BETWEEN '2025-12-22' AND '2025-12-24'
      ORDER BY bs.date, b.name
    `;
    
    console.log(`\nSchedule dal 22 al 24 dicembre:\n`);
    
    let currentDate = null;
    for (const schedule of christmasPeriod) {
      const scheduleDate = new Date(schedule.date).toLocaleDateString('it-IT', { 
        weekday: 'long', 
        day: '2-digit', 
        month: 'long'
      });
      
      if (scheduleDate !== currentDate) {
        currentDate = scheduleDate;
        console.log(`\n📅 ${scheduleDate}:`);
      }
      
      const slots = schedule.available_slots ? JSON.parse(schedule.available_slots) : [];
      console.log(`   ${schedule.name}: ${schedule.day_off ? '🔴 CHIUSO' : `${slots.length} slots`}`);
      if (!schedule.day_off && slots.length > 0) {
        console.log(`      Slots: ${slots.slice(0, 3).join(', ')}...${slots.slice(-2).join(', ')}`);
      }
    }
    
    console.log('\n🏁 Analisi completata');
    
  } catch (error) {
    console.error('❌ Errore:', error.message);
    console.error(error);
    process.exit(1);
  }
}

checkNicoloIssues();
