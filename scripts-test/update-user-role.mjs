import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

// Carica le variabili d'ambiente dal file .env
dotenv.config();

const { DATABASE_URL } = process.env;
if (!DATABASE_URL) {
  console.error('❌ Errore: variabile d\'ambiente DATABASE_URL non trovata.');
  console.error('Crea un file .env nella root del progetto con la variabile DATABASE_URL.');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function updateUserRoles() {
  try {
    console.log('🔍 Checking existing users...');
    
    // Get all users
    const allUsers = await sql`SELECT * FROM users`;
    console.log(`📊 Found ${allUsers.length} users in database:`);
    
    allUsers.forEach(user => {
      console.log(`  - ${user.email} (${user.name}) - Role: ${user.role}`);
    });
    
    // Update prova@gmail.com to barber role
    console.log('\n🔧 Updating prova@gmail.com role to barber...');
    
    const result = await sql`
      UPDATE users 
      SET role = 'barber'
      WHERE email = 'prova@gmail.com'
      RETURNING *
    `;
    
    if (result.length > 0) {
      console.log('✅ Successfully updated prova@gmail.com to barber role');
      console.log('Updated user:', result[0]);
    } else {
      console.log('⚠️  User prova@gmail.com not found in database');
    }
    
    // Show updated users
    console.log('\n📊 Updated user list:');
    const updatedUsers = await sql`SELECT * FROM users`;
    updatedUsers.forEach(user => {
      console.log(`  - ${user.email} (${user.name}) - Role: ${user.role}`);
    });
    
  } catch (error) {
    console.error('❌ Error updating user roles:', error);
  }
}

updateUserRoles();
