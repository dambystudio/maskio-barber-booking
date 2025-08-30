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
      console.log('🔔 Iniziando attivazione notifiche...');
      
      // Controlla se abbiamo la chiave VAPID
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      console.log('🔑 VAPID key presente:', !!vapidKey);
      
      if (!vapidKey) {
        throw new Error('Chiave VAPID mancante');
      }

      // Richiedi permesso
      console.log('📋 Richiedendo permesso notifiche...');
      const permission = await Notification.requestPermission();
      console.log('✅ Permesso ottenuto:', permission);
      
      if (permission !== 'granted') {
        alert('Permesso negato. Puoi abilitare le notifiche dalle impostazioni del browser.');
        setIsLoading(false);
        return;
      }

      // Crea subscription
      console.log('📱 Creando subscription...');
      const registration = await navigator.serviceWorker.ready;
      console.log('🔧 Service worker ready:', !!registration);
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey)
      });
      console.log('✅ Subscription creata:', !!subscription);

      // Salva sul server
      console.log('💾 Salvando subscription sul server...');
      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription.toJSON())
      });
      
      console.log('📡 Risposta server:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Errore server:', errorText);
        throw new Error(`Errore server: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Subscription salvata:', result);

      setHasPermission(true);
      setShowBanner(false);
      onNotificationEnabled?.();
      
      // Mostra messaggio di successo
      alert('🎉 Notifiche attivate! Riceverai avvisi quando si libera un posto.');
      
      // Invia notifica di benvenuto
      console.log('🧪 Inviando notifica di test...');
      const testResponse = await fetch('/api/push/test', { method: 'POST' });
      console.log('🧪 Test response:', testResponse.status);
      
    } catch (error) {
      console.error('❌ Errore completo:', error);
      console.error('❌ Stack trace:', error instanceof Error ? error.stack : 'No stack');
      
      let errorMessage = 'Errore attivando le notifiche. ';
      
      if (error instanceof Error) {
        if (error.message.includes('VAPID')) {
          errorMessage += 'Configurazione server non valida.';
        } else if (error.message.includes('subscribe')) {
          errorMessage += 'Problema con il browser. Prova a ricaricare la pagina.';
        } else if (error.message.includes('server')) {
          errorMessage += 'Problema di connessione. Riprova più tardi.';
        } else {
          errorMessage += `Dettaglio: ${error.message}`;
        }
      } else {
        errorMessage += 'Riprova più tardi.';
      }
      
      alert(errorMessage);
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
