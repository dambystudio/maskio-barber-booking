// TEST PUSH EVENT DIRETTO NEL SERVICE WORKER
// Da eseguire nella Console del browser

(async function testPushDirect() {
  console.log('🧪 === TEST PUSH EVENT DIRETTO ===\n');
  
  try {
    // 1. Verifica Service Worker
    const registration = await navigator.serviceWorker.ready;
    console.log('✅ Service Worker ready:', registration.active?.state);
    
    if (!registration.active) {
      console.error('❌ Nessun Service Worker attivo!');
      return;
    }
    
    // 2. Verifica subscription
    const subscription = await registration.pushManager.getSubscription();
    console.log('✅ Subscription:', subscription ? 'presente' : 'assente');
    
    if (!subscription) {
      console.error('❌ Nessuna subscription! Attiva prima le notifiche.');
      return;
    }
    
    console.log('📱 Endpoint:', subscription.endpoint.substring(0, 60) + '...\n');
    
    // 3. Test locale - mostra notifica direttamente
    console.log('🧪 Test 1: Notifica locale dal SW...');
    try {
      await registration.showNotification('🧪 Test Locale SW', {
        body: 'Questa è una notifica di test diretta dal Service Worker',
        icon: '/icone/predefinita/192x192.png',
        tag: 'test-local',
        requireInteraction: false,
      });
      console.log('✅ Test 1 OK: Notifica locale mostrata!\n');
    } catch (e) {
      console.error('❌ Test 1 FAIL:', e.message, '\n');
    }
    
    // 4. Test API - invia tramite server
    console.log('🧪 Test 2: Notifica via API server...');
    try {
      const response = await fetch('/api/push/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const result = await response.json();
      console.log('✅ Test 2 Response:', result);
      
      if (result.success) {
        console.log('✅ Server ha inviato la notifica');
        console.log('⏳ Aspetta 2-3 secondi...');
        console.log('⏳ Se NON appare la notifica, il problema è nel Service Worker\n');
        
        // Aspetta e controlla
        setTimeout(() => {
          console.log('🔍 Controlla se hai ricevuto la notifica.');
          console.log('📊 Se NO, apri DevTools → Application → Service Workers');
          console.log('📊 E controlla i log del Service Worker per errori.');
        }, 3000);
      } else {
        console.error('❌ Server error:', result.error);
      }
    } catch (e) {
      console.error('❌ Test 2 FAIL:', e.message);
    }
    
  } catch (error) {
    console.error('❌ Errore generale:', error);
  }
})();

console.log('\n💡 TIP: Controlla anche i log del Service Worker:');
console.log('   DevTools → Application → Service Workers → Click sul SW → Guarda Console');
