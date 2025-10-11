import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function debugPushSubscriptions() {
  console.log('🔍 DEBUG SOTTOSCRIZIONI PUSH\n');

  try {
    // 1. Controlla tutte le subscriptions per il tuo account
    const userEmail = 'davide431@outlook.it'; // Modifica con la tua email
    
    const user = await sql`
      SELECT id, email, name FROM users WHERE email = ${userEmail}
    `;

    if (user.length === 0) {
      console.log('❌ Utente non trovato');
      return;
    }

    console.log(`👤 Utente trovato: ${user[0].name} (${user[0].email})`);
    console.log(`   ID: ${user[0].id}\n`);

    // 2. Trova tutte le subscriptions
    const subscriptions = await sql`
      SELECT * FROM push_subscriptions 
      WHERE user_id = ${user[0].id}
      ORDER BY created_at DESC
    `;

    console.log(`📱 Sottoscrizioni trovate: ${subscriptions.length}\n`);

    subscriptions.forEach((sub, i) => {
      console.log(`${i + 1}. Subscription ID: ${sub.id}`);
      console.log(`   Endpoint: ${sub.endpoint.substring(0, 60)}...`);
      console.log(`   Tipo: ${sub.endpoint.includes('apple') ? 'Apple Push' : sub.endpoint.includes('fcm') ? 'Firebase (Chrome/Android)' : 'Altro'}`);
      console.log(`   Creata: ${sub.created_at}`);
      console.log(`   p256dh: ${sub.p256dh ? sub.p256dh.substring(0, 20) + '...' : 'N/A'}`);
      console.log(`   auth: ${sub.auth ? sub.auth.substring(0, 20) + '...' : 'N/A'}`);
      console.log('');
    });

    // 3. Controlla se ci sono subscriptions duplicate o vecchie
    const appleSubscriptions = subscriptions.filter(s => s.endpoint.includes('apple'));
    const fcmSubscriptions = subscriptions.filter(s => s.endpoint.includes('fcm'));

    if (appleSubscriptions.length > 1) {
      console.log(`⚠️ ATTENZIONE: Trovate ${appleSubscriptions.length} subscriptions Apple Push!`);
      console.log('   Potrebbe causare conflitti. Rimuoviamo quelle vecchie?\n');
      
      // Tieni solo la più recente
      const toDelete = appleSubscriptions.slice(1);
      console.log(`🗑️ Rimuovo ${toDelete.length} subscription vecchie...`);
      
      for (const sub of toDelete) {
        await sql`DELETE FROM push_subscriptions WHERE id = ${sub.id}`;
        console.log(`   ✅ Rimossa: ${sub.id} (${sub.created_at})`);
      }
    }

    if (fcmSubscriptions.length > 1) {
      console.log(`⚠️ ATTENZIONE: Trovate ${fcmSubscriptions.length} subscriptions FCM!`);
      console.log('   Potrebbe causare conflitti. Rimuoviamo quelle vecchie?\n');
      
      const toDelete = fcmSubscriptions.slice(1);
      console.log(`🗑️ Rimuovo ${toDelete.length} subscription vecchie...`);
      
      for (const sub of toDelete) {
        await sql`DELETE FROM push_subscriptions WHERE id = ${sub.id}`;
        console.log(`   ✅ Rimossa: ${sub.id} (${sub.created_at})`);
      }
    }

    // 4. Verifica finale
    const finalSubs = await sql`
      SELECT * FROM push_subscriptions 
      WHERE user_id = ${user[0].id}
      ORDER BY created_at DESC
    `;

    console.log(`\n✅ Sottoscrizioni attive finali: ${finalSubs.length}`);
    finalSubs.forEach((sub, i) => {
      const tipo = sub.endpoint.includes('apple') ? '🍎 Apple' : sub.endpoint.includes('fcm') ? '🤖 FCM' : '❓ Altro';
      console.log(`   ${i + 1}. ${tipo} - ${sub.created_at}`);
    });

    console.log('\n💡 RACCOMANDAZIONI:');
    console.log('   1. Sul telefono, vai su /debug-push');
    console.log('   2. Clicca "🔍 Controlla Ambiente"');
    console.log('   3. Se vedi "Subscription esistente", va bene');
    console.log('   4. Se non vedi niente, clicca "🔔 Abilita Notifiche" di nuovo');
    console.log('   5. Poi prova "🧪 Test Notifica Server"');
    console.log('   6. Se ancora non funziona:');
    console.log('      - Chiudi completamente la PWA (swipe up per chiudere)');
    console.log('      - Riapri la PWA');
    console.log('      - Vai su /debug-push');
    console.log('      - Riprova il test');

    console.log('\n🔧 DEBUG TECNICO:');
    console.log('   - Service Worker: Controlla che sia attivo');
    console.log('   - Browser: Safari richiede iOS 16.4+');
    console.log('   - Permessi: Devono essere "granted"');
    console.log('   - VAPID: Devono corrispondere tra client e server');

  } catch (error) {
    console.error('❌ Errore:', error);
  }
}

debugPushSubscriptions();
