import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

// Carica le variabili d'ambiente
dotenv.config();

const { DATABASE_URL } = process.env;
if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not found');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function updateBarberRole() {
  try {
    console.log('🔍 Controllando utenti esistenti...\n');
    
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
    
    console.log('\n📊 Stato finale degli utenti:');
    const updatedUsers = await sql`SELECT id, email, name, role FROM users ORDER BY created_at`;
    updatedUsers.forEach(user => {
      console.log(`  - ${user.email} (${user.name}) - Ruolo: ${user.role}`);
    });
    
  } catch (error) {
    console.error('❌ Errore durante l\'aggiornamento:', error);
  }
}

updateBarberRole();
