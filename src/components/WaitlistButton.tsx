'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { clientLogger } from '@/lib/clientLogger';

interface WaitlistButtonProps {
  barberId: string;
  barberName: string;
  date: string; // formato YYYY-MM-DD
  time: string; // formato HH:MM
  service: string;
  price: number;
  className?: string;
}

export default function WaitlistButton({
  barberId,
  barberName,
  date,
  time,
  service,
  price,
  className = ''
}: WaitlistButtonProps) {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleJoinWaitlist = async () => {
    clientLogger.waitlist('JOIN_CLICKED', { barberId, barberName, date, time, service, price });
    
    if (!session?.user) {
      const errorMsg = 'Devi effettuare il login per iscriverti alla lista d\'attesa';
      setError(errorMsg);
      clientLogger.error('[WaitlistButton] User not logged in');
      return;
    }

    clientLogger.info('[WaitlistButton] User authenticated', { userId: session.user.id, email: session.user.email });
    setIsLoading(true);
    setError(null);

    try {
      const requestBody = {
        barberId,
        barberName,
        date,
        time,
        service,
        price,
        customerName: session.user.name || '',
        customerEmail: session.user.email || '',
      };
      
      clientLogger.info('[WaitlistButton] Sending API request', requestBody);
      
      const response = await fetch('/api/waitlist/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      clientLogger.info('[WaitlistButton] Response received', { 
        status: response.status, 
        statusText: response.statusText,
        ok: response.ok 
      });
      
      const data = await response.json();
      clientLogger.info('[WaitlistButton] Response data', data);

      if (!response.ok) {
        const errorMsg = data.error || data.details || 'Errore durante l\'iscrizione';
        clientLogger.error('[WaitlistButton] API error', { status: response.status, error: errorMsg, fullData: data });
        throw new Error(errorMsg);
      }

      clientLogger.info('[WaitlistButton] Join successful!', data);
      setIsJoined(true);
      
      // Mostra messaggio di successo per 3 secondi
      setTimeout(() => {
        setIsJoined(false);
      }, 3000);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Errore sconosciuto';
      clientLogger.error('[WaitlistButton] Catch error', { 
        message: errorMessage, 
        error: err,
        stack: err instanceof Error ? err.stack : undefined 
      });
      setError(errorMessage);
      
      // Mostra errore per 5 secondi
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsLoading(false);
      clientLogger.info('[WaitlistButton] Request completed');
    }
  };

  if (!session?.user) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`text-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg ${className}`}
      >
        <p className="text-sm text-yellow-800">
          <span className="font-semibold">Effettua il login</span> per iscriverti alla lista d'attesa
        </p>
      </motion.div>
    );
  }

  if (isJoined) {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`text-center p-4 bg-green-50 border border-green-300 rounded-lg ${className}`}
      >
        <div className="flex items-center justify-center gap-2 text-green-700">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <p className="font-semibold">Iscritto alla lista d'attesa!</p>
        </div>
        <p className="text-sm text-green-600 mt-1">
          Ti invieremo una notifica push quando si libera un posto
        </p>
      </motion.div>
    );
  }

  return (
    <div className={className}>
      <motion.button
        onClick={handleJoinWaitlist}
        disabled={isLoading}
        whileHover={{ scale: isLoading ? 1 : 1.05 }}
        whileTap={{ scale: isLoading ? 1 : 0.95 }}
        className={`
          w-full px-8 py-4 rounded-lg font-semibold text-lg
          transition-all duration-200 shadow-lg
          focus:outline-none focus:ring-2 focus:ring-offset-2
          ${isLoading 
            ? 'bg-gray-400 cursor-not-allowed opacity-70' 
            : 'bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 text-black focus:ring-yellow-400'
          }
          flex items-center justify-center gap-3
        `}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>Iscrizione in corso...</span>
          </>
        ) : (
          <>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span>Aggiungi alla Lista d'Attesa</span>
          </>
        )}
      </motion.button>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg"
        >
          <p className="text-sm text-red-600 text-center">{error}</p>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mt-3 text-center"
      >
        <p className="text-xs text-gray-500">
          📅 <span className="font-medium">{date}</span> alle <span className="font-medium">{time}</span>
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Ti avviseremo quando questo orario si libera
        </p>
      </motion.div>
    </div>
  );
}
