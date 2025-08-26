import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://neondb_owner:npg_Wj09qDUmTsxE@ep-old-forest-a2ur722g-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require';
const sql = neon(DATABASE_URL);

async function checkTableStructure() {
    try {
        // Check bookings table structure
        const columns = await sql`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns 
            WHERE table_name = 'bookings' 
            ORDER BY ordinal_position
        `;
        
        console.log('📊 Bookings table structure:');
        columns.forEach(col => {
            console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
        });
        
        // Also check if there are any bookings to see the actual structure
        const sampleBookings = await sql`
            SELECT * FROM bookings LIMIT 2
        `;
        
        if (sampleBookings.length > 0) {
            console.log('\n📋 Sample booking data:');
            console.log(JSON.stringify(sampleBookings[0], null, 2));
        } else {
            console.log('\n📋 No bookings found in the table');
        }
        
    } catch (error) {
        console.error('❌ Error checking table structure:', error);
    }
}

checkTableStructure();
