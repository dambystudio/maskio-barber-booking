// Service Worker Initialization Coordinator
// Ensures proper startup sequence

console.log('[SW-Init] Initializing service worker system...');

// Flag per tracking stato
window.swInitState = {
  registered: false,
  ready: false,
  pushManagerReady: false
};

// Funzione di inizializzazione coordinata
async function initializeServiceWorkerSystem() {
  if (!('serviceWorker' in navigator)) {
    console.error('[SW-Init] ❌ Service Worker not supported');
    return;
  }

  try {
    // Step 1: Registra Service Worker
    // In dev mode usiamo sw-wrapper.js, in production sw.js viene generato da next-pwa
    const isDev = location.hostname === 'localhost' || location.hostname.includes('ngrok');
    const swPath = isDev ? '/sw-wrapper.js' : '/sw.js';
    
    console.log('[SW-Init] Step 1: Registering service worker...');
    console.log('[SW-Init] Mode:', isDev ? 'DEVELOPMENT' : 'PRODUCTION');
    console.log('[SW-Init] SW Path:', swPath);
    
    const registration = await navigator.serviceWorker.register(swPath, {
      scope: '/',
      updateViaCache: 'none'
    });

    window.swInitState.registered = true;
    console.log('[SW-Init] ✅ Service worker registered');
    console.log('[SW-Init] Scope:', registration.scope);
    console.log('[SW-Init] Active:', registration.active?.state);

    // Step 1.5: Carica push handlers nel Service Worker
    console.log('[SW-Init] Step 1.5: Loading push handlers into service worker...');
    if (registration.active) {
      try {
        registration.active.postMessage({
          type: 'LOAD_PUSH_HANDLERS'
        });
        console.log('[SW-Init] ✅ Push handlers load requested');
      } catch (error) {
        console.warn('[SW-Init] ⚠️ Failed to request push handlers:', error.message);
      }
    }

    // Step 2: Aspetta che sia ready
    console.log('[SW-Init] Step 2: Waiting for service worker to be ready...');
    await navigator.serviceWorker.ready;
    window.swInitState.ready = true;
    console.log('[SW-Init] ✅ Service worker ready');

    // Step 3: Attendi un momento per sicurezza
    await new Promise(resolve => setTimeout(resolve, 500));

    // Step 4: Inizializza Push Manager (se disponibile)
    if (window.PushNotificationManager) {
      console.log('[SW-Init] Step 3: Initializing push manager...');
      try {
        await window.PushNotificationManager.initialize();
        window.swInitState.pushManagerReady = true;
        console.log('[SW-Init] ✅ Push manager ready');
      } catch (error) {
        console.warn('[SW-Init] ⚠️ Push manager init failed:', error.message);
      }
    } else {
      console.log('[SW-Init] ⚠️ Push manager not available yet, will retry');
      // Retry dopo che push-manager.js è caricato
      setTimeout(() => {
        if (window.PushNotificationManager) {
          window.PushNotificationManager.initialize();
        }
      }, 2000);
    }

    // Step 5: Setup update handler (non ricaricare automaticamente)
    registration.addEventListener('updatefound', () => {
      console.log('[SW-Init] 🔄 Update found!');
      const newWorker = registration.installing;
      
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('[SW-Init] ✨ New version available (not auto-reloading in dev mode)');
            // Non mostrare banner in dev mode per evitare loop
            if (!location.hostname.includes('localhost') && !location.hostname.includes('ngrok')) {
              showUpdateNotification();
            }
          }
        });
      }
    });

    // Step 6: Check for updates periodically (with safety checks)
    setInterval(async () => {
      try {
        const reg = await navigator.serviceWorker.getRegistration('/');
        if (reg && (reg.active || reg.installing)) {
          console.log('[SW-Init] 🔍 Checking for updates...');
          await reg.update();
        }
      } catch (error) {
        console.warn('[SW-Init] ⚠️ Update check failed:', error.message);
      }
    }, 60000);

    console.log('[SW-Init] ✅ System fully initialized');

  } catch (error) {
    console.error('[SW-Init] ❌ Initialization failed:', error);
  }
}

// Update notification
function showUpdateNotification() {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    bottom: 100px;
    left: 50%;
    transform: translateX(-50%);
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 16px 24px;
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.3);
    z-index: 10000;
    font-family: system-ui;
    text-align: center;
    animation: slideUp 0.3s ease-out;
  `;
  notification.innerHTML = `
    <div style="font-weight: bold; margin-bottom: 8px;">✨ Aggiornamento Disponibile</div>
    <div style="font-size: 14px; margin-bottom: 12px;">Nuova versione dell'app disponibile</div>
    <button 
      onclick="window.location.reload()" 
      style="
        background: white;
        color: #667eea;
        border: none;
        padding: 8px 20px;
        border-radius: 6px;
        font-weight: bold;
        cursor: pointer;
      "
    >
      Aggiorna Ora
    </button>
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideDown 0.3s ease-out';
    setTimeout(() => notification.remove(), 300);
  }, 10000);
}

// Start initialization when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeServiceWorkerSystem);
} else {
  // DOM already loaded
  initializeServiceWorkerSystem();
}

// Also reinitialize when page becomes visible
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && window.swInitState.registered) {
    console.log('[SW-Init] Page visible again, checking state...');
    navigator.serviceWorker.getRegistration('/').then(reg => {
      if (!reg) {
        console.warn('[SW-Init] ⚠️ Registration lost! Re-initializing...');
        initializeServiceWorkerSystem();
      }
    });
  }
});

console.log('[SW-Init] Coordinator loaded ✅');
