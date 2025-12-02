// Script per inizializzare il primo admin del sistema
// Imposta l'utente con email "prova@gmail.com" come admin e barbiere
import('dotenv/config');

const DATABASE_URL = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL;

if (!DATABASE_URL) {
  console.error('❌ Nessuna variabile DATABASE_URL trovata');
  console.error('Controlla: DATABASE_URL, POSTGRES_URL, POSTGRES_PRISMA_URL');
  process.exit(1);
}

console.log('🔧 Usando DATABASE_URL:', DATABASE_URL.substring(0, 30) + '...');

// Importa Neon direttamente
const { neon } = await import('@neondatabase/serverless');
const sql = neon(DATABASE_URL);

console.log('🚀 INIZIALIZZAZIONE SISTEMA ADMIN\n');

try {
  // Mostra tutti gli utenti
  console.log('🔍 Utenti attuali nel database:');
  const allUsers = await sql`SELECT id, email, name, role FROM users ORDER BY created_at`;
  
  if (allUsers.length === 0) {
    console.log('   📭 Nessun utente trovato nel database');
  } else {
    allUsers.forEach(user => {
      console.log(`   - ${user.email} (${user.name}) - Ruolo: ${user.role}`);
    });
  }
  
  // Cerca l'utente prova@gmail.com
  const targetUser = allUsers.find(user => user.email === 'prova@gmail.com');
  
  if (!targetUser) {
    console.log('\n⚠️ Utente prova@gmail.com non trovato nel database');
    console.log('   Per inizializzare il sistema:');
    console.log('   1. Registrati/loggati con email prova@gmail.com');
    console.log('   2. Riesegui questo script');
    process.exit(0);
  }
  
  console.log('\n🔧 Aggiornando prova@gmail.com a admin...');
  
  // Aggiorna l'utente a admin
  const result = await sql`
    UPDATE users 
    SET role = 'admin'
    WHERE email = 'prova@gmail.com'
    RETURNING id, email, name, role
  `;
  
  if (result.length > 0) {
    console.log('✅ Utente aggiornato con successo:');
    console.log(`   📧 Email: ${result[0].email}`);
    console.log(`   👤 Nome: ${result[0].name}`);
    console.log(`   🔑 Nuovo ruolo: ${result[0].role}`);
    console.log('\n🎉 Sistema inizializzato! Ora puoi:');
    console.log('   - Accedere alla gestione utenti: /admin/users');
    console.log('   - Promuovere altri utenti a barbiere o admin');
    console.log('   - Gestire tutti i ruoli dal pannello admin');
  } else {
    console.log('❌ Errore durante l\'aggiornamento');
  }
  
} catch (error) {
  console.error('❌ Errore durante l\'inizializzazione:', error);
}
