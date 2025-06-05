import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://neondb_owner:npg_Wj09qDUmTsxE@ep-old-forest-a2ur722g-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require';
const sql = neon(DATABASE_URL);

async function debugSchedules() {
    console.log('🔍 Debug all schedules...');
    
    try {
        // Check what's actually in the database
        const allSchedules = await sql`
            SELECT date, barber_id, EXTRACT(DOW FROM date::date) as day_of_week, available_slots
            FROM barber_schedules 
            ORDER BY date, barber_id
        `;
        
        console.log(`\n📊 Total schedules in database: ${allSchedules.length}`);
        
        // Group by day of week
        const byDayOfWeek = {};
        allSchedules.forEach(schedule => {
            const dow = schedule.day_of_week;
            if (!byDayOfWeek[dow]) byDayOfWeek[dow] = 0;
            byDayOfWeek[dow]++;
        });
        
        console.log('\n📅 Schedules by day of week:');
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        for (let i = 0; i <= 6; i++) {
            const count = byDayOfWeek[i] || 0;
            console.log(`   ${dayNames[i]} (${i}): ${count} records`);
        }
        
        // Show first few dates
        console.log('\n📋 First 10 schedules:');
        allSchedules.slice(0, 10).forEach(schedule => {
            const slots = JSON.parse(schedule.available_slots);
            console.log(`   ${schedule.date} (${schedule.barber_id}) - DOW:${schedule.day_of_week} - ${slots.length} slots`);
        });
        
        // Find next Saturday manually
        console.log('\n🗓️ Finding next Saturday...');
        const today = new Date();
        console.log(`   Today: ${today.toISOString().split('T')[0]} (DOW: ${today.getDay()})`);
        
        let nextSat = new Date(today);
        while (nextSat.getDay() !== 6) {
            nextSat.setDate(nextSat.getDate() + 1);
        }
        console.log(`   Next Saturday: ${nextSat.toISOString().split('T')[0]} (DOW: ${nextSat.getDay()})`);
        
        // Check if that Saturday exists in DB
        const satCheck = await sql`
            SELECT * FROM barber_schedules 
            WHERE date = ${nextSat.toISOString().split('T')[0]}
        `;
        console.log(`   Records for next Saturday: ${satCheck.length}`);
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

debugSchedules();
