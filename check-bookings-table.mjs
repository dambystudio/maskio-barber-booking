import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://neondb_owner:npg_Wj09qDUmTsxE@ep-old-forest-a2ur722g-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require';
const sql = neon(DATABASE_URL);

async function checkBookingsTable() {
    console.log('🔍 Checking bookings table structure...');
    
    try {
        // Get table structure
        const columns = await sql`
            SELECT column_name, data_type, is_nullable 
            FROM information_schema.columns 
            WHERE table_name = 'bookings' 
            ORDER BY ordinal_position
        `;
        
        console.log('\n📊 Bookings table columns:');
        columns.forEach(col => {
            console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
        });
        
        // Get a sample booking to see actual data
        const sampleBookings = await sql`
            SELECT * FROM bookings 
            LIMIT 3
        `;
        
        if (sampleBookings.length > 0) {
            console.log('\n📋 Sample bookings:');
            sampleBookings.forEach((booking, index) => {
                console.log(`\n  Booking ${index + 1}:`);
                Object.entries(booking).forEach(([key, value]) => {
                    console.log(`    ${key}: ${value}`);
                });
            });
        } else {
            console.log('\n❌ No bookings found in the table');
        }
        
        // Count total bookings
        const count = await sql`SELECT COUNT(*) as total FROM bookings`;
        console.log(`\n📊 Total bookings in database: ${count[0].total}`);
        
    } catch (error) {
        console.error('❌ Error checking table:', error);
    }
}

checkBookingsTable();
