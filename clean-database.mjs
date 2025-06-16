// Script per cancellare tutti gli utenti e prenotazioni dal database
import { db } from './src/lib/database-postgres.js';
import { users, bookings, accounts, sessions, verificationTokens, closureSettings } from './src/lib/schema.js';

async function cleanDatabase() {
  const action = process.argv[2];
  
  if (!action || !['users', 'bookings', 'all', 'help'].includes(action)) {
    console.log('📖 MASKIO BARBER - Database Cleanup Tool');
    console.log('');
    console.log('🔧 Comandi disponibili:');
    console.log('  node clean-database.mjs users     - Cancella tutti gli utenti e sessioni');
    console.log('  node clean-database.mjs bookings  - Cancella tutte le prenotazioni');
    console.log('  node clean-database.mjs all       - Cancella TUTTO (⚠️ ATTENZIONE!)');
    console.log('  node clean-database.mjs help      - Mostra questo aiuto');
    console.log('');
    console.log('⚠️  ATTENZIONE: Queste operazioni sono IRREVERSIBILI!');
    process.exit(0);
  }

  try {
    console.log('🗄️ MASKIO BARBER - Database Cleanup');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    if (action === 'users' || action === 'all') {
      console.log('🔄 Cancellazione utenti e sessioni...');
      
      // Cancella in ordine per rispettare le foreign key
      const sessionsDeleted = await db.delete(sessions);
      console.log(`✅ ${sessionsDeleted.rowCount || 0} sessioni cancellate`);
      
      const accountsDeleted = await db.delete(accounts);
      console.log(`✅ ${accountsDeleted.rowCount || 0} account OAuth cancellati`);
      
      const tokensDeleted = await db.delete(verificationTokens);
      console.log(`✅ ${tokensDeleted.rowCount || 0} token di verifica cancellati`);
      
      const usersDeleted = await db.delete(users);
      console.log(`✅ ${usersDeleted.rowCount || 0} utenti cancellati`);
    }

    if (action === 'bookings' || action === 'all') {
      console.log('🔄 Cancellazione prenotazioni...');
      
      const bookingsDeleted = await db.delete(bookings);
      console.log(`✅ ${bookingsDeleted.rowCount || 0} prenotazioni cancellate`);
    }

    if (action === 'all') {
      console.log('🔄 Reset impostazioni chiusure...');
      
      // Non cancellare le closure settings, ma resettarle ai valori di default
      await db.delete(closureSettings);
      
      // Ricrea le impostazioni di default
      await db.insert(closureSettings).values({
        id: 'shop_closures',
        closedDays: '[0]', // Solo domenica
        closedDates: '[]',
        updatedAt: new Date(),
        updatedBy: null
      });
      
      console.log(`✅ Impostazioni chiusure resettate ai valori di default`);
    }

    console.log('');
    console.log('🎉 Pulizia completata con successo!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  } catch (error) {
    console.error('❌ Errore durante la pulizia del database:', error);
    process.exit(1);
  }
}

// Esegui solo se chiamato direttamente
if (import.meta.url === `file://${process.argv[1]}`) {
  cleanDatabase();
}
