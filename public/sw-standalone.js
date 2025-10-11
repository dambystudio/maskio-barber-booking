// Service Worker SEMPLIFICATO per Push Notifications
// NO Workbox, NO next-pwa - SOLO push handlers

console.log('[SW] 🚀 Service Worker inizializzato');

// Versione del SW per forzare l'aggiornamento
const SW_VERSION = 'v1.0.1';
const CACHE_NAME = `maskio-cache-${SW_VERSION}`;

// Install event
self.addEventListener('install', (event) => {
  console.log(`[SW] Install ${SW_VERSION}`);
  self.skipWaiting(); // Attiva immediatamente
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log(`[SW] Activate ${SW_VERSION}`);
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => {
      console.log('[SW] Claiming clients');
      return self.clients.claim();
    })
  );
});

// ===== PUSH NOTIFICATION HANDLERS =====

console.log('[SW] 🔔 Registering push event listener...');

self.addEventListener('push', function(event) {
  console.log('🚨 [PUSH EVENT RECEIVED]', event);
  console.log('🚨 [PUSH] Has data?', event.data !== null);
  
  let notificationData = {
    title: '🔔 Maskio Barber Concept',
    body: 'Hai una nuova notifica',
    icon: '/icone/predefinita/192x192.png',
    badge: '/icone/predefinita/32x32.png',
    tag: 'maskio-notification',
    requireInteraction: false,
    data: {
      url: '/area-personale',
      timestamp: Date.now()
    }
  };

  // Parse payload
  if (event.data) {
    try {
      const payload = event.data.json();
      console.log('📦 [PUSH] Payload JSON:', payload);
      notificationData = {
        title: payload.title || notificationData.title,
        body: payload.body || notificationData.body,
        icon: payload.icon || notificationData.icon,
        badge: payload.badge || notificationData.badge,
        tag: payload.tag || notificationData.tag,
        requireInteraction: payload.requireInteraction || false,
        data: payload.data || notificationData.data,
        actions: payload.actions || []
      };
    } catch (error) {
      console.error('❌ [PUSH] Error parsing JSON:', error);
      try {
        const text = event.data.text();
        console.log('📦 [PUSH] Payload text:', text);
        notificationData.body = text;
      } catch (e) {
        console.error('❌ [PUSH] Could not read as text:', e);
      }
    }
  } else {
    console.warn('⚠️ [PUSH] No data in event');
  }

  console.log('📱 [PUSH] Showing notification:', notificationData);

  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      requireInteraction: notificationData.requireInteraction,
      data: notificationData.data,
      actions: notificationData.actions || [],
      silent: false,
      renotify: true,
      vibrate: [200, 100, 200]
    }).then(() => {
      console.log('✅ [PUSH] Notification shown successfully!');
    }).catch((error) => {
      console.error('❌ [PUSH] Error showing notification:', error);
    })
  );
});

console.log('[SW] ✅ Push event listener registered');

// Notification click
self.addEventListener('notificationclick', function(event) {
  console.log('👆 [NOTIFICATION CLICK]', event.action);
  
  event.notification.close();
  
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      // Cerca finestra già aperta
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // Apri nuova finestra
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Notification close
self.addEventListener('notificationclose', function(event) {
  console.log('❌ [NOTIFICATION] Closed:', event.notification.tag);
});

// Message handler
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[SW] SKIP_WAITING requested');
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    console.log('[SW] CLEAR_CACHE requested');
    event.waitUntil(
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      }).then(() => {
        console.log('[SW] All caches cleared ✅');
        if (event.ports && event.ports[0]) {
          event.ports[0].postMessage({ success: true });
        }
      })
    );
  }
});

// Fetch handler (passthrough - no caching)
self.addEventListener('fetch', (event) => {
  // Passthrough - non facciamo caching per ora
  event.respondWith(fetch(event.request));
});

console.log('[SW] ✅ All event listeners registered');
