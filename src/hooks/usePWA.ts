import { useState, useEffect } from 'react';

export interface PWAState {
  isInstalled: boolean;
  isStandalone: boolean;
  canInstall: boolean;
  installPrompt: any;
}

export const usePWA = (): PWAState => {
  const [pwaState, setPwaState] = useState<PWAState>({
    isInstalled: false,
    isStandalone: false,
    canInstall: false,
    installPrompt: null,
  });

  useEffect(() => {
    const checkPWAStatus = () => {
      // Metodo 1: CSS display-mode
      const isStandaloneCSS = window.matchMedia('(display-mode: standalone)').matches;
      
      // Metodo 2: Navigator standalone (iOS Safari)
      const isStandaloneiOS = (window.navigator as any).standalone === true;
      
      // Metodo 3: URL parameter o localStorage
      const isStandaloneParam = window.location.search.includes('standalone=true');
      
      // Metodo 4: Verifica altezza schermo (euristica)
      const hasFullHeight = window.innerHeight === window.screen.height;
      
      const isStandalone = isStandaloneCSS || isStandaloneiOS || isStandaloneParam;
      const isInstalled = isStandalone || hasFullHeight;

      setPwaState(prev => ({
        ...prev,
        isStandalone,
        isInstalled,
      }));
    };

    // Listener per installazione PWA
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setPwaState(prev => ({
        ...prev,
        canInstall: true,
        installPrompt: e,
      }));
    };

    // Listener per quando la PWA viene installata
    const handleAppInstalled = () => {
      setPwaState(prev => ({
        ...prev,
        isInstalled: true,
        canInstall: false,
        installPrompt: null,
      }));
    };

    // Event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    
    // Controlla lo stato iniziale
    checkPWAStatus();

    // Controlla quando cambia la modalità display
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    mediaQuery.addEventListener('change', checkPWAStatus);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      mediaQuery.removeEventListener('change', checkPWAStatus);
    };
  }, []);

  return pwaState;
};
