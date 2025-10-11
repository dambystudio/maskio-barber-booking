#!/usr/bin/env node

/**
 * Test COMPLETO Waitlist - Step by Step Manuale
 * 
 * SCENARIO REALE:
 * 1. Pulisco la situazione attuale
 * 2. Tu vai manualmente sul sito e ti iscrivi in lista d'attesa
 * 3. Verifico che sei iscritto correttamente
 * 4. Libero uno slot
 * 5. Invio la notifica
 */

import { neon } from '@neondatabase/serverless';
import webpush from 'web-push';
import { config } from 'dotenv';
import readline from 'readline';

config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

// Configura VAPID
webpush.setVapidDetails(
  'mailto:davide431@outlook.it',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

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

const CONFIG = {
  barberId: 'michele',
  barberName: 'Michele',
  date: '2025-12-05',
  testEmail: 'test@gmail.com',
  slotTime: '10:00',
  ngrokUrl: process.env.NGROK_URL || 'https://dominical-kenneth-gasifiable.ngrok-free.dev'
};

console.log('\n╔═══════════════════════════════════════════════════════╗');
console.log('║   🎬 TEST COMPLETO WAITLIST - STEP BY STEP MANUALE   ║');
console.log('╚═══════════════════════════════════════════════════════╝\n');

console.log('📋 CONFIGURAZIONE:');
console.log(`   Barbiere: ${CONFIG.barberName}`);
console.log(`   Data: ${new Date(CONFIG.date).toLocaleDateString('it-IT', { 
  weekday: 'long', 
  day: 'numeric', 
  month: 'long' 
})}`);
console.log(`   Account Test: ${CONFIG.testEmail}`);
console.log(`   Slot da liberare: ${CONFIG.slotTime}`);
console.log(`   URL Sito: ${CONFIG.ngrokUrl}\n`);

// ============================================================
// STEP 1: Pulisci situazione
// ============================================================
async function step1_Cleanup() {
  console.log('\n╔═══════════════════════════════════════════════════════╗');
  console.log('║  🧹 STEP 1: Pulizia Situazione Attuale               ║');
  console.log('╚═══════════════════════════════════════════════════════╝\n');

  try {
    const [testUser] = await sql`
      SELECT id, email, name FROM users WHERE email = ${CONFIG.testEmail}
    `;

    if (!testUser) {
      console.log(`❌ Utente ${CONFIG.testEmail} non trovato nel database\n`);
      console.log('👉 Prima crea l\'account su:');
      console.log(`   ${CONFIG.ngrokUrl}/auth/signup\n`);
      return false;
    }

    console.log(`👤 Utente trovato: ${testUser.name} (${testUser.email})\n`);

    // Controlla waitlist esistente
    const existing = await sql`
      SELECT * FROM waitlist
      WHERE user_id = ${testUser.id}
        AND barber_id = ${CONFIG.barberId}
        AND date = ${CONFIG.date}
    `;

    if (existing.length > 0) {
      console.log(`⚠️  Trovate ${existing.length} entry in waitlist. Le pulisco...\n`);
      
      existing.forEach((e, i) => {
        console.log(`   ${i + 1}. Status: ${e.status} | Pos: ${e.position} | Creato: ${new Date(e.created_at).toLocaleString('it-IT')}`);
      });
      
      await sql`
        DELETE FROM waitlist
        WHERE user_id = ${testUser.id}
          AND barber_id = ${CONFIG.barberId}
          AND date = ${CONFIG.date}
      `;
      
      console.log(`\n✅ Pulite ${existing.length} entry dalla waitlist\n`);
    } else {
      console.log('✅ Nessuna entry esistente in waitlist\n');
    }

    // Controlla push subscription
    const subs = await sql`
      SELECT COUNT(*) as count FROM push_subscriptions
      WHERE user_id = ${testUser.id}
    `;

    console.log(`📱 Push Subscriptions attive: ${subs[0].count}`);
    
    if (subs[0].count === 0) {
      console.log('\n⚠️  ATTENZIONE: Nessuna push subscription attiva!');
      console.log('👉 Prima di continuare:');
      console.log(`   1. Vai su ${CONFIG.ngrokUrl}/debug-push`);
      console.log('   2. Clicca "Crea Subscription"');
      console.log('   3. Accetta i permessi notifiche\n');
      
      await waitForEnter('⏸️  Premi INVIO quando hai creato la subscription...');
      
      // Ricontrolla
      const subsCheck = await sql`
        SELECT COUNT(*) as count FROM push_subscriptions
        WHERE user_id = ${testUser.id}
      `;
      
      if (subsCheck[0].count === 0) {
        console.log('\n❌ Ancora nessuna subscription. Test interrotto.\n');
        return false;
      }
      
      console.log(`\n✅ Subscription creata! (${subsCheck[0].count} attive)\n`);
    } else {
      console.log('✅ Push subscriptions pronte!\n');
    }

    // Verifica slot 10:00
    const [booking] = await sql`
      SELECT id, customer_name, status FROM bookings
      WHERE barber_id = ${CONFIG.barberId}
        AND date = ${CONFIG.date}
        AND time = ${CONFIG.slotTime}
      ORDER BY created_at DESC
      LIMIT 1
    `;

    if (booking) {
      console.log(`📅 Slot ${CONFIG.slotTime}:`);
      console.log(`   Cliente: ${booking.customer_name}`);
      console.log(`   Status: ${booking.status}\n`);
      
      if (booking.status === 'confirmed') {
        console.log('✅ Slot occupato - perfetto per il test!\n');
      } else if (booking.status === 'cancelled') {
        console.log('⚠️  Slot già cancellato - lo riattivo...\n');
        await sql`
          UPDATE bookings
          SET status = 'confirmed',
              updated_at = NOW()
          WHERE id = ${booking.id}
        `;
        console.log('✅ Slot riattivato come "confirmed"\n');
      }
    } else {
      console.log(`⚠️  Nessun booking trovato per slot ${CONFIG.slotTime}\n`);
      console.log('💡 Creo un booking fittizio...\n');
      
      const [admin] = await sql`
        SELECT id, name, email FROM users WHERE email = 'davide431@outlook.it'
      `;
      
      await sql`
        INSERT INTO bookings (
          user_id, customer_name, customer_email, customer_phone,
          barber_id, barber_name, service, price, date, time,
          duration, status, notes
        ) VALUES (
          ${admin.id}, ${admin.name}, ${admin.email}, '3334455667',
          ${CONFIG.barberId}, ${CONFIG.barberName},
          'Taglio', '18.00', ${CONFIG.date}, ${CONFIG.slotTime},
          30, 'confirmed', '[TEST] Booking per simulazione waitlist'
        )
      `;
      
      console.log(`✅ Booking creato per ${CONFIG.slotTime}\n`);
    }

    console.log('✅ Pulizia completata!\n');
    return true;

  } catch (error) {
    console.error('❌ Errore:', error.message);
    return false;
  }
}

// ============================================================
// STEP 2: Iscrizione manuale
// ============================================================
async function step2_ManualWaitlist() {
  console.log('\n╔═══════════════════════════════════════════════════════╗');
  console.log('║  👤 STEP 2: Tu ti iscrivi MANUALMENTE alla Lista     ║');
  console.log('╚═══════════════════════════════════════════════════════╝\n');

  console.log('📱 COSA FARE ORA:\n');
  console.log('1. Apri il browser sul tuo dispositivo');
  console.log(`2. Vai su: ${CONFIG.ngrokUrl}`);
  console.log(`3. Fai login con: ${CONFIG.testEmail}`);
  console.log('4. Vai su "Prenota"');
  console.log('5. Seleziona "Michele"');
  console.log('6. Seleziona "5 Dicembre"');
  console.log('7. Cerca lo slot 10:00 - vedrai che è OCCUPATO');
  console.log('8. Clicca su "Aggiungi alla Lista d\'attesa" (o pulsante simile)\n');
  
  console.log('⏳ Aspetto che ti iscrivi...\n');

  await waitForEnter('⏸️  Premi INVIO quando ti sei iscritto alla lista...');

  // Verifica iscrizione
  console.log('\n🔍 Verifico se sei in lista...\n');

  const [testUser] = await sql`
    SELECT id FROM users WHERE email = ${CONFIG.testEmail}
  `;

  const [entry] = await sql`
    SELECT * FROM waitlist
    WHERE user_id = ${testUser.id}
      AND barber_id = ${CONFIG.barberId}
      AND date = ${CONFIG.date}
    ORDER BY created_at DESC
    LIMIT 1
  `;

  if (!entry) {
    console.log('❌ Non ti trovo in lista d\'attesa!\n');
    console.log('💡 Possibili problemi:');
    console.log('   - Non hai cliccato sul pulsante giusto');
    console.log('   - La funzionalità non è ancora implementata nel sito\n');
    console.log('🔧 Aggiungo manualmente per continuare il test...\n');
    
    const [inserted] = await sql`
      INSERT INTO waitlist (
        user_id, barber_id, barber_name, date,
        service, price, customer_name, customer_email, customer_phone,
        notes, status, position
      ) VALUES (
        ${testUser.id}, ${CONFIG.barberId}, ${CONFIG.barberName}, ${CONFIG.date},
        'Taglio Uomo', '18.00', 'Account Test', ${CONFIG.testEmail}, '3331234567',
        '[TEST] Iscritto manualmente per test', 'waiting', 1
      )
      RETURNING *
    `;
    
    console.log('✅ Aggiunto manualmente alla lista!\n');
    return inserted;
  }

  console.log('✅ SEI IN LISTA D\'ATTESA!\n');
  console.log('📋 Dettagli:');
  console.log(`   Status: ${entry.status}`);
  console.log(`   Posizione: ${entry.position}`);
  console.log(`   Creato: ${new Date(entry.created_at).toLocaleString('it-IT')}\n`);

  return entry;
}

// ============================================================
// STEP 3: Verifica iscrizione
// ============================================================
async function step3_VerifyWaitlist(waitlistEntry) {
  console.log('\n╔═══════════════════════════════════════════════════════╗');
  console.log('║  ✅ STEP 3: Verifica Iscrizione                       ║');
  console.log('╚═══════════════════════════════════════════════════════╝\n');

  const [testUser] = await sql`
    SELECT id, name, email FROM users WHERE email = ${CONFIG.testEmail}
  `;

  console.log('👤 UTENTE:');
  console.log(`   Nome: ${testUser.name}`);
  console.log(`   Email: ${testUser.email}\n`);

  console.log('📋 LISTA D\'ATTESA:');
  console.log(`   ID Entry: ${waitlistEntry.id}`);
  console.log(`   Status: ${waitlistEntry.status}`);
  console.log(`   Posizione: ${waitlistEntry.position}`);
  console.log(`   Barbiere: ${waitlistEntry.barber_name}`);
  console.log(`   Data: ${new Date(waitlistEntry.date).toLocaleDateString('it-IT')}`);
  console.log(`   Servizio: ${waitlistEntry.service || 'N/A'}`);
  console.log(`   Prezzo: €${waitlistEntry.price || 'N/A'}\n`);

  // Verifica push
  const subs = await sql`
    SELECT COUNT(*) as count FROM push_subscriptions
    WHERE user_id = ${testUser.id}
  `;

  console.log('📱 NOTIFICHE:');
  console.log(`   Push Subscriptions: ${subs[0].count} attive`);
  
  if (subs[0].count > 0) {
    console.log('   ✅ Pronto per ricevere notifiche!\n');
  } else {
    console.log('   ❌ Nessuna subscription attiva!\n');
    return false;
  }

  return true;
}

// ============================================================
// STEP 4: Libera slot
// ============================================================
async function step4_FreeSlot() {
  console.log('\n╔═══════════════════════════════════════════════════════╗');
  console.log('║  🗑️  STEP 4: Libero lo Slot                          ║');
  console.log('╚═══════════════════════════════════════════════════════╝\n');

  console.log('📅 SIMULAZIONE: Un cliente cancella la prenotazione delle 10:00\n');

  await waitForEnter('⏸️  Premi INVIO per cancellare il booking...');

  const [booking] = await sql`
    SELECT id, customer_name, time FROM bookings
    WHERE barber_id = ${CONFIG.barberId}
      AND date = ${CONFIG.date}
      AND time = ${CONFIG.slotTime}
      AND status = 'confirmed'
    LIMIT 1
  `;

  if (!booking) {
    console.log('⚠️  Booking non trovato o già cancellato\n');
    return false;
  }

  console.log(`🎯 Booking trovato:`);
  console.log(`   Cliente: ${booking.customer_name}`);
  console.log(`   Orario: ${booking.time}\n`);

  await sql`
    UPDATE bookings
    SET status = 'cancelled',
        notes = CONCAT(COALESCE(notes, ''), ' - [CANCELLATO PER TEST WAITLIST]'),
        updated_at = NOW()
    WHERE id = ${booking.id}
  `;

  console.log('✅ Booking CANCELLATO!\n');
  console.log(`🎉 Lo slot ${CONFIG.slotTime} è ora LIBERO!\n`);

  return true;
}

// ============================================================
// STEP 5: Invia notifica
// ============================================================
async function step5_SendNotification() {
  console.log('\n╔═══════════════════════════════════════════════════════╗');
  console.log('║  📤 STEP 5: Invio Notifica Push                       ║');
  console.log('╚═══════════════════════════════════════════════════════╝\n');

  await waitForEnter('⏸️  Premi INVIO per inviare la notifica...');

  const [testUser] = await sql`
    SELECT id, email, name FROM users WHERE email = ${CONFIG.testEmail}
  `;

  const [waitlistEntry] = await sql`
    SELECT * FROM waitlist
    WHERE user_id = ${testUser.id}
      AND barber_id = ${CONFIG.barberId}
      AND date = ${CONFIG.date}
      AND status = 'waiting'
    ORDER BY position
    LIMIT 1
  `;

  if (!waitlistEntry) {
    console.log('❌ Nessuna entry in waitlist con status "waiting"\n');
    return false;
  }

  console.log(`👤 Invio notifica a: ${testUser.name}\n`);

  // Crea offerta
  const offerExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

  await sql`
    UPDATE waitlist
    SET status = 'offered',
        offered_time = ${CONFIG.slotTime},
        offer_expires_at = ${offerExpiresAt.toISOString()},
        updated_at = NOW()
    WHERE id = ${waitlistEntry.id}
  `;

  console.log('💾 Offerta creata:');
  console.log(`   Slot offerto: ${CONFIG.slotTime}`);
  console.log(`   Scadenza: ${offerExpiresAt.toLocaleTimeString('it-IT')} (tra 15 minuti)\n`);

  // Prepara payload
  const payload = {
    title: '🎉 Posto Disponibile!',
    body: `${CONFIG.barberName} è libero il ${new Date(CONFIG.date).toLocaleDateString('it-IT')} alle ${CONFIG.slotTime}. Prenota entro 15 minuti!`,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: `waitlist-${waitlistEntry.id}`,
    data: {
      url: `/prenota?barber=${CONFIG.barberId}&date=${CONFIG.date}&time=${CONFIG.slotTime}`,
      type: 'waitlist_slot_available',
      waitlistId: waitlistEntry.id,
      barberId: CONFIG.barberId,
      date: CONFIG.date,
      time: CONFIG.slotTime,
      expiresAt: offerExpiresAt.toISOString()
    },
    actions: [
      { action: 'book', title: '📅 Prenota' },
      { action: 'dismiss', title: 'Ignora' }
    ],
    requireInteraction: true
  };

  console.log('📦 Payload notifica:');
  console.log(`   📌 ${payload.title}`);
  console.log(`   📌 ${payload.body}\n`);

  // Invia
  const subscriptions = await sql`
    SELECT * FROM push_subscriptions
    WHERE user_id = ${testUser.id}
  `;

  console.log(`📡 Invio a ${subscriptions.length} subscription(s)...\n`);

  let sent = 0;
  let errors = 0;

  for (const sub of subscriptions) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth }
        },
        JSON.stringify(payload),
        { TTL: 3600, urgency: 'high' }
      );
      sent++;
      console.log(`   ✅ Inviata (${sent}/${subscriptions.length})`);
    } catch (error) {
      errors++;
      console.log(`   ❌ Errore: ${error.message}`);
      if (error.statusCode === 410) {
        await sql`DELETE FROM push_subscriptions WHERE id = ${sub.id}`;
      }
    }
  }

  console.log('\n');
  console.log('═'.repeat(60));
  console.log(`📊 Risultato: ${sent} inviate, ${errors} errori\n`);

  if (sent > 0) {
    console.log('╔═══════════════════════════════════════════════════════╗');
    console.log('║       🎉 NOTIFICA INVIATA CON SUCCESSO! 🎉           ║');
    console.log('╚═══════════════════════════════════════════════════════╝\n');

    console.log('📱 CONTROLLA IL TUO DISPOSITIVO!\n');
    console.log('   Dovresti ricevere:\n');
    console.log('   📌 "🎉 Posto Disponibile!"');
    console.log(`   📌 "${CONFIG.barberName} è libero il 5 dicembre alle ${CONFIG.slotTime}"`);
    console.log('   📌 Pulsanti: "📅 Prenota" / "Ignora"\n');
    console.log('🔍 Se hai il browser aperto:');
    console.log('   F12 → Console → cerca "[SW-PUSH]"\n');

    return true;
  }

  return false;
}

// ============================================================
// MAIN
// ============================================================
async function runTest() {
  try {
    await waitForEnter('\n🚀 Premi INVIO per iniziare il test...');

    // Step 1
    const cleanup = await step1_Cleanup();
    if (!cleanup) {
      console.log('❌ Test interrotto allo Step 1\n');
      rl.close();
      process.exit(1);
    }

    // Step 2
    const waitlistEntry = await step2_ManualWaitlist();
    if (!waitlistEntry) {
      console.log('❌ Test interrotto allo Step 2\n');
      rl.close();
      process.exit(1);
    }

    // Step 3
    const verified = await step3_VerifyWaitlist(waitlistEntry);
    if (!verified) {
      console.log('❌ Test interrotto allo Step 3\n');
      rl.close();
      process.exit(1);
    }

    // Step 4
    const freed = await step4_FreeSlot();
    if (!freed) {
      console.log('❌ Test interrotto allo Step 4\n');
      rl.close();
      process.exit(1);
    }

    // Step 5
    const sent = await step5_SendNotification();

    console.log('\n╔═══════════════════════════════════════════════════════╗');
    if (sent) {
      console.log('║            🎉 TEST COMPLETATO! 🎉                     ║');
    } else {
      console.log('║         ⚠️  TEST COMPLETATO CON ERRORI ⚠️             ║');
    }
    console.log('╚═══════════════════════════════════════════════════════╝\n');

    rl.close();
    process.exit(sent ? 0 : 1);

  } catch (error) {
    console.error('\n❌ ERRORE:', error);
    rl.close();
    process.exit(1);
  }
}

runTest();
