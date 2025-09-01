import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function debugUserWaitlist() {
  console.log('🔍 Debugging User Waitlist Issue...\n');

  try {
    // 1. Controlla le prenotazioni in waitlist
    const waitlistEntries = await sql`
      SELECT id, customer_name, customer_email, barber_name, date, status, position, created_at
      FROM waitlist 
      ORDER BY created_at DESC
    `;

    console.log('📋 Waitlist entries found:', waitlistEntries.length);
    waitlistEntries.forEach((entry, index) => {
      console.log(`${index + 1}. ${entry.customer_name} (${entry.customer_email}) - ${entry.barber_name} - ${entry.date} - Status: ${entry.status} - Position: ${entry.position}`);
    });

    // 2. Test API call con email specifico
    if (waitlistEntries.length > 0) {
      const testEmail = waitlistEntries[0].customer_email;
      console.log(`\n🧪 Testing API call with email: ${testEmail}`);
      
      try {
        const response = await fetch(`http://localhost:3000/api/waitlist?user_email=${encodeURIComponent(testEmail)}`);
        console.log('API Response Status:', response.status);
        
        if (response.ok) {
          const apiData = await response.json();
          console.log('API Response Data:', JSON.stringify(apiData, null, 2));
        } else {
          const errorText = await response.text();
          console.log('API Error Response:', errorText);
        }
      } catch (apiError) {
        console.log('API Call Error (server might not be running):', apiError.message);
      }
    }

    // 3. Controlla anche nella tabella users
    const users = await sql`
      SELECT id, email, name FROM users
      WHERE email = 'prova@gmail.com'
    `;
    
    console.log('\n👤 User with prova@gmail.com:', users);

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

debugUserWaitlist();
