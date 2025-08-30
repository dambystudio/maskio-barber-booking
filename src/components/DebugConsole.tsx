'use client';

import { useState } from 'react';

export default function DebugConsole() {
  const [logs, setLogs] = useState<string[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  // Override console.log per catturare i messaggi
  if (typeof window !== 'undefined') {
    const originalLog = console.log;
    const originalError = console.error;
    
    console.log = (...args) => {
      originalLog(...args);
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      setLogs(prev => [...prev.slice(-50), `📝 ${new Date().toLocaleTimeString()}: ${message}`]);
    };
    
    console.error = (...args) => {
      originalError(...args);
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      setLogs(prev => [...prev.slice(-50), `❌ ${new Date().toLocaleTimeString()}: ${message}`]);
    };
  }

  const clearLogs = () => setLogs([]);

  return (
    <>
      {/* Pulsante flottante per aprire debug */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed bottom-4 right-4 z-50 bg-red-600 text-white p-3 rounded-full shadow-lg hover:bg-red-700 transition-colors"
        style={{ fontSize: '16px' }}
      >
        🐛
      </button>

      {/* Console di debug */}
      {isVisible && (
        <div className="fixed inset-4 z-50 bg-black/95 text-green-400 font-mono text-xs overflow-auto p-4 rounded-lg border border-green-500">
          <div className="flex justify-between items-center mb-4 sticky top-0 bg-black/95 pb-2">
            <h3 className="text-green-400 font-bold">🐛 Debug Console PWA</h3>
            <div className="flex gap-2">
              <button
                onClick={clearLogs}
                className="bg-yellow-600 text-black px-2 py-1 rounded text-xs hover:bg-yellow-500"
              >
                Clear
              </button>
              <button
                onClick={() => setIsVisible(false)}
                className="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-500"
              >
                ✕
              </button>
            </div>
          </div>
          
          <div className="space-y-1 max-h-96 overflow-auto">
            {logs.length === 0 ? (
              <p className="text-gray-500">Nessun log ancora... Prova ad attivare le notifiche!</p>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="whitespace-pre-wrap break-all">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </>
  );
}
