import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://neondb_owner:npg_Wj09qDUmTsxE@ep-old-forest-a2ur722g-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require';
const sql = neon(DATABASE_URL);

async function checkSpecificDates() {
    console.log('🔍 Checking specific dates for slot availability...');
    
    try {
        // Check Saturday (should be 2025-06-07)
        const saturday = await sql`
            SELECT * FROM barber_schedules 
            WHERE date = '2025-06-07'
            ORDER BY barber_id
        `;
        
        console.log('📅 Saturday (2025-06-07) schedules:');
        saturday.forEach(schedule => {
            console.log(`  Barber: ${schedule.barber_id}`);
            console.log(`  Available slots: ${schedule.available_slots}`);
            console.log(`  Day off: ${schedule.day_off}`);
            console.log('---');
        });
        
        // Check a regular weekday
        const friday = await sql`
            SELECT * FROM barber_schedules 
            WHERE date = '2025-06-06'
            ORDER BY barber_id
        `;
        
        console.log('📅 Friday (2025-06-06) schedules:');
        friday.forEach(schedule => {
            console.log(`  Barber: ${schedule.barber_id}`);
            console.log(`  Available slots: ${schedule.available_slots}`);
            console.log(`  Day off: ${schedule.day_off}`);
            console.log('---');
        });
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

checkSpecificDates();
