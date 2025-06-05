import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://neondb_owner:npg_Wj09qDUmTsxE@ep-old-forest-a2ur722g-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require';
const sql = neon(DATABASE_URL);

async function checkSaturdayAndFutureDates() {
    console.log('🔍 Checking Saturday and future dates availability...');
    
    try {
        // Check Saturday schedules specifically
        console.log('📅 Saturday schedules:');
        const saturdays = await sql`
            SELECT date, barber_id, available_slots, day_off
            FROM barber_schedules 
            WHERE EXTRACT(DOW FROM date::date) = 6
            ORDER BY date
        `;
        
        saturdays.forEach(schedule => {
            const slots = JSON.parse(schedule.available_slots || '[]');
            console.log(`  ${schedule.date} (${schedule.barber_id}): ${slots.length} slots - ${schedule.day_off ? 'DAY OFF' : slots.join(', ')}`);
        });
        
        // Check date range of schedules
        console.log('\n📊 Schedule date range:');
        const dateRange = await sql`
            SELECT 
                MIN(date) as earliest_date,
                MAX(date) as latest_date,
                COUNT(DISTINCT date) as total_days
            FROM barber_schedules
        `;
        
        console.log(`  From: ${dateRange[0].earliest_date}`);
        console.log(`  To: ${dateRange[0].latest_date}`);
        console.log(`  Total days: ${dateRange[0].total_days}`);
        
        // Check for gaps in coverage
        console.log('\n🗓️ Checking July dates (should be in viola/purple):');
        const julyDates = await sql`
            SELECT date, barber_id, available_slots
            FROM barber_schedules 
            WHERE date >= '2025-07-01' AND date <= '2025-07-07'
            ORDER BY date, barber_id
        `;
        
        if (julyDates.length === 0) {
            console.log('  ❌ NO July dates found - this explains purple unavailable dates!');
        } else {
            julyDates.forEach(schedule => {
                const slots = JSON.parse(schedule.available_slots || '[]');
                console.log(`  ${schedule.date} (${schedule.barber_id}): ${slots.length} slots`);
            });
        }
        
        // Show current date for reference
        const today = new Date().toISOString().split('T')[0];
        console.log(`\n📅 Today: ${today}`);
        console.log(`📅 30 days from today: ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}`);
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

checkSaturdayAndFutureDates();
