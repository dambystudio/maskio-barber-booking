// Script diretto per pulire il database
import { db } from './src/lib/database-postgres.js';
import { users, bookings, accounts, sessions, verificationTokens, closureSettings } from './src/lib/schema.js';

async function cleanDatabase() {
  try {
    console.log('🗄️ MASKIO BARBER - Database Cleanup');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

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

    console.log('🔄 Cancellazione prenotazioni...');
    
    const bookingsDeleted = await db.delete(bookings);
    console.log(`✅ ${bookingsDeleted.rowCount || 0} prenotazioni cancellate`);

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

    console.log('');
    console.log('🎉 Pulizia completata con successo!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Chiudi la connessione
    process.exit(0);

  } catch (error) {
    console.error('❌ Errore durante la pulizia del database:', error);
    process.exit(1);
  }
}

cleanDatabase();
