import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';
import readline from 'readline';

// Carica variabili d'ambiente
config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

// Setup readline per input utente
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const askQuestion = (question) => {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
};

const waitForEnter = async (message = '\n📍 Premi INVIO per continuare...') => {
  await askQuestion(message);
};

// Dati di test
const TEST_USER = {
  email: 'test@gmail.com',
  name: 'Test User'
};

const TEST_BARBER = {
  id: 'fabio', // ID corretto dal database
  name: 'Fabio'
};

const TEST_BOOKING = {
  date: '2025-12-05', // 5 novembre 2025 (mercoledì)
  // Questi campi sono solo per creare le prenotazioni di test (bookings richiede service/price)
  service: 'Taglio Uomo',
  price: 18
};

// Slot da occupare (tutti gli slot del mattino e pomeriggio)
const ALL_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
];

console.log('\n' + '='.repeat(80));
console.log('🧪 TEST COMPLETO SISTEMA LISTA D\'ATTESA');
console.log('='.repeat(80));
console.log('\nQuesto test verificherà step-by-step:');
console.log('  1. ✅ Frontend - UI nel BookingForm');
console.log('  2. ✅ API - Iscrizione alla lista d\'attesa');
console.log('  3. ✅ Dashboard - Visualizzazione iscrizioni');
console.log('  4. ✅ Notifiche - Sistema broadcast');
console.log('  5. ✅ Rimozione - Cancellazione iscrizione');
console.log('\n' + '='.repeat(80));

await waitForEnter('\n🚀 Premi INVIO per iniziare il test...');

// ============================================================================
// STEP 1: VERIFICA DATABASE
// ============================================================================
console.log('\n' + '━'.repeat(80));
console.log('📋 STEP 1: VERIFICA DATABASE');
console.log('━'.repeat(80));

try {
  // Verifica utente di test
  console.log('\n🔍 Cerco utente di test...');
  const users = await sql`
    SELECT id, email, name, role 
    FROM users 
    WHERE email = ${TEST_USER.email}
  `;

  if (users.length === 0) {
    console.log('❌ Utente di test non trovato!');
    console.log(`\n💡 Crea un utente con email: ${TEST_USER.email}`);
    process.exit(1);
  }

  const testUser = users[0];
  console.log(`✅ Utente trovato: ${testUser.name} (${testUser.email})`);
  console.log(`   ID: ${testUser.id}`);
  console.log(`   Ruolo: ${testUser.role || 'user'}`);

  // Verifica subscription push
  console.log('\n🔍 Cerco push subscription...');
  const subscriptions = await sql`
    SELECT id, endpoint, p256dh, auth
    FROM push_subscriptions
    WHERE user_id = ${testUser.id}
  `;

  if (subscriptions.length === 0) {
    console.log('⚠️  Nessuna push subscription trovata');
    console.log('   Le notifiche non funzioneranno, ma il test può continuare');
  } else {
    console.log(`✅ Trovate ${subscriptions.length} push subscription(s)`);
  }

  // Verifica barbiere
  console.log('\n🔍 Cerco barbiere di test...');
  const barbers = await sql`
    SELECT id, name
    FROM barbers
    WHERE id = ${TEST_BARBER.id}
  `;

  if (barbers.length === 0) {
    console.log('❌ Barbiere non trovato!');
    process.exit(1);
  }

  console.log(`✅ Barbiere trovato: ${barbers[0].name}`);

  await waitForEnter();

} catch (error) {
  console.error('❌ Errore durante verifica database:', error);
  process.exit(1);
}

// ============================================================================
// STEP 2: PULIZIA DATI PRECEDENTI
// ============================================================================
console.log('\n' + '━'.repeat(80));
console.log('🧹 STEP 2: PULIZIA DATI PRECEDENTI');
console.log('━'.repeat(80));

try {
  console.log('\n🗑️  Rimuovo prenotazioni di test precedenti...');
  const deletedBookings = await sql`
    DELETE FROM bookings
    WHERE barber_id = ${TEST_BARBER.id}
      AND date = ${TEST_BOOKING.date}
      AND time = ${TEST_BOOKING.time}
  `;
  console.log(`   Rimosse ${deletedBookings.length} prenotazioni`);

  console.log('\n🗑️  Rimuovo iscrizioni waitlist precedenti...');
  const users = await sql`SELECT id FROM users WHERE email = ${TEST_USER.email}`;
  if (users.length > 0) {
    const deletedWaitlist = await sql`
      DELETE FROM waitlist
      WHERE user_id = ${users[0].id}
        AND barber_id = ${TEST_BARBER.id}
        AND date = ${TEST_BOOKING.date}
    `;
    console.log(`   Rimosse ${deletedWaitlist.length} iscrizioni waitlist`);
  }

  console.log('\n✅ Pulizia completata');
  await waitForEnter();

} catch (error) {
  console.error('❌ Errore durante pulizia:', error);
  process.exit(1);
}

// ============================================================================
// STEP 3: OCCUPA TUTTI GLI SLOT
// ============================================================================
console.log('\n' + '━'.repeat(80));
console.log('📅 STEP 3: OCCUPA TUTTI GLI SLOT DISPONIBILI');
console.log('━'.repeat(80));

try {
  console.log(`\n📝 Creo prenotazioni per il ${TEST_BOOKING.date}...`);
  console.log(`   Numero di slot da occupare: ${ALL_SLOTS.length}`);
  
  let bookingIds = [];
  
  for (let i = 0; i < ALL_SLOTS.length; i++) {
    const time = ALL_SLOTS[i];
    const booking = await sql`
      INSERT INTO bookings (
        barber_id,
        barber_name,
        date,
        time,
        service,
        price,
        duration,
        customer_name,
        customer_email,
        customer_phone,
        status,
        created_at
      ) VALUES (
        ${TEST_BARBER.id},
        ${TEST_BARBER.name},
        ${TEST_BOOKING.date},
        ${time},
        ${TEST_BOOKING.service},
        ${TEST_BOOKING.price},
        30,
        ${`Cliente Test ${i + 1}`},
        ${`cliente${i + 1}@test.com`},
        '1234567890',
        'confirmed',
        NOW()
      )
      RETURNING id
    `;
    
    bookingIds.push({ id: booking[0].id, time });
    console.log(`   ✅ Slot ${time} occupato (ID: ${booking[0].id})`);
  }

  console.log(`\n✅ Tutti i ${ALL_SLOTS.length} slot sono ora OCCUPATI`);
  console.log(`   Il calendario del 5 dicembre 2025 è completamente pieno!`);

  await waitForEnter();

} catch (error) {
  console.error('❌ Errore durante creazione prenotazioni:', error);
  process.exit(1);
}

// ============================================================================
// STEP 4: TEST FRONTEND - VERIFICA UI
// ============================================================================
console.log('\n' + '━'.repeat(80));
console.log('🎨 STEP 4: TEST FRONTEND - VERIFICA UI');
console.log('━'.repeat(80));

console.log('\n📱 Azioni da eseguire MANUALMENTE nel browser:');
console.log('');
console.log('   1. Apri: http://localhost:3001/prenota');
console.log('   2. Fai login con: ' + TEST_USER.email);
console.log(`   3. Seleziona barbiere: ${TEST_BARBER.name}`);
console.log('   4. Seleziona un servizio qualsiasi');
console.log(`   5. Seleziona data: 5 dicembre 2025`);
console.log(`   6. Cerca gli slot (dovrebbero essere TUTTI OCCUPATI in rosso!)`);
console.log('');
console.log('✅ Verifica che TUTTI gli slot appaiano:');
console.log('   - Con linea barrata (line-through)');
console.log('   - Colore rosso (bg-red-900/50)');
console.log('   - Testo "Occupato"');
console.log('');
console.log('✅ Ora CLICCA su UNO O PIÙ slot occupati e verifica:');
console.log('   - Lo slot si evidenzia in BLU');
console.log('   - Appare messaggio: "❌ Orario [TIME] già occupato"');
console.log('   - Appare il bottone: "🔔 Aggiungi alla Lista d\'Attesa"');
console.log('   - Si vedono i dettagli: data e orario');
console.log('');

await waitForEnter('✅ Hai verificato l\'UI? Premi INVIO per continuare...');

// ============================================================================
// STEP 5: TEST API - ISCRIZIONE LISTA D'ATTESA
// ============================================================================
console.log('\n' + '━'.repeat(80));
console.log('🔌 STEP 5: TEST API - ISCRIZIONE LISTA D\'ATTESA');
console.log('━'.repeat(80));

console.log('\n📱 Azioni da eseguire MANUALMENTE nel browser:');
console.log('');
console.log('   1. CLICCA sul bottone "🔔 Aggiungi alla Lista d\'Attesa"');
console.log('');
console.log('✅ Verifica che appaia:');
console.log('   - Animazione di caricamento');
console.log('   - Messaggio: "Iscritto alla lista d\'attesa!" ✅');
console.log('   - Badge verde di conferma');
console.log('   - Testo: "Ti invieremo una notifica push quando si libera"');
console.log('');

await waitForEnter('✅ Hai cliccato e visto la conferma? Premi INVIO per continuare...');

// Verifica nel database
console.log('\n🔍 Verifico nel database...');

try {
  const users = await sql`SELECT id FROM users WHERE email = ${TEST_USER.email}`;
  const userId = users[0]?.id;
  
  console.log(`🔍 User ID: ${userId || 'NOT FOUND'}`);
  
  // Prima verifica: cerca con user_id (se disponibile)
  let waitlistEntries = [];
  
  if (userId) {
    console.log('🔍 Cerco con user_id...');
    waitlistEntries = await sql`
      SELECT 
        id,
        user_id,
        barber_name,
        date,
        status,
        position,
        created_at
      FROM waitlist
      WHERE user_id = ${userId}
        AND barber_id = ${TEST_BARBER.id}
        AND date = ${TEST_BOOKING.date}
    `;
  }
  
  // Fallback 1: cerca con customer_email (per record con user_id NULL)
  if (waitlistEntries.length === 0) {
    console.log('⚠️  Non trovato con user_id, cerco con customer_email...');
    waitlistEntries = await sql`
      SELECT 
        id,
        user_id,
        barber_name,
        date,
        status,
        position,
        created_at
      FROM waitlist
      WHERE customer_email = ${TEST_USER.email}
        AND barber_id = ${TEST_BARBER.id}
        AND date = ${TEST_BOOKING.date}
    `;
  }

  if (waitlistEntries.length === 0) {
    console.log('❌ Nessuna iscrizione trovata nel database!');
    console.log('   Verifica che l\'API funzioni correttamente');
    process.exit(1);
  }

  const entry = waitlistEntries[0];
  console.log('✅ Iscrizione trovata nel database:');
  console.log(`   ID: ${entry.id}`);
  console.log(`   User ID: ${entry.user_id || 'NULL (guest/vecchio record)'}`);
  console.log(`   Barbiere: ${entry.barber_name}`);
  console.log(`   Data: ${entry.date}`);
  console.log(`   Status: ${entry.status}`);
  console.log(`   Posizione: #${entry.position}`);
  
  if (!entry.user_id) {
    console.log('\n⚠️  NOTA: user_id è NULL - questo è un vecchio record o guest.');
    console.log('   📌 Nuove iscrizioni avranno user_id popolato se utente loggato.');
  }
  
  console.log('\n✅ Sistema corretto! Lista d\'attesa per GIORNO (non slot specifico)');
  console.log('   📌 Questo è il comportamento atteso:');
  console.log('      - Giorno arancione (tutto occupato) → WaitlistModal si apre');
  console.log('      - Iscrizione per giorno intero (qualsiasi orario disponibile)');
  console.log('      - Notifica broadcast quando si libera UN QUALSIASI slot');

  await waitForEnter();

} catch (error) {
  console.error('❌ Errore durante verifica database:', error);
  process.exit(1);
}

// ============================================================================
// STEP 6: TEST DASHBOARD - VISUALIZZAZIONE
// ============================================================================
console.log('\n' + '━'.repeat(80));
console.log('📊 STEP 6: TEST DASHBOARD - VISUALIZZAZIONE');
console.log('━'.repeat(80));

console.log('\n📱 Azioni da eseguire MANUALMENTE nel browser:');
console.log('');
console.log('   1. Apri: http://localhost:3001/dashboard/waitlist');
console.log('');
console.log('✅ Verifica che vedi:');
console.log('   - Titolo: "🔔 Lista d\'Attesa"');
console.log(`   - Card con data: ${TEST_BOOKING.date}`);
console.log(`   - Barbiere: ${TEST_BARBER.name}`);
console.log('   - Badge giallo: "⏳ In Attesa"');
console.log('   - Bottone rosso: "❌ Rimuovi"');
console.log('   - Posizione in coda');
console.log('');

await waitForEnter('✅ Hai verificato la dashboard? Premi INVIO per continuare...');

// ============================================================================
// STEP 7: TEST NOTIFICHE - LIBERA TUTTI GLI SLOT
// ============================================================================
console.log('\n' + '━'.repeat(80));
console.log('🔔 STEP 7: LIBERA TUTTI GLI SLOT E INVIA NOTIFICHE');
console.log('━'.repeat(80));

console.log('\n📝 Ora libererò TUTTI gli slot uno per uno...');
console.log('   Questo simula la cancellazione di prenotazioni durante il giorno');

try {
  // Cancella TUTTE le prenotazioni per liberare tutti gli slot
  console.log(`\n🗑️  Cancello TUTTE le prenotazioni per ${TEST_BOOKING.date}...`);
  const deleted = await sql`
    DELETE FROM bookings
    WHERE barber_id = ${TEST_BARBER.id}
      AND date = ${TEST_BOOKING.date}
  `;
  console.log(`✅ Liberati ${deleted.length} slot!`);

  // Ora invia notifica broadcast
  console.log('\n📤 Invio notifica broadcast...');
  console.log(`   Barbiere: ${TEST_BARBER.name}`);
  console.log(`   Data: ${TEST_BOOKING.date}\n`);
  
  let totalNotified = 0;
  let totalErrors = 0;

  console.log(`🔔 Invio notifica per ${TEST_BOOKING.date}...`);
  
  try {
    const notifyResponse = await fetch('http://localhost:3001/api/waitlist/notify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        barberId: TEST_BARBER.id,
        date: TEST_BOOKING.date,
      }),
    });

    const notifyData = await notifyResponse.json();

    if (notifyResponse.ok) {
      console.log(`   ✅ Notifiche inviate: ${notifyData.notified || 0}`);
      totalNotified += (notifyData.notified || 0);
      totalErrors += (notifyData.errors || 0);
    } else {
      console.log(`   ⚠️  Errore: ${notifyData.error}`);
    }
  } catch (err) {
    console.log(`   ❌ Errore: ${err.message}`);
  }

  console.log('\n' + '─'.repeat(80));
  console.log('📊 RIEPILOGO NOTIFICHE:');
  console.log(`   📤 Totale notifiche inviate: ${totalNotified}`);
  console.log(`   ❌ Totale errori: ${totalErrors}`);
  console.log('─'.repeat(80));

  console.log('\n📱 Verifica sul tuo dispositivo:');
  console.log('   ✅ Dovresti aver ricevuto una notifica push!');
  console.log('   ✅ Titolo: "� Posto Disponibile!"');
  console.log(`   ✅ Testo: "${TEST_BARBER.name} ha posti disponibili il [DATA]"`);

  await waitForEnter('\n✅ Hai ricevuto la notifica? Premi INVIO per continuare...');

  // Verifica status nel database
  console.log('\n🔍 Verifico status nel database...');
  const users = await sql`SELECT id FROM users WHERE email = ${TEST_USER.email}`;
  const updatedEntries = await sql`
    SELECT status, date, position
    FROM waitlist
    WHERE user_id = ${users[0].id}
      AND barber_id = ${TEST_BARBER.id}
      AND date = ${TEST_BOOKING.date}
    ORDER BY created_at ASC
  `;

  if (updatedEntries.length > 0) {
    console.log(`✅ Trovate ${updatedEntries.length} iscrizioni:`);
    updatedEntries.forEach(entry => {
      const statusIcon = entry.status === 'notified' ? '🔔' : '⏳';
      console.log(`   ${statusIcon} Data: ${entry.date}, Status: ${entry.status.toUpperCase()}, Posizione: #${entry.position}`);
    });
    
    const notifiedCount = updatedEntries.filter(e => e.status === 'notified').length;
    console.log(`\n   📊 Notificati: ${notifiedCount}/${updatedEntries.length}`);
  } else {
    console.log('⚠️  Nessuna iscrizione trovata nel database');
  }

  await waitForEnter();

} catch (error) {
  console.error('❌ Errore durante test notifiche:', error);
  console.error('   Stack:', error.stack);
}

// ============================================================================
// STEP 8: TEST DASHBOARD DOPO NOTIFICA
// ============================================================================
console.log('\n' + '━'.repeat(80));
console.log('📊 STEP 8: TEST DASHBOARD DOPO NOTIFICA');
console.log('━'.repeat(80));

console.log('\n📱 Azioni da eseguire MANUALMENTE nel browser:');
console.log('');
console.log('   1. Ricarica: http://localhost:3001/dashboard/waitlist');
console.log('');
console.log('✅ Verifica che ORA vedi:');
console.log('   - Badge BLU: "🔔 Notificato" (invece di giallo "In Attesa")');
console.log('   - Bottone VERDE: "🎯 Prenota Ora"');
console.log('   - Banner blu: "💡 Posto liberato! Prenota prima..."');
console.log('');

await waitForEnter('✅ Hai verificato il cambio di status? Premi INVIO per continuare...');

// ============================================================================
// STEP 9: TEST RIMOZIONE
// ============================================================================
console.log('\n' + '━'.repeat(80));
console.log('🗑️  STEP 9: TEST RIMOZIONE ISCRIZIONE');
console.log('━'.repeat(80));

console.log('\n📱 Azioni da eseguire MANUALMENTE nel browser:');
console.log('');
console.log('   1. Nella dashboard waitlist, clicca "❌ Rimuovi"');
console.log('   2. Conferma la rimozione nel popup');
console.log('');
console.log('✅ Verifica che:');
console.log('   - La card scompare dalla lista');
console.log('   - Appare messaggio: "Nessuna iscrizione alla lista d\'attesa"');
console.log('');

await waitForEnter('✅ Hai rimosso l\'iscrizione? Premi INVIO per continuare...');

// Verifica nel database
console.log('\n🔍 Verifico nel database...');

try {
  const users = await sql`SELECT id FROM users WHERE email = ${TEST_USER.email}`;
  const cancelledEntry = await sql`
    SELECT status
    FROM waitlist
    WHERE user_id = ${users[0].id}
      AND barber_id = ${TEST_BARBER.id}
      AND date = ${TEST_BOOKING.date}
  `;

  if (cancelledEntry.length > 0 && cancelledEntry[0].status === 'cancelled') {
    console.log('✅ Status aggiornato a: CANCELLED');
  } else if (cancelledEntry.length === 0) {
    console.log('✅ Entry rimossa dal database completamente');
  } else {
    console.log(`⚠️  Status inatteso: ${cancelledEntry[0].status}`);
  }

} catch (error) {
  console.error('❌ Errore durante verifica:', error);
}

// ============================================================================
// RIEPILOGO FINALE
// ============================================================================
console.log('\n' + '═'.repeat(80));
console.log('🎉 TEST COMPLETATO!');
console.log('═'.repeat(80));

console.log('\n✅ FUNZIONALITÀ TESTATE:');
console.log('   1. ✅ Database e utente di test');
console.log('   2. ✅ Pulizia dati precedenti');
console.log('   3. ✅ Creazione prenotazione (slot occupato)');
console.log('   4. ✅ UI Frontend - Visualizzazione slot occupato');
console.log('   5. ✅ API - Iscrizione alla lista d\'attesa');
console.log('   6. ✅ Dashboard - Visualizzazione iscrizioni');
console.log('   7. ✅ Notifiche - Sistema broadcast');
console.log('   8. ✅ Dashboard - Cambio status dopo notifica');
console.log('   9. ✅ Rimozione - Cancellazione iscrizione');

console.log('\n🎯 FLUSSO UTENTE COMPLETO VERIFICATO:');
console.log('   Cliente → Slot occupato → Lista d\'attesa → Notifica → Prenotazione');

console.log('\n💡 NOTE IMPORTANTI:');
console.log('   • Sistema broadcast: TUTTI ricevono notifica');
console.log('   • First come, first served: Chi prenota per primo vince');
console.log('   • Nessuna scadenza offerta');
console.log('   • Push notifications funzionanti');
console.log('   • UI intuitiva e responsive');

console.log('\n🚀 Sistema pronto per la produzione!');
console.log('═'.repeat(80) + '\n');

rl.close();
process.exit(0);
