import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://neondb_owner:npg_Wj09qDUmTsxE@ep-old-forest-a2ur722g-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require';
const sql = neon(DATABASE_URL);

async function testEmailVerification() {
  try {
    console.log('🧪 TEST SISTEMA VERIFICA EMAIL\n');
    
    // Get existing users
    const users = await sql`SELECT id, email, email_verified FROM users ORDER BY created_at DESC`;
    
    if (users.length === 0) {
      console.log('❌ Nessun utente trovato per testare');
      return;
    }
    
    console.log('👥 Utenti disponibili per test:');
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} - Verificata: ${user.email_verified ? '✅' : '❌'}`);
    });
    
    console.log('\n📧 Test API endpoints:');
    console.log('POST /api/auth/verify-email - Invia codice');
    console.log('PUT /api/auth/verify-email - Verifica codice');
    console.log('GET /api/auth/verify-email - Stato verifica');
    
    console.log('\n🔧 Per testare:');
    console.log('1. Accedi al sito con uno di questi account');
    console.log('2. Vai in area personale');
    console.log('3. Richiedi verifica email');
    console.log('4. Controlla il terminale per il codice (modalità sviluppo)');
    console.log('5. Inserisci il codice per completare la verifica');
    
    console.log('\n💡 Codici di verifica in sviluppo vengono mostrati nel terminale del server');
    
  } catch (error) {
    console.error('❌ Errore:', error.message);
  }
}

testEmailVerification();
