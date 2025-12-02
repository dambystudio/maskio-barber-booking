import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config } from 'dotenv';

// Configura il percorso del file .env.local
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '.env.local');

console.log('📁 Loading environment from:', envPath);
config({ path: envPath });

import pkg from 'pg';
const { Client } = pkg;

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function checkUserProfiles() {
  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Controlla tutti gli utenti e i loro telefoni
    console.log('\n📋 Checking user profiles...');
    const users = await client.query('SELECT id, name, email, phone, created_at FROM users ORDER BY created_at DESC LIMIT 10');
    
    if (users.rows.length === 0) {
      console.log('❌ No users found in database');
      return;
    }
    
    console.log(`\n👥 Found ${users.rows.length} users:`);
    users.rows.forEach((user, index) => {
      console.log(`  ${index + 1}. ${user.name} (${user.email})`);
      console.log(`     Phone: ${user.phone || 'NULL'}`);
      console.log(`     Created: ${user.created_at}`);
      console.log('');
    });

    // Test specifico per utenti con telefono mancante
    const usersWithoutPhone = await client.query('SELECT COUNT(*) as count FROM users WHERE phone IS NULL OR phone = \'\'');
    console.log(`📊 Users without phone: ${usersWithoutPhone.rows[0].count}`);
    
    const usersWithPhone = await client.query('SELECT COUNT(*) as count FROM users WHERE phone IS NOT NULL AND phone != \'\'');
    console.log(`📞 Users with phone: ${usersWithPhone.rows[0].count}`);

    // Prova a aggiornare un utente specifico (se esiste)
    if (users.rows.length > 0) {
      const testUser = users.rows[0];
      console.log(`\n🧪 Testing phone update for user: ${testUser.email}`);
      
      if (!testUser.phone) {
        const testPhone = '+39 123 456 7890';
        await client.query('UPDATE users SET phone = $1 WHERE id = $2', [testPhone, testUser.id]);
        
        // Verifica l'aggiornamento
        const updated = await client.query('SELECT phone FROM users WHERE id = $1', [testUser.id]);
        console.log(`✅ Phone updated to: ${updated.rows[0].phone}`);
      } else {
        console.log(`ℹ️  User already has phone: ${testUser.phone}`);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.end();
    console.log('\n🔚 Database connection closed');
  }
}

checkUserProfiles();
