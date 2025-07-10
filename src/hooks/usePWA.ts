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

    const registerPWA = async () => {
      // Usa workbox-window
      const { Workbox } = await import('workbox-window');

      if (Workbox) {
        const wb = new Workbox('/sw.js');

        // Listener per quando il nuovo service worker prende il controllo
        // Con skipWaiting: true, questo ricaricherà la pagina automaticamente
        const onControlling = () => {
          console.log('Service worker ha preso il controllo, ricarico la pagina.');
          window.location.reload();
        };

        wb.addEventListener('controlling', onControlling);
        
        wb.register();
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
