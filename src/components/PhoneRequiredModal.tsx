'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface PhoneRequiredModalProps {
  isOpen: boolean;
  userEmail: string;
  userName: string;
  onComplete: () => void;
}

export default function PhoneRequiredModal({ isOpen, userEmail, userName, onComplete }: PhoneRequiredModalProps) {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validazione telefono
    const phoneRegex = /^[\+]?[\d\s\-\(\)]{10,}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
      setError('Formato numero di telefono non valido (minimo 10 cifre)');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/user/update-phone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: phone.trim()
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Errore durante l\'aggiornamento');
      }

      onComplete();
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl p-8 w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-amber-900/30 border border-amber-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">📞 Numero di Telefono Richiesto</h2>
          <p className="text-gray-300 text-sm">
            Ciao <span className="text-amber-400 font-medium">{userName}</span>!<br/>
            Per completare la registrazione e permetterti di prenotare, abbiamo bisogno del tuo numero di telefono.
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-900/20 border border-red-500/30 text-red-400 p-3 rounded-lg mb-6 text-sm"
          >
            {error}
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
              Numero di telefono <span className="text-red-400">*</span>
            </label>
            <input
              type="tel"
              id="phone"
              required
              minLength={10}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 placeholder-gray-400"
              placeholder="+39 123 456 7890"
            />
            <p className="text-xs text-gray-400 mt-1">
              Inserisci un numero valido (minimo 10 cifre). Sarà usato per confermare le prenotazioni.
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading || phone.length < 10}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white py-3 px-4 rounded-lg font-medium hover:from-amber-600 hover:to-amber-700 transition-colors disabled:opacity-50 shadow-lg"
          >
            {loading ? 'Aggiornamento in corso...' : 'Completa Registrazione'}
          </motion.button>
        </form>

        {/* Info footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-400">
            🔒 Il tuo numero sarà usato solo per le prenotazioni e non sarà condiviso con terzi.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
