'use client';

import { useState, useEffect } from 'react';

export const usePWA = () => {
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Controllo per la modalità standalone
    if (typeof window !== 'undefined') {
      const standalone = window.matchMedia('(display-mode: standalone)').matches;
      setIsStandalone(standalone);
    }

    // Assicurati che il codice venga eseguito solo nel browser
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    const registerPWA = async () => {
      // Usa workbox-window, che è lo standard per le PWA con Next.js
      const { Workbox } = await import('workbox-window');

      if (Workbox) {
        const wb = new Workbox('/sw.js');

        // Questo evento si attiva quando un nuovo Service Worker è stato installato
        // ma è in attesa di attivazione. È il momento perfetto per notificare l'utente.
        const onWaiting = (event: any) => {
          setIsUpdateAvailable(true);
          setWaitingWorker(event.sw);
          console.log('✨ Una nuova versione è disponibile. In attesa di attivazione.');
        };

        // Aggiungi il listener
        wb.addEventListener('waiting', onWaiting);

        // Registra il service worker
        wb.register();
      }
    };

    registerPWA();
  }, []);

  // Funzione che verrà chiamata dal pulsante "Aggiorna"
  const handleUpdate = () => {
    if (waitingWorker) {
      // Invia un messaggio al service worker per attivare subito la nuova versione
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
      
      // Ricarica la pagina per applicare gli aggiornamenti
      window.location.reload();
    }
  };

  return { isUpdateAvailable, handleUpdate, isStandalone };
};
