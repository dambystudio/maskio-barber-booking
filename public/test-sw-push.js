// Test Service Worker push handlers
console.log('🧪 TEST SERVICE WORKER PUSH HANDLERS\n');

// Simula cosa succede quando arriva una notifica push
const testSWPushHandlers = async () => {
  try {
    if (!('serviceWorker' in navigator)) {
      console.log('❌ Service Worker non supportato');
      return;
    }

    const registration = await navigator.serviceWorker.ready;
    console.log('✅ Service Worker ready:', registration.active?.scriptURL);

    // Verifica se ci sono event listeners per 'push'
    console.log('\n🔍 Verifica handlers nel Service Worker...\n');

    // Ottieni il SW attivo
    const sw = registration.active;
    if (!sw) {
      console.log('❌ Nessun Service Worker attivo');
      return;
    }

    console.log('📋 Service Worker State:', sw.state);
    console.log('📋 Service Worker Script URL:', sw.scriptURL);

    // Prova a inviare un messaggio al SW per verificare se è attivo
    const channel = new MessageChannel();
    
    channel.port1.onmessage = (event) => {
      console.log('✅ Risposta dal SW:', event.data);
    };

    sw.postMessage({ type: 'PING' }, [channel.port2]);

    // Aspetta risposta
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Controlla subscription
    const subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      console.log('❌ Nessuna push subscription');
      return;
    }

    console.log('\n✅ Push subscription attiva:');
    console.log('   Endpoint:', subscription.endpoint.substring(0, 50) + '...');

    // Test: trigger manuale di una push notification (se possibile)
    console.log('\n🧪 Per testare il SW:');
    console.log('   1. Apri DevTools → Application → Service Workers');
    console.log('   2. Clicca "Push" per simulare un push event');
    console.log('   3. Guarda la console per vedere se vengono loggati eventi push\n');

    // Verifica che sw-push-handlers.js sia stato caricato
    console.log('🔍 Verifico se sw-push-handlers.js è accessibile...\n');
    
    try {
      const response = await fetch('/sw-push-handlers.js');
      if (response.ok) {
        const content = await response.text();
        console.log('✅ sw-push-handlers.js trovato (' + content.length + ' bytes)');
        
        if (content.includes('addEventListener')) {
          console.log('✅ File contiene addEventListener');
        } else {
          console.log('⚠️  File NON contiene addEventListener');
        }
        
        if (content.includes('push')) {
          console.log('✅ File contiene handler per "push"');
        } else {
          console.log('⚠️  File NON contiene handler per "push"');
        }
      } else {
        console.log('❌ sw-push-handlers.js non accessibile:', response.status);
      }
    } catch (error) {
      console.log('❌ Errore caricando sw-push-handlers.js:', error.message);
    }

    // Verifica sw.js
    console.log('\n🔍 Verifico se sw.js contiene importScripts...\n');
    
    try {
      const swResponse = await fetch('/sw.js');
      if (swResponse.ok) {
        const swContent = await swResponse.text();
        console.log('✅ sw.js trovato (' + swContent.length + ' bytes)');
        
        if (swContent.includes('importScripts')) {
          const matches = swContent.match(/importScripts\([^)]*\)/g);
          console.log('✅ importScripts trovato:');
          matches.forEach(m => console.log('   -', m));
          
          if (swContent.includes('sw-push-handlers.js')) {
            console.log('✅ sw.js importa sw-push-handlers.js');
          } else {
            console.log('❌ sw.js NON importa sw-push-handlers.js!');
            console.log('   → Questo è il problema! Il SW non carica i push handlers.');
            console.log('   → Esegui: node inject-push-handlers.mjs');
          }
        } else {
          console.log('⚠️  importScripts non trovato in sw.js');
        }
      }
    } catch (error) {
      console.log('❌ Errore caricando sw.js:', error.message);
    }

  } catch (error) {
    console.error('❌ Errore test:', error);
  }
};

// Esegui il test
testSWPushHandlers();
