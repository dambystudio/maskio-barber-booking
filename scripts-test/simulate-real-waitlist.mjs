import { neon } from '@neondatabase/serverless';
import webpush from 'web-push';
import { config } from 'dotenv';
import { readFileSync } from 'fs';

// Carica .env.local
config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

// Configura VAPID
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

if (!vapidPublicKey || !vapidPrivateKey) {
  console.error('❌ VAPID keys mancanti nel .env.local');
  process.exit(1);
}

webpush.setVapidDetails(
  'mailto:davide431@outlook.it',
  vapidPublicKey,
  vapidPrivateKey
);

async function simulateRealScenario() {
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║   🎬 SIMULAZIONE SCENARIO REALE - WAITLIST NOTIFICA   ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');
  
  console.log('📋 SCENARIO:');
  console.log('   1. Tu sei in lista d\'attesa per Michele - 5 Dicembre');
  console.log('   2. Tutti gli slot sono occupati');
  console.log('   3. Un cliente cancella (io simulo la cancellazione)');
  console.log('   4. Il sistema rileva lo slot libero');
  console.log('   5. Ti invia automaticamente la notifica push\n');
  
  console.log('═'.repeat(60));
  
  // STEP 1: Verifica situazione attuale
  console.log('\n📊 STEP 1: Verifico situazione attuale\n');
  
  const [testUser] = await sql`
    SELECT id, email, name FROM users WHERE email = 'test@gmail.com'
  `;
  
  console.log(`👤 Utente in attesa: ${testUser.name} (${testUser.email})`);
  
  const [waitlistEntry] = await sql`
    SELECT * FROM waitlist
    WHERE user_id = ${testUser.id}
      AND barber_id = 'michele'
      AND date = '2025-12-05'
      AND status = 'waiting'
    ORDER BY position
    LIMIT 1
  `;
  
  if (!waitlistEntry) {
    console.log('❌ Non sei in lista d\'attesa!\n');
    return;
  }
  
  console.log(`✅ In lista d'attesa - Posizione: ${waitlistEntry.position}`);
  console.log(`   Status: ${waitlistEntry.status}\n`);
  
  // STEP 2: Verifica push subscription
  const subscriptions = await sql`
    SELECT * FROM push_subscriptions
    WHERE user_id = ${testUser.id}
    ORDER BY created_at DESC
  `;
  
  console.log(`📱 Push Subscriptions attive: ${subscriptions.length}`);
  
  if (subscriptions.length === 0) {
    console.log('❌ Nessuna subscription attiva!\n');
    return;
  }
  
  console.log(`✅ Prima subscription: ${subscriptions[0].endpoint.substring(0, 50)}...\n`);
  
  // STEP 3: Simula cancellazione booking
  console.log('═'.repeat(60));
  console.log('\n🗑️  STEP 2: Cliente cancella prenotazione slot 10:00\n');
  
  const [booking] = await sql`
    SELECT id, customer_name, time FROM bookings
    WHERE barber_id = 'michele'
      AND date = '2025-12-05'
      AND time = '10:00'
      AND status = 'confirmed'
    LIMIT 1
  `;
  
  if (booking) {
    console.log(`📅 Trovato booking: ${booking.customer_name} - ${booking.time}`);
    console.log('🗑️  Cancello il booking...');
    
    await sql`
      UPDATE bookings
      SET status = 'cancelled',
          notes = CONCAT(COALESCE(notes, ''), ' - [CANCELLATO - Simulazione waitlist]'),
          updated_at = NOW()
      WHERE id = ${booking.id}
    `;
    
    console.log('✅ Booking cancellato!\n');
  } else {
    console.log('⚠️  Booking già cancellato o non trovato\n');
  }
  
  // STEP 4: Sistema rileva slot libero
  console.log('═'.repeat(60));
  console.log('\n🔍 STEP 3: Sistema rileva slot libero\n');
  console.log('   Cerco utenti in lista per michele - 2025-12-05...');
  
  const waitingUsers = await sql`
    SELECT 
      w.*,
      u.email
    FROM waitlist w
    JOIN users u ON w.user_id = u.id
    WHERE w.barber_id = 'michele'
      AND w.date = '2025-12-05'
      AND w.status = 'waiting'
    ORDER BY w.position, w.created_at
    LIMIT 1
  `;
  
  if (waitingUsers.length === 0) {
    console.log('❌ Nessun utente in attesa!\n');
    return;
  }
  
  const userToNotify = waitingUsers[0];
  console.log(`✅ Trovato utente: ${userToNotify.customer_name} (pos: ${userToNotify.position})`);
  console.log(`   Email: ${userToNotify.email}\n`);
  
  // STEP 5: Aggiorna waitlist con offerta
  console.log('💾 Creo offerta con scadenza 15 minuti...');
  
  const offerExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
  
  await sql`
    UPDATE waitlist
    SET status = 'offered',
        offered_time = '10:00',
        offer_expires_at = ${offerExpiresAt.toISOString()},
        updated_at = NOW()
    WHERE id = ${userToNotify.id}
  `;
  
  console.log(`✅ Offerta creata (scade: ${offerExpiresAt.toLocaleTimeString('it-IT')})\n`);
  
  // STEP 6: Invia notifica push
  console.log('═'.repeat(60));
  console.log('\n📤 STEP 4: Invio notifica push\n');
  
  const payload = {
    title: '🎉 Posto Disponibile!',
    body: `Michele è libero il 5 dicembre alle 10:00. Prenota entro 15 minuti!`,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: `waitlist-${userToNotify.id}`,
    data: {
      url: '/prenota?barber=michele&date=2025-12-05&time=10:00',
      type: 'waitlist_slot_available',
      waitlistId: userToNotify.id,
      barberId: 'michele',
      date: '2025-12-05',
      time: '10:00',
      expiresAt: offerExpiresAt.toISOString()
    },
    actions: [
      { action: 'book', title: '📅 Prenota' },
      { action: 'dismiss', title: 'Ignora' }
    ],
    requireInteraction: true
  };
  
  console.log('📦 Payload notifica:');
  console.log(`   Titolo: ${payload.title}`);
  console.log(`   Testo: ${payload.body}`);
  console.log(`   Azioni: "📅 Prenota" / "Ignora"\n`);
  
  console.log('📡 Invio a tutte le subscription attive...\n');
  
  let sentCount = 0;
  let errorCount = 0;
  const errors = [];
  
  for (let i = 0; i < subscriptions.length; i++) {
    const sub = subscriptions[i];
    
    try {
      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth
        }
      };
      
      await webpush.sendNotification(
        pushSubscription, 
        JSON.stringify(payload),
        {
          TTL: 3600,
          urgency: 'high'
        }
      );
      
      console.log(`   ✅ [${i + 1}/${subscriptions.length}] Inviata`);
      sentCount++;
      
    } catch (error) {
      console.log(`   ❌ [${i + 1}/${subscriptions.length}] Errore: ${error.message}`);
      errorCount++;
      errors.push({ index: i + 1, error: error.message, statusCode: error.statusCode });
      
      // Rimuovi subscription scadute
      if (error.statusCode === 410) {
        await sql`DELETE FROM push_subscriptions WHERE id = ${sub.id}`;
        console.log(`      🗑️  Subscription scaduta rimossa`);
      }
    }
  }
  
  console.log('\n');
  console.log('═'.repeat(60));
  console.log('\n📊 RISULTATO FINALE:\n');
  console.log(`   ✅ Inviate con successo: ${sentCount}`);
  console.log(`   ❌ Errori: ${errorCount}\n`);
  
  if (sentCount > 0) {
    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║       🎉 NOTIFICA INVIATA CON SUCCESSO! 🎉            ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');
    
    console.log('📱 CONTROLLA IL TUO DISPOSITIVO ADESSO!\n');
    console.log('   Dovresti ricevere una notifica push:\n');
    console.log('   📌 Titolo: "🎉 Posto Disponibile!"');
    console.log('   📌 Testo: "Michele è libero il 5 dicembre alle 10:00"');
    console.log('   📌 Sottotesto: "Prenota entro 15 minuti!"');
    console.log('   📌 Azioni: Pulsante "📅 Prenota" e "Ignora"\n');
    console.log('   🔔 La notifica richiede interazione (non scompare da sola)\n');
    
    console.log('🔍 Se hai il browser aperto, controlla anche la Console:');
    console.log('   F12 → Console → cerca "[SW-PUSH]"');
    console.log('   Dovresti vedere: "🚨 [SW-PUSH] PUSH EVENT RICEVUTO!"\n');
    
    console.log('⏰ IMPORTANTE:');
    console.log(`   L'offerta scade alle: ${offerExpiresAt.toLocaleTimeString('it-IT')}`);
    console.log(`   Hai 15 minuti per prenotare!\n`);
    
  } else {
    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║        ⚠️  NESSUNA NOTIFICA INVIATA ⚠️                 ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');
    
    console.log('❌ Tutte le subscription hanno fallito\n');
    console.log('🔍 Errori riscontrati:');
    errors.forEach(e => {
      console.log(`   [${e.index}] ${e.error} (Status: ${e.statusCode || 'N/A'})`);
    });
    console.log('\n💡 Possibili cause:');
    console.log('   - Subscription scadute (riavvia browser e ricrea)');
    console.log('   - Permessi notifiche revocati');
    console.log('   - Service Worker non attivo\n');
  }
  
  console.log('═'.repeat(60));
  console.log('\n✅ Simulazione completata!\n');
}

simulateRealScenario().catch(error => {
  console.error('\n❌ ERRORE FATALE:', error);
  process.exit(1);
});
