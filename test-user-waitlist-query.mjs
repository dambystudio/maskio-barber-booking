import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function testUserWaitlistQuery() {
  console.log('🧪 Testing User Waitlist Query...\n');

  try {
    // 1. Controlla i dati nel database
    console.log('1. Database content check:');
    const allWaitlist = await sql`
      SELECT id, customer_name, customer_email, barber_name, date, status, position, created_at
      FROM waitlist 
      ORDER BY created_at DESC
    `;
    
    console.log(`Found ${allWaitlist.length} total waitlist entries:`);
    allWaitlist.forEach((entry, index) => {
      console.log(`   ${index + 1}. ${entry.customer_name} (${entry.customer_email}) - ${entry.barber_name} - ${entry.date} - ${entry.status}`);
    });

    // 2. Test della query usata dall'API per user_email
    console.log('\n2. Testing API query for user_email="prova@gmail.com":');
    const userEmail = 'prova@gmail.com';
    
    const apiQuery = await sql`
      SELECT w.*, u.name as user_name, u.email as user_email
      FROM waitlist w
      LEFT JOIN users u ON w.user_id = u.id
      WHERE w.status = 'waiting'
      AND w.customer_email = ${userEmail}
      ORDER BY w.date ASC, w.created_at ASC
    `;

    console.log(`Query result for ${userEmail}:`, apiQuery.length, 'entries');
    apiQuery.forEach((entry, index) => {
      console.log(`   ${index + 1}. ID: ${entry.id}, Name: ${entry.customer_name}, Email: ${entry.customer_email}, Barber: ${entry.barber_name}, Date: ${entry.date}, Status: ${entry.status}`);
    });

    // 3. Test della query con diversi status
    console.log('\n3. Testing query without status filter:');
    const allUserEntries = await sql`
      SELECT w.*, u.name as user_name, u.email as user_email
      FROM waitlist w
      LEFT JOIN users u ON w.user_id = u.id
      WHERE w.customer_email = ${userEmail}
      ORDER BY w.date ASC, w.created_at ASC
    `;

    console.log(`All entries for ${userEmail} (any status):`, allUserEntries.length, 'entries');
    allUserEntries.forEach((entry, index) => {
      console.log(`   ${index + 1}. ID: ${entry.id}, Status: ${entry.status}, Date: ${entry.date}`);
    });

    // 4. Controlla gli utenti
    console.log('\n4. Users table check:');
    const users = await sql`
      SELECT id, name, email FROM users WHERE email = ${userEmail}
    `;
    console.log(`User record for ${userEmail}:`, users);

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testUserWaitlistQuery();
