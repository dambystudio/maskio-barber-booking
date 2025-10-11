'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PushNotificationBanner() {
  const { data: session } = useSession();
  const [showBanner, setShowBanner] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    // Non mostrare se:
    // 1. Non è supportato
    // 2. Utente non loggato
    // 3. Banner già chiuso in questa sessione
    if (!('Notification' in window) || !session || isDismissed) {
      return;
    }

    // Controlla se banner già mostrato/chiuso permanentemente
    const bannerDismissed = localStorage.getItem('maskio-push-banner-dismissed');
    if (bannerDismissed === 'true') {
      return;
    }

    // Controlla permesso corrente
    const permission = Notification.permission;
    
    console.log('🔔 Banner notifiche - Permesso:', permission);

    // Mostra banner solo se permesso è "default" (non ancora richiesto)
    if (permission === 'default') {
      // Delay di 2 secondi per non essere troppo invasivo
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [session, isDismissed]);

  const handleEnable = async () => {
    setIsRequesting(true);

    try {
      console.log('🔔 Richiesta permesso notifiche...');
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        console.log('✅ Permesso concesso!');
        
        // Registra subscription
        const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        if (!vapidKey) {
          console.error('❌ VAPID key mancante');
          alert('Errore configurazione. Contatta il supporto.');
          return;
        }

        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidKey)
        });

        // Salva sul server
        const response = await fetch('/api/push/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(subscription.toJSON())
        });

        if (response.ok) {
          console.log('✅ Subscription salvata');
          setShowBanner(false);
          setIsDismissed(true);
        } else {
          console.error('❌ Errore salvando subscription');
          alert('Errore salvando le notifiche. Riprova più tardi.');
        }
      } else {
        console.log('❌ Permesso negato');
        setShowBanner(false);
        setIsDismissed(true);
        // Salva permanentemente per non chiedere più
        localStorage.setItem('maskio-push-banner-dismissed', 'true');
      }
    } catch (error) {
      console.error('❌ Errore:', error);
      alert('Errore attivando le notifiche. Riprova più tardi.');
    } finally {
      setIsRequesting(false);
    }
  };

  const handleDismiss = () => {
    console.log('🔕 Banner chiuso');
    setShowBanner(false);
    setIsDismissed(true);
    // Salva temporaneamente (solo per questa sessione)
    // NON salviamo in localStorage così lo rivede al prossimo accesso
  };

  const handleDismissPermanently = () => {
    console.log('🔕 Banner chiuso permanentemente');
    setShowBanner(false);
    setIsDismissed(true);
    localStorage.setItem('maskio-push-banner-dismissed', 'true');
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

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 via-blue-700 to-purple-600 text-white shadow-2xl"
        >
          <div className="container mx-auto px-4 py-4 max-w-5xl">
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className="flex-shrink-0 text-4xl">
                🔔
              </div>

              {/* Content */}
              <div className="flex-1">
                <h3 className="text-lg font-bold mb-1">
                  Rimani sempre aggiornato!
                </h3>
                <p className="text-sm opacity-90">
                  Attiva le notifiche per ricevere aggiornamenti su:
                </p>
                <ul className="text-sm mt-2 space-y-1 opacity-90">
                  <li>• <strong>Liste d'attesa</strong>: Ti avvisiamo quando si libera un posto</li>
                  <li>• <strong>Promemoria</strong>: Non dimenticare il tuo appuntamento</li>
                  <li>• <strong>Conferme</strong>: Ricevi conferma istantanea delle prenotazioni</li>
                </ul>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 flex-shrink-0">
                <button
                  onClick={handleEnable}
                  disabled={isRequesting}
                  className="bg-white text-blue-700 px-6 py-2 rounded-lg font-bold hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {isRequesting ? '⏳ Attesa...' : '✅ Attiva'}
                </button>
                <button
                  onClick={handleDismiss}
                  className="text-white text-sm underline hover:no-underline opacity-75 hover:opacity-100"
                >
                  Più tardi
                </button>
                <button
                  onClick={handleDismissPermanently}
                  className="text-white text-xs opacity-50 hover:opacity-75"
                >
                  Non mostrare più
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
