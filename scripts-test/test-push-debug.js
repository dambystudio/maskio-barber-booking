// Test manuale per verificare se il Service Worker riceve eventi push
// Copia e incolla questo nella Console del Browser (F12)

(async function testPushHandling() {
  console.log('🧪 === TEST PUSH NOTIFICATION ===\n');
  
  // 1. Verifica Service Worker
  if (!('serviceWorker' in navigator)) {
    console.error('❌ Service Worker non supportato');
    return;
  }
  
  const registration = await navigator.serviceWorker.ready;
  console.log('✅ Service Worker ready');
  console.log('   Scope:', registration.scope);
  console.log('   Active:', registration.active?.state);
  
  // 2. Verifica Push API
  if (!('PushManager' in window)) {
    console.error('❌ Push API non supportata');
    return;
  }
  console.log('✅ Push API supportata');
  
  // 3. Verifica permessi
  const permission = Notification.permission;
  console.log('🔒 Permesso notifiche:', permission);
  
  if (permission !== 'granted') {
    console.error('❌ Permesso notifiche non concesso!');
    console.log('   Vai su Impostazioni browser → Notifiche → Consenti per questo sito');
    return;
  }
  console.log('✅ Permesso notifiche concesso');
  
  // 4. Verifica subscription
  const subscription = await registration.pushManager.getSubscription();
  
  if (!subscription) {
    console.error('❌ Nessuna subscription trovata!');
    console.log('   Devi prima attivare le notifiche sul sito');
    return;
  }
  
  console.log('✅ Subscription trovata');
  console.log('   Endpoint:', subscription.endpoint.substring(0, 70) + '...');
  console.log('   Keys:', {
    p256dh: subscription.toJSON().keys.p256dh.substring(0, 20) + '...',
    auth: subscription.toJSON().keys.auth.substring(0, 20) + '...'
  });
  
  // 5. Test notifica locale (dal Service Worker stesso)
  console.log('\n📤 Test 1: Notifica locale dal Service Worker...');
  
  try {
    await registration.showNotification('🧪 Test Locale', {
      body: 'Questa è una notifica di test locale (non viene da server)',
      icon: '/icone/predefinita/192x192.png',
      badge: '/icone/predefinita/32x32.png',
      tag: 'test-local',
      requireInteraction: false,
      data: { test: true }
    });
    console.log('✅ Test 1 OK: Notifica locale mostrata!');
  } catch (error) {
    console.error('❌ Test 1 FAILED:', error);
  }
  
  // 6. Test notifica via API server
  console.log('\n📤 Test 2: Notifica via API server...');
  console.log('   Invio richiesta a /api/push/test...');
  
  try {
    const response = await fetch('/api/push/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    const data = await response.json();
    console.log('📡 Risposta server:', data);
    
    if (data.success) {
      console.log('✅ Test 2 OK: Server ha inviato la notifica');
      console.log('   Aspetta 5-10 secondi per vedere se arriva...');
      console.log('\n⏳ Se non arriva, il problema è nella ricezione push event');
    } else {
      console.error('❌ Test 2 FAILED:', data.error);
    }
  } catch (error) {
    console.error('❌ Test 2 ERROR:', error);
  }
  
  console.log('\n\n📋 COME DEBUGGARE:');
  console.log('1. Apri DevTools (F12)');
  console.log('2. Vai su Application → Service Workers');
  console.log('3. Guarda i log del Service Worker');
  console.log('4. Se vedi "🚨 [Push Event] Received!" → SW riceve l\'evento');
  console.log('5. Se NON lo vedi → problema con VAPID keys o subscription');
  console.log('\n6. Controlla anche i Runtime Logs di Vercel');
  console.log('7. Cerca errori tipo "410 Gone" o "401 Unauthorized"');
  
})();
