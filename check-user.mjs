// Test veloce per verificare l'utente nel database
import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://neondb_owner:npg_Wj09qDUmTsxE@ep-old-forest-a2ur722g-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require';
const sql = neon(DATABASE_URL);

async function checkUser() {
  console.log('👤 Checking user data...\n');
  
  try {
    const users = await sql`
      SELECT id, email, name, role, email_verified, phone, created_at
      FROM users 
      ORDER BY created_at DESC
    `;
    
    console.log(`Found ${users.length} users:`);
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email})`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Email verified: ${user.email_verified}`);
      console.log(`   Phone: ${user.phone || 'Not set'}`);
      console.log(`   Created: ${user.created_at}`);
      console.log('');
    });
    
    if (users.length === 0) {
      console.log('⚠️ No users found. You need to register or login first.');
      console.log('💡 Go to: http://localhost:3000/auth/signup');
    } else {
      console.log('✅ User data looks good!');
      
      // Check if user has phone number
      const userWithoutPhone = users.find(u => !u.phone);
      if (userWithoutPhone) {
        console.log('⚠️ User without phone number found.');
        console.log('💡 Please add a phone number in the profile.');
      }
    }
    
  } catch (error) {
    console.error('💥 Error checking users:', error);
  }
}

checkUser().catch(console.error);
