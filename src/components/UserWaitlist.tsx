'use client';

import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { motion } from 'framer-motion';

interface WaitlistEntry {
  id: string;
  barber_name: string;
  date: string;
  service?: string;
  status: string;
  position: number;
  created_at: string;
  offered_time?: string;
  offer_expires_at?: string;
}

interface UserWaitlistProps {
  userEmail?: string;
}

export default function UserWaitlist({ userEmail }: UserWaitlistProps) {
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState<string | null>(null);

  const fetchUserWaitlist = useCallback(async () => {
    if (!userEmail) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      
      const url = `/api/waitlist?user_email=${encodeURIComponent(userEmail)}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // L'API restituisce direttamente l'array
      const waitlistArray = Array.isArray(data) ? data : [];
      setWaitlist(waitlistArray);
    } catch (error) {
      console.error('❌ UserWaitlist: Errore nel fetch della lista d\'attesa utente:', error);
      setWaitlist([]);
    } finally {
      setLoading(false);
    }
  }, [userEmail]);

  useEffect(() => {
    fetchUserWaitlist();
    
    // Ricarica ogni 30 secondi per controllare nuove offerte
    const interval = setInterval(fetchUserWaitlist, 30000);
    return () => clearInterval(interval);
  }, [fetchUserWaitlist]);

  const removeFromWaitlist = async (waitlistId: string) => {
    if (!confirm('Sei sicuro di voler rimuovere questa richiesta di lista d\'attesa?')) {
      return;
    }

    try {
      const response = await fetch('/api/waitlist', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ waitlistId })
      });

      if (!response.ok) {
        throw new Error('Errore nella rimozione dalla lista d\'attesa');
      }

      // Ricarica la lista
      fetchUserWaitlist();
    } catch (error: any) {
      console.error('Errore nella rimozione:', error);
      alert(`❌ Errore: ${error.message}`);
    }
  };

  const respondToOffer = async (waitlistId: string, response: 'accepted' | 'declined') => {
    setResponding(waitlistId);

    try {
      const res = await fetch('/api/waitlist/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ waitlistId, response })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Errore nella risposta');
      }

      alert(`✅ ${data.message}`);
      
      // Ricarica la lista
      fetchUserWaitlist();
    } catch (error: any) {
      console.error('Errore nella risposta:', error);
      alert(`❌ Errore: ${error.message}`);
    } finally {
      setResponding(null);
    }
  };

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();
    
    if (diff <= 0) return 'Scaduta';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m rimanenti`;
    }
    return `${minutes} minuti rimanenti`;
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gray-800 border border-gray-700 rounded-xl p-6 mt-8"
      >
        <h2 className="text-2xl font-bold text-white mb-4">📋 Le Mie Liste d'Attesa</h2>
        <div className="text-center text-gray-400 py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto mb-4"></div>
          Caricamento liste d'attesa...
        </div>
      </motion.div>
    );
  }

  // Separa offerte dalle liste d'attesa normali
  const offers = waitlist.filter(entry => entry.status === 'offered');
  const waitingList = waitlist.filter(entry => entry.status === 'waiting');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-gray-800 border border-gray-700 rounded-xl p-6 mt-8"
    >
      <h2 className="text-2xl font-bold text-white mb-4">📋 Le Mie Liste d'Attesa</h2>
      
      {/* Offerte Attive */}
      {offers.length > 0 && (
        <div className="mb-6 space-y-4">
          <div className="bg-green-900/30 border-2 border-green-500 rounded-lg p-4">
            <h3 className="text-xl font-bold text-green-400 mb-4 flex items-center gap-2">
              <span className="text-2xl">🎉</span>
              Posto Disponibile!
            </h3>
            
            {offers.map((entry) => (
              <div
                key={entry.id}
                className="bg-gray-900 rounded-lg p-4 border-2 border-green-500 mb-4 last:mb-0"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-lg font-bold text-white">
                      📅 {format(new Date(entry.date), 'EEEE d MMMM', { locale: it })}
                    </div>
                    {entry.offer_expires_at && (
                      <div className="bg-red-600 text-white text-sm px-3 py-1 rounded-full animate-pulse">
                        ⏰ {getTimeRemaining(entry.offer_expires_at)}
                      </div>
                    )}
                  </div>
                  
                  <div className="text-gray-300 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-green-400">👨‍💼</span>
                      <span className="font-medium">{entry.barber_name}</span>
                    </div>
                    {entry.offered_time && (
                      <div className="flex items-center gap-2 text-lg font-bold text-green-400">
                        <span>🕐</span>
                        <span>Orario disponibile: {entry.offered_time}</span>
                      </div>
                    )}
                    {entry.service && (
                      <div className="flex items-center gap-2">
                        <span className="text-green-400">✂️</span>
                        <span>{entry.service}</span>
                      </div>
                    )}
                  </div>

                  <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-3">
                    <p className="text-green-200 text-sm mb-3">
                      <strong>Si è liberato un posto!</strong> Conferma entro 24 ore per prenotare questo slot.
                    </p>
                    
                    <div className="flex gap-3">
                      <button
                        onClick={() => respondToOffer(entry.id, 'accepted')}
                        disabled={responding === entry.id}
                        className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                      >
                        {responding === entry.id ? '⏳ Conferma...' : '✅ Conferma Prenotazione'}
                      </button>
                      
                      <button
                        onClick={() => respondToOffer(entry.id, 'declined')}
                        disabled={responding === entry.id}
                        className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                      >
                        {responding === entry.id ? '⏳ Rifiuto...' : '❌ Rifiuta'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Liste d'Attesa Normali */}
      {waitingList.length === 0 && offers.length === 0 ? (
        <div className="text-center text-gray-400 py-8">
          <div className="text-4xl mb-4">🎯</div>
          <p>Non sei in nessuna lista d'attesa al momento</p>
          <p className="text-sm mt-2">Quando un giorno è tutto occupato, puoi metterti in lista d'attesa dalla pagina di prenotazione</p>
        </div>
      ) : waitingList.length > 0 ? (
        <div className="space-y-4">
          <p className="text-gray-300 mb-4">
            Sei in lista d'attesa per {waitingList.length} giorno/i. Riceverai una notifica se si libera un posto!
          </p>
          
          {waitingList
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .map((entry) => (
            <div
              key={entry.id}
              className="bg-gray-900 rounded-lg p-4 border border-gray-600"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-amber-600 text-white text-sm px-3 py-1 rounded-full font-medium">
                      📅 {format(new Date(entry.date), 'EEEE d MMMM yyyy', { locale: it })}
                    </div>
                    <div className="bg-blue-600 text-white text-sm px-2 py-1 rounded-full">
                      ⏳ Posizione #{entry.position}
                    </div>
                  </div>
                  
                  <div className="text-gray-300 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-amber-400">👨‍💼</span>
                      <span className="font-medium">{entry.barber_name}</span>
                    </div>
                    {entry.service && (
                      <div className="flex items-center gap-2">
                        <span className="text-amber-400">✂️</span>
                        <span>{entry.service}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <span>🕐</span>
                      <span>Richiesta il {format(new Date(entry.created_at), 'dd/MM/yyyy alle HH:mm', { locale: it })}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => removeFromWaitlist(entry.id)}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm font-medium transition-colors ml-4"
                  title="Rimuovi dalla lista d'attesa"
                >
                  🗑️ Rimuovi
                </button>
              </div>
              
              <div className="mt-3 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                <p className="text-blue-200 text-sm">
                  💡 <strong>Come funziona:</strong> Se si libera un posto per questo giorno, riceverai una notifica push e avrai 24 ore per confermare.
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </motion.div>
  );
}
