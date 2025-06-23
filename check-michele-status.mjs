// Script per verificare lo stato attuale di Michele nel database
import { neon } from '@neondatabase/serverless';

const DATABASE_URL = 'postgres://neondb_owner:npg_Wj09qDUmTsxE@ep-old-forest-a2ur722g-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require';
const sql = neon(DATABASE_URL);

async function checkMicheleStatus() {
    console.log('🔍 Checking Michele status in database...\n');
    
    try {
        // 1. Check barbers table
        console.log('1️⃣ Checking barbers table...');
        const barbers = await sql`SELECT * FROM barbers WHERE id = 'michele' OR name ILIKE '%michele%'`;
        console.log(`   Found ${barbers.length} barber records:`);
        barbers.forEach(barber => {
            console.log(`   - ID: ${barber.id}, Name: ${barber.name}, Email: ${barber.email}`);
        });
        
        // 2. Check for old email
        console.log('\n2️⃣ Checking for old email michelebiancofiore0230@gmail.com...');
        const oldEmailBarbers = await sql`SELECT * FROM barbers WHERE email = 'michelebiancofiore0230@gmail.com'`;
        console.log(`   Found ${oldEmailBarbers.length} records with old email`);
        
        // 3. Check barber_recurring_closures
        console.log('\n3️⃣ Checking barber_recurring_closures...');
        const recurringClosures = await sql`SELECT * FROM barber_recurring_closures WHERE barber_email ILIKE '%michele%'`;
        console.log(`   Found ${recurringClosures.length} recurring closures for Michele:`);
        recurringClosures.forEach(closure => {
            console.log(`   - Email: ${closure.barber_email}, Days: ${closure.closed_days}`);
        });
        
        // 4. Check specific email
        const oldEmailClosures = await sql`SELECT * FROM barber_recurring_closures WHERE barber_email = 'michelebiancofiore0230@gmail.com'`;
        console.log(`   Found ${oldEmailClosures.length} recurring closures with old email`);
        
        // 5. Check table structure for accounts
        console.log('\n4️⃣ Checking accounts table structure...');
        try {
            const accounts = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'accounts'`;
            console.log('   Accounts table columns:', accounts.map(col => col.column_name).join(', '));
        } catch (err) {
            console.log('   Error checking accounts structure:', err.message);
        }
        
        // 6. Check users table
        console.log('\n5️⃣ Checking users table...');
        try {
            const users = await sql`SELECT * FROM users WHERE email ILIKE '%michele%'`;
            console.log(`   Found ${users.length} users with Michele in email:`);
            users.forEach(user => {
                console.log(`   - ID: ${user.id}, Name: ${user.name}, Email: ${user.email}`);
            });
        } catch (err) {
            console.log('   Error checking users:', err.message);
        }
        
    } catch (error) {
        console.error('❌ Error checking Michele status:', error);
    }
}

checkMicheleStatus();
