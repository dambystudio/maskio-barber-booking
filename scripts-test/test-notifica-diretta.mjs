import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import webpush from 'web-push';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

// Configura VAPID
webpush.setVapidDetails(
  `mailto:${process.env.VAPID_EMAIL}`,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

async function testDirectNotification() {
  console.log('🧪 Test Notifica Diretta\n');

  try {
    // 1. Trova tutte le subscription attive
    console.log('1️⃣ Cerco subscription attive...');
    const subscriptions = await sql`
      SELECT ps.*, u.email
      FROM push_subscriptions ps
      JOIN users u ON ps.user_id = u.id
      ORDER BY ps.created_at DESC
    `;

    console.log(`   Trovate ${subscriptions.length} subscription\n`);

    if (subscriptions.length === 0) {
      console.log('❌ Nessuna subscription trovata nel database');
      return;
    }

    // Mostra tutte le subscription
    console.log('📋 Subscription disponibili:\n');
    subscriptions.forEach((sub, i) => {
      console.log(`   ${i + 1}. ${sub.email}`);
      console.log(`      ID: ${sub.id}`);
      console.log(`      Endpoint: ${sub.endpoint.substring(0, 50)}...`);
      console.log(`      Created: ${sub.created_at}`);
      console.log('');
    });

    // 2. Prepara notifica di test COMPLETA
    const notification = {
      title: '🎉 Test Notifica Diretta!',
      body: 'Questa è una notifica di test inviata direttamente da script. Se la vedi, funziona tutto!',
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      tag: 'test-direct',
      requireInteraction: false, // Importante: non richiedere interazione
      vibrate: [200, 100, 200],
      data: {
        type: 'test-direct',
        url: '/area-personale/profilo',
        timestamp: Date.now()
      }
    };

    console.log('📤 Invio notifica a tutte le subscription...\n');

    // 3. Invia a tutte
    let sent = 0;
    let failed = 0;

    for (const sub of subscriptions) {
      try {
        console.log(`📱 Invio a ${sub.email}...`);
        
        const result = await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth
            }
          },
          JSON.stringify(notification)
        );

        console.log(`   ✅ Inviato! Status: ${result.statusCode}`);
        sent++;
      } catch (error) {
        console.error(`   ❌ Errore:`, error.message);
        console.error(`      Status Code:`, error.statusCode);
        console.error(`      Body:`, error.body);
        failed++;
        
        // Se subscription scaduta, rimuovila
        if (error.statusCode === 410 || error.statusCode === 404) {
          console.log(`   🗑️ Rimuovo subscription scaduta...`);
          await sql`DELETE FROM push_subscriptions WHERE id = ${sub.id}`;
        }
      }
      console.log('');
    }

    console.log('='.repeat(70));
    console.log('📊 RISULTATO FINALE');
    console.log('='.repeat(70));
    console.log(`✅ Notifiche inviate con successo: ${sent}`);
    console.log(`❌ Notifiche fallite: ${failed}`);
    console.log(`📱 Totale: ${sent + failed}\n`);

    if (sent > 0) {
      console.log('🎉 Controlla il tuo dispositivo, dovresti vedere la notifica!');
      console.log('📱 Se non vedi nulla, controlla:');
      console.log('   - Permessi notifiche nel browser/sistema');
      console.log('   - Service Worker attivo in DevTools');
      console.log('   - Console del Service Worker per errori');
    }

  } catch (error) {
    console.error('❌ Errore:', error);
  }
}

testDirectNotification();
