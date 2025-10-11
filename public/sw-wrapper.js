// Service Worker Wrapper with Push Handlers
// This adds push notification support to the service worker

console.log('� [SW-Wrapper] Loading service worker wrapper...');

// Load push notification handlers
console.log('🔔 [SW-Wrapper] Importing push handlers...');
try {
  self.importScripts('/sw-push-handlers.js');
  console.log('✅ [SW-Wrapper] Push handlers imported');
} catch (error) {
  console.error('❌ [SW-Wrapper] Failed to import push handlers:', error);
}

// Basic caching strategy for development
console.log('📦 [SW-Wrapper] Setting up basic caching...');

// Install event
self.addEventListener('install', (event) => {
  console.log('⚙️ [SW-Wrapper] Installing...');
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('🚀 [SW-Wrapper] Activating...');
  event.waitUntil(
    clients.claim().then(() => {
      console.log('✅ [SW-Wrapper] Claimed all clients');
    })
  );
});

// Fetch event - pass through (no caching in dev)
self.addEventListener('fetch', (event) => {
  // Just fetch from network, no caching
  event.respondWith(fetch(event.request));
});

// Additional message handlers
self.addEventListener('message', (event) => {
  console.log('📨 [SW-Wrapper] Message received:', event.data);
  
  if (event.data?.type === 'SKIP_WAITING') {
    console.log('⏭️ [SW-Wrapper] Skipping waiting...');
    self.skipWaiting();
  }
  
  if (event.data?.type === 'CLEAR_CACHE') {
    console.log('🧹 [SW-Wrapper] Clearing all caches...');
    event.waitUntil(
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            console.log('🗑️ [SW-Wrapper] Deleting cache:', cacheName);
            return caches.delete(cacheName);
          })
        );
      })
    );
  }
});

console.log('✅ [SW-Wrapper] Service worker wrapper ready!');
