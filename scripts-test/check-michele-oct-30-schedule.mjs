import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function checkSchedule() {
    const date = '2025-10-30';
    const micheleId = 'michele';
    
    console.log('\n🔍 CHECK SCHEDULE DATABASE:\n');
    
    const schedule = await sql`
        SELECT * FROM barber_schedules 
        WHERE barber_id = ${micheleId} AND date = ${date}
    `;
    
    if (schedule.length === 0) {
        console.log('❌ Schedule NON trovato!');
        return;
    }
    
    const s = schedule[0];
    const availableSlots = JSON.parse(s.available_slots || '[]');
    const unavailableSlots = JSON.parse(s.unavailable_slots || '[]');
    
    console.log('📋 SCHEDULE DATABASE:');
    console.log(`   day_off: ${s.day_off}`);
    console.log(`   available_slots (${availableSlots.length}):`, availableSlots);
    console.log(`   unavailable_slots (${unavailableSlots.length}):`, unavailableSlots);
    
    // Test la logica dell'API
    const allTimeSlots = [...new Set([...availableSlots, ...unavailableSlots])];
    console.log(`\n🧪 TEST LOGICA API:`);
    console.log(`   allTimeSlots length: ${allTimeSlots.length}`);
    console.log(`   Condizione: schedule && !schedule.dayOff && schedule.availableSlots`);
    console.log(`   schedule: ${!!s}`);
    console.log(`   !day_off: ${!s.day_off}`);
    console.log(`   available_slots exists: ${!!s.available_slots}`);
    console.log(`   allTimeSlots.length > 0: ${allTimeSlots.length > 0}`);
    
    if (!s.day_off && s.available_slots && allTimeSlots.length > 0) {
        console.log('\n✅ DOVREBBE ENTRARE nel blocco apertura eccezionale!');
    } else {
        console.log('\n❌ NON entra nel blocco apertura eccezionale!');
        console.log('   Problema: available_slots potrebbe essere una stringa vuota o null?');
    }
    
    // Check bookings
    const bookings = await sql`
        SELECT time, customer_name FROM bookings 
        WHERE barber_id = ${micheleId} AND date = ${date}
        ORDER BY time
    `;
    
    console.log(`\n📋 PRENOTAZIONI (${bookings.length}):`);
    bookings.forEach(b => console.log(`   ${b.time}: ${b.customer_name}`));
    
    process.exit(0);
}

checkSchedule().catch(error => {
    console.error('❌ ERROR:', error);
    process.exit(1);
});
