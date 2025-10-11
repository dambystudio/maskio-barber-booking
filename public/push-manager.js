// Push notification manager - gestisce registrazione e mantenimento subscription
class PushNotificationManager {
  constructor() {
    this.swRegistration = null;
    this.isInitialized = false;
    this.checkInterval = null;
  }

  async initialize() {
    if (this.isInitialized) {
      console.log('[PushManager] Già inizializzato');
      return;
    }

    console.log('[PushManager] Inizializzazione...');

    if (!('serviceWorker' in navigator)) {
      console.error('[PushManager] Service Worker non supportato');
      return;
    }

    if (!('PushManager' in window)) {
      console.error('[PushManager] Push API non supportata');
      return;
    }

    try {
      // Aspetta che il SW sia pronto con timeout
      console.log('[PushManager] Attendo Service Worker ready...');
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('SW timeout')), 10000)
      );
      
      this.swRegistration = await Promise.race([
        navigator.serviceWorker.ready,
        timeoutPromise
      ]);
      
      console.log('[PushManager] ✅ Service Worker ready');
      console.log('[PushManager] SW scope:', this.swRegistration.scope);
      console.log('[PushManager] SW active:', this.swRegistration.active?.state);

      // Verifica che il SW sia effettivamente attivo
      if (!this.swRegistration.active) {
        console.warn('[PushManager] ⚠️ SW non ancora attivo, attendo...');
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Verifica subscription esistente
      await this.checkSubscription();

      // Imposta controllo periodico
      this.startPeriodicCheck();

      this.isInitialized = true;
      console.log('[PushManager] ✅ Inizializzato');

    } catch (error) {
      console.error('[PushManager] ❌ Errore inizializzazione:', error);
      // Retry dopo 5 secondi
      console.log('[PushManager] ⏳ Riprovo tra 5 secondi...');
      setTimeout(() => this.initialize(), 5000);
    }
  }

  async checkSubscription() {
    if (!this.swRegistration) {
      console.warn('[PushManager] ⚠️ SW non disponibile per check subscription');
      return false;
    }
    
    try {
      const subscription = await this.swRegistration.pushManager.getSubscription();
      
      if (subscription) {
        console.log('[PushManager] ✅ Subscription attiva');
        console.log('[PushManager] Endpoint:', subscription.endpoint.substring(0, 50) + '...');
        return true;
      } else {
        console.log('[PushManager] ⚠️ Nessuna subscription trovata');
        return false;
      }
    } catch (error) {
      console.error('[PushManager] ❌ Errore check subscription:', error);
      return false;
    }
  }

  startPeriodicCheck() {
    // Controlla subscription ogni 5 minuti
    this.checkInterval = setInterval(async () => {
      console.log('[PushManager] 🔄 Check periodico subscription...');
      const hasSubscription = await this.checkSubscription();
      
      if (!hasSubscription) {
        console.log('[PushManager] ⚠️ Subscription persa! Notifica all\'utente...');
        this.notifySubscriptionLost();
      }
    }, 5 * 60 * 1000); // 5 minuti

    console.log('[PushManager] ✅ Check periodico attivato (ogni 5 min)');
  }

  notifySubscriptionLost() {
    // Mostra messaggio all'utente
    const message = document.createElement('div');
    message.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: #ff6b6b;
      color: white;
      padding: 15px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 10000;
      font-family: system-ui;
      max-width: 90%;
      text-align: center;
    `;
    message.innerHTML = `
      <strong>⚠️ Notifiche disattivate</strong><br>
      <small>Vai su Profilo → Notifiche per riattivarle</small>
    `;
    document.body.appendChild(message);
    
    setTimeout(() => message.remove(), 8000);
  }

  async resubscribe() {
    console.log('[PushManager] 🔄 Tentativo risubscribe...');
    
    try {
      // Rimuovi vecchia subscription se esiste
      const oldSubscription = await this.swRegistration.pushManager.getSubscription();
      if (oldSubscription) {
        await oldSubscription.unsubscribe();
        console.log('[PushManager] Vecchia subscription rimossa');
      }

      // Crea nuova subscription
      const vapidPublicKey = document.querySelector('meta[name="vapid-public-key"]')?.content;
      if (!vapidPublicKey) {
        throw new Error('VAPID public key non trovata');
      }

      const convertedKey = this.urlBase64ToUint8Array(vapidPublicKey);
      
      const newSubscription = await this.swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedKey
      });

      console.log('[PushManager] ✅ Nuova subscription creata');

      // Invia al server
      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: newSubscription.endpoint,
          keys: {
            p256dh: btoa(String.fromCharCode(...new Uint8Array(newSubscription.getKey('p256dh')))),
            auth: btoa(String.fromCharCode(...new Uint8Array(newSubscription.getKey('auth'))))
          }
        })
      });

      if (response.ok) {
        console.log('[PushManager] ✅ Subscription salvata sul server');
        return true;
      } else {
        console.error('[PushManager] ❌ Errore salvataggio server:', response.status);
        return false;
      }

    } catch (error) {
      console.error('[PushManager] ❌ Errore resubscribe:', error);
      return false;
    }
  }

  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  destroy() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      console.log('[PushManager] Check periodico fermato');
    }
    this.isInitialized = false;
  }
}

// Inizializza il manager quando il DOM è pronto
let pushManager;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    pushManager = new PushNotificationManager();
    pushManager.initialize();
  });
} else {
  pushManager = new PushNotificationManager();
  pushManager.initialize();
}

// Reinizializza quando l'app diventa visibile
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    console.log('[PushManager] App tornata visibile, verifico subscription...');
    if (pushManager && pushManager.isInitialized) {
      pushManager.checkSubscription();
    } else if (pushManager) {
      pushManager.initialize();
    }
  }
});

// Gestisci anche eventi PWA specifici
window.addEventListener('appinstalled', () => {
  console.log('[PushManager] PWA installata, inizializzo...');
  if (pushManager) {
    pushManager.initialize();
  }
});

// Quando la PWA viene riaperta dopo essere stata chiusa
window.addEventListener('focus', () => {
  console.log('[PushManager] Window focus, verifico stato...');
  if (pushManager && pushManager.isInitialized) {
    pushManager.checkSubscription();
  }
});

// Export per uso in altre parti dell'app
window.PushNotificationManager = pushManager;
