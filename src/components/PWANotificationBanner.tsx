'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface PWANotificationBannerProps {
  onNotificationEnabled?: () => void;
}

export default function PWANotificationBanner({ onNotificationEnabled }: PWANotificationBannerProps) {
  const { data: session } = useSession();
  const [showBanner, setShowBanner] = useState(false);
  const [isPWA, setIsPWA] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkPWAAndNotificationStatus();
  }, [session]);

  const checkPWAAndNotificationStatus = async () => {
    // Controlla se è una PWA
    const isInPWA = window.matchMedia('(display-mode: standalone)').matches ||
                    (window.navigator as any).standalone ||
                    document.referrer.includes('android-app://');
    
    setIsPWA(isInPWA);

    // Controlla supporto notifiche
    const isNotificationSupported = 'serviceWorker' in navigator && 'PushManager' in window;
    setIsSupported(isNotificationSupported);

    if (!isNotificationSupported || !session) return;

    // Controlla permesso attuale
    const permission = Notification.permission;
    setHasPermission(permission === 'granted');

    // Controlla se ha già una subscription attiva
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      // Mostra banner solo se:
      // - È una PWA
      // - Supporta notifiche  
      // - Non ha ancora permesso/subscription
      // - Non ha chiuso il banner (localStorage)
      const bannerDismissed = localStorage.getItem('notification-banner-dismissed');
      
      setShowBanner(
        isInPWA && 
        isNotificationSupported && 
        permission !== 'granted' && 
        !subscription && 
        !bannerDismissed &&
        session
      );
      
    } catch (error) {
      console.error('Errore controllando subscription:', error);
    }
  };

  const handleEnableNotifications = async () => {
    setIsLoading(true);
    
    try {
      // Richiedi permesso
      const permission = await Notification.requestPermission();
      
      if (permission !== 'granted') {
        alert('Permesso negato. Puoi abilitare le notifiche dalle impostazioni del browser.');
        setIsLoading(false);
        return;
      }

      // Crea subscription
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!)
      });

      // Salva sul server
      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription.toJSON())
      });

      if (response.ok) {
        setHasPermission(true);
        setShowBanner(false);
        onNotificationEnabled?.();
        
        // Mostra messaggio di successo
        alert('🎉 Notifiche attivate! Riceverai avvisi quando si libera un posto.');
        
        // Invia notifica di benvenuto
        await fetch('/api/push/test', { method: 'POST' });
        
      } else {
        throw new Error('Errore salvando subscription');
      }
      
    } catch (error) {
      console.error('Errore attivando notifiche:', error);
      alert('Errore attivando le notifiche. Riprova più tardi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    // Ricorda che l'utente ha chiuso il banner (per 30 giorni)
    const dismissDate = new Date();
    dismissDate.setDate(dismissDate.getDate() + 30);
    localStorage.setItem('notification-banner-dismissed', dismissDate.toISOString());
  };

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  if (!showBanner) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 shadow-lg">
      <div className="max-w-lg mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🔔</span>
          <div>
            <div className="font-semibold text-sm">Novità: Notifiche Intelligenti!</div>
            <div className="text-xs opacity-90">Ricevi avvisi quando si libera un posto</div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={handleEnableNotifications}
            disabled={isLoading}
            className="bg-white text-blue-600 px-3 py-1 rounded-full text-xs font-semibold hover:bg-blue-50 transition-colors disabled:opacity-50"
          >
            {isLoading ? '⏳' : '✅ Attiva'}
          </button>
          
          <button
            onClick={handleDismiss}
            className="text-white/70 hover:text-white transition-colors p-1"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
