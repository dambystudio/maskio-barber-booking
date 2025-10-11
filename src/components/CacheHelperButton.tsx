'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function CacheHelperButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-24 right-4 z-40 md:bottom-8 md:right-8">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            className="absolute bottom-16 right-0 bg-gray-900 text-white rounded-2xl shadow-2xl p-4 mb-2 w-64"
          >
            <h3 className="font-bold text-sm mb-2">🔧 Problemi con l'app?</h3>
            <p className="text-xs text-gray-300 mb-3">
              Se il calendario non si aggiorna o le notifiche non funzionano, prova a pulire la cache.
            </p>
            <div className="space-y-2">
              <Link href="/force-cache-clear" onClick={() => setIsOpen(false)}>
                <button className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
                  🧹 Pulisci Cache
                </button>
              </Link>
              <Link href="/debug-push" onClick={() => setIsOpen(false)}>
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
                  🔔 Test Notifiche
                </button>
              </Link>
              <Link href="/unregister-sw.html" onClick={() => setIsOpen(false)}>
                <button className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
                  💣 Reset Completo SW
                </button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className={`
          w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-2xl
          transition-all duration-300
          ${isOpen 
            ? 'bg-red-500 hover:bg-red-600 rotate-45' 
            : 'bg-gradient-to-br from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900'
          }
        `}
        aria-label="Helper menu"
      >
        {isOpen ? '✕' : '🛠️'}
      </motion.button>
    </div>
  );
}
