#!/usr/bin/env node
/**
 * Script per verificare che gli account eliminati siano effettivamente rimossi dal database
 */

import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';

config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function checkDatabaseDeletion() {
  console.log('🔍 VERIFICA ELIMINAZIONE DAL DATABASE');
  console.log('====================================\n');

  try {
    // 1. Controlla tutti gli utenti nel database
    console.log('👥 1. Conteggio utenti totali nel database:');
    const userCount = await sql`SELECT COUNT(*) as count FROM users`;
    console.log(`   📊 Totale utenti: ${userCount[0].count}`);

    // 2. Lista degli ultimi 10 utenti
    console.log('\n📋 2. Ultimi 10 utenti registrati:');
    const recentUsers = await sql`
      SELECT id, name, email, role, created_at 
      FROM users 
      ORDER BY created_at DESC 
      LIMIT 10
    `;

    if (recentUsers.length === 0) {
      console.log('   📭 Nessun utente trovato nel database');
    } else {
      recentUsers.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.name} (${user.email}) - ${user.role}`);
        console.log(`      ID: ${user.id.slice(0, 8)}...`);
        console.log(`      Creato: ${new Date(user.created_at).toLocaleString('it-IT')}`);
        console.log('');
      });
    }

    // 3. Controlla prenotazioni orfane (senza utente valido)
    console.log('🔍 3. Controllo prenotazioni orfane:');
    const orphanBookings = await sql`
      SELECT b.id, b.customer_name, b.customer_email, b.user_id
      FROM bookings b
      LEFT JOIN users u ON b.user_id = u.id
      WHERE b.user_id IS NOT NULL AND u.id IS NULL
    `;

    if (orphanBookings.length === 0) {
      console.log('   ✅ Nessuna prenotazione orfana trovata');
    } else {
      console.log(`   ⚠️ Trovate ${orphanBookings.length} prenotazioni orfane:`);
      orphanBookings.forEach(booking => {
        console.log(`      - ${booking.customer_name} (User ID: ${booking.user_id})`);
      });
    }

    // 4. Controlla account OAuth orfani
    console.log('\n🔍 4. Controllo account OAuth orfani:');
    const orphanAccounts = await sql`
      SELECT a."userId", a.provider
      FROM accounts a
      LEFT JOIN users u ON a."userId" = u.id
      WHERE u.id IS NULL
    `;

    if (orphanAccounts.length === 0) {
      console.log('   ✅ Nessun account OAuth orfano trovato');
    } else {
      console.log(`   ⚠️ Trovati ${orphanAccounts.length} account OAuth orfani:`);
      orphanAccounts.forEach(account => {
        console.log(`      - ${account.provider} (User ID: ${account.userId})`);
      });
    }

    // 5. Controlla sessioni orfane
    console.log('\n🔍 5. Controllo sessioni orfane:');
    const orphanSessions = await sql`
      SELECT s."userId", s."sessionToken"
      FROM sessions s
      LEFT JOIN users u ON s."userId" = u.id
      WHERE u.id IS NULL
    `;

    if (orphanSessions.length === 0) {
      console.log('   ✅ Nessuna sessione orfana trovata');
    } else {
      console.log(`   ⚠️ Trovate ${orphanSessions.length} sessioni orfane:`);
      orphanSessions.forEach(session => {
        console.log(`      - Token: ${session.sessionToken.slice(0, 20)}... (User ID: ${session.userId})`);
      });
    }    // 6. Controlla barbieri orfani
    console.log('\n🔍 6. Controllo dati barbiere orfani:');
    const orphanBarbers = await sql`
      SELECT b.user_id, b.name
      FROM barbers b
      LEFT JOIN users u ON b.user_id = u.id
      WHERE u.id IS NULL
    `;

    if (orphanBarbers.length === 0) {
      console.log('   ✅ Nessun dato barbiere orfano trovato');
    } else {
      console.log(`   ⚠️ Trovati ${orphanBarbers.length} dati barbiere orfani:`);
      orphanBarbers.forEach(barber => {
        console.log(`      - ${barber.name} (User ID: ${barber.user_id})`);
      });
    }

    // 7. Statistiche generali
    console.log('\n📊 7. Statistiche database:');
    
    const stats = await Promise.all([
      sql`SELECT COUNT(*) as count FROM users`,
      sql`SELECT COUNT(*) as count FROM bookings`,
      sql`SELECT COUNT(*) as count FROM accounts`,
      sql`SELECT COUNT(*) as count FROM sessions`,
      sql`SELECT COUNT(*) as count FROM barbers`
    ]);

    console.log(`   👥 Utenti: ${stats[0][0].count}`);
    console.log(`   📅 Prenotazioni: ${stats[1][0].count}`);
    console.log(`   🔐 Account OAuth: ${stats[2][0].count}`);
    console.log(`   🔑 Sessioni attive: ${stats[3][0].count}`);
    console.log(`   💼 Profili barbiere: ${stats[4][0].count}`);

    console.log('\n✅ VERIFICA COMPLETATA');
    console.log('\n💡 Interpretazione:');
    console.log('   - Se non ci sono record orfani = Eliminazione funziona correttamente');
    console.log('   - Se ci sono record orfani = Problemi con la cascata di eliminazione');

  } catch (error) {
    console.error('\n❌ ERRORE DURANTE LA VERIFICA:', error);
  }
}

// Esegui la verifica
checkDatabaseDeletion().catch(console.error);
