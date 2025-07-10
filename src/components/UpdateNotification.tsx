'use client';

import { motion } from 'framer-motion';

interface UpdateNotificationProps {
  onUpdate: () => void;
}

export default function UpdateNotification({ onUpdate }: UpdateNotificationProps) {
  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed bottom-4 left-1/2 -translate-x-1/2 w-11/12 max-w-md z-50"
    >
      <div className="bg-gray-800 border border-amber-500 rounded-xl p-4 shadow-2xl flex items-center justify-between space-x-4">
        <div className="flex-shrink-0 text-2xl">
          🚀
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-white">Nuova versione disponibile!</h4>
          <p className="text-sm text-gray-300">Ricarica per applicare gli ultimi aggiornamenti.</p>
        </div>
        <button
          onClick={onUpdate}
          className="px-5 py-2 bg-amber-600 text-black font-bold rounded-lg hover:bg-amber-700 transition-colors whitespace-nowrap"
        >
          Aggiorna
        </button>
      </div>
    </motion.div>
  );
} 