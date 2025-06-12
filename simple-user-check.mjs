// Simple user check
import { neon } from '@neondatabase/serverless';

const DATABASE_URL = 'postgres://neondb_owner:npg_Wj09qDUmTsxE@ep-old-forest-a2ur722g-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require';
const sql = neon(DATABASE_URL);

async function checkUser() {
  try {
    console.log('Checking user...');
    const users = await sql`SELECT * FROM users LIMIT 1`;
    console.log('User found:', users[0]);
    
    if (users[0] && !users[0].phone) {
      console.log('Adding phone...');
      await sql`UPDATE users SET phone = '+39 333 1234567' WHERE id = ${users[0].id}`;
      console.log('Phone added!');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

checkUser();
