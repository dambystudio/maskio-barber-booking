// Script semplice per aggiornare il ruolo utente usando il service esistente
import('dotenv/config');

const DATABASE_URL = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL non trovata nelle variabili d\'ambiente');
  process.exit(1);
}

// Importa Neon direttamente
const { neon } = await import('@neondatabase/serverless');
const sql = neon(DATABASE_URL);

console.log('🔍 Controllando utenti esistenti...\n');

try {
  // Mostra tutti gli utenti
  const allUsers = await sql`SELECT id, email, name, role FROM users ORDER BY created_at`;
  console.log('📊 Utenti nel database:');
  allUsers.forEach(user => {
    console.log(`  - ${user.email} (${user.name}) - Ruolo: ${user.role}`);
  });
  
  console.log('\n🔧 Aggiornando prova@gmail.com a ruolo "barber"...');
  
  // Aggiorna l'utente specifico
  const result = await sql`
    UPDATE users 
    SET role = 'barber'
    WHERE email = 'prova@gmail.com'
    RETURNING id, email, name, role
  `;
  
  if (result.length > 0) {
    console.log('✅ Utente aggiornato con successo:');
    console.log(`   Email: ${result[0].email}`);
    console.log(`   Nome: ${result[0].name}`);
    console.log(`   Nuovo ruolo: ${result[0].role}`);
  } else {
    console.log('⚠️ Utente prova@gmail.com non trovato nel database');
  }
  
} catch (error) {
  console.error('❌ Errore durante l\'aggiornamento:', error);
}
