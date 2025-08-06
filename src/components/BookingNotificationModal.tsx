'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BookingNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BookingNotificationModal({ isOpen, onClose }: BookingNotificationModalProps) {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    setShowModal(isOpen);
  }, [isOpen]);

  const handleClose = () => {
    setShowModal(false);
    setTimeout(onClose, 300); // Aspetta che l'animazione finisca
  };

  const handleDontShowAgain = () => {
    localStorage.setItem('maskio-booking-notification-dismissed', 'true');
    handleClose();
  };

  return (
    <AnimatePresence>
      {showModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-yellow-500 to-yellow-500 p-4 sm:p-6 text-center">
              <div className="text-3xl sm:text-4xl mb-2">📅</div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                Importante: Nuovo Sistema di Prenotazione
              </h2>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6 space-y-4">
              <div className="bg-blue-900/30 border border-blue-500 rounded-lg p-3 sm:p-4">
                <div className="flex items-start gap-3">
                  <div className="text-blue-400 text-xl sm:text-2xl flex-shrink-0">ℹ️</div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-blue-300 mb-2 text-sm sm:text-base">
                      Cambio di Sistema
                    </h3>
                    <div className="text-blue-200 text-xs sm:text-sm space-y-2">
                      <p>
                        <strong>Fino al 31 agosto:</strong> Le prenotazioni avvengono tramite <strong>"ZetaBarber"</strong>
                      </p>
                      <p>
                        <strong>Da settembre in poi:</strong> Le prenotazioni avverranno su questo sito
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-900/30 border border-yellow-500 rounded-lg p-3 sm:p-4">
                <div className="flex items-start gap-3">
                  <div className="text-yellow-400 text-xl sm:text-2xl flex-shrink-0">🗓️</div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-yellow-300 mb-2 text-sm sm:text-base">
                      Date Disponibili
                    </h3>
                    <p className="text-yellow-200 text-xs sm:text-sm">
                      Le prenotazioni su questo sito partono dal <strong>1° settembre</strong> e sono già disponibili per i prossimi due mesi.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-green-900/30 border border-green-500 rounded-lg p-3 sm:p-4">
                <div className="flex items-start gap-3">
                  <div className="text-green-400 text-xl sm:text-2xl flex-shrink-0">✨</div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-green-300 mb-2 text-sm sm:text-base">
                      Vantaggi del Nuovo Sistema
                    </h3>
                    <ul className="text-green-200 text-xs sm:text-sm space-y-1">
                      <li>• Interfaccia più moderna e veloce</li>
                      <li>• Conferme automatiche via email</li>
                      <li>• Gestione semplificata delle prenotazioni</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-red-900/30 border border-red-500 rounded-lg p-3 sm:p-4">
                <div className="flex items-start gap-3">
                  <div className="text-red-400 text-xl sm:text-2xl flex-shrink-0">⚠️</div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-red-300 mb-2 text-sm sm:text-base">
                      Per Prenotazioni Immediate
                    </h3>
                    <p className="text-red-200 text-xs sm:text-sm mb-2">
                      Per prenotazioni prima del 1° settembre, contatta direttamente:
                    </p>
                    <div className="space-y-1">
                      <a 
                        href="tel:+393317100730"
                        className="block text-red-200 text-xs sm:text-sm font-medium hover:text-red-100 transition-colors"
                      >
                        📞 <strong>+39 331 710 0730</strong>
                      </a>
                      <a 
                        href="https://wa.me/393317100730"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-red-200 text-xs sm:text-sm hover:text-red-100 transition-colors"
                      >
                        📱 WhatsApp
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-800 border-t border-gray-700 p-4 space-y-3">
              <div className="flex flex-col gap-2">
                <button
                  onClick={handleClose}
                  className="w-full px-4 py-3 bg-yellow-500 text-black rounded-lg hover:bg-yellow-600 transition-colors font-medium text-sm sm:text-base"
                >
                  Ho capito, continua
                </button>
                <button
                  onClick={handleDontShowAgain}
                  className="w-full px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors text-xs sm:text-sm"
                >
                  Non mostrare più
                </button>
              </div>
              <p className="text-xs text-gray-400 text-center">
                Questo messaggio apparirà solo una volta per sessione
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 