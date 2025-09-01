'use client';

import { useState, useEffect } from 'react';
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
}

interface UserWaitlistProps {
  userEmail?: string;
}

export default function UserWaitlist({ userEmail }: UserWaitlistProps) {
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userEmail) {
      fetchUserWaitlist();
    }
  }, [userEmail]);

  const fetchUserWaitlist = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/waitlist?user_email=${encodeURIComponent(userEmail!)}`);
      if (!response.ok) throw new Error('Errore nel caricamento lista d\'attesa');
      
      const data = await response.json();
      setWaitlist(data || []);
    } catch (error) {
      console.error('Errore nel fetch della lista d\'attesa utente:', error);
      setWaitlist([]);
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-gray-800 border border-gray-700 rounded-xl p-6 mt-8"
    >
      <h2 className="text-2xl font-bold text-white mb-4">📋 Le Mie Liste d'Attesa</h2>
      
      {waitlist.length === 0 ? (
        <div className="text-center text-gray-400 py-8">
          <div className="text-4xl mb-4">🎯</div>
          <p>Non sei in nessuna lista d'attesa al momento</p>
          <p className="text-sm mt-2">Quando un giorno è tutto occupato, puoi metterti in lista d'attesa dalla pagina di prenotazione</p>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-gray-300 mb-4">
            Sei in lista d'attesa per {waitlist.length} giorno/i. Ti contatteremo se si libera un posto!
          </p>
          
          {waitlist
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
                    {entry.status === 'waiting' && (
                      <div className="bg-blue-600 text-white text-sm px-2 py-1 rounded-full">
                        ⏳ In attesa
                      </div>
                    )}
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
              
              <div className="mt-3 p-3 bg-amber-900/20 border border-amber-500/30 rounded-lg">
                <p className="text-amber-200 text-sm">
                  💡 <strong>Come funziona:</strong> Se si libera un posto per questo giorno, il barbiere ti contatterà per confermare la disponibilità.
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
