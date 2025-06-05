import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://neondb_owner:npg_Wj09qDUmTsxE@ep-old-forest-a2ur722g-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require';
const sql = neon(DATABASE_URL);

async function testDirectQuery() {
    try {
        console.log('🔍 Testing direct database query...');
        
        // Check Saturday specifically
        const result = await sql`SELECT date, barber_id, available_slots, day_off FROM barber_schedules WHERE date = '2025-06-07' ORDER BY barber_id`;
        
        console.log('📅 Saturday (2025-06-07) results:');
        console.log(JSON.stringify(result, null, 2));
        
        // Check if there are any schedules at all for next few days
        const nextDays = await sql`SELECT date, barber_id, available_slots FROM barber_schedules WHERE date >= '2025-06-05' ORDER BY date, barber_id LIMIT 10`;
        
        console.log('📅 Next days schedules:');
        console.log(JSON.stringify(nextDays, null, 2));
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

testDirectQuery();
