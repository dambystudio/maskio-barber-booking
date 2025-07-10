'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const phrases = [
  "✂️ Stile autentico",
  "🔄 Test Aggiornamento PWA", 
  "🎯 Precisione assoluta",
  "⭐ Qualità superiore",
  "🔥 Taglio perfetto"
];

export default function RotatingPhrases() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % phrases.length);
    }, 3000); // Cambia ogni 3 secondi

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-6 flex items-center overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 flex items-center"
        >
          <span className="text-sm font-medium text-gray-600 whitespace-nowrap">
            {phrases[currentIndex]}
          </span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
