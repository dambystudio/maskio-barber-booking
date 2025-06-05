import { neon } from '@neondatabase/serverless';

const DATABASE_URL = 'postgres://neondb_owner:npg_Wj09qDUmTsxE@ep-old-forest-a2ur722g-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require';
const sql = neon(DATABASE_URL);

async function simpleTest() {
    try {
        console.log('Testing database connection...');
        const result = await sql`SELECT COUNT(*) as count FROM barber_schedules`;
        console.log('Schedules count:', result[0].count);
        
        const sample = await sql`SELECT date, available_slots FROM barber_schedules LIMIT 1`;
        console.log('Sample schedule:', sample[0]);
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

simpleTest();
