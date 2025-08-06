'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function BookingInfoBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Mostra il banner solo se l'utente non ha ancora visto la notifica
    const hasSeenNotification = localStorage.getItem('maskio-booking-notification-dismissed');
    if (!hasSeenNotification) {
      setShowBanner(true);
    }
  }, []);

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('maskio-booking-info-banner-dismissed', 'true');
  };

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -100 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative bg-gradient-to-r from-yellow-500 to-yellow-500 text-white py-4 px-6 shadow-lg"
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-2xl">📅</div>
              <div>
                <h3 className="font-bold text-lg">Nuovo Sistema di Prenotazione!</h3>
                <p className="text-sm opacity-90">
                  Da settembre le prenotazioni avverranno su questo sito. 
                  <span className="hidden sm:inline"> Per agosto, continua a usare ZetaBarber o contattaci direttamente.</span>
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Link
                href="/prenota"
                className="bg-white text-yellow-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors text-sm"
              >
                Prenota da Settembre
              </Link>
              <button
                onClick={handleDismiss}
                className="text-white hover:text-gray-200 p-2 rounded-full hover:bg-white/10 transition-colors"
                aria-label="Chiudi banner"
              >
                ✕
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 