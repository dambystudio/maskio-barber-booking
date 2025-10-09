'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DebugPushPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [logs, setLogs] = useState<string[]>([]);
  const [subscription, setSubscription] = useState<any>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString('it-IT');
    setLogs(prev => [...prev, `[` + timestamp + `] ` + message]);
    console.log(message);
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=' + encodeURIComponent('/debug-push'));
      return;
    }

    if (status === 'authenticated') {
      addLog('User autenticato: ' + session?.user?.email);
      checkPushSupport();
    }
  }, [status, session, router]);

  const checkPushSupport = async () => {
    addLog('=== CONTROLLO SUPPORTO PUSH ===');
    
    if (!('serviceWorker' in navigator)) {
      addLog('Service Worker non supportato');
      return;
    }
    addLog('Service Worker supportato');

    if (!('PushManager' in window)) {
      addLog('Push Manager non supportato');
      return;
    }
    addLog('Push Manager supportato');

    if (!('Notification' in window)) {
      addLog('Notification API non supportata');
      return;
    }
    addLog('Notification API supportata');

    setIsSupported(true);
    setPermission(Notification.permission);
    addLog(`Permesso notifiche: ` + Notification.permission);

    try {
      const reg = await navigator.serviceWorker.ready;
      addLog('Service Worker registrato: ' + reg.scope);
      
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        addLog('Subscription esistente trovata');
        addLog('Endpoint: ' + sub.endpoint.substring(0, 50) + '...');
        setSubscription(sub.toJSON());
      } else {
        addLog('Nessuna subscription esistente');
      }
    } catch (error: any) {
      addLog('Errore controllo Service Worker: ' + error.message);
    }
  };

  const requestPermission = async () => {
    addLog('=== RICHIESTA PERMESSO ===');
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      addLog(`Permesso: ` + result);
      
      if (result === 'granted') {
        addLog('Permesso concesso!');
        await createSubscription();
      } else if (result === 'denied') {
        addLog('Permesso negato');
      } else {
        addLog('Permesso non risposto');
      }
    } catch (error: any) {
      addLog('Errore richiesta permesso: ' + error.message);
    }
  };

  const createSubscription = async () => {
    addLog('=== CREAZIONE SUBSCRIPTION ===');
    try {
      const registration = await navigator.serviceWorker.ready;
      addLog('Service Worker pronto');

      let sub = await registration.pushManager.getSubscription();
      
      if (sub) {
        addLog('Subscription esistente trovata, la rimuovo...');
        await sub.unsubscribe();
        addLog('Vecchia subscription rimossa');
      }

      addLog('Creazione nuova subscription...');
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      
      if (!vapidPublicKey) {
        addLog('VAPID_PUBLIC_KEY non trovata');
        return;
      }

      sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidPublicKey,
      });

      addLog('Subscription creata!');
      const subJson = sub.toJSON();
      setSubscription(subJson);
      
      addLog('Salvataggio nel database...');
      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subJson),
      });

      const data = await response.json();
      
      if (response.ok) {
        addLog('Subscription salvata! ID: ' + data.subscriptionId);
      } else {
        addLog('Errore salvataggio: ' + data.error);
      }
    } catch (error: any) {
      addLog('Errore creazione subscription: ' + error.message);
      console.error('Dettagli errore:', error);
    }
  };

  const sendTestNotification = async () => {
    addLog('=== INVIO NOTIFICA TEST ===');
    try {
      const response = await fetch('/api/push/test', {
        method: 'POST',
      });

      const data = await response.json();
      
      if (response.ok) {
        addLog('Test completato: ' + data.message);
        if (data.results) {
          data.results.forEach((result: any) => {
            if (result.success) {
              addLog(`  Inviata a: ` + result.subscriptionId);
            } else {
              addLog(`  Errore per ` + result.subscriptionId + ': ' + result.error);
            }
          });
        }
      } else {
        addLog('Errore test: ' + data.error);
      }
    } catch (error: any) {
      addLog('Errore invio test: ' + error.message);
    }
  };

  const clearLogs = () => {
    setLogs([]);
    addLog('Logs puliti');
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="text-white text-xl">Caricamento...</div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 mb-8 shadow-2xl">
          <h1 className="text-4xl font-bold mb-4">Debug Notifiche Push</h1>
          <p className="text-blue-100 text-lg">
            Pagina di test per verificare il funzionamento delle notifiche push
          </p>
          {session?.user && (
            <div className="mt-4 p-4 bg-white/10 rounded-lg backdrop-blur-sm">
              <p className="text-sm text-blue-100">Utente: <span className="font-semibold">{session.user.name}</span></p>
              <p className="text-sm text-blue-100">Email: <span className="font-semibold">{session.user.email}</span></p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className={'p-6 rounded-xl shadow-lg ' + (isSupported ? 'bg-green-600' : 'bg-red-600')}>
            <div className="text-3xl mb-2">{isSupported ? 'OK' : 'NO'}</div>
            <h3 className="font-semibold mb-1">Supporto Push</h3>
            <p className="text-sm opacity-90">{isSupported ? 'Supportato' : 'Non Supportato'}</p>
          </div>

          <div className={'p-6 rounded-xl shadow-lg ' + (
            permission === 'granted' ? 'bg-green-600' : 
            permission === 'denied' ? 'bg-red-600' : 'bg-yellow-600'
          )}>
            <div className="text-3xl mb-2">
              {permission === 'granted' ? 'OK' : permission === 'denied' ? 'NO' : '?'}
            </div>
            <h3 className="font-semibold mb-1">Permesso</h3>
            <p className="text-sm opacity-90 capitalize">{permission}</p>
          </div>

          <div className={'p-6 rounded-xl shadow-lg ' + (subscription ? 'bg-green-600' : 'bg-gray-600')}>
            <div className="text-3xl mb-2">{subscription ? 'OK' : '-'}</div>
            <h3 className="font-semibold mb-1">Subscription</h3>
            <p className="text-sm opacity-90">{subscription ? 'Attiva' : 'Non Attiva'}</p>
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 mb-8 shadow-xl border border-gray-700">
          <h2 className="text-2xl font-bold mb-6">Azioni</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={checkPushSupport}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
            >
              Controlla Supporto
            </button>

            <button
              onClick={requestPermission}
              disabled={!isSupported || permission === 'granted'}
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              Richiedi Permesso
            </button>

            <button
              onClick={createSubscription}
              disabled={!isSupported || permission !== 'granted'}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              Crea Subscription
            </button>

            <button
              onClick={sendTestNotification}
              disabled={!subscription}
              className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              Invia Notifica Test
            </button>
          </div>
        </div>

        {subscription && (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 mb-8 shadow-xl border border-gray-700">
            <h2 className="text-2xl font-bold mb-6">Info Subscription</h2>
            <div className="bg-black/30 p-4 rounded-lg font-mono text-sm overflow-x-auto">
              <pre className="text-green-400">{JSON.stringify(subscription, null, 2)}</pre>
            </div>
          </div>
        )}

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-gray-700">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Logs</h2>
            <button
              onClick={clearLogs}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300"
            >
              Pulisci
            </button>
          </div>
          
          <div className="bg-black/50 p-6 rounded-lg font-mono text-sm space-y-2 max-h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-gray-400 italic">Nessun log ancora...</p>
            ) : (
              logs.map((log, index) => (
                <div 
                  key={index}
                  className="text-gray-300"
                >
                  {log}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => router.push('/')}
            className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300"
          >
            Torna alla Home
          </button>
        </div>
      </div>
    </div>
  );
}
