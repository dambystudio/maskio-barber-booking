// Push Notification Handlers per Maskio Barber
console.log('🔔 [SW-PUSH] Loading push notification handlers...');

// Handler per eventi push
self.addEventListener('push', function(event) {
  console.log('🚨 [SW-PUSH] PUSH EVENT RICEVUTO!', event);
  console.log('📦 [SW-PUSH] Data presente:', !!event.data);
  
  let notificationData = {
    title: '🔔 Maskio Barber',
    body: 'Hai una nuova notifica',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    data: {
      url: '/'
    }
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      console.log('📦 [SW-PUSH] Payload ricevuto:', payload);
      notificationData = {
        ...notificationData,
        ...payload
      };
    } catch (e) {
      console.error('❌ [SW-PUSH] Errore parsing payload:', e);
    }
  }

  console.log('🔔 [SW-PUSH] Mostrando notifica:', notificationData.title);
  
  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      data: notificationData.data,
      requireInteraction: true,
      tag: 'maskio-notification',
      vibrate: [200, 100, 200]
    }).then(() => {
      console.log('✅ [SW-PUSH] Notifica mostrata con successo!');
    }).catch((error) => {
      console.error('❌ [SW-PUSH] Errore mostrando notifica:', error);
    })
  );
});

// Handler per click su notifica
self.addEventListener('notificationclick', function(event) {
  console.log('👆 [SW-PUSH] Click su notifica:', event.notification.tag);
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';
  console.log('🔗 [SW-PUSH] URL da aprire:', urlToOpen);
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(function(clientList) {
        console.log('🔍 [SW-PUSH] Client aperti:', clientList.length);
        
        // Cerca una finestra già aperta
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            console.log('✅ [SW-PUSH] Focalizzo finestra esistente');
            return client.focus().then(function() {
              if ('navigate' in client) {
                return client.navigate(urlToOpen);
              }
            });
          }
        }
        
        // Altrimenti apri nuova finestra
        console.log('🆕 [SW-PUSH] Apro nuova finestra');
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

console.log('✅ [SW-PUSH] Push notification handlers registrati!');
