'use client';

import { useState, useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';
import { motion } from 'framer-motion';

interface Booking {
  id: string;
  service_name: string;
  barber_name: string;
  barber_phone?: string;
  booking_date: string;
  booking_time: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  created_at: string;
  notes?: string;
}

interface CalendarGridProps {
  bookings: Booking[];
  selectedDate: string;
  onWhatsAppClick: (booking: Booking) => void;
  onPhoneClick: (phone: string) => void;
}

const CalendarGrid = ({ 
  bookings, 
  selectedDate, 
  onWhatsAppClick, 
  onPhoneClick 
}: CalendarGridProps) => {
  // Definisco i barbieri fissi
  const BARBERS = [
    { name: 'Fabio', email: 'fabio.cassano97@icloud.com' },
    { name: 'Michele', email: 'michelebiancofiore0230@gmail.com' },
    { name: 'Marco', email: 'marcocis2006@gmail.com' }
  ];

  // Filtro TUTTE le prenotazioni per la data selezionata (non più filtrate per barbiere)
  const dayBookings = useMemo(() => {
    return bookings.filter(booking => booking.booking_date === selectedDate);
  }, [bookings, selectedDate]);

  // Genera gli slot orari per il giorno
  const generateTimeSlots = () => {
    const slots = [];
    
    // Orari mattutini (9:00-12:30)
    for (let hour = 9; hour <= 12; hour++) {
      if (hour === 12) {
        slots.push(`${hour.toString().padStart(2, '0')}:00`);
        slots.push(`${hour.toString().padStart(2, '0')}:30`);
      } else {
        slots.push(`${hour.toString().padStart(2, '0')}:00`);
        slots.push(`${hour.toString().padStart(2, '0')}:30`);
      }
    }
    
    // Orari pomeridiani
    const selectedDateObj = new Date(selectedDate + 'T00:00:00');
    const dayOfWeek = selectedDateObj.getDay();
    
    if (dayOfWeek === 1) { // Lunedì - solo pomeriggio
      for (let hour = 15; hour <= 17; hour++) {
        if (hour === 17) {
          slots.push(`${hour.toString().padStart(2, '0')}:00`);
          slots.push(`${hour.toString().padStart(2, '0')}:30`);
        } else {
          slots.push(`${hour.toString().padStart(2, '0')}:00`);
          slots.push(`${hour.toString().padStart(2, '0')}:30`);
        }
      }
    } else if (dayOfWeek === 6) { // Sabato
      for (let hour = 14; hour <= 17; hour++) {
        if (hour === 14) {
          slots.push(`${hour.toString().padStart(2, '0')}:30`);
        } else if (hour === 17) {
          slots.push(`${hour.toString().padStart(2, '0')}:00`);
        } else {
          slots.push(`${hour.toString().padStart(2, '0')}:00`);
          slots.push(`${hour.toString().padStart(2, '0')}:30`);
        }
      }
    } else if (dayOfWeek >= 2 && dayOfWeek <= 5) { // Martedì-Venerdì
      for (let hour = 15; hour <= 17; hour++) {
        if (hour === 17) {
          slots.push(`${hour.toString().padStart(2, '0')}:00`);
          slots.push(`${hour.toString().padStart(2, '0')}:30`);
        } else {
          slots.push(`${hour.toString().padStart(2, '0')}:00`);
          slots.push(`${hour.toString().padStart(2, '0')}:30`);
        }
      }
    }
    
    return slots;
  };

  // Creo una mappa delle prenotazioni per barbiere e orario
  const bookingGrid = useMemo(() => {
    const grid: { [key: string]: Booking } = {};
    
    dayBookings.forEach(booking => {
      const key = `${booking.barber_name}-${booking.booking_time}`;
      grid[key] = booking;
    });
    
    return grid;
  }, [dayBookings]);

  const timeSlots = generateTimeSlots();

  // State per il modal
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  // Funzioni per gestire il modal
  const openBookingModal = (booking: Booking) => {
    setSelectedBooking(booking);
  };

  const closeBookingModal = () => {
    setSelectedBooking(null);
  };

  // Funzioni per ottenere gli stili dei blocchi prenotazione
  const getBookingStyles = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-600 border-green-400 text-white';
      case 'pending':
        return 'bg-yellow-600 border-yellow-400 text-white';
      case 'cancelled':
        return 'bg-red-600 border-red-400 text-white';
      default:
        return 'bg-gray-600 border-gray-400 text-white';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return '✅';
      case 'pending':
        return '⏳';
      case 'cancelled':
        return '❌';
      default:
        return '📅';
    }
  };

  if (dayBookings.length === 0) {
    return (
      <div className="mt-8 bg-gray-800 rounded-lg p-8 text-center">
        <h2 className="text-xl font-bold text-white mb-4">
          📅 Calendario Prenotazioni - {format(parseISO(selectedDate + 'T00:00:00'), 'dd MMMM yyyy', { locale: it })}
        </h2>
        <div className="text-gray-400">
          <p className="text-lg">Nessuna prenotazione per questa data</p>
          <p className="text-sm mt-2">Seleziona un'altra data per vedere le prenotazioni</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 bg-gray-800 rounded-lg p-4 sm:p-6">
      <h2 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6 text-center">
        📅 Calendario Prenotazioni
        <div className="text-sm sm:text-base font-normal text-gray-300 mt-1">
          {format(parseISO(selectedDate + 'T00:00:00'), 'dd MMMM yyyy', { locale: it })}
        </div>
      </h2>
      
      {/* Legenda */}
      <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-4 sm:mb-6 text-xs sm:text-sm">
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-600 border border-green-400 rounded"></div>
          <span className="text-gray-300">✅ Confermato</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="w-3 h-3 sm:w-4 sm:h-4 bg-yellow-600 border border-yellow-400 rounded"></div>
          <span className="text-gray-300">⏳ In attesa</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="w-3 h-3 sm:w-4 sm:h-4 bg-red-600 border border-red-400 rounded"></div>
          <span className="text-gray-300">❌ Annullato</span>
        </div>
      </div>

      {/* Griglia del calendario */}
      <div className="overflow-x-auto">
        <div className="min-w-[280px] sm:min-w-[400px] lg:min-w-[600px]">
          {/* Header con i barbieri */}
          <div className="grid grid-cols-4 gap-1 mb-1">
            <div className="p-1 sm:p-2 text-center font-semibold text-gray-300 bg-gray-700 rounded text-xs">
              🕐 Orario
            </div>
            {BARBERS.map(barber => (
              <div 
                key={barber.email} 
                className="p-1 sm:p-2 text-center font-semibold text-white bg-amber-600 rounded text-xs"
              >
                <span className="hidden sm:inline">🧔 </span>{barber.name}
              </div>
            ))}
          </div>

          {/* Righe degli orari */}
          {timeSlots.map(timeSlot => (
            <motion.div 
              key={timeSlot}
              className="grid grid-cols-4 gap-1 mb-1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Colonna orario */}
              <div className="p-1 sm:p-2 text-center font-mono font-semibold text-white bg-gray-700 rounded border border-gray-600 text-xs">
                {timeSlot}
              </div>
              
              {/* Celle per ogni barbiere */}
              {BARBERS.map(barber => {
                const bookingKey = `${barber.name}-${timeSlot}`;
                const booking = bookingGrid[bookingKey];
                
                return (
                  <div 
                    key={`${barber.email}-${timeSlot}`}
                    className="relative min-h-[35px] sm:min-h-[40px] border border-gray-600 rounded bg-gray-900/50"
                  >
                    {booking ? (
                      <motion.div
                        className={`absolute inset-0 p-1 rounded border-2 cursor-pointer hover:shadow-lg transition-all duration-200 ${getBookingStyles(booking.status)}`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => openBookingModal(booking)}
                      >
                        <div className="h-full flex flex-col justify-center text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold truncate text-xs">
                              {booking.customer_name.split(' ')[0]}
                            </span>
                            <span className="text-xs">
                              {getStatusIcon(booking.status)}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-xs">
                        <span className="hidden sm:inline">Libero</span>
                        <span className="sm:hidden">-</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Statistiche giornaliere */}
      <div className="mt-4 sm:mt-6 grid grid-cols-3 gap-2 sm:gap-4">
        <div className="bg-gray-700 p-3 sm:p-4 rounded-lg text-center">
          <div className="text-lg sm:text-2xl font-bold text-white">{dayBookings.length}</div>
          <div className="text-xs sm:text-sm text-gray-300">Totali</div>
        </div>
        <div className="bg-gray-700 p-3 sm:p-4 rounded-lg text-center">
          <div className="text-lg sm:text-2xl font-bold text-green-400">
            {dayBookings.filter(b => b.status === 'confirmed').length}
          </div>
          <div className="text-xs sm:text-sm text-gray-300">Confermate</div>
        </div>
        <div className="bg-gray-700 p-3 sm:p-4 rounded-lg text-center">
          <div className="text-lg sm:text-2xl font-bold text-yellow-400">
            {dayBookings.filter(b => b.status === 'pending').length}
          </div>
          <div className="text-xs sm:text-sm text-gray-300">In Attesa</div>
        </div>
      </div>

      {/* Modal per dettagli prenotazione - ottimizzato per mobile PWA */}
      {selectedBooking && (
        <motion.div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeBookingModal();
            }
          }}
        >
          <motion.div 
            className="bg-gray-800 rounded-lg shadow-xl w-full max-w-sm mx-auto 
                     max-h-[60vh] sm:max-h-[70vh] overflow-y-auto
                     mb-16 sm:mb-0" // Margine inferiore per evitare sovrapposizione con navbar PWA
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Modal */}
            <div className="sticky top-0 bg-gray-800 p-4 border-b border-gray-700 rounded-t-lg">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-white">
                  📅 Dettagli Prenotazione
                </h3>
                <button
                  onClick={closeBookingModal}
                  className="text-gray-400 hover:text-white text-xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-700 transition-colors"
                >
                  ×
                </button>
              </div>
            </div>
            
            {/* Contenuto Modal */}
            <div className="p-4 space-y-3">
              {/* Status Badge */}
              <div className="flex justify-center">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getBookingStyles(selectedBooking.status)}`}>
                  {getStatusIcon(selectedBooking.status)} {selectedBooking.status.toUpperCase()}
                </span>
              </div>
              
              {/* Informazioni Cliente */}
              <div className="space-y-2">
                <div className="bg-gray-700 rounded-lg p-3">
                  <h4 className="text-white font-semibold mb-2">👤 Cliente</h4>
                  <p className="text-gray-300"><strong>Nome:</strong> {selectedBooking.customer_name}</p>
                  <p className="text-gray-300"><strong>Telefono:</strong> {selectedBooking.customer_phone}</p>
                  {selectedBooking.customer_email && (
                    <p className="text-gray-300"><strong>Email:</strong> {selectedBooking.customer_email}</p>
                  )}
                </div>
                
                {/* Informazioni Servizio */}
                <div className="bg-gray-700 rounded-lg p-3">
                  <h4 className="text-white font-semibold mb-2">✂️ Servizio</h4>
                  <p className="text-gray-300"><strong>Tipo:</strong> {selectedBooking.service_name}</p>
                  <p className="text-gray-300"><strong>Barbiere:</strong> {selectedBooking.barber_name}</p>
                  <p className="text-gray-300">
                    <strong>Data e Ora:</strong> {format(parseISO(selectedBooking.booking_date + 'T00:00:00'), 'dd/MM/yyyy', { locale: it })} - {selectedBooking.booking_time}
                  </p>
                </div>
                
                {/* Note (se presenti) */}
                {selectedBooking.notes && (
                  <div className="bg-gray-700 rounded-lg p-3">
                    <h4 className="text-white font-semibold mb-2">📝 Note</h4>
                    <p className="text-gray-300">{selectedBooking.notes}</p>
                  </div>
                )}
                
                {/* Data Creazione */}
                <div className="bg-gray-700 rounded-lg p-3">
                  <h4 className="text-white font-semibold mb-2">📆 Informazioni</h4>
                  <p className="text-gray-300 text-sm">
                    <strong>Prenotata il:</strong> {format(parseISO(selectedBooking.created_at), 'dd/MM/yyyy HH:mm', { locale: it })}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Footer con azioni - compatto per mobile */}
            <div className="sticky bottom-0 bg-gray-800 p-3 border-t border-gray-700 rounded-b-lg">
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    onWhatsAppClick(selectedBooking);
                    closeBookingModal();
                  }}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-1 text-sm"
                >
                  💬 WhatsApp
                </button>
                <button
                  onClick={() => {
                    onPhoneClick(selectedBooking.customer_phone);
                    closeBookingModal();
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-1 text-sm"
                >
                  📞 Chiama
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default CalendarGrid;
