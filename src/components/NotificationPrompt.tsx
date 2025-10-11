'use client';

import { useState, useEffect } from 'react';

/**
 * Banner che chiede all'utente di abilitare le notifiche push
 * Appare solo se:
 * - L'utente è loggato
 * - Non ha già una subscription attiva
 * - Non ha rifiutato in precedenza (localStorage)
 */
export default function NotificationPrompt() {
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkAndShow();
  }, []);

  async function checkAndShow() {
    // Controlla se ha già rifiutato
    if (localStorage.getItem('notification-prompt-dismissed') === 'true') {
      return;
    }

    // Controlla se ha già una subscription
    try {
      const response = await fetch('/api/push/subscription');
      const data = await response.json();
      
      if (data.hasSubscription) {
        return; // Ha già le notifiche attive
      }

      // Mostra il prompt dopo 3 secondi
      setTimeout(() => setShow(true), 3000);
    } catch (error) {
      console.error('Errore check subscription:', error);
    }
  }

  async function handleEnable() {
    setLoading(true);

    try {
      // Chiedi permesso
      const permission = await Notification.requestPermission();
      
      if (permission !== 'granted') {
        alert('Per ricevere notifiche quando si liberano posti, devi abilitare i permessi nelle impostazioni del browser.');
        handleDismiss();
        return;
      }

      // Crea subscription
      const registration = await navigator.serviceWorker.ready;
      
      const response = await fetch('/api/push/vapid-public-key');
      const { publicKey } = await response.json();

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: publicKey,
      });

      // Salva sul server
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription),
      });

      alert('✅ Notifiche attivate! Ti avviseremo quando si liberano posti.');
      setShow(false);

    } catch (error) {
      console.error('Errore attivazione notifiche:', error);
      alert('Errore durante l\'attivazione delle notifiche. Riprova più tardi.');
    } finally {
      setLoading(false);
    }
  }

  function handleDismiss() {
    localStorage.setItem('notification-prompt-dismissed', 'true');
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white rounded-lg shadow-2xl border border-gray-200 p-4 z-50 animate-slide-up">
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
        aria-label="Chiudi"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div className="flex items-start gap-3">
        <div className="text-3xl">🔔</div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">
            Attiva le Notifiche
          </h3>
          <p className="text-sm text-gray-600 mb-3">
            Ricevi avvisi quando si liberano posti nei giorni che ti interessano. Sarai il primo a saperlo!
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleEnable}
              disabled={loading}
              className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Attivazione...' : 'Attiva Ora'}
            </button>
            <button
              onClick={handleDismiss}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
            >
              Non ora
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
