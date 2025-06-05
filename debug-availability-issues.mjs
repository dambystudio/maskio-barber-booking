import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://neondb_owner:npg_Wj09qDUmTsxE@ep-old-forest-a2ur722g-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require';
const sql = neon(DATABASE_URL);

async function debugAvailabilityIssues() {
    console.log('🔍 Debugging availability issues...');
    
    try {
        // 1. Check Friday afternoon slots
        console.log('\n📅 Friday afternoon analysis:');
        const fridays = await sql`
            SELECT date, barber_id, available_slots, unavailable_slots
            FROM barber_schedules 
            WHERE EXTRACT(DOW FROM date::date) = 5
            ORDER BY date
            LIMIT 10
        `;
        
        fridays.forEach(schedule => {
            const availableSlots = JSON.parse(schedule.available_slots || '[]');
            const unavailableSlots = JSON.parse(schedule.unavailable_slots || '[]');
            
            // Check for afternoon slots (15:00-17:30)
            const afternoonSlots = availableSlots.filter(slot => {
                const hour = parseInt(slot.split(':')[0]);
                return hour >= 15 && hour <= 17;
            });
            
            console.log(`  ${schedule.date} (${schedule.barber_id}):`);
            console.log(`    Available afternoon: ${afternoonSlots.join(', ') || 'NONE'}`);
            console.log(`    Total available: ${availableSlots.length}`);
            console.log(`    Unavailable: ${unavailableSlots.length}`);
        });
        
        // 2. Check next month dates
        console.log('\n📅 Next month dates analysis:');
        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        const nextMonthStr = nextMonth.toISOString().slice(0, 7); // YYYY-MM format
        
        const nextMonthSchedules = await sql`
            SELECT date, barber_id, available_slots, COUNT(*) OVER () as total_count
            FROM barber_schedules 
            WHERE date::text LIKE ${nextMonthStr + '%'}
            ORDER BY date
            LIMIT 5
        `;
        
        if (nextMonthSchedules.length === 0) {
            console.log('  ❌ NO SCHEDULES FOUND for next month! This is the problem.');
            console.log('  Need to generate schedules for future dates.');
        } else {
            console.log(`  ✅ Found ${nextMonthSchedules[0].total_count} next month schedules`);
            nextMonthSchedules.forEach(schedule => {
                const availableSlots = JSON.parse(schedule.available_slots || '[]');
                console.log(`  ${schedule.date} (${schedule.barber_id}): ${availableSlots.length} slots`);
            });
        }
        
        // 3. Check date range in database
        console.log('\n📊 Database date range:');
        const dateRange = await sql`
            SELECT 
                MIN(date) as earliest_date,
                MAX(date) as latest_date,
                COUNT(DISTINCT date) as total_days
            FROM barber_schedules
        `;
        
        console.log(`  Earliest: ${dateRange[0].earliest_date}`);
        console.log(`  Latest: ${dateRange[0].latest_date}`);
        console.log(`  Total days: ${dateRange[0].total_days}`);
        
        // 4. Check if we need to extend schedules
        const today = new Date();
        const maxDate = new Date(dateRange[0].latest_date);
        const daysUntilMaxDate = Math.ceil((maxDate - today) / (1000 * 60 * 60 * 24));
        
        console.log(`  Days until max date: ${daysUntilMaxDate}`);
        
        if (daysUntilMaxDate < 30) {
            console.log('  ⚠️ Need to extend schedules for future dates!');
        }
        
    } catch (error) {
        console.error('❌ Error debugging availability:', error);
    }
}

debugAvailabilityIssues();
