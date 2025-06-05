import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://neondb_owner:npg_Wj09qDUmTsxE@ep-old-forest-a2ur722g-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require';
const sql = neon(DATABASE_URL);

async function debugSaturdaySlots() {
    console.log('🔍 Debug Saturday slots issue...');
    
    try {
        // Check Saturday schedules
        const saturdays = await sql`
            SELECT date, barber_id, available_slots, unavailable_slots, day_off
            FROM barber_schedules 
            WHERE EXTRACT(DOW FROM date::date) = 6
            ORDER BY date, barber_id
            LIMIT 6
        `;
        
        console.log('📅 Saturday schedules in database:');
        saturdays.forEach(schedule => {
            const availableSlots = JSON.parse(schedule.available_slots || '[]');
            const unavailableSlots = JSON.parse(schedule.unavailable_slots || '[]');
            console.log(`\n  Date: ${schedule.date} (${schedule.barber_id})`);
            console.log(`  Day off: ${schedule.day_off}`);
            console.log(`  Available slots (${availableSlots.length}): ${availableSlots.join(', ')}`);
            console.log(`  Unavailable slots (${unavailableSlots.length}): ${unavailableSlots.join(', ')}`);
        });
        
        // Compare with weekday
        const friday = await sql`
            SELECT date, barber_id, available_slots
            FROM barber_schedules 
            WHERE EXTRACT(DOW FROM date::date) = 5
            AND date >= CURRENT_DATE
            ORDER BY date, barber_id
            LIMIT 2
        `;
        
        console.log('\n📅 Friday comparison:');
        friday.forEach(schedule => {
            const availableSlots = JSON.parse(schedule.available_slots || '[]');
            console.log(`  ${schedule.date} (${schedule.barber_id}): ${availableSlots.length} slots - ${availableSlots.join(', ')}`);
        });
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

debugSaturdaySlots();
