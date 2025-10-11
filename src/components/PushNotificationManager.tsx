'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function PushNotificationManager() {
  const { data: session } = useSession();
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'requesting' | 'granted' | 'denied'>('idle');

  useEffect(() => {
    // Controlla se push notifications sono supportate
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      checkSubscriptionStatus();
    }
  }, []);

  const checkSubscriptionStatus = async () => {
    try {
      console.log('🔍 Controllo stato subscription...');
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      console.log('📱 Subscription trovata nel browser:', !!subscription);
      if (subscription) {
        console.log('📋 Dettagli subscription:', {
          endpoint: subscription.endpoint.substring(0, 50) + '...',
          expirationTime: subscription.expirationTime
        });
      }
      
      setIsSubscribed(!!subscription);
      
      if (subscription) {
        console.log('✅ Subscription attiva');
        setStatus('granted');
      }
    } catch (error) {
      console.error('❌ Errore controllando subscription:', error);
    }
  };

  const requestPermission = async () => {
    if (!isSupported || !session) {
      console.log('❌ Requisiti non soddisfatti:', { isSupported, hasSession: !!session });
      return;
    }

    console.log('🚀 Inizio richiesta permesso notifiche...');
    setIsLoading(true);
    setStatus('requesting');

    try {
      // Richiedi permesso
      console.log('📋 Richiesta permesso browser...');
      const permission = await Notification.requestPermission();
      console.log('📋 Permesso notifiche:', permission);
      
      if (permission !== 'granted') {
        console.log('❌ Permesso negato');
        setStatus('denied');
        setIsLoading(false);
        return;
      }

      setStatus('granted');
      console.log('✅ Permesso concesso!');

      // Verifica VAPID key
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      console.log('🔑 VAPID key presente:', !!vapidKey);
      if (!vapidKey) {
        console.error('❌ VAPID key mancante!');
        alert('Errore: VAPID key non configurata');
        setIsLoading(false);
        return;
      }

      // Registra service worker e crea subscription
      console.log('⏳ Attendo Service Worker...');
      const registration = await navigator.serviceWorker.ready;
      console.log('✅ Service Worker pronto:', registration.scope);
      
      console.log('📱 Creazione subscription push...');
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey)
      });

      console.log('📱 Subscription creata:', {
        endpoint: subscription.endpoint.substring(0, 50) + '...',
        keys: Object.keys(subscription.toJSON().keys || {})
      });

      // Invia subscription al server
      console.log('📤 Invio subscription al server...');
      const subscriptionData = subscription.toJSON();
      console.log('📦 Dati da inviare:', {
        hasEndpoint: !!subscriptionData.endpoint,
        hasKeys: !!subscriptionData.keys,
        hasP256dh: !!(subscriptionData.keys as any)?.p256dh,
        hasAuth: !!(subscriptionData.keys as any)?.auth
      });

      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscriptionData)
      });

      console.log('📡 Risposta server:', response.status, response.statusText);

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Subscription salvata sul server:', result);
        setIsSubscribed(true);
        alert('✅ Notifiche attivate con successo!');
      } else {
        const error = await response.json();
        console.error('❌ Errore salvando subscription:', error);
        alert(`❌ Errore: ${error.error || 'Errore sconosciuto'}`);
      }

    } catch (error) {
      console.error('❌ Errore attivando notifiche:', error);
      alert(`❌ Errore: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`);
      setStatus('denied');
    } finally {
      setIsLoading(false);
    }
  };

  const unsubscribe = async () => {
    if (!isSupported) return;

    setIsLoading(true);

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        // Rimuovi dal server PRIMA di unsubscribe locale
        await fetch('/api/push/subscribe', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: subscription.endpoint })
        });
        
        // Poi unsubscribe locale
        await subscription.unsubscribe();
      }

      setIsSubscribed(false);
      setStatus('idle');
      console.log('🔕 Notifiche disattivate');

    } catch (error) {
      console.error('❌ Errore disattivando notifiche:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendTestNotification = async () => {
    if (!session) return;

    setIsLoading(true);

    try {
      const response = await fetch('/api/push/test', {
        method: 'POST'
      });

      if (response.ok) {
        const result = await response.json();
        console.log('🎉 Test inviato:', result);
        alert('Test notifica inviato! Controlla il dispositivo.');
      } else {
        const error = await response.json();
        console.error('❌ Errore test:', error);
        alert(`Errore: ${error.error}`);
      }
    } catch (error) {
      console.error('❌ Errore invio test:', error);
      alert('Errore inviando test notifica');
    } finally {
      setIsLoading(false);
    }
  };

  // Utility function per convertire VAPID key
  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  if (!session) {
    return (
      <div className="bg-gray-800 rounded-lg p-4 text-center">
        <p className="text-gray-400">Devi essere autenticato per gestire le notifiche</p>
      </div>
    );
  }

  if (!isSupported) {
    return (
      <div className="bg-gray-800 rounded-lg p-4 text-center">
        <p className="text-gray-400">Push notifications non supportate su questo browser</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 space-y-4">
      <h3 className="text-xl font-bold text-white mb-4">
        📱 Gestione Notifiche Push
      </h3>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-gray-300">Stato notifiche:</span>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
            isSubscribed 
              ? 'bg-green-600 text-white' 
              : 'bg-red-600 text-white'
          }`}>
            {isSubscribed ? '✅ Attive' : '❌ Disattive'}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-gray-300">Permesso browser:</span>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
            status === 'granted' 
              ? 'bg-green-600 text-white' 
              : status === 'denied'
              ? 'bg-red-600 text-white'
              : 'bg-yellow-600 text-white'
          }`}>
            {status === 'granted' && '✅ Concesso'}
            {status === 'denied' && '❌ Negato'}
            {status === 'requesting' && '⏳ Richiesta...'}
            {status === 'idle' && '⚪ Non richiesto'}
          </span>
        </div>
      </div>

      <div className="flex gap-3 flex-wrap">
        {!isSubscribed ? (
          <button
            onClick={requestPermission}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
          >
            {isLoading ? '⏳' : '🔔'} Attiva Notifiche
          </button>
        ) : (
          <button
            onClick={unsubscribe}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
          >
            {isLoading ? '⏳' : '🔕'} Disattiva Notifiche
          </button>
        )}

        {isSubscribed && (
          <button
            onClick={sendTestNotification}
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
          >
            {isLoading ? '⏳' : '🧪'} Test Notifica
          </button>
        )}
      </div>

      <div className="text-sm text-gray-400 bg-gray-700 rounded p-3">
        <p><strong>💡 Come funziona:</strong></p>
        <ul className="list-disc list-inside space-y-1 mt-1">
          <li>Clicca "Attiva Notifiche" per abilitare</li>
          <li>Il browser chiederà il permesso</li>
          <li>Una volta attivate, riceverai notifiche automatiche</li>
          <li>Testa con "Test Notifica" per verificare</li>
        </ul>
      </div>
    </div>
  );
}
