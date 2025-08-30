// Service Worker per notifiche push - Maskio Barber Concept

console.log('🔔 Service Worker: Caricamento in corso...');

// Importa il service worker di Next.js esistente
importScripts('./workbox-8363d77b.js');

console.log('📦 Workbox caricato');

// === PUSH NOTIFICATIONS HANDLER ===
console.log('🔔 Service Worker: Registrando gestori notifiche push');

// Gestisce la ricezione delle notifiche push
self.addEventListener('push', function(event) {
  console.log('📨 Push event ricevuto:', event);
  
  let notificationData = {
    title: '🔔 Maskio Barber Concept',
    body: 'Hai ricevuto una notifica!',
    icon: '/icone/predefinita/192x192.png',
    badge: '/icone/predefinita/32x32.png',
    data: { 
      timestamp: Date.now(),
      url: 'https://www.maskiobarberconcept.it/area-personale'
    }
  };

  // Parse del payload se presente
  if (event.data) {
    try {
      const payload = event.data.json();
      console.log('📦 Payload notifica:', payload);
      notificationData = { ...notificationData, ...payload };
    } catch (error) {
      console.error('❌ Errore parsing payload:', error);
      notificationData.body = event.data.text() || notificationData.body;
    }
  }

  console.log('🔔 Mostrando notifica:', notificationData);

  // Mostra la notifica
  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      data: notificationData.data,
      actions: notificationData.actions || [],
      requireInteraction: false,
      silent: false,
      tag: 'maskio-notification',
      renotify: true
    })
  );
});

// Gestisce il click sulla notifica
self.addEventListener('notificationclick', function(event) {
  console.log('👆 Click notifica:', event);
  
  event.notification.close();
  
  const targetUrl = event.notification.data?.url || 'https://www.maskiobarberconcept.it/area-personale';
  
  // Apri/porta in focus l'app
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      console.log('🪟 Client trovati:', clientList.length);
      
      // Se c'è già una finestra aperta con il sito, portala in focus
      for (let client of clientList) {
        if (client.url.includes('maskiobarberconcept.it') && 'focus' in client) {
          console.log('🎯 Portando in focus client esistente');
          return client.focus();
        }
      }
      
      // Altrimenti apri una nuova finestra
      if (clients.openWindow) {
        console.log('🆕 Aprendo nuova finestra:', targetUrl);
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// Gestisce la chiusura della notifica
self.addEventListener('notificationclose', function(event) {
  console.log('❌ Notifica chiusa:', event.notification.tag);
});

console.log('✅ Service Worker: Push handlers registrati correttamente');
