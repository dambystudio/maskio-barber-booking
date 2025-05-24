'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookingService } from '../services/bookingService';
import { Booking } from '../types/booking';

export default function BookingsList() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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
  }, []);

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
  };

  return (
    <div className="max-w-6xl mx-auto p-8">      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-center mb-8"
      >
        📋 Prenotazioni Attive
      </motion.h1>
      
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 text-red-700 text-center"
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
          <p className="text-gray-500 text-lg">Caricamento prenotazioni...</p>
        </motion.div>
      ) : bookings.length === 0 ? (
        <motion.div 
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="text-center py-12"
        >
          <p className="text-gray-500 text-lg">Nessuna prenotazione presente</p>
        </motion.div>
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {bookings.map((booking) => (
            <motion.div
              key={booking.id}
              variants={fadeInUp}
              className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-yellow-400"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold">{booking.customerInfo.name}</h3>
                <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
                  Confermata
                </span>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Barbiere:</span>
                  <span className="font-medium capitalize">{booking.barberId}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Data:</span>
                  <span className="font-medium">
                    {new Date(booking.date).toLocaleDateString('it-IT')}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Ora:</span>
                  <span className="font-medium">{booking.time}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Durata:</span>
                  <span className="font-medium">{booking.duration} min</span>
                </div>
                
                <div className="border-t pt-2 mt-3">
                  <span className="text-gray-600 text-xs">Servizi:</span>
                  {booking.services.map((service, index) => (
                    <div key={index} className="flex justify-between text-xs mt-1">
                      <span>{service.name}</span>
                      <span>€{service.price}</span>
                    </div>
                  ))}
                </div>
                
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between font-semibold">
                    <span>Totale:</span>
                    <span>€{booking.services.reduce((total, service) => total + service.price, 0)}</span>
                  </div>
                </div>
                
                <div className="border-t pt-2 mt-3 text-xs text-gray-500">
                  <p>Tel: {booking.customerInfo.phone}</p>
                  <p>Email: {booking.customerInfo.email}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 text-center"
      >
        <p className="text-sm text-gray-500">
          Totale prenotazioni: {bookings.length}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Aggiornamento automatico ogni 2 secondi
        </p>
      </motion.div>
    </div>
  );
}
