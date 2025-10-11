'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';

// Extend Window interface
declare global {
  interface Window {
    PushNotificationManager?: {
      resubscribe: () => Promise<boolean>;
      checkSubscription: () => Promise<boolean>;
      isInitialized: boolean;
    };
  }
}

export default function DebugPushPage() {
  const { data: session } = useSession();
  const [logs, setLogs] = useState<string[]>([]);
  const [subscription, setSubscription] = useState<any>(null);
  const [swState, setSwState] = useState<any>(null);

  const addLog = (message: string) => {
    console.log(message);
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    checkEnvironment();
  }, []);

  const checkEnvironment = async () => {
    addLog('🔍 === CONTROLLO AMBIENTE ===');
    
    // 1. Service Worker Support
    if ('serviceWorker' in navigator) {
      addLog('✅ Service Worker supportato');
    } else {
      addLog('❌ Service Worker NON supportato');
      return;
    }

    // 2. Push Manager Support
    if ('PushManager' in window) {
      addLog('✅ Push Manager supportato');
    } else {
      addLog('❌ Push Manager NON supportato');
      return;
    }

    // 3. Notification Permission
    addLog(`📋 Permesso notifiche: ${Notification.permission}`);

    // 4. VAPID Key
    const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (vapidKey) {
      addLog(`✅ VAPID key presente: ${vapidKey.substring(0, 20)}...`);
    } else {
      addLog('❌ VAPID key MANCANTE');
      return;
    }

    // 5. Service Worker Registration
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      addLog(`📱 Service Workers registrati: ${registrations.length}`);
      registrations.forEach((reg, i) => {
        addLog(`  SW #${i + 1}: ${reg.scope}`);
      });

      if (registrations.length > 0) {
        const reg = registrations[0];
        
        // Check SW state
        const swState = {
          scope: reg.scope,
          installing: reg.installing?.state,
          waiting: reg.waiting?.state,
          active: reg.active?.state,
        };
        setSwState(swState);
        addLog(`🔍 SW State: ${JSON.stringify(swState)}`);
        
        const sub = await reg.pushManager.getSubscription();
        if (sub) {
          addLog('✅ Subscription esistente trovata');
          addLog(`  Endpoint: ${sub.endpoint.substring(0, 50)}...`);
          setSubscription(sub.toJSON());
        } else {
          addLog('ℹ️ Nessuna subscription esistente');
        }
      }
    } catch (error: any) {
      addLog(`❌ Errore controllo SW: ${error.message}`);
    }
  };

  const requestPermission = async () => {
    addLog('🚀 === RICHIESTA PERMESSO ===');
    
    try {
      const permission = await Notification.requestPermission();
      addLog(`📋 Risultato permesso: ${permission}`);
      
      if (permission !== 'granted') {
        addLog('❌ Permesso negato o ignorato');
        return;
      }

      addLog('✅ Permesso concesso, proseguo...');
      await createSubscription();
    } catch (error: any) {
      addLog(`❌ Errore richiesta permesso: ${error.message}`);
    }
  };

  const createSubscription = async () => {
    addLog('🚀 === CREAZIONE SUBSCRIPTION ===');
    
    try {
      // 1. Ottieni Service Worker
      addLog('⏳ Attendo Service Worker...');
      const registration = await navigator.serviceWorker.ready;
      addLog(`✅ Service Worker pronto: ${registration.scope}`);

      // 2. Controlla subscription esistente
      let sub = await registration.pushManager.getSubscription();
      if (sub) {
        addLog('ℹ️ Subscription già esistente, la elimino...');
        await sub.unsubscribe();
        addLog('✅ Vecchia subscription eliminata');
      }

      // 3. Prepara VAPID key
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;
      addLog('🔑 Conversione VAPID key...');
      const applicationServerKey = urlBase64ToUint8Array(vapidKey);
      addLog(`✅ VAPID key convertita (${applicationServerKey.length} bytes)`);

      // 4. Crea subscription
      addLog('📱 Creazione subscription push...');
      sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey
      });
      addLog('✅ Subscription creata!');
      
      const subData = sub.toJSON();
      addLog(`  Endpoint: ${subData.endpoint?.substring(0, 50)}...`);
      addLog(`  Keys: ${Object.keys(subData.keys || {}).join(', ')}`);
      
      setSubscription(subData);

      // 5. Salva sul server
      addLog('📤 Invio subscription al server...');
      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subData)
      });

      addLog(`📡 Risposta server: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const result = await response.json();
        addLog(`✅ SUCCESS! Subscription ID: ${result.subscriptionId}`);
      } else {
        const error = await response.json();
        addLog(`❌ Errore server: ${error.error}`);
      }

    } catch (error: any) {
      addLog(`❌ ERRORE: ${error.message}`);
      addLog(`   Stack: ${error.stack}`);
    }
  };

  const sendTest = async () => {
    addLog('🧪 === INVIO TEST ===');
    
    try {
      const response = await fetch('/api/push/test', { method: 'POST' });
      const result = await response.json();
      
      if (response.ok) {
        addLog(`✅ Test inviato: ${result.message}`);
        addLog(`   Risultati: ${JSON.stringify(result.results)}`);
        
        // Verifica se la notifica è stata davvero inviata
        if (result.results && result.results.length > 0) {
          const success = result.results.filter((r: any) => r.success).length;
          if (success > 0) {
            addLog(`🎉 ${success} notifiche inviate con successo!`);
            addLog(`📱 Controlla il tuo dispositivo, dovresti ricevere la notifica tra poco...`);
          } else {
            addLog(`⚠️ Le notifiche sono state inviate ma potrebbero non essere visualizzate`);
            addLog(`   Verifica le impostazioni del browser/sistema`);
          }
        }
      } else {
        addLog(`❌ Errore test: ${result.error}`);
      }
    } catch (error: any) {
      addLog(`❌ Errore invio test: ${error.message}`);
    }
  };

  const sendTestLocal = async () => {
    addLog('🧪 === TEST NOTIFICA LOCALE ===');
    
    try {
      // Prova a inviare una notifica locale direttamente dal browser
      if ('Notification' in window && Notification.permission === 'granted') {
        addLog('📱 Invio notifica locale dal browser...');
        
        const notification = new Notification('🎉 Test Notifica Locale', {
          body: 'Questa è una notifica di test inviata direttamente dal browser!',
          icon: '/icone/predefinita/192x192.png',
          badge: '/icone/predefinita/32x32.png',
          tag: 'test-local',
          requireInteraction: false
        });
        
        addLog('✅ Notifica locale inviata!');
        addLog('📱 Se vedi la notifica, il problema è nel Service Worker push');
        addLog('📱 Se non vedi nulla, il problema è nelle impostazioni del browser');
        
        notification.onclick = () => {
          addLog('👆 Notifica cliccata!');
          notification.close();
        };
        
        // Chiudi automaticamente dopo 5 secondi
        setTimeout(() => notification.close(), 5000);
      } else {
        addLog('❌ Permesso notifiche non concesso o API non disponibile');
      }
    } catch (error: any) {
      addLog(`❌ Errore notifica locale: ${error.message}`);
    }
  };

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

  const forceServiceWorkerUpdate = async () => {
    addLog('🔄 === FORCE UPDATE SERVICE WORKER ===');
    
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      addLog(`📱 Trovate ${registrations.length} registrazioni`);
      
      for (const registration of registrations) {
        addLog(`🔄 Aggiorno Service Worker: ${registration.scope}`);
        
        // Forza l'update
        await registration.update();
        addLog('✅ Update richiesto');
        
        // Se c'è un SW in attesa, attivalo
        if (registration.waiting) {
          addLog('⏳ Service Worker in attesa trovato, attivo...');
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          
          // Aspetta che il nuovo SW prenda il controllo
          await new Promise((resolve) => {
            navigator.serviceWorker.addEventListener('controllerchange', () => {
              addLog('✅ Nuovo Service Worker attivato!');
              resolve(true);
            });
          });
        }
      }
      
      addLog('✅ Service Worker aggiornato!');
      addLog('🔄 Ricarica la pagina per applicare le modifiche');
      
      // Ricarica dopo 2 secondi
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error: any) {
      addLog(`❌ Errore update SW: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">🔧 Debug Push Notifications</h1>
        
        {session ? (
          <div className="bg-gray-800 p-4 rounded mb-4">
            <p>👤 Loggato come: <strong>{session.user?.email}</strong></p>
            <p>🆔 ID: <code className="text-xs">{session.user?.id}</code></p>
          </div>
        ) : (
          <div className="bg-red-800 p-4 rounded mb-4">
            <p>❌ Non autenticato - <a href="/auth/signin" className="underline">Accedi</a></p>
          </div>
        )}

        <div className="flex gap-2 mb-4">
          <button
            onClick={checkEnvironment}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded font-semibold"
          >
            🔍 Controlla Ambiente
          </button>
          
          <button
            onClick={requestPermission}
            className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded font-semibold"
            disabled={!session}
          >
            🔔 Richiedi Permesso
          </button>
          
          <button
            onClick={async () => {
              addLog('🔄 Resubscribe forzato...');
              if (window.PushNotificationManager) {
                const success = await window.PushNotificationManager.resubscribe();
                addLog(success ? '✅ Resubscribe completato' : '❌ Resubscribe fallito');
              } else {
                addLog('❌ PushNotificationManager non disponibile');
              }
            }}
            className="bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded font-semibold"
          >
            🔁 Resubscribe
          </button>
          
          <button
            onClick={sendTest}
            className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded font-semibold"
            disabled={!session || !subscription}
          >
            🧪 Test Notifica Server
          </button>

          <button
            onClick={sendTestLocal}
            className="bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded font-semibold"
            disabled={!session}
          >
            🔔 Test Notifica Locale
          </button>

          <button
            onClick={forceServiceWorkerUpdate}
            className="bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded font-semibold"
          >
            🔄 Aggiorna SW
          </button>

          <button
            onClick={() => setLogs([])}
            className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded font-semibold"
          >
            🗑️ Pulisci Log
          </button>
        </div>

        {swState && (
          <div className="bg-blue-900 p-4 rounded mb-4">
            <h3 className="font-bold mb-2">🔧 Service Worker State</h3>
            <div className="text-sm space-y-1">
              <p>📍 Scope: <code className="text-xs">{swState.scope}</code></p>
              <p>🔄 Installing: <span className={swState.installing ? 'text-yellow-400' : 'text-gray-500'}>{swState.installing || 'none'}</span></p>
              <p>⏳ Waiting: <span className={swState.waiting ? 'text-orange-400' : 'text-gray-500'}>{swState.waiting || 'none'}</span></p>
              <p>✅ Active: <span className={swState.active ? 'text-green-400' : 'text-red-400'}>{swState.active || 'none'}</span></p>
            </div>
          </div>
        )}

        {subscription && (
          <div className="bg-green-900 p-4 rounded mb-4">
            <h3 className="font-bold mb-2">✅ Subscription Attiva</h3>
            <pre className="text-xs overflow-auto max-h-40">
              {JSON.stringify(subscription, null, 2)}
            </pre>
          </div>
        )}

        <div className="bg-gray-800 p-4 rounded">
          <h2 className="font-bold mb-2">📋 Log Console:</h2>
          <div className="bg-black p-3 rounded font-mono text-xs overflow-auto max-h-96">
            {logs.length === 0 ? (
              <p className="text-gray-500">Nessun log ancora...</p>
            ) : (
              logs.map((log, i) => (
                <div key={i} className="mb-1">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-4 text-center">
          <a href="/test-notifications" className="text-blue-400 hover:underline">
            ← Torna a Test Notifications
          </a>
        </div>
      </div>
    </div>
  );
}
