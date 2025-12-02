import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config } from 'dotenv';
import pkg from 'pg';

const { Client } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '.env.local');
config({ path: envPath });

async function testProfileAPI() {
  try {
    console.log('🧪 Testing profile API...');
    
    // Test per simulare una richiesta all'API (senza autenticazione per ora)
    const testEmails = ['davide431@outlook.it', 'michelebiancofiore0230@gmail.com'];
    
    for (const email of testEmails) {
      console.log(`\n👤 Testing for user: ${email}`);
        try {
        // Simuliamo quello che fa l'API internamente
        const client = new Client({
          connectionString: process.env.DATABASE_URL
        });
        
        await client.connect();
        
        const result = await client.query(`
          SELECT id, email, name, phone, image, role, created_at, last_login 
          FROM users 
          WHERE email = $1
        `, [email]);
        
        if (result.rows.length > 0) {
          const profile = result.rows[0];
          console.log('✅ Profile found:');
          console.log(`   ID: ${profile.id}`);
          console.log(`   Name: ${profile.name}`);
          console.log(`   Email: ${profile.email}`);
          console.log(`   Phone: ${profile.phone || 'NULL'}`);
          console.log(`   Role: ${profile.role}`);
          console.log(`   Image: ${profile.image || 'NULL'}`);
        } else {
          console.log('❌ No profile found');
        }
        
        await client.end();
        
      } catch (error) {
        console.error(`❌ Error testing ${email}:`, error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ General error:', error);
  }
}

testProfileAPI();
