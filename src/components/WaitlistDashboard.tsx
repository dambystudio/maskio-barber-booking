'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';

interface WaitlistEntry {
  id: string;
  barber_id: string;
  barber_name: string;
  date: string;
  time: string;
  service: string;
  price: number;
  status: 'waiting' | 'notified' | 'cancelled' | 'booked';
  position: number;
  created_at: string;
}

export default function WaitlistDashboard() {
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWaitlistEntries();
  }, []);

  const fetchWaitlistEntries = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/waitlist/join');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Errore durante il caricamento');
      }

      setEntries(data.entries || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (id: string) => {
    if (!confirm('Vuoi rimuoverti da questa lista d\'attesa?')) {
      return;
    }

    try {
      const response = await fetch(`/api/waitlist/join?id=${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Errore durante la rimozione');
      }

      // Rimuovi l'entry dall'elenco
      setEntries(prev => prev.filter(entry => entry.id !== id));

    } catch (err) {
      alert(err instanceof Error ? err.message : 'Errore durante la rimozione');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'waiting':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            ⏳ In Attesa
          </span>
        );
      case 'notified':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            🔔 Notificato
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            ❌ Cancellato
          </span>
        );
      case 'booked':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            ✅ Prenotato
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
        <p className="text-gray-400 mt-4">Caricamento lista d'attesa...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-500 rounded-xl p-6 text-center">
        <p className="text-red-400 font-semibold">❌ {error}</p>
        <button
          onClick={fetchWaitlistEntries}
          className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
        >
          Riprova
        </button>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-12 text-center">
        <div className="text-6xl mb-4">📋</div>
        <h3 className="text-xl font-semibold text-white mb-2">
          Nessuna iscrizione alla lista d'attesa
        </h3>
        <p className="text-gray-400 mb-6">
          Quando un orario che desideri è occupato, puoi iscriverti alla lista d'attesa durante la prenotazione.
        </p>
        <a
          href="/prenota"
          className="inline-block px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white rounded-lg font-semibold transition-all"
        >
          Prenota Ora
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {entries.map((entry, index) => {
          const entryDate = parseISO(entry.date);
          const formattedDate = format(entryDate, 'EEEE d MMMM yyyy', { locale: it });
          
          return (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 hover:border-yellow-500/50 transition-all"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-white capitalize">
                      {formattedDate}
                    </h3>
                    {getStatusBadge(entry.status)}
                  </div>

                  <div className="space-y-2 text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-medium text-white">{entry.time}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>{entry.barber_name}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      <span>{entry.service}</span>
                      <span className="text-yellow-500 font-semibold ml-1">€{entry.price}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      <span>Posizione: <span className="font-semibold text-white">#{entry.position}</span></span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  {entry.status === 'notified' && (
                    <a
                      href="/prenota"
                      className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg font-semibold text-center transition-all"
                    >
                      🎯 Prenota Ora
                    </a>
                  )}

                  {(entry.status === 'waiting' || entry.status === 'notified') && (
                    <button
                      onClick={() => handleRemove(entry.id)}
                      className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500 text-red-400 rounded-lg font-medium transition-all"
                    >
                      ❌ Rimuovi
                    </button>
                  )}
                </div>
              </div>

              {entry.status === 'notified' && (
                <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                  <p className="text-sm text-blue-300">
                    💡 <span className="font-semibold">Posto liberato!</span> Questo orario è ora disponibile. Prenota prima che venga occupato da qualcun altro!
                  </p>
                </div>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>

      <div className="mt-8 bg-gray-800/30 border border-gray-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-3">
          📖 Come funziona la lista d'attesa
        </h3>
        <ul className="space-y-2 text-sm text-gray-400">
          <li className="flex items-start gap-2">
            <span className="text-yellow-500 mt-0.5">1.</span>
            <span>Quando un orario è occupato, puoi iscriverti alla lista d'attesa</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-yellow-500 mt-0.5">2.</span>
            <span>Se quell'orario si libera, riceverai una <strong>notifica push</strong> immediata</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-yellow-500 mt-0.5">3.</span>
            <span>Il primo che prenota, ottiene il posto (nessuna priorità, nessuna scadenza)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-yellow-500 mt-0.5">4.</span>
            <span>Puoi rimuoverti dalla lista d'attesa in qualsiasi momento</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
