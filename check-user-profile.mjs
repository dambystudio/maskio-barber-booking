// Test per verificare il profilo utente e aggiungere telefono se mancante
import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function checkUserProfile() {
  console.log('🔍 Checking user profile for booking compatibility...\n');
  
  try {
    // Get the existing user
    const users = await sql`
      SELECT id, email, name, phone, email_verified, role 
      FROM users 
      WHERE email = 'premioisybank@gmail.com'
    `;
    
    if (users.length === 0) {
      console.log('❌ User not found');
      return;
    }
    
    const user = users[0];
    console.log('👤 User details:');
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Phone: ${user.phone || 'NOT SET'}`);
    console.log(`   Email Verified: ${user.email_verified}`);
    console.log(`   Role: ${user.role}`);
    
    // If phone is missing, add one for testing
    if (!user.phone) {
      console.log('\n📱 Phone number missing. Adding test phone number...');
      
      await sql`
        UPDATE users 
        SET phone = '+39 333 1234567'
        WHERE id = ${user.id}
      `;
      
      console.log('✅ Phone number added: +39 333 1234567');
      
      // Verify update
      const updatedUser = await sql`
        SELECT phone FROM users WHERE id = ${user.id}
      `;
      console.log('📋 Updated phone:', updatedUser[0].phone);
    } else {
      console.log('✅ Phone number already set');
    }
    
    // Also ensure email is verified for smooth booking
    if (!user.email_verified) {
      console.log('\n📧 Email not verified. Setting as verified for testing...');
      
      await sql`
        UPDATE users 
        SET email_verified = true
        WHERE id = ${user.id}
      `;
      
      console.log('✅ Email marked as verified');
    } else {
      console.log('✅ Email already verified');
    }
    
    console.log('\n🎉 User profile ready for booking tests!');
    console.log('\n🔗 Next steps:');
    console.log('1. Go to http://localhost:3000/auth/signin');
    console.log('2. Login with: premioisybank@gmail.com');
    console.log('3. Go to http://localhost:3000/prenota');
    console.log('4. Test the booking system');
    
  } catch (error) {
    console.error('💥 Error checking user profile:', error);
  }
}

checkUserProfile().catch(console.error);
