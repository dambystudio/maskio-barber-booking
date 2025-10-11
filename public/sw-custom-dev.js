// Custom Service Worker for Development
// This wraps the Next.js generated sw.js and adds push notification support

console.log('🔧 [SW-Custom] Loading custom service worker...');

// Import the generated sw.js
importScripts('/sw-generated.js');

// Import push notification handlers
importScripts('/sw-push-handlers.js');

// Message handler for dynamic push handler loading
self.addEventListener('message', (event) => {
  console.log('📨 [SW-Custom] Message received:', event.data);
  
  if (event.data && event.data.type === 'LOAD_PUSH_HANDLERS') {
    console.log('🔔 [SW-Custom] Loading push handlers...');
    try {
      importScripts('/sw-push-handlers.js');
      console.log('✅ [SW-Custom] Push handlers loaded!');
    } catch (error) {
      console.error('❌ [SW-Custom] Failed to load push handlers:', error);
    }
  }
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('⏭️ [SW-Custom] Skipping waiting...');
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    console.log('🧹 [SW-Custom] Clearing all caches...');
    event.waitUntil(
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            console.log('🗑️ [SW-Custom] Deleting cache:', cacheName);
            return caches.delete(cacheName);
          })
        );
      }).then(() => {
        console.log('✅ [SW-Custom] All caches cleared!');
      })
    );
  }
});

// Activate handler
self.addEventListener('activate', (event) => {
  console.log('🚀 [SW-Custom] Service Worker activated!');
  event.waitUntil(
    clients.claim().then(() => {
      console.log('✅ [SW-Custom] Claimed all clients');
    })
  );
});

console.log('✅ [SW-Custom] Custom service worker ready!');
