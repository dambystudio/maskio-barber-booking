'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function NotificationSettings() {
  const { data: session } = useSession();
  const [isSupported, setIsSupported] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkNotificationStatus();
  }, [session]);

  const checkNotificationStatus = async () => {
    if (!session) return;

    // Controlla supporto
    const supported = 'serviceWorker' in navigator && 'PushManager' in window;
    setIsSupported(supported);

    if (!supported) return;

    // Controlla permesso
    const permission = Notification.permission;
    setHasPermission(permission === 'granted');

    // Controlla subscription esistente
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setHasSubscription(!!subscription);
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
        alert('Permesso negato. Abilita le notifiche dalle impostazioni del browser.');
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
        setHasSubscription(true);
        alert('🎉 Notifiche attivate con successo!');
        
        // Invia notifica di test
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

  const handleDisableNotifications = async () => {
    setIsLoading(true);
    
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
        
        // Rimuovi dal server
        await fetch('/api/push/unsubscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: subscription.endpoint })
        });
      }
      
      setHasSubscription(false);
      alert('Notifiche disattivate.');
      
    } catch (error) {
      console.error('Errore disattivando notifiche:', error);
      alert('Errore disattivando le notifiche.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestNotification = async () => {
    try {
      const response = await fetch('/api/push/test', { method: 'POST' });
      if (response.ok) {
        alert('Notifica di test inviata! Controlla se l\'hai ricevuta.');
      } else {
        throw new Error('Errore invio test');
      }
    } catch (error) {
      alert('Errore inviando la notifica di test.');
    }
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

  if (!session) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          🔔 Notifiche Push
        </h3>
        <p className="text-gray-600">Effettua il login per gestire le notifiche.</p>
      </div>
    );
  }

  if (!isSupported) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          🔔 Notifiche Push
        </h3>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">
            ⚠️ Il tuo browser non supporta le notifiche push.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        🔔 Notifiche Push
      </h3>
      
      <div className="space-y-4">
        {/* Status attuale */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <div className="font-medium">Stato Notifiche</div>
            <div className="text-sm text-gray-600">
              {hasPermission && hasSubscription ? (
                <span className="text-green-600">✅ Attive</span>
              ) : hasPermission ? (
                <span className="text-yellow-600">⚠️ Permesso OK, subscription mancante</span>
              ) : (
                <span className="text-red-600">❌ Non attive</span>
              )}
            </div>
          </div>
          
          <div className="flex gap-2">
            {hasPermission && hasSubscription ? (
              <>
                <button
                  onClick={handleTestNotification}
                  className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors"
                >
                  🧪 Test
                </button>
                <button
                  onClick={handleDisableNotifications}
                  disabled={isLoading}
                  className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  {isLoading ? '⏳' : '❌ Disattiva'}
                </button>
              </>
            ) : (
              <button
                onClick={handleEnableNotifications}
                disabled={isLoading}
                className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 transition-colors disabled:opacity-50"
              >
                {isLoading ? '⏳' : '✅ Attiva'}
              </button>
            )}
          </div>
        </div>

        {/* Informazioni */}
        <div className="text-sm text-gray-600 space-y-2">
          <div className="flex items-start gap-2">
            <span>📱</span>
            <div>
              <strong>Lista d'attesa intelligente:</strong> Ricevi una notifica quando si libera un posto nel giorno che desideri.
            </div>
          </div>
          
          <div className="flex items-start gap-2">
            <span>🔒</span>
            <div>
              <strong>Privacy:</strong> Le notifiche funzionano anche quando l'app è chiusa e non raccogliamo dati personali.
            </div>
          </div>
          
          <div className="flex items-start gap-2">
            <span>⚡</span>
            <div>
              <strong>Istantanee:</strong> Avvisi in tempo reale per non perdere l'occasione.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
