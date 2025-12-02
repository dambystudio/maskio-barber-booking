// Script per forzare la pulizia della cache Service Worker
// Da eseguire nella console del browser mobile

(async function() {
  console.log('🧹 Inizio pulizia cache...');
  
  try {
    // 1. Elimina tutte le cache
    const cacheNames = await caches.keys();
    console.log(`📦 Cache trovate: ${cacheNames.length}`);
    
    for (const name of cacheNames) {
      await caches.delete(name);
      console.log(`✅ Cache eliminata: ${name}`);
    }
    
    // 2. Disregistra tutti i Service Worker
    const registrations = await navigator.serviceWorker.getRegistrations();
    console.log(`🔧 Service Worker registrati: ${registrations.length}`);
    
    for (const registration of registrations) {
      await registration.unregister();
      console.log(`✅ SW disregistrato: ${registration.scope}`);
    }
    
    console.log('✅ Pulizia completata!');
    console.log('🔄 Ricarico la pagina tra 2 secondi...');
    
    setTimeout(() => {
      window.location.reload();
    }, 2000);
    
  } catch (error) {
    console.error('❌ Errore durante pulizia:', error);
  }
})();
