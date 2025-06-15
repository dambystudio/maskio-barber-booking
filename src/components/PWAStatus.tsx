'use client';

import { usePWA } from '@/hooks/usePWA';
import { useState } from 'react';

export default function PWAStatus() {
  const { isInstalled, isStandalone, canInstall, installPrompt } = usePWA();
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  const handleInstall = async () => {
    if (installPrompt) {
      installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      console.log(`User response to install prompt: ${outcome}`);
      setShowInstallBanner(false);
    }
  };

  // Mostra banner di installazione solo se può essere installata
  if (canInstall && !showInstallBanner) {
    setTimeout(() => setShowInstallBanner(true), 2000); // Mostra dopo 2 secondi
  }

  return (
    <>
      {/* Banner per installazione PWA */}
      {canInstall && showInstallBanner && !isInstalled && (
        <div className="fixed bottom-4 left-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg z-50 md:max-w-sm md:left-auto">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Installa l'App</p>
              <p className="text-sm opacity-90">Aggiungi Maskio Barber alla tua schermata home</p>
            </div>
            <div className="flex gap-2 ml-4">
              <button
                onClick={() => setShowInstallBanner(false)}
                className="text-white/70 hover:text-white text-sm px-2"
              >
                Ignora
              </button>
              <button
                onClick={handleInstall}
                className="bg-white text-blue-600 px-4 py-2 rounded font-medium text-sm hover:bg-gray-100"
              >
                Installa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Indicatore stato PWA (solo in development per debug) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-16 left-4 bg-black/80 text-white text-xs p-2 rounded z-50">
          <div>Standalone: {isStandalone ? '✅' : '❌'}</div>
          <div>Installed: {isInstalled ? '✅' : '❌'}</div>
          <div>Can Install: {canInstall ? '✅' : '❌'}</div>
        </div>
      )}
    </>
  );
}
