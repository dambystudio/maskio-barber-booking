'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface PhoneVerificationN8NProps {
  phone: string;
  onVerified: () => void;
  onCancel: () => void;
  onChangePhone: () => void;
}

export default function PhoneVerificationN8N({ 
  phone, 
  onVerified, 
  onCancel, 
  onChangePhone 
}: PhoneVerificationN8NProps) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<'auto' | 'whatsapp' | 'sms'>('auto');
  const [lastUsedMethod, setLastUsedMethod] = useState<string | null>(null);

  const sendVerificationCode = async (method: 'auto' | 'whatsapp' | 'sms' = selectedMethod) => {
    setSending(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/verification/send-verification-n8n', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone, method }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message);
        setLastUsedMethod(data.method);
        
        // Show method-specific success message
        if (data.method.includes('whatsapp')) {
          setSuccess('✅ Messaggio WhatsApp inviato! Controlla l\'app WhatsApp.');
        } else if (data.method.includes('sms')) {
          setSuccess('✅ SMS inviato! Controlla i messaggi sul tuo telefono.');
        } else {
          setSuccess('✅ Codice di verifica inviato!');
        }
      } else {
        setError(data.error || 'Errore nell\'invio della verifica');
      }
    } catch (error) {
      setError('Errore di connessione con il server');
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
      const response = await fetch('/api/verification/verify-n8n', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: code.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(`✅ Numero verificato tramite ${data.method === 'whatsapp' ? 'WhatsApp' : 'SMS'}!`);
        setTimeout(() => {
          onVerified();
        }, 1500);
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
          <div className="text-4xl mb-4">📱</div>
          <h2 className="text-xl font-bold text-white mb-2">
            Verifica il tuo numero
          </h2>
          <p className="text-gray-400 text-sm">
            Scegli come ricevere il codice di verifica:
          </p>
          <p className="text-yellow-400 font-medium mt-1">{phone}</p>
        </div>

        {/* Method Selection */}
        {!lastUsedMethod && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Metodo di verifica
            </label>
            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={() => setSelectedMethod('auto')}
                className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                  selectedMethod === 'auto'
                    ? 'border-blue-500 bg-blue-900/30 text-blue-300'
                    : 'border-gray-600 bg-gray-800 text-gray-300 hover:border-gray-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>🚀 Automatico</span>
                  <span className="text-xs text-gray-400">WhatsApp → SMS</span>
                </div>
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setSelectedMethod('whatsapp')}
                  className={`p-2 rounded border text-xs font-medium transition-colors ${
                    selectedMethod === 'whatsapp'
                      ? 'border-green-500 bg-green-900/30 text-green-300'
                      : 'border-gray-600 bg-gray-800 text-gray-300 hover:border-gray-500'
                  }`}
                >
                  💬 WhatsApp
                </button>
                <button
                  onClick={() => setSelectedMethod('sms')}
                  className={`p-2 rounded border text-xs font-medium transition-colors ${
                    selectedMethod === 'sms'
                      ? 'border-yellow-500 bg-yellow-900/30 text-yellow-300'
                      : 'border-gray-600 bg-gray-800 text-gray-300 hover:border-gray-500'
                  }`}
                >
                  📱 SMS
                </button>
              </div>
            </div>
          </div>
        )}

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
            </button>

            <div className="flex space-x-3">
              <button
                onClick={() => sendVerificationCode()}
                disabled={sending}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
              >
                {sending ? 'Invio...' : 'Invia di nuovo'}
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

        <div className="mt-6 text-xs text-gray-500 text-center">
          <p>Il codice scadrà tra 10 minuti</p>
          {lastUsedMethod && (
            <p className="mt-1 text-blue-400">
              Ultimo invio: {lastUsedMethod.includes('whatsapp') ? 'WhatsApp' : 'SMS'}
            </p>
          )}
          {selectedMethod === 'auto' && !lastUsedMethod && (
            <p className="mt-1 text-green-400">
              💡 Proveremo WhatsApp prima, poi SMS se necessario
            </p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
