// Test notifiche dopo aggiornamento chiavi Vercel
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function testNotifications() {
  console.log('🧪 === TEST NOTIFICHE POST-UPDATE VERCEL ===\n');

  try {
    // 1. Verifica subscriptions esistenti
    const subscriptions = await sql`
      SELECT ps.*, u.email 
      FROM push_subscriptions ps
      JOIN users u ON ps.user_id = u.id
      WHERE u.email = 'fabiocassano.fc@gmail.com'
      ORDER BY ps.created_at DESC
    `;

    console.log(`📱 Subscription di Fabio: ${subscriptions.length}\n`);

    if (subscriptions.length === 0) {
      console.log('❌ Nessuna subscription trovata!');
      return;
    }

    // 2. Test invio notifica via API
    console.log('📤 Invio notifica di test via API...\n');
    
    const testUrl = 'https://www.maskiobarberconcept.it/api/push/test';
    console.log(`🌐 URL: ${testUrl}`);
    console.log('📝 Verifica i log Vercel per vedere il risultato.\n');
    
    console.log('🎯 ISTRUZIONI:');
    console.log('1. Vai su: https://www.maskiobarberconcept.it/area-personale/profilo');
    console.log('2. Clicca "Test Notifica"');
    console.log('3. Controlla se arriva la notifica sul dispositivo');
    console.log('4. Controlla i log Vercel Runtime');
    console.log('5. Controlla la console del Service Worker nel browser\n');

    console.log('✅ SE FUNZIONA:');
    console.log('   → Le chiavi sono corrette!');
    console.log('   → Le subscription esistenti funzionano!\n');

    console.log('❌ SE NON FUNZIONA:');
    console.log('   → Elimina le subscription esistenti');
    console.log('   → Ri-abilita le notifiche con le nuove chiavi\n');

    // 3. Mostra subscription details per debug
    subscriptions.forEach((sub, i) => {
      const endpoint = sub.endpoint;
      const isApple = endpoint.includes('web.push.apple');
      const isFCM = endpoint.includes('fcm.googleapis');
      const age = ((new Date() - new Date(sub.created_at)) / (1000 * 60 * 60)).toFixed(1);
      
      console.log(`Subscription #${i + 1}:`);
      console.log(`   ID: ${sub.id}`);
      console.log(`   Tipo: ${isApple ? '🍎 iOS/Safari' : isFCM ? '🤖 Android/Chrome' : '❓'}`);
      console.log(`   Età: ${age} ore`);
      console.log(`   Endpoint: ${endpoint.substring(0, 60)}...`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Errore:', error.message);
  }
}

testNotifications();
