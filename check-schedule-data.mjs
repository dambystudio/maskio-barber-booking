import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://neondb_owner:npg_Wj09qDUmTsxE@ep-old-forest-a2ur722g-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require';
const sql = neon(DATABASE_URL);

async function checkScheduleData() {
    console.log('🔍 Checking barber_schedules table...');
    
    try {
        const schedules = await sql`
            SELECT * FROM barber_schedules 
            ORDER BY barber_id, day_of_week
        `;
        
        console.log('📅 Barber schedules:');
        schedules.forEach(schedule => {
            console.log(`  Barber: ${schedule.barber_id}`);
            console.log(`  Day: ${schedule.day_of_week} (${getDayName(schedule.day_of_week)})`);
            console.log(`  Morning: ${schedule.start_time_morning} - ${schedule.end_time_morning}`);
            console.log(`  Afternoon: ${schedule.start_time_afternoon} - ${schedule.end_time_afternoon}`);
            console.log(`  Active: ${schedule.is_active}`);
            console.log('---');
        });
        
        if (schedules.length === 0) {
            console.log('❌ No schedules found! This is the problem.');
        }
        
    } catch (error) {
        console.error('❌ Error checking schedules:', error);
    }
}

function getDayName(dayNum) {
    const days = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];
    return days[dayNum];
}

checkScheduleData();
