// Script per aggiornare l'email di Michele nel database
import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://neondb_owner:npg_Wj09qDUmTsxE@ep-old-forest-a2ur722g-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require';
const sql = neon(DATABASE_URL);

const OLD_EMAIL = 'michelebiancofiore0230@gmail.com';
const NEW_EMAIL = 'michelebiancofiore0230@gmail.com';

async function updateMicheleEmail() {
    console.log('🔧 Updating Michele email in database...\n');
    
    try {
        console.log(`📧 Changing from: ${OLD_EMAIL}`);
        console.log(`📧 Changing to: ${NEW_EMAIL}\n`);
        
        // 1. Update barbers table
        console.log('1️⃣ Updating barbers table...');
        const updateBarbers = await sql`
            UPDATE barbers 
            SET email = ${NEW_EMAIL}
            WHERE email = ${OLD_EMAIL}
        `;
        console.log(`   Updated ${updateBarbers.length} barber records`);
        
        // 2. Update barber_recurring_closures table
        console.log('2️⃣ Updating barber_recurring_closures table...');
        const updateRecurringClosures = await sql`
            UPDATE barber_recurring_closures 
            SET barber_email = ${NEW_EMAIL}
            WHERE barber_email = ${OLD_EMAIL}
        `;
        console.log(`   Updated ${updateRecurringClosures.length} recurring closure records`);
        
        // 3. Update barber_closures table
        console.log('3️⃣ Updating barber_closures table...');
        const updateClosures = await sql`
            UPDATE barber_closures 
            SET barber_email = ${NEW_EMAIL}
            WHERE barber_email = ${OLD_EMAIL}
        `;
        console.log(`   Updated ${updateClosures.length} closure records`);
        
        // 4. Update accounts table (NextAuth)
        console.log('4️⃣ Updating accounts table...');
        const updateAccounts = await sql`
            UPDATE accounts 
            SET email = ${NEW_EMAIL}
            WHERE email = ${OLD_EMAIL}
        `;
        console.log(`   Updated ${updateAccounts.length} account records`);
        
        // 5. Update users table (NextAuth)
        console.log('5️⃣ Updating users table...');
        const updateUsers = await sql`
            UPDATE users 
            SET email = ${NEW_EMAIL}
            WHERE email = ${OLD_EMAIL}
        `;
        console.log(`   Updated ${updateUsers.length} user records`);
        
        // 6. Update bookings table
        console.log('6️⃣ Updating bookings table...');
        const updateBookings = await sql`
            UPDATE bookings 
            SET user_email = ${NEW_EMAIL}
            WHERE user_email = ${OLD_EMAIL}
        `;
        console.log(`   Updated ${updateBookings.length} booking records`);
        
        console.log('\n✅ Database update completed successfully!');
        
        // Verify changes
        console.log('\n🔍 Verifying changes...');
        
        const barberCheck = await sql`SELECT * FROM barbers WHERE email = ${NEW_EMAIL}`;
        console.log(`✓ Barber with new email found: ${barberCheck.length > 0 ? 'Yes' : 'No'}`);
        
        const closuresCheck = await sql`SELECT COUNT(*) as count FROM barber_recurring_closures WHERE barber_email = ${NEW_EMAIL}`;
        console.log(`✓ Recurring closures for new email: ${closuresCheck[0].count}`);
        
        const oldEmailCheck = await sql`SELECT COUNT(*) as count FROM barbers WHERE email = ${OLD_EMAIL}`;
        console.log(`✓ Old email still present: ${oldEmailCheck[0].count > 0 ? 'Yes (ERROR!)' : 'No (Good)'}`);
        
    } catch (error) {
        console.error('❌ Error updating Michele email:', error);
    }
}

updateMicheleEmail();
