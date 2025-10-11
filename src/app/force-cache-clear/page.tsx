'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type LogEntry = {
  time: string;
  message: string;
  type: 'success' | 'error' | 'info';
};

export default function ForceCacheClearPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const router = useRouter();

  const addLog = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { time, message, type }]);
    console.log(message);
  };

  useEffect(() => {
    addLog('✅ Pagina caricata', 'success');
    addLog('💡 Clicca "Pulisci Cache" per iniziare', 'info');
  }, []);

  const clearCache = async () => {
    addLog('🧹 Inizio pulizia cache...', 'info');
    
    try {
      const cacheNames = await caches.keys();
      addLog(`📦 Trovate ${cacheNames.length} cache`, 'info');
      
      for (const name of cacheNames) {
        await caches.delete(name);
        addLog(`✅ Cache eliminata: ${name}`, 'success');
      }
      
      addLog('✅ Cache pulita con successo!', 'success');
      addLog('🔄 Ricarico tra 2 secondi...', 'info');
      
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error: any) {
      addLog(`❌ Errore: ${error.message}`, 'error');
    }
  };

  const fullReset = async () => {
    addLog('💣 RESET COMPLETO in corso...', 'info');
    
    try {
      // 1. Elimina cache
      const cacheNames = await caches.keys();
      addLog(`📦 Eliminazione ${cacheNames.length} cache...`, 'info');
      
      for (const name of cacheNames) {
        await caches.delete(name);
        addLog(`✅ ${name}`, 'success');
      }
      
      // 2. Disregistra Service Workers
      const registrations = await navigator.serviceWorker.getRegistrations();
      addLog(`🔧 Disregistrazione ${registrations.length} Service Worker...`, 'info');
      
      for (const registration of registrations) {
        await registration.unregister();
        addLog(`✅ SW disregistrato: ${registration.scope}`, 'success');
      }
      
      addLog('✅ RESET COMPLETO!', 'success');
      addLog('🔄 Redirect a /prenota tra 2 secondi...', 'info');
      
      setTimeout(() => {
        router.push('/prenota');
      }, 2000);
      
    } catch (error: any) {
      addLog(`❌ Errore: ${error.message}`, 'error');
    }
  };

  const testAPI = async () => {
    addLog('🧪 Test API in corso...', 'info');
    
    try {
      // Test batch-availability
      const batchUrl = '/api/bookings/batch-availability?barberId=michele&startDate=2025-12-05&endDate=2025-12-05';
      addLog(`📡 GET batch-availability`, 'info');
      
      const batchResp = await fetch(batchUrl, {
        headers: { 'Cache-Control': 'no-cache' }
      });
      const batchData = await batchResp.json();
      
      const dec5 = batchData.availability['2025-12-05'];
      addLog(`📊 5 dicembre: hasSlots=${dec5?.hasSlots}, available=${dec5?.availableCount}`, dec5?.hasSlots ? 'success' : 'error');
      
      // Test slots
      const slotsUrl = '/api/bookings/slots?barberId=michele&date=2025-12-05';
      addLog(`📡 GET slots`, 'info');
      
      const slotsResp = await fetch(slotsUrl, {
        headers: { 'Cache-Control': 'no-cache' }
      });
      const slotsData = await slotsResp.json();
      
      const available = slotsData.slots.filter((s: any) => s.available);
      addLog(`✅ Slot disponibili: ${available.map((s: any) => s.time).join(', ')}`, available.length > 0 ? 'success' : 'error');
      
      if (available.length > 0) {
        addLog(`✅ API funziona! Trovati ${available.length} slot`, 'success');
      } else {
        addLog(`⚠️ API dice nessuno slot disponibile`, 'error');
      }
      
    } catch (error: any) {
      addLog(`❌ Errore test: ${error.message}`, 'error');
    }
  };

  const goToBooking = () => {
    addLog('➡️ Redirect a /prenota...', 'info');
    router.push('/prenota?_=' + Date.now());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-purple-900 text-white p-4 flex items-center justify-center">
      <div className="bg-white/10 backdrop-blur-lg p-6 md:p-8 rounded-2xl max-w-md w-full shadow-2xl">
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">🧹</div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Pulizia Cache</h1>
          <p className="text-sm md:text-base text-purple-100">
            Risolvi problemi di calendario e notifiche
          </p>
        </div>
        
        <div className="space-y-3">
          <button
            onClick={testAPI}
            className="w-full bg-blue-500 text-white px-6 py-4 rounded-xl font-bold hover:bg-blue-600 active:scale-95 transition shadow-lg"
          >
            <div className="flex items-center justify-center gap-2">
              <span className="text-xl">🧪</span>
              <span>Test API</span>
            </div>
            <div className="text-xs font-normal mt-1 opacity-90">Verifica cosa ritorna il server</div>
          </button>
          
          <button
            onClick={clearCache}
            className="w-full bg-white text-purple-600 px-6 py-4 rounded-xl font-bold hover:bg-purple-50 active:scale-95 transition shadow-lg"
          >
            <div className="flex items-center justify-center gap-2">
              <span className="text-xl">�</span>
              <span>Pulisci Cache</span>
            </div>
            <div className="text-xs font-normal mt-1 opacity-75">Elimina cache temporanea</div>
          </button>
          
          <button
            onClick={fullReset}
            className="w-full bg-red-500 text-white px-6 py-4 rounded-xl font-bold hover:bg-red-600 active:scale-95 transition shadow-lg"
          >
            <div className="flex items-center justify-center gap-2">
              <span className="text-xl">💣</span>
              <span>Reset Completo</span>
            </div>
            <div className="text-xs font-normal mt-1 opacity-90">Cache + Service Worker</div>
          </button>
          
          <button
            onClick={goToBooking}
            className="w-full bg-green-500 text-white px-6 py-4 rounded-xl font-bold hover:bg-green-600 active:scale-95 transition shadow-lg"
          >
            <div className="flex items-center justify-center gap-2">
              <span className="text-xl">➡️</span>
              <span>Vai a Prenota</span>
            </div>
          </button>
        </div>
        
        <div className="mt-6 bg-black/30 p-4 rounded-xl max-h-80 overflow-y-auto">
          <h2 className="font-bold mb-2 text-sm">📋 Log Console:</h2>
          <div className="font-mono text-xs space-y-1">
            {logs.length === 0 ? (
              <p className="text-gray-400">Nessun log... Clicca "Test API" per iniziare</p>
            ) : (
              logs.map((log: any, i) => (
                <div 
                  key={i} 
                  className={
                    log.type === 'success' ? 'text-green-400' : 
                    log.type === 'error' ? 'text-red-400' : 
                    'text-blue-300'
                  }
                >
                  [{log.time}] {log.message}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
