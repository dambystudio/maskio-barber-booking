import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://neondb_owner:npg_Wj09qDUmTsxE@ep-old-forest-a2ur722g-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require';
const sql = neon(DATABASE_URL);

async function checkDateRange() {
    console.log('📅 Checking date range in schedules...');
    
    try {
        // Check min and max dates
        const dateRange = await sql`
            SELECT 
                MIN(date) as earliest_date,
                MAX(date) as latest_date,
                COUNT(DISTINCT date) as total_dates
            FROM barber_schedules
        `;
        
        console.log('\n📊 Date range in database:');
        console.log(`   Earliest: ${dateRange[0].earliest_date}`);
        console.log(`   Latest: ${dateRange[0].latest_date}`);
        console.log(`   Total unique dates: ${dateRange[0].total_dates}`);
        
        // Check today's date and future availability
        const today = new Date().toISOString().split('T')[0];
        console.log(`\n🗓️ Today: ${today}`);
        
        // Check July dates specifically
        const julyDates = await sql`
            SELECT date, COUNT(*) as records
            FROM barber_schedules
            WHERE date LIKE '2025-07-%'
            GROUP BY date
            ORDER BY date
            LIMIT 10
        `;
        
        console.log(`\n📅 July 2025 dates in database: ${julyDates.length}`);
        if (julyDates.length > 0) {
            julyDates.forEach(date => {
                console.log(`   ${date.date}: ${date.records} records`);
            });
        } else {
            console.log('   ❌ No July dates found! This is the problem.');
        }
        
        // Check last few dates to see pattern
        const lastDates = await sql`
            SELECT date, COUNT(*) as barber_records
            FROM barber_schedules
            ORDER BY date DESC
            LIMIT 10
        `;
        
        console.log(`\n📋 Last 10 dates in database:`);
        lastDates.forEach(date => {
            console.log(`   ${date.date}: ${date.barber_records} barber records`);
        });
        
    } catch (error) {
        console.error('❌ Error checking date range:', error);
    }
}

checkDateRange();
