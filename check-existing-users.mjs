// Script per verificare account esistenti nel database
import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

// Carica le variabili d'ambiente dal file .env
dotenv.config();

// Usa la variabile d'ambiente DATABASE_URL, senza fallback hardcoded
const { DATABASE_URL } = process.env;
if (!DATABASE_URL) {
  console.error('❌ Errore: variabile d\'ambiente DATABASE_URL non trovata.');
  console.error('Crea un file .env nella root del progetto con la variabile DATABASE_URL.');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function checkUsers() {
  try {
    console.log('🔍 VERIFICA ACCOUNT ESISTENTI NEL DATABASE\n');

    const users = await sql`SELECT id, name, email, phone, role, created_at, "emailVerified" FROM users ORDER BY created_at DESC`;

    if (users.length === 0) {
      console.log('📭 Nessun account trovato nel database');
      return;
    }

    console.log(`👤 Trovati ${users.length} account(s):\n`);

    users.forEach((user, index) => {
      console.log(`📝 ACCOUNT ${index + 1}:`);
      console.log(`   📧 Email: ${user.email}`);
      console.log(`   👤 Nome: ${user.name}`);
      console.log(`   📱 Telefono: ${user.phone || 'Non fornito'}`);
      console.log(`   🎭 Ruolo: ${user.role}`);
      console.log(`   📅 Creato: ${new Date(user.created_at).toLocaleString('it-IT')}`);      console.log(`   ✅ Email verificata: ${user.emailVerified ? '✅ Sì' : '❌ No'}`);
      console.log(`   📞 Telefono verificato: ❌ Non implementato ancora`);
      console.log(`   🆔 ID: ${user.id.slice(0, 8)}...`);
      console.log('   ---');
    });

    // Statistiche riassuntive
    console.log('\n📊 STATISTICHE:');
    console.log(`   Total accounts: ${users.length}`);
    console.log(`   Con telefono: ${users.filter(u => u.phone).length}`);    console.log(`   Email verificate: ${users.filter(u => u.emailVerified).length}`);
    console.log(`   Telefoni verificati: Non implementato ancora`);
    console.log(`   Ruoli: ${[...new Set(users.map(u => u.role))].join(', ')}`);

  } catch (error) {
    console.error('❌ Errore:', error.message);
  }
}

checkUsers();
