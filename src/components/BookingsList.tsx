'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { BookingService } from '../services/bookingService';
import { Booking } from '../types/booking';

export default function BookingsList() {
  const { data: session, status } = useSession();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is authorized (barber role)
  const isAuthorized = session?.user?.role === 'barber';

  useEffect(() => {
    // Only load bookings if user is authorized
    if (status === 'loading') return; // Still loading session
    
    if (!session || !isAuthorized) {
      setLoading(false);
      return;
    }

    const loadBookings = async () => {
      try {
        setLoading(true);
        const currentBookings = await BookingService.getBookings();
        setBookings(currentBookings);
        setError(null);
      } catch (err: any) {
        setError('Errore nel caricamento delle prenotazioni');
        console.error('Errore nel caricamento:', err);
      } finally {
        setLoading(false);
      }
    };

    loadBookings();
    // Aggiorna ogni 5 secondi per vedere nuove prenotazioni
    const interval = setInterval(loadBookings, 5000);
    
    return () => clearInterval(interval);
  }, [session, isAuthorized, status]);

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };  return (
    <div className="max-w-6xl mx-auto p-8">
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-center mb-8 text-white"
      >
        📋 Pannello Gestione Prenotazioni
      </motion.h1>
      
      {/* Authentication Check */}
      {status === 'loading' ? (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-gray-400 text-lg">Verificando autorizzazioni...</p>
        </motion.div>
      ) : !session ? (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 max-w-md mx-auto">
            <div className="text-6xl mb-4">🔐</div>
            <h2 className="text-xl font-bold text-white mb-4">Accesso Richiesto</h2>
            <p className="text-gray-300 mb-6">
              Devi effettuare l'accesso per visualizzare il pannello delle prenotazioni.
            </p>
            <button
              onClick={() => window.location.href = '/auth/signin'}
              className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Effettua l'Accesso
            </button>
          </div>
        </motion.div>
      ) : !isAuthorized ? (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-8 max-w-md mx-auto">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-red-400 mb-4">Accesso Non Autorizzato</h2>
            <p className="text-red-300 mb-4">
              Solo il personale autorizzato può accedere a questa sezione.
            </p>
            <p className="text-gray-400 text-sm">
              Utente: {session.user?.email} (Ruolo: {session.user?.role})
            </p>
            <button
              onClick={() => window.location.href = '/'}
              className="mt-6 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Torna alla Home
            </button>
          </div>
        </motion.div>
      ) : (
        // Authorized content - existing booking list
        <div>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-900/50 border-l-4 border-red-400 text-red-300 text-center"
            >
              <p className="font-medium">⚠️ {error}</p>
            </motion.div>
          )}
          
          {loading ? (
            <motion.div 
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              className="text-center py-12"
            >
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
              <p className="text-gray-400 text-lg">Caricamento prenotazioni...</p>
            </motion.div>
          ) : !bookings || bookings.length === 0 ? (
            <motion.div 
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              className="text-center py-12"
            >
              <div className="text-6xl mb-4">📅</div>
              <p className="text-gray-400 text-lg">Nessuna prenotazione presente</p>
            </motion.div>
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
          {(bookings || []).map((booking) => (
            <motion.div
              key={booking.id}
              variants={fadeInUp}
              className="bg-gray-900 border border-gray-800 rounded-lg shadow-lg p-6 border-l-4 border-l-yellow-400"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-white">{booking.customerInfo.name}</h3>
                <span className="text-sm bg-green-900/50 text-green-300 px-2 py-1 rounded">
                  Confermata
                </span>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Barbiere:</span>
                  <span className="font-medium capitalize text-white">{booking.barberId}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">Data:</span>
                  <span className="font-medium text-white">
                    {new Date(booking.date).toLocaleDateString('it-IT')}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">Ora:</span>
                  <span className="font-medium text-white">{booking.time}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">Durata:</span>
                  <span className="font-medium text-white">{booking.duration} min</span>
                </div>
                
                <div className="border-t border-gray-700 pt-2 mt-3">
                  <span className="text-gray-400 text-xs">Servizi:</span>
                  {booking.services.map((service, index) => (
                    <div key={index} className="flex justify-between text-xs mt-1">
                      <span className="text-gray-300">{service.name}</span>
                      <span className="text-white">€{service.price}</span>
                    </div>
                  ))}
                </div>
                
                <div className="border-t border-gray-700 pt-2 mt-2">
                  <div className="flex justify-between font-semibold">
                    <span className="text-gray-300">Totale:</span>
                    <span className="text-yellow-400">€{booking.services.reduce((total, service) => total + service.price, 0)}</span>
                  </div>
                </div>
                
                <div className="border-t border-gray-700 pt-2 mt-3 text-xs text-gray-400">
                  <p>Tel: {booking.customerInfo.phone}</p>
                  <p>Email: {booking.customerInfo.email}</p>
                </div>
              </div>
            </motion.div>
          ))}        </motion.div>
      )}
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 text-center"
      >
        <p className="text-sm text-gray-400">
          Totale prenotazioni: {bookings.length}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Aggiornamento automatico ogni 5 secondi
        </p>
      </motion.div>
        </div>
      )}
    </div>
  );
}
