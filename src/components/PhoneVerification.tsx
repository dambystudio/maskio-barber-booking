'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface PhoneVerificationProps {
  phone: string;
  onVerified: () => void;
  onCancel: () => void;
  onChangePhone: () => void;
  userId?: string; // For signup flow
  isSignupFlow?: boolean; // Flag to indicate this is during signup
}

export default function PhoneVerification({ 
  phone, 
  onVerified, 
  onCancel, 
  onChangePhone,
  userId,
  isSignupFlow = false
}: PhoneVerificationProps) {  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);  const [success, setSuccess] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [initialSmsSent, setInitialSmsSent] = useState(false);
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);
  const [blockedUntil, setBlockedUntil] = useState<Date | null>(null);

  // Send initial SMS when component mounts
  useEffect(() => {
    if (!initialSmsSent) {
      sendVerificationCode();
      setInitialSmsSent(true);
    }
  }, [initialSmsSent]);

  // Countdown timer for blocked state
  useEffect(() => {
    if (blockedUntil) {
      const timer = setInterval(() => {
        const now = new Date();
        if (now >= blockedUntil) {
          setBlockedUntil(null);
          setError(null);
        }
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [blockedUntil]);  const sendVerificationCode = async () => {
    setSending(true);
    setError(null);
    setSuccess(null);

    try {
      const requestBody: any = { phone };
      
      // Add signup-specific fields if needed
      if (isSignupFlow && userId) {
        requestBody.userId = userId;
        requestBody.isSignupFlow = true;
      }

      console.log('📱 Sending SMS verification request:', requestBody);

      const response = await fetch('/api/verification/send-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Codice SMS inviato con successo!');
        
        // Update rate limit info
        if (data.rateLimitInfo) {
          setRemainingAttempts(data.rateLimitInfo.remaining);
        }
      } else {
        setError(data.error || 'Errore nell\'invio del SMS');
        
        // Handle rate limit info
        if (data.rateLimitInfo && data.rateLimitInfo.blocked) {
          setBlockedUntil(new Date(data.rateLimitInfo.blockedUntil));
          setRemainingAttempts(0);
        }
      }
    } catch (error) {
      setError('Errore di connessione');
    } finally {
      setSending(false);
    }
  };
  const verifyCode = async () => {
    if (!code.trim()) {
      setError('Inserisci il codice di verifica');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const requestBody: any = { code: code.trim() };
      
      // Add signup-specific fields if needed
      if (isSignupFlow && userId) {
        requestBody.userId = userId;
        requestBody.isSignupFlow = true;
      }

      console.log('🔍 Sending SMS verification check:', requestBody);

      const response = await fetch('/api/verification/verify-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Numero verificato con successo!');
        setTimeout(() => {
          onVerified();
        }, 1000);
      } else {
        setError(data.error || 'Codice non valido');
      }
    } catch (error) {
      setError('Errore di connessione');
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setCode(value);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      verifyCode();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        className="bg-gray-900 border border-gray-700 rounded-lg p-6 max-w-md w-full shadow-xl"
      >
        <div className="text-center mb-6">
          <div className="text-4xl mb-4">📱</div>          <h2 className="text-xl font-bold text-white mb-2">
            Verifica il tuo numero
          </h2>
          {!initialSmsSent || sending ? (
            <p className="text-blue-400 text-sm animate-pulse">
              📤 Invio SMS in corso...
            </p>
          ) : success ? (
            <p className="text-green-400 text-sm">
              ✅ SMS inviato con successo!
            </p>
          ) : (
            <p className="text-gray-400 text-sm">
              Abbiamo inviato un codice di verifica a:
            </p>
          )}
          <p className="text-yellow-400 font-medium mt-1">{phone}</p>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-4 p-3 bg-red-900/50 border border-red-500/50 rounded text-red-300 text-sm"
          >
            {error}
          </motion.div>
        )}

        {/* Success Message */}
        {success && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-4 p-3 bg-green-900/50 border border-green-500/50 rounded text-green-300 text-sm"
          >
            {success}
          </motion.div>
        )}

        <div className="space-y-4">
          {/* Code Input */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Codice di verifica (6 cifre)
            </label>
            <input
              type="text"
              value={code}
              onChange={handleCodeChange}
              onKeyPress={handleKeyPress}
              placeholder="123456"
              className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-gray-800 text-white text-center text-xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
              autoFocus
              maxLength={6}
            />
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={verifyCode}
              disabled={loading || code.length !== 6}
              className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-black font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              {loading ? 'Verifica in corso...' : 'Verifica Codice'}
            </button>            <div className="flex space-x-3">
              <button
                onClick={sendVerificationCode}
                disabled={sending || blockedUntil !== null}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
              >
                {sending ? 'Invio...' : blockedUntil ? 'Bloccato' : 'Invia di nuovo'}
              </button>
              
              <button
                onClick={onChangePhone}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
              >
                Cambia numero
              </button>
            </div>
            
            <button
              onClick={onCancel}
              className="w-full bg-transparent border border-gray-600 hover:border-gray-500 text-gray-300 font-medium py-2 px-4 rounded-lg transition-colors text-sm"
            >
              Annulla
            </button>
          </div>
        </div>

        {/* Rate Limiting Info */}
        <div className="mt-6 text-xs text-gray-500 text-center">
          <p>Il codice scadrà tra 10 minuti</p>
          
          {remainingAttempts !== null && remainingAttempts >= 0 && (
            <p className="mt-1 text-yellow-400">
              📱 Tentativi rimasti: {remainingAttempts}/3
            </p>
          )}
          
          {blockedUntil && (
            <p className="mt-1 text-red-400">
              🚫 Troppi tentativi. Riprova tra {Math.ceil((blockedUntil.getTime() - new Date().getTime()) / (60 * 1000))} minuti
            </p>
          )}
          
          {!blockedUntil && (
            <p className="mt-1">Non hai ricevuto il SMS? Controlla che il numero sia corretto</p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
