#!/usr/bin/env node

/**
 * Test E2E completo del sistema waitlist con notifiche
 * 
 * SCENARIO:
 * 1. Io (admin) prenoto tutti gli slot per un giorno specifico
 * 2. Tu ti metti in lista d'attesa per quello stesso giorno
 * 3. Io cancello una prenotazione (liberando uno slot)
 * 4. Tu ricevi automaticamente la notifica push
 */

import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';

// Carica variabili ambiente
config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

console.log('🎬 === TEST E2E WAITLIST + NOTIFICHE ===\n');

// Configurazione test
const TEST_CONFIG = {
  barberId: 'michele',
  date: '2025-12-15', // Data futura per test
  testUserEmail: 'test@gmail.com', // L'utente che si mette in coda (TU)
  adminEmail: 'davide431@outlook.it', // L'utente che prenota tutto (IO)
  slotToBook: '10:00', // Slot da prenotare/liberare
};

async function step1_PrenotaTuttiGliSlot() {
  console.log('📅 STEP 1: Prenoto tutti gli slot disponibili');
  console.log('=' .repeat(50));
  console.log(`Barbiere: ${TEST_CONFIG.barberId}`);
  console.log(`Data: ${TEST_CONFIG.date}`);
  console.log(`Slot target: ${TEST_CONFIG.slotToBook}\n`);

  try {
    // Trova l'admin user
    const [admin] = await sql`
      SELECT id, email, name FROM users WHERE email = ${TEST_CONFIG.adminEmail}
    `;

    if (!admin) {
      console.log(`❌ Admin user non trovato (${TEST_CONFIG.adminEmail})`);
      console.log('👉 Crea prima l\'utente admin nel database\n');
      return false;
    }

    console.log(`✅ Admin trovato: ${admin.name} (${admin.email})\n`);

    // Configurazione servizio
    const serviceConfig = {
      name: 'Taglio',
      duration: 30,
      price: '18.00'
    };

    console.log(`✅ Servizio: ${serviceConfig.name} (${serviceConfig.duration} min, €${serviceConfig.price})\n`);

    // Crea la prenotazione per lo slot target
    console.log(`📝 Creo prenotazione per ${TEST_CONFIG.slotToBook}...`);

    const [existingBooking] = await sql`
      SELECT id FROM bookings 
      WHERE barber_id = ${TEST_CONFIG.barberId}
      AND date = ${TEST_CONFIG.date}
      AND time = ${TEST_CONFIG.slotToBook}
      AND status != 'cancelled'
    `;

    if (existingBooking) {
      console.log('⚠️ Prenotazione già esistente per questo slot');
      console.log(`   ID: ${existingBooking.id}`);
      console.log('   Continuo al prossimo step...\n');
      return existingBooking.id;
    }

    const [booking] = await sql`
      INSERT INTO bookings (
        user_id,
        customer_name,
        customer_email,
        customer_phone,
        barber_id,
        barber_name,
        service,
        price,
        date,
        time,
        duration,
        status,
        notes
      ) VALUES (
        ${admin.id},
        ${admin.name},
        ${admin.email},
        '3331234567',
        ${TEST_CONFIG.barberId},
        'Michele',
        ${serviceConfig.name},
        ${serviceConfig.price},
        ${TEST_CONFIG.date},
        ${TEST_CONFIG.slotToBook},
        ${serviceConfig.duration},
        'confirmed',
        '[TEST E2E] Prenotazione per test waitlist'
      )
      RETURNING id, date, time, status
    `;

    console.log('✅ Prenotazione creata con successo!');
    console.log(`   ID: ${booking.id}`);
    console.log(`   Slot: ${booking.time}`);
    console.log(`   Status: ${booking.status}\n`);

    return booking.id;

  } catch (error) {
    console.error('❌ Errore in Step 1:', error.message);
    return false;
  }
}

async function step2_AggiungiInCoda() {
  console.log('👤 STEP 2: Tu ti metti in lista d\'attesa');
  console.log('='.repeat(50));

  try {
    // Trova l'utente test
    const [testUser] = await sql`
      SELECT id, email, name FROM users WHERE email = ${TEST_CONFIG.testUserEmail}
    `;

    if (!testUser) {
      console.log(`❌ Test user non trovato (${TEST_CONFIG.testUserEmail})`);
      console.log('👉 Crea prima l\'utente test nel database\n');
      return null;
    }

    console.log(`✅ Test user trovato: ${testUser.name} (${testUser.email})\n`);

    const [waitlistEntry] = await sql`
      INSERT INTO waitlist (
        user_id,
        barber_id,
        barber_name,
        date,
        service,
        price,
        customer_name,
        customer_email,
        customer_phone,
        notes,
        status,
        position
      ) VALUES (
        ${testUser.id},
        ${TEST_CONFIG.barberId},
        'Michele',
        ${TEST_CONFIG.date},
        'Taglio Uomo',
        '18.00',
        ${testUser.name},
        ${testUser.email},
        '3331234567',
        '[TEST E2E] Utente in attesa di notifica',
        'waiting',
        1
      )
      RETURNING id, position, status, customer_name
    `;

    console.log(`✅ Utente aggiunto in lista:`);
    console.log(`   ID Entry: ${waitlistEntry.id}`);
    console.log(`   Nome: ${waitlistEntry.customer_name}`);
    console.log(`   Posizione: ${waitlistEntry.position}`);
    console.log(`   Status: ${waitlistEntry.status}\n`);

    return waitlistEntry.id;
  } catch (error) {
    console.error('❌ Errore inserimento waitlist:', error);
    return null;
  }
}

async function step3_VerificaSubscription() {
  console.log('📱 STEP 3: Verifico che tu abbia una subscription push attiva');
  console.log('=' .repeat(50));

  try {
    const [testUser] = await sql`
      SELECT id FROM users WHERE email = ${TEST_CONFIG.testUserEmail}
    `;

    const subscriptions = await sql`
      SELECT id, endpoint, created_at
      FROM push_subscriptions
      WHERE user_id = ${testUser.id}
      ORDER BY created_at DESC
    `;

    console.log(`📊 Subscription trovate: ${subscriptions.length}\n`);

    if (subscriptions.length === 0) {
      console.log('❌ NESSUNA SUBSCRIPTION TROVATA!');
      console.log('');
      console.log('👉 Azioni richieste:');
      console.log('   1. Apri il browser come utente test@gmail.com');
      console.log('   2. Vai su /debug-push');
      console.log('   3. Clicca "Richiedi Permesso"');
      console.log('   4. Clicca "Crea Subscription"');
      console.log('   5. Riavvia questo script\n');
      return false;
    }

    subscriptions.forEach((sub, i) => {
      console.log(`   ${i + 1}. ID: ${sub.id}`);
      console.log(`      Endpoint: ${sub.endpoint.substring(0, 60)}...`);
      console.log(`      Creata: ${new Date(sub.created_at).toLocaleString('it-IT')}`);
      console.log('');
    });

    console.log('✅ Subscription attiva trovata!\n');
    return true;

  } catch (error) {
    console.error('❌ Errore in Step 3:', error.message);
    return false;
  }
}

async function step4_LiberaSlot(bookingId) {
  console.log('🗑️  STEP 4: Io cancello la prenotazione (libero lo slot)');
  console.log('=' .repeat(50));
  console.log(`Booking ID: ${bookingId}\n`);

  try {
    // Cancella la prenotazione (semplice update dello status)
    const [cancelled] = await sql`
      UPDATE bookings
      SET status = 'cancelled',
          notes = CONCAT(notes, ' - [CANCELLATO PER TEST]'),
          updated_at = NOW()
      WHERE id = ${bookingId}
      RETURNING id, date, time, status
    `;

    console.log('✅ Prenotazione cancellata!');
    console.log(`   ID: ${cancelled.id}`);
    console.log(`   Slot liberato: ${cancelled.time}`);
    console.log(`   Status: ${cancelled.status}\n`);

    return true;

  } catch (error) {
    console.error('❌ Errore in Step 4:', error.message);
    return false;
  }
}

async function step5_InviaNotifica() {
  console.log('📤 STEP 5: Invio notifica push agli utenti in coda');
  console.log('='.repeat(50));

  try {
    const ngrokUrl = process.env.NGROK_URL || 'https://dominical-kenneth-gasifiable.ngrok-free.dev';
    const apiUrl = `${ngrokUrl}/api/waitlist/notify`;

    console.log(`🔗 API URL: ${apiUrl}\n`);

    const payload = {
      barberId: TEST_CONFIG.barberId,
      date: TEST_CONFIG.date,
      time: TEST_CONFIG.slotToBook,
    };

    console.log('📦 Payload:');
    console.log(JSON.stringify(payload, null, 2));
    console.log('');

    console.log('📡 Invio richiesta...\n');

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    console.log(`📊 Risposta API (${response.status} ${response.statusText}):`);
    console.log(JSON.stringify(result, null, 2));
    console.log('');

    if (response.ok) {
      console.log('✅ NOTIFICHE INVIATE CON SUCCESSO!');
      console.log('');
      if (result.notified > 0) {
        console.log('📱 CONTROLLA IL TUO DISPOSITIVO!');
        console.log('   Dovresti ricevere una notifica push con:');
        console.log(`   Titolo: "🎉 Posto Disponibile!"`);
        console.log(`   Testo: "Michele è libero il [data] alle ${TEST_CONFIG.slotToBook}"`);
        console.log('');
        console.log(`👤 Notificato: ${result.user.name} (posizione ${result.user.position})`);
        console.log(`⏰ Offerta scade: ${new Date(result.offer.expiresAt).toLocaleString('it-IT')}`);
        console.log('');
        console.log('🔍 Verifica anche nella console del browser:');
        console.log('   F12 → Console → cerca "[SW-PUSH]"');
      } else {
        console.log('⚠️ Nessun utente notificato');
        console.log(`   Motivo: ${result.message}`);
      }
      console.log('');
      return true;
    } else {
      console.log('❌ Errore invio notifiche');
      console.log(`   ${result.error || 'Unknown error'}`);
      return false;
    }

  } catch (error) {
    console.error('❌ Errore in Step 5:', error.message);
    return false;
  }
}

async function cleanup() {
  console.log('\n🧹 CLEANUP (opzionale)');
  console.log('=' .repeat(50));
  console.log('Vuoi cancellare i dati di test creati? (Y/n)');
  // Per ora skippiamo il cleanup automatico
  console.log('⏭️  Skip cleanup - puoi pulire manualmente se necessario\n');
}

// MAIN EXECUTION
async function runTest() {
  console.log(`📅 Data test: ${TEST_CONFIG.date}`);
  console.log(`👤 Utente test: ${TEST_CONFIG.testUserEmail}`);
  console.log(`👨‍💼 Admin: ${TEST_CONFIG.adminEmail}`);
  console.log('');

  // Step 1: Prenota lo slot
  const bookingId = await step1_PrenotaTuttiGliSlot();
  if (!bookingId) {
    console.log('\n❌ Test fallito allo Step 1');
    process.exit(1);
  }

  console.log('⏸️  Pausa 2 secondi...\n');
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Step 2: Metti in coda
  const waitlistId = await step2_AggiungiInCoda();
  if (!waitlistId) {
    console.log('\n❌ Test fallito allo Step 2');
    process.exit(1);
  }

  console.log('⏸️  Pausa 2 secondi...\n');
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Step 3: Verifica subscription
  const hasSubscription = await step3_VerificaSubscription();
  if (!hasSubscription) {
    console.log('\n⚠️ Test interrotto - configura prima la subscription');
    process.exit(1);
  }

  console.log('⏸️  Pausa 2 secondi...\n');
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Step 4: Libera lo slot
  const slotFreed = await step4_LiberaSlot(bookingId);
  if (!slotFreed) {
    console.log('\n❌ Test fallito allo Step 4');
    process.exit(1);
  }

  console.log('⏸️  Pausa 2 secondi...\n');
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Step 5: Invia notifica
  const notificationSent = await step5_InviaNotifica();
  if (!notificationSent) {
    console.log('\n❌ Test fallito allo Step 5');
    process.exit(1);
  }

  console.log('\n🎉 ==========================================');
  console.log('🎉 TEST COMPLETATO CON SUCCESSO!');
  console.log('🎉 ==========================================\n');

  console.log('📋 Riepilogo:');
  console.log(`   ✅ Booking ID: ${bookingId}`);
  console.log(`   ✅ Waitlist ID: ${waitlistId}`);
  console.log(`   ✅ Notifica inviata`);
  console.log('');
  console.log('👉 Controlla il dispositivo per vedere la notifica!\n');
}

// Verifica environment
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL non configurata!');
  console.error('👉 Assicurati che .env.local esista con DATABASE_URL\n');
  process.exit(1);
}

runTest().catch(error => {
  console.error('\n💥 ERRORE FATALE:', error);
  console.error(error.stack);
  process.exit(1);
});
