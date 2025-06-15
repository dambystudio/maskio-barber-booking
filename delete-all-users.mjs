import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';

// Carica le variabili d'ambiente
config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function deleteAllUsers() {
  try {
    console.log('🗑️ Cancellando tutti gli utenti...');
    
    // Prima cancelliamo le sessioni (dipendono dagli utenti)
    await sql`DELETE FROM sessions`;
    console.log('✅ Sessioni cancellate');
    
    // Poi cancelliamo gli account (dipendono dagli utenti)
    await sql`DELETE FROM accounts`;
    console.log('✅ Account OAuth cancellati');
    
    // Infine cancelliamo gli utenti
    await sql`DELETE FROM users`;
    console.log('✅ Utenti cancellati');
    
    console.log('\n🎉 Database completamente pulito!');
    console.log('📋 Ora puoi testare con account nuovi.');
    
  } catch (error) {
    console.error('❌ Errore durante la cancellazione:', error);
  }
}

deleteAllUsers();
