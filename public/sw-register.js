// Service Worker Registration Manager
// Gestisce registrazione esplicita e update del SW

console.log('[SW-Register] Script caricato');

if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    console.log('[SW-Register] Window loaded, inizio registrazione...');
    
    try {
      // 1. Check registrazioni esistenti
      const existingRegs = await navigator.serviceWorker.getRegistrations();
      console.log(`[SW-Register] Registrazioni esistenti: ${existingRegs.length}`);
      
      // 2. Registra nuovo SW
      console.log('[SW-Register] Registrazione /sw.js...');
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none' // Force bypass cache
      });
      
      console.log('[SW-Register] ✅ SW registrato!');
      console.log('[SW-Register] Scope:', registration.scope);
      console.log('[SW-Register] Active:', registration.active?.state);
      console.log('[SW-Register] Installing:', registration.installing?.state);
      console.log('[SW-Register] Waiting:', registration.waiting?.state);
      
      // 3. Forza update se già esiste
      if (registration.waiting) {
        console.log('[SW-Register] SW in attesa trovato, attivo subito...');
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
      
      // 4. Check update iniziale (con controllo registrazione valida)
      if (registration.active || registration.installing) {
        try {
          console.log('[SW-Register] Verifico update iniziale...');
          await registration.update();
          console.log('[SW-Register] Update verificato');
        } catch (updateError) {
          console.warn('[SW-Register] ⚠️ Update iniziale fallito (normale se primo avvio):', updateError.message);
        }
      }
      
      // 5. Listen per update
      registration.addEventListener('updatefound', () => {
        console.log('[SW-Register] 🔄 Update SW trovato!');
        const newWorker = registration.installing;
        
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            console.log('[SW-Register] Nuovo SW state:', newWorker.state);
            
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('[SW-Register] ✅ Nuovo SW pronto!');
              // Notifica utente che c'è update disponibile
              showUpdateNotification();
            }
          });
        }
      });
      
      // 6. Verifica ogni 60 secondi (con controllo registrazione valida)
      setInterval(async () => {
        try {
          const currentReg = await navigator.serviceWorker.getRegistration('/');
          if (currentReg && (currentReg.active || currentReg.installing)) {
            console.log('[SW-Register] Check update automatico...');
            await currentReg.update();
          } else {
            console.warn('[SW-Register] ⚠️ Registrazione non valida, salto update');
          }
        } catch (error) {
          console.warn('[SW-Register] ⚠️ Update automatico fallito:', error.message);
        }
      }, 60000);
      
    } catch (error) {
      console.error('[SW-Register] ❌ Errore registrazione:', error);
    }
  });
  
  // Listen per controller change
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    console.log('[SW-Register] 🔄 Controller cambiato! Nuovo SW attivo');
    // Ricarica pagina per usare nuovo SW
    if (!window.swUpdateHandled) {
      window.swUpdateHandled = true;
      console.log('[SW-Register] Ricarico pagina per applicare update...');
      window.location.reload();
    }
  });
  
  // Listen per messaggi dal SW
  navigator.serviceWorker.addEventListener('message', (event) => {
    console.log('[SW-Register] Messaggio da SW:', event.data);
    
    if (event.data.type === 'CACHE_UPDATED') {
      console.log('[SW-Register] Cache aggiornata:', event.data.url);
    }
  });
  
} else {
  console.warn('[SW-Register] ❌ Service Worker non supportato');
}

function showUpdateNotification() {
  // Mostra toast notification
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
  
  // Auto remove dopo 10 secondi
  setTimeout(() => {
    notification.style.animation = 'slideDown 0.3s ease-out';
    setTimeout(() => notification.remove(), 300);
  }, 10000);
}

// Aggiungi animazioni CSS
const style = document.createElement('style');
style.textContent = `
  @keyframes slideUp {
    from {
      transform: translateX(-50%) translateY(100px);
      opacity: 0;
    }
    to {
      transform: translateX(-50%) translateY(0);
      opacity: 1;
    }
  }
  
  @keyframes slideDown {
    from {
      transform: translateX(-50%) translateY(0);
      opacity: 1;
    }
    to {
      transform: translateX(-50%) translateY(100px);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

console.log('[SW-Register] Manager inizializzato');
