import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://neondb_owner:npg_Wj09qDUmTsxE@ep-old-forest-a2ur722g-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require';
const sql = neon(DATABASE_URL);

async function checkTablesAndSchedules() {
    console.log('🔍 Checking database tables and schedule data...');
    
    try {
        // Check if barber_schedules table exists
        console.log('📊 Checking table existence...');
        const tables = await sql`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name LIKE '%schedule%'
            ORDER BY table_name
        `;
        
        console.log('📋 Schedule-related tables:', tables.map(t => t.table_name));
        
        // Check all tables
        const allTables = await sql`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name
        `;
        
        console.log('📋 All tables:', allTables.map(t => t.table_name));
        
        // Try to query barber_schedules if it exists
        if (tables.some(t => t.table_name === 'barber_schedules')) {
            console.log('✅ barber_schedules table exists');
            const schedules = await sql`SELECT COUNT(*) as count FROM barber_schedules`;
            console.log(`📊 Records in barber_schedules: ${schedules[0].count}`);
            
            if (schedules[0].count > 0) {
                const sampleSchedules = await sql`
                    SELECT * FROM barber_schedules 
                    LIMIT 5
                `;
                console.log('📅 Sample schedules:', sampleSchedules);
            }
        } else {
            console.log('❌ barber_schedules table does NOT exist!');
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

checkTablesAndSchedules();
