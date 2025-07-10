'use client';

import { useState, useEffect } from 'react';

// Definiamo un'interfaccia per l'evento BeforeInstallPromptEvent
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: Array<string>;
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed',
    platform: string
  }>;
  prompt(): Promise<void>;
}

export const usePWA = () => {
  // Stati per lo stato di installazione
  const [isStandalone, setIsStandalone] = useState(false);
  const [canInstall, setCanInstall] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // Controllo per la modalità standalone
    if (typeof window !== 'undefined') {
      const standalone = window.matchMedia('(display-mode: standalone)').matches;
      setIsStandalone(standalone);

      // Listener per l'evento 'beforeinstallprompt'
      const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault();
        setCanInstall(true);
        setInstallPrompt(e as BeforeInstallPromptEvent);
        console.log('✅ `beforeinstallprompt` event fired.');
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

      // Cleanup
      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      };
    }
  }, []);

  useEffect(() => {
    // Assicurati che il codice venga eseguito solo nel browser
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    let wb: any = null;
    let updateCheckInterval: NodeJS.Timeout;

    const registerPWA = async () => {
      try {
        // Usa workbox-window
        const { Workbox } = await import('workbox-window');

        if (Workbox) {
          wb = new Workbox('/sw.js');

          // Listener per quando il nuovo service worker prende il controllo
          const onControlling = () => {
            console.log('🔄 Service worker ha preso il controllo, ricarico la pagina.');
            window.location.reload();
          };

          // Listener per quando c'è un aggiornamento disponibile
          const onWaiting = (event: any) => {
            console.log('✨ Aggiornamento disponibile, attivazione automatica...');
            // Forza l'attivazione immediata
            event.sw.postMessage({ type: 'SKIP_WAITING' });
          };

          // Listener per quando il service worker è installato
          const onInstalled = (event: any) => {
            if (event.isUpdate) {
              console.log('📦 Nuovo service worker installato, attivazione automatica...');
            }
          };

          wb.addEventListener('controlling', onControlling);
          wb.addEventListener('waiting', onWaiting);
          wb.addEventListener('installed', onInstalled);

          // Registra il service worker
          await wb.register();

          // Funzione per controllare gli aggiornamenti
          const checkForUpdates = async () => {
            try {
              if (wb) {
                await wb.update();
                console.log('🔍 Controllo aggiornamenti completato');
              }
            } catch (err) {
              console.error('❌ Errore nel controllo aggiornamenti:', err);
            }
          };

          // Controlla gli aggiornamenti all'avvio
          checkForUpdates();

          // Controlla gli aggiornamenti ogni 5 minuti (per test)
          // In produzione, potresti voler aumentare questo intervallo
          updateCheckInterval = setInterval(checkForUpdates, 5 * 60 * 1000);

          // Controlla anche quando la pagina torna online
          const handleOnline = () => {
            console.log('🌐 Connessione ripristinata, controllo aggiornamenti...');
            checkForUpdates();
          };

          window.addEventListener('online', handleOnline);

          // Cleanup
          return () => {
            if (updateCheckInterval) {
              clearInterval(updateCheckInterval);
            }
            window.removeEventListener('online', handleOnline);
          };
        }
      } catch (error) {
        console.error('❌ Errore nella registrazione PWA:', error);
      }
    };

    registerPWA();
  }, []);

  return { 
    isStandalone,
    canInstall,
    installPrompt
  };
};
