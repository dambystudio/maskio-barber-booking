import { neon } from '@neondatabase/serverless';
import webpush from 'web-push';
import 'dotenv/config';

const sql = neon(process.env.DATABASE_URL);

// Configura web-push
webpush.setVapidDetails(
  'mailto:davide431@outlook.it',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

async function sendDirectNotification() {
  console.log('📤 INVIO NOTIFICA DIRETTA\n');
  console.log('═'.repeat(60));
  
  // 1. Trova test user
  const [testUser] = await sql`
    SELECT id, email, name FROM users WHERE email = 'test@gmail.com'
  `;
  
  console.log(`\n👤 ${testUser.name} (${testUser.email})\n`);
  
  // 2. Prendi tutte le sue subscription attive
  const subscriptions = await sql`
    SELECT * FROM push_subscriptions
    WHERE user_id = ${testUser.id}
    ORDER BY created_at DESC
  `;
  
  console.log(`📱 Push Subscriptions trovate: ${subscriptions.length}\n`);
  
  if (subscriptions.length === 0) {
    console.log('❌ Nessuna subscription trovata!\n');
    return;
  }
  
  // 3. Prepara payload notifica
  const payload = {
    title: '🎉 Posto Disponibile!',
    body: 'Michele è libero il 5 dicembre alle 10:00. Prenota entro 15 minuti!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: 'waitlist-slot-available',
    data: {
      url: '/prenota?barber=michele&date=2025-12-05&time=10:00',
      type: 'waitlist_slot_available',
      barberId: 'michele',
      date: '2025-12-05',
      time: '10:00'
    },
    actions: [
      { action: 'book', title: '📅 Prenota' },
      { action: 'dismiss', title: 'Ignora' }
    ],
    requireInteraction: true
  };
  
  console.log('📦 Payload notifica:');
  console.log(JSON.stringify(payload, null, 2));
  console.log('\n');
  
  // 4. Invia a tutte le subscription
  console.log('📡 Invio a tutte le subscription...\n');
  
  let sentCount = 0;
  let errorCount = 0;
  
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
      
      await webpush.sendNotification(pushSubscription, JSON.stringify(payload));
      
      console.log(`   ✅ Subscription ${i + 1}/${subscriptions.length} - INVIATA`);
      sentCount++;
      
    } catch (error) {
      console.log(`   ❌ Subscription ${i + 1}/${subscriptions.length} - ERRORE: ${error.message}`);
      errorCount++;
      
      // Se è 410 Gone, la subscription è scaduta
      if (error.statusCode === 410) {
        console.log(`      🗑️  Rimuovo subscription scaduta...`);
        await sql`DELETE FROM push_subscriptions WHERE id = ${sub.id}`;
      }
    }
  }
  
  console.log('\n');
  console.log('═'.repeat(60));
  console.log(`📊 RISULTATO: ${sentCount} inviate, ${errorCount} errori\n`);
  
  if (sentCount > 0) {
    console.log('╔══════════════════════════════════════════════════╗');
    console.log('║      ✅ NOTIFICHE INVIATE CON SUCCESSO! ✅       ║');
    console.log('╚══════════════════════════════════════════════════╝\n');
    
    console.log('📱 CONTROLLA IL TUO DISPOSITIVO!\n');
    console.log('   Dovresti vedere la notifica:\n');
    console.log('   📌 "🎉 Posto Disponibile!"');
    console.log('   📌 "Michele è libero il 5 dicembre alle 10:00"');
    console.log('   📌 Pulsanti: "📅 Prenota" e "Ignora"\n');
    console.log('🔍 Controlla anche il Browser (F12 → Console):\n');
    console.log('   Cerca: "[SW-PUSH] PUSH EVENT RICEVUTO!"\n');
    
    // Aggiorna waitlist
    await sql`
      UPDATE waitlist
      SET status = 'offered',
          offered_time = '10:00',
          offer_expires_at = NOW() + INTERVAL '15 minutes',
          updated_at = NOW()
      WHERE user_id = ${testUser.id}
        AND barber_id = 'michele'
        AND date = '2025-12-05'
        AND status = 'waiting'
    `;
    
    console.log('✅ Waitlist aggiornata con offerta (scade tra 15 min)\n');
    
  } else {
    console.log('❌ Nessuna notifica inviata con successo\n');
  }
}

sendDirectNotification().catch(console.error);
