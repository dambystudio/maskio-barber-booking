import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';

// Carica le variabili d'ambiente
config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function clearDatabase() {
  try {
    console.log('🗑️  Iniziando pulizia completa del database...\n');
    
    // 1. Cancella tutte le prenotazioni
    console.log('📅 Cancellando tutte le prenotazioni...');
    const deletedBookings = await sql`DELETE FROM bookings`;
    console.log(`✅ Cancellate ${deletedBookings.length} prenotazioni`);
    
    // 2. Cancella tutte le sessioni NextAuth
    console.log('🔐 Cancellando sessioni NextAuth...');
    const deletedSessions = await sql`DELETE FROM sessions`;
    console.log(`✅ Cancellate ${deletedSessions.length} sessioni`);
    
    // 3. Cancella tutti gli account OAuth
    console.log('🔗 Cancellando account OAuth...');
    const deletedAccounts = await sql`DELETE FROM accounts`;
    console.log(`✅ Cancellati ${deletedAccounts.length} account OAuth`);
    
    // 4. Cancella tutti i token di verifica
    console.log('📧 Cancellando token di verifica...');
    const deletedTokens = await sql`DELETE FROM verificationtoken`;
    console.log(`✅ Cancellati ${deletedTokens.length} token di verifica`);
    
    // 5. Cancella tutti gli utenti
    console.log('👤 Cancellando tutti gli utenti...');
    const deletedUsers = await sql`DELETE FROM users`;
    console.log(`✅ Cancellati ${deletedUsers.length} utenti`);
    
    // 6. Cancella gli schedules dei barbieri (se esistono)
    console.log('📋 Cancellando schedules barbieri...');
    const deletedSchedules = await sql`DELETE FROM barber_schedules`;
    console.log(`✅ Cancellati ${deletedSchedules.length} schedules`);
    
    console.log('\n🎉 Database pulito completamente!');
    console.log('\n📊 Riepilogo pulizia:');
    console.log(`- Prenotazioni: ${deletedBookings.length}`);
    console.log(`- Utenti: ${deletedUsers.length}`);
    console.log(`- Sessioni: ${deletedSessions.length}`);
    console.log(`- Account OAuth: ${deletedAccounts.length}`);
    console.log(`- Token verifica: ${deletedTokens.length}`);
    console.log(`- Schedules: ${deletedSchedules.length}`);
    
    console.log('\n✨ Ora puoi testare con un database completamente pulito!');
    console.log('📝 Per testare:');
    console.log('1. Registra un nuovo utente');
    console.log('2. Prova a prenotare per il 18 giugno (dovrebbe funzionare)');
    console.log('3. Prova a prenotare un secondo appuntamento lo stesso giorno (dovrebbe essere bloccato)');
    
  } catch (error) {
    console.error('❌ Errore durante la pulizia:', error);
    console.log('\n⚠️  Alcune tabelle potrebbero non esistere ancora, questo è normale.');
  }
}

// Conferma prima di eseguire
console.log('⚠️  ATTENZIONE: Questo script cancellerà TUTTI i dati dal database!');
console.log('📋 Tabelle che verranno svuotate:');
console.log('- bookings (prenotazioni)');
console.log('- users (utenti)');
console.log('- sessions (sessioni NextAuth)');
console.log('- accounts (account OAuth)');
console.log('- verificationtoken (token email)');
console.log('- barber_schedules (schedules barbieri)');
console.log('\n🚀 Eseguendo pulizia in 3 secondi...\n');

setTimeout(clearDatabase, 3000);
