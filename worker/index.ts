// Service Worker personalizzato per gestione aggiornamenti automatici
import { clientsClaim } from 'workbox-core';
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';

// Forza il controllo immediato
clientsClaim();

// Pulisci le cache obsolete
cleanupOutdatedCaches();

// Precache delle risorse critiche
precacheAndRoute(self.__WB_MANIFEST);

// Gestione messaggi dal client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Gestione installazione
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installazione completata');
  // Forza l'attivazione immediata
  self.skipWaiting();
});

// Gestione attivazione
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Attivazione completata');
  // Prendi il controllo di tutte le pagine aperte
  event.waitUntil(self.clients.claim());
});

// Gestione fetch con strategia intelligente
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Strategia per le API: Network-First
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache la risposta per 5 minuti
          const responseClone = response.clone();
          caches.open('api-cache').then((cache) => {
            cache.put(request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // Fallback alla cache se la rete fallisce
          return caches.match(request);
        })
    );
    return;
  }

  // Strategia per risorse statiche: Cache-First
  if (request.destination === 'script' || 
      request.destination === 'style' || 
      request.destination === 'image') {
    event.respondWith(
      caches.match(request)
        .then((response) => {
          if (response) {
            return response;
          }
          return fetch(request).then((response) => {
            const responseClone = response.clone();
            caches.open('static-resources').then((cache) => {
              cache.put(request, responseClone);
            });
            return response;
          });
        })
    );
    return;
  }

  // Strategia per le pagine: Stale-While-Revalidate
  if (request.mode === 'navigate') {
    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          const fetchPromise = fetch(request)
            .then((networkResponse) => {
              const responseClone = networkResponse.clone();
              caches.open('pages-cache').then((cache) => {
                cache.put(request, responseClone);
              });
              return networkResponse;
            })
            .catch(() => cachedResponse);
          
          return cachedResponse || fetchPromise;
        })
    );
    return;
  }
});

// Gestione sync in background (per aggiornamenti automatici)
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Controlla aggiornamenti in background
      self.registration.update()
    );
  }
});

// Gestione push notifications (per notifiche di aggiornamento)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body || 'Nuovo aggiornamento disponibile',
      icon: '/icone/predefinita/192x192.png',
      badge: '/icone/predefinita/32x32.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: '1'
      },
      actions: [
        {
          action: 'update',
          title: 'Aggiorna ora',
          icon: '/icone/predefinita/32x32.png'
        }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'Maskio Barber', options)
    );
  }
});

// Gestione click sulle notifiche
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'update') {
    // Forza l'aggiornamento
    self.skipWaiting();
    event.waitUntil(
      self.clients.claim().then(() => {
        // Ricarica tutte le pagine aperte
        return self.clients.matchAll().then((clients) => {
          clients.forEach((client) => {
            client.postMessage({ type: 'FORCE_RELOAD' });
          });
        });
      })
    );
  } else {
    // Apri l'app
    event.waitUntil(
      self.clients.openWindow('/')
    );
  }
}); 