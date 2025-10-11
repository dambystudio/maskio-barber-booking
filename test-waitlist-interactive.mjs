#!/usr/bin/env node

/**
 * Test INTERATTIVO Waitlist + Notifiche Push
 * 
 * SCENARIO:
 * 1. Pulisce waitlist esistente per Michele - 5 Dicembre
 * 2. Occupa tutti gli slot per il 5 Dicembre
 * 3. Tu ti metti in lista con account test
 * 4. Libera uno slot e ricevi la notifica
 * 
 * Ogni step richiede conferma premendo INVIO
 */

import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';
import readline from 'readline';

// Carica variabili ambiente
config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

// Configurazione test
const TEST_CONFIG = {
  barberId: 'michele',
  barberName: 'Michele',
  date: '2025-12-05', // 5 Dicembre
  testUserEmail: 'test@gmail.com',
  adminEmail: 'davide431@outlook.it',
  slotToFree: '10:00', // Slot da liberare per notifica
  ngrokUrl: process.env.NGROK_URL || 'https://dominical-kenneth-gasifiable.ngrok-free.dev'
};

// Helper per input utente
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function waitForEnter(message = '\n⏸️  Premi INVIO per continuare...') {
  return new Promise((resolve) => {
    rl.question(message, () => {
      resolve();
    });
  });
}

console.log('\n╔═══════════════════════════════════════════════════╗');
console.log('║   🎬 TEST INTERATTIVO WAITLIST + NOTIFICHE     ║');
console.log('╚═══════════════════════════════════════════════════╝\n');

console.log('📋 CONFIGURAZIONE:');
console.log(`   Barbiere: ${TEST_CONFIG.barberName}`);
console.log(`   Data: ${new Date(TEST_CONFIG.date).toLocaleDateString('it-IT', { 
  weekday: 'long', 
  day: 'numeric', 
  month: 'long' 
})}`);
console.log(`   Account Test: ${TEST_CONFIG.testUserEmail}`);
console.log(`   Slot da testare: ${TEST_CONFIG.slotToFree}`);
console.log('');

// ============================================================
// STEP 1: Pulisci waitlist esistente
// ============================================================
async function step1_PulisciWaitlist() {
  console.log('\n╔═══════════════════════════════════════════════════╗');
  console.log('║  📝 STEP 1: Pulisci Waitlist                     ║');
  console.log('╚═══════════════════════════════════════════════════╝\n');

  try {
    // Mostra waitlist esistente
    const existing = await sql`
      SELECT id, customer_name, status, position, created_at
      FROM waitlist
      WHERE barber_id = ${TEST_CONFIG.barberId}
        AND date = ${TEST_CONFIG.date}
      ORDER BY position, created_at
    `;

    if (existing.length > 0) {
      console.log(`⚠️  Trovati ${existing.length} record in waitlist per ${TEST_CONFIG.date}:\n`);
      existing.forEach((entry, i) => {
        console.log(`   ${i + 1}. ${entry.customer_name} - Status: ${entry.status} - Pos: ${entry.position}`);
      });
      console.log('');
    } else {
      console.log('✅ Nessun record esistente in waitlist\n');
    }

    await waitForEnter('🧹 Premi INVIO per pulire la waitlist...');

    // Cancella tutti i record
    const result = await sql`
      DELETE FROM waitlist
      WHERE barber_id = ${TEST_CONFIG.barberId}
        AND date = ${TEST_CONFIG.date}
    `;

    console.log(`\n✅ Waitlist pulita! (${result.count || existing.length} record eliminati)\n`);
    
    return true;
  } catch (error) {
    console.error('❌ Errore:', error.message);
    return false;
  }
}

// ============================================================
// STEP 2: Occupa tutti gli slot
// ============================================================
async function step2_OccupaTuttiGliSlot() {
  console.log('\n╔═══════════════════════════════════════════════════╗');
  console.log('║  📅 STEP 2: Occupa Tutti gli Slot                ║');
  console.log('╚═══════════════════════════════════════════════════╝\n');

  try {
    // Trova admin
    const [admin] = await sql`
      SELECT id, email, name FROM users WHERE email = ${TEST_CONFIG.adminEmail}
    `;

    if (!admin) {
      console.log(`❌ Admin non trovato: ${TEST_CONFIG.adminEmail}\n`);
      return null;
    }

    console.log(`👤 Admin: ${admin.name}\n`);

    // Mostra bookings esistenti
    const existingBookings = await sql`
      SELECT time, customer_name, status
      FROM bookings
      WHERE barber_id = ${TEST_CONFIG.barberId}
        AND date = ${TEST_CONFIG.date}
        AND status != 'cancelled'
      ORDER BY time
    `;

    if (existingBookings.length > 0) {
      console.log(`📋 Slot già occupati (${existingBookings.length}):\n`);
      existingBookings.forEach(b => {
        console.log(`   ${b.time} - ${b.customer_name} (${b.status})`);
      });
      console.log('');
    }

    await waitForEnter('📅 Premi INVIO per occupare tutti gli slot mancanti...');

    // Orari lavorativi Michele (esempio)
    const allSlots = [
      '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
      '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30'
    ];

    const occupiedTimes = new Set(existingBookings.map(b => b.time));
    const slotsToBook = allSlots.filter(time => !occupiedTimes.has(time));

    console.log(`\n📝 Creo ${slotsToBook.length} prenotazioni...\n`);

    const created = [];
    for (const time of slotsToBook) {
      try {
        const [booking] = await sql`
          INSERT INTO bookings (
            user_id, customer_name, customer_email, customer_phone,
            barber_id, barber_name, service, price, date, time, 
            duration, status, notes
          ) VALUES (
            ${admin.id}, ${admin.name}, ${admin.email}, '3334455667',
            ${TEST_CONFIG.barberId}, ${TEST_CONFIG.barberName}, 
            'Taglio', '18.00', ${TEST_CONFIG.date}, ${time},
            30, 'confirmed', '[TEST] Slot occupato per test waitlist'
          )
          RETURNING id, time
        `;
        created.push(booking);
        console.log(`   ✅ ${time} - Prenotato`);
      } catch (err) {
        if (err.message.includes('duplicate key')) {
          console.log(`   ⚠️  ${time} - Già esistente`);
        } else {
          console.log(`   ❌ ${time} - Errore: ${err.message}`);
        }
      }
    }

    console.log(`\n✅ Tutti gli slot sono ora occupati!\n`);
    
    // Trova l'ID del booking da liberare
    const [targetBooking] = await sql`
      SELECT id FROM bookings
      WHERE barber_id = ${TEST_CONFIG.barberId}
        AND date = ${TEST_CONFIG.date}
        AND time = ${TEST_CONFIG.slotToFree}
        AND status != 'cancelled'
      LIMIT 1
    `;

    return targetBooking?.id || null;
  } catch (error) {
    console.error('❌ Errore:', error.message);
    return null;
  }
}

// ============================================================
// STEP 3: Mettiti in lista
// ============================================================
async function step3_MettitiInLista() {
  console.log('\n╔═══════════════════════════════════════════════════╗');
  console.log('║  👤 STEP 3: Tu ti metti in Lista d\'attesa        ║');
  console.log('╚═══════════════════════════════════════════════════╝\n');

  try {
    // Trova test user
    const [testUser] = await sql`
      SELECT id, email, name FROM users WHERE email = ${TEST_CONFIG.testUserEmail}
    `;

    if (!testUser) {
      console.log(`❌ Test user non trovato: ${TEST_CONFIG.testUserEmail}`);
      console.log('👉 Crea prima l\'account su /auth/signup\n');
      return null;
    }

    console.log(`👤 Account Test: ${testUser.name} (${testUser.email})\n`);

    // Verifica push subscription
    const [subscription] = await sql`
      SELECT id, endpoint FROM push_subscriptions
      WHERE user_id = ${testUser.id}
      LIMIT 1
    `;

    if (subscription) {
      console.log(`📱 Push Subscription: ✅ Attiva`);
      console.log(`   Endpoint: ${subscription.endpoint.substring(0, 50)}...\n`);
    } else {
      console.log(`⚠️  Push Subscription: ❌ Non trovata`);
      console.log('👉 Vai su /debug-push e crea una subscription\n');
      await waitForEnter('⏸️  Premi INVIO quando hai attivato le notifiche...');
    }

    await waitForEnter('📝 Premi INVIO per aggiungerti alla lista d\'attesa...');

    // Aggiungi in waitlist
    const [waitlistEntry] = await sql`
      INSERT INTO waitlist (
        user_id, barber_id, barber_name, date,
        service, price, customer_name, customer_email, customer_phone,
        notes, status, position
      ) VALUES (
        ${testUser.id}, ${TEST_CONFIG.barberId}, ${TEST_CONFIG.barberName}, ${TEST_CONFIG.date},
        'Taglio Uomo', '18.00', ${testUser.name}, ${testUser.email}, '3331234567',
        '[TEST] Utente in attesa di notifica', 'waiting', 1
      )
      RETURNING id, position, status
    `;

    console.log(`\n✅ Aggiunto in lista d'attesa!`);
    console.log(`   ID: ${waitlistEntry.id}`);
    console.log(`   Posizione: ${waitlistEntry.position}`);
    console.log(`   Status: ${waitlistEntry.status}\n`);

    return waitlistEntry.id;
  } catch (error) {
    console.error('❌ Errore:', error.message);
    return null;
  }
}

// ============================================================
// STEP 4: Libera slot e notifica
// ============================================================
async function step4_LiberaSlotENotifica(bookingId) {
  console.log('\n╔═══════════════════════════════════════════════════╗');
  console.log('║  🔔 STEP 4: Libera Slot e Invia Notifica         ║');
  console.log('╚═══════════════════════════════════════════════════╝\n');

  if (!bookingId) {
    console.log('❌ Nessun booking ID da liberare\n');
    return false;
  }

  try {
    console.log(`🎯 Booking da liberare: ${bookingId}`);
    console.log(`⏰ Slot: ${TEST_CONFIG.slotToFree}\n`);

    await waitForEnter('🗑️  Premi INVIO per cancellare il booking...');

    // Cancella booking
    await sql`
      UPDATE bookings
      SET status = 'cancelled', 
          notes = CONCAT(notes, ' - [CANCELLATO PER TEST]'),
          updated_at = NOW()
      WHERE id = ${bookingId}
    `;

    console.log(`\n✅ Booking cancellato!\n`);

    await waitForEnter('📤 Premi INVIO per inviare la notifica agli utenti in lista...');

    // Invia notifica via API
    const apiUrl = `${TEST_CONFIG.ngrokUrl}/api/waitlist/notify`;
    
    console.log(`\n📡 Chiamata API: ${apiUrl}\n`);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        barberId: TEST_CONFIG.barberId,
        date: TEST_CONFIG.date,
        time: TEST_CONFIG.slotToFree,
      })
    });

    const result = await response.json();

    console.log(`📊 Risposta API (${response.status}):\n`);
    console.log(JSON.stringify(result, null, 2));
    console.log('');

    if (response.ok && result.notified > 0) {
      console.log('╔═══════════════════════════════════════════════════╗');
      console.log('║         ✅ NOTIFICA INVIATA CON SUCCESSO!         ║');
      console.log('╚═══════════════════════════════════════════════════╝\n');
      
      console.log('📱 CONTROLLA IL TUO DISPOSITIVO!\n');
      console.log(`   Dovresti ricevere:`);
      console.log(`   📌 Titolo: "🎉 Posto Disponibile!"`);
      console.log(`   📌 Testo: "${TEST_CONFIG.barberName} è libero il [data] alle ${TEST_CONFIG.slotToFree}"`);
      console.log(`   📌 Azione: "📅 Prenota" / "Ignora"\n`);
      
      if (result.user) {
        console.log(`👤 Notificato: ${result.user.name}`);
        console.log(`🏆 Posizione in coda: ${result.user.position}`);
      }
      
      if (result.offer) {
        console.log(`⏰ Offerta scade: ${new Date(result.offer.expiresAt).toLocaleString('it-IT')}\n`);
      }
      
      console.log('🔍 Verifica anche nella Console del Browser:');
      console.log('   F12 → Console → cerca "[SW-PUSH]"\n');
      
      return true;
    } else {
      console.log('⚠️  Notifica non inviata\n');
      console.log(`   Motivo: ${result.message || result.error}\n`);
      return false;
    }

  } catch (error) {
    console.error('❌ Errore:', error.message);
    return false;
  }
}

// ============================================================
// MAIN EXECUTION
// ============================================================
async function runInteractiveTest() {
  try {
    await waitForEnter('\n🚀 Premi INVIO per iniziare il test...');

    // Step 1
    const step1Ok = await step1_PulisciWaitlist();
    if (!step1Ok) {
      console.log('❌ Test interrotto allo Step 1\n');
      rl.close();
      process.exit(1);
    }

    // Step 2
    const bookingId = await step2_OccupaTuttiGliSlot();
    if (!bookingId) {
      console.log('❌ Test interrotto allo Step 2\n');
      rl.close();
      process.exit(1);
    }

    // Step 3
    const waitlistId = await step3_MettitiInLista();
    if (!waitlistId) {
      console.log('❌ Test interrotto allo Step 3\n');
      rl.close();
      process.exit(1);
    }

    // Step 4
    const step4Ok = await step4_LiberaSlotENotifica(bookingId);
    
    console.log('\n╔═══════════════════════════════════════════════════╗');
    if (step4Ok) {
      console.log('║            🎉 TEST COMPLETATO! 🎉                 ║');
    } else {
      console.log('║         ⚠️  TEST COMPLETATO CON WARNING           ║');
    }
    console.log('╚═══════════════════════════════════════════════════╝\n');

    rl.close();
    process.exit(step4Ok ? 0 : 1);

  } catch (error) {
    console.error('\n❌ ERRORE FATALE:', error);
    rl.close();
    process.exit(1);
  }
}

// Start test
runInteractiveTest();
