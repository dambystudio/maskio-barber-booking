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
        alert('Permesso negato. Abilita le notifiche dalle impostazioni del browser.');
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
      setHasSubscription(true);
      alert('🎉 Notifiche attivate con successo!');
      
      // Invia notifica di test
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
      console.log('🧪 Inviando notifica di test...');
      
      const response = await fetch('/api/push/test', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📡 Risposta test:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Risultato test:', result);
        
        alert(`✅ Test completato!\n\n📊 Info:\n- Account: ${result.user?.email}\n- Dispositivi: ${result.subscriptions}\n- Inviati: ${result.results?.filter((r: any) => r.success).length}\n\n🔔 Controlla se hai ricevuto la notifica!`);
      } else {
        const error = await response.text();
        console.error('❌ Errore test:', error);
        
        if (response.status === 404) {
          alert('❌ Nessuna subscription trovata.\n\nDevi prima:\n1. Attivare le notifiche\n2. Permettere al browser di inviare notifiche\n3. Riprovare il test');
        } else if (response.status === 401) {
          alert('❌ Non sei autenticato. Effettua il login e riprova.');
        } else {
          alert(`❌ Errore test: ${error}`);
        }
      }
    } catch (error) {
      console.error('❌ Errore inviando test:', error);
      alert('❌ Errore di connessione durante il test.');
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
                  onClick={async () => {
                    try {
                      const response = await fetch('/api/push/test-simple', { method: 'POST' });
                      const result = await response.json();
                      if (response.ok) {
                        alert(`✅ Test semplice: ${result.message}\n\n🔔 CHIUDI QUESTA FINESTRA e controlla se arriva la notifica!`);
                      } else {
                        alert(`❌ Errore: ${result.error}`);
                      }
                    } catch (error) {
                      alert('❌ Errore di connessione');
                    }
                  }}
                  className="bg-orange-500 text-white px-3 py-1 rounded text-sm hover:bg-orange-600 transition-colors"
                >
                  🚨 Test Semplice
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
