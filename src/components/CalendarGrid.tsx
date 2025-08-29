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
  onCancelBooking?: (bookingId: string) => void;
  onConfirmBooking?: (bookingId: string) => void;
}

const CalendarGrid = ({ 
  bookings, 
  selectedDate, 
  onWhatsAppClick, 
  onPhoneClick,
  onCancelBooking,
  onConfirmBooking
}: CalendarGridProps) => {
  // State per il modal
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Definisco i barbieri fissi
  const BARBERS = [
    { name: 'Fabio', email: 'fabio.cassano97@icloud.com' },
    { name: 'Michele', email: 'michelebiancofiore0230@gmail.com' },
    { name: 'Marco', email: 'marcocis2006@gmail.com' }
  ];

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

  // Filtro le prenotazioni per la data selezionata
  const dayBookings = useMemo(() => {
    return bookings.filter(booking => booking.booking_date === selectedDate);
  }, [bookings, selectedDate]);

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

  // Funzioni per gestire il modal
  const openBookingModal = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  const closeBookingModal = () => {
    setSelectedBooking(null);
    setIsModalOpen(false);
  };

  const handleWhatsAppClick = () => {
    if (selectedBooking) {
      onWhatsAppClick(selectedBooking);
      closeBookingModal();
    }
  };

  const handlePhoneClick = () => {
    if (selectedBooking) {
      onPhoneClick(selectedBooking.customer_phone);
      closeBookingModal();
    }
  };

  const handleCancelBooking = () => {
    if (selectedBooking && onCancelBooking) {
      onCancelBooking(selectedBooking.id);
      closeBookingModal();
    }
  };

  const handleConfirmBooking = () => {
    if (selectedBooking && onConfirmBooking) {
      onConfirmBooking(selectedBooking.id);
      closeBookingModal();
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
    <div className="mt-8 bg-gray-800 rounded-lg p-6">
      <h2 className="text-xl font-bold text-white mb-6 text-center">
        📅 Calendario Prenotazioni - {format(parseISO(selectedDate + 'T00:00:00'), 'dd MMMM yyyy', { locale: it })}
      </h2>
      
      {/* Legenda */}
      <div className="flex flex-wrap justify-center gap-4 mb-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-600 border border-green-400 rounded"></div>
          <span className="text-gray-300">✅ Confermato</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-600 border border-yellow-400 rounded"></div>
          <span className="text-gray-300">⏳ In attesa</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-600 border border-red-400 rounded"></div>
          <span className="text-gray-300">❌ Annullato</span>
        </div>
      </div>

      {/* Griglia del calendario */}
      <div className="overflow-x-auto">
        <div className="min-w-[600px]">
          {/* Header con i barbieri */}
          <div className="grid grid-cols-4 gap-2 mb-2">
            <div className="p-3 text-center font-semibold text-gray-300 bg-gray-700 rounded-lg">
              🕐 Orario
            </div>
            {BARBERS.map(barber => (
              <div 
                key={barber.email} 
                className="p-3 text-center font-semibold text-white bg-amber-600 rounded-lg"
              >
                🧔 {barber.name}
              </div>
            ))}
          </div>

          {/* Righe degli orari */}
          {timeSlots.map(timeSlot => (
            <motion.div 
              key={timeSlot}
              className="grid grid-cols-4 gap-2 mb-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Colonna orario */}
              <div className="p-3 text-center font-mono font-semibold text-white bg-gray-700 rounded-lg border border-gray-600">
                {timeSlot}
              </div>
              
              {/* Celle per ogni barbiere */}
              {BARBERS.map(barber => {
                const bookingKey = `${barber.name}-${timeSlot}`;
                const booking = bookingGrid[bookingKey];
                
                return (
                  <div 
                    key={`${barber.email}-${timeSlot}`}
                    className="relative min-h-[60px] border border-gray-600 rounded-lg bg-gray-900/50"
                  >
                    {booking ? (
                      <motion.div
                        className={`absolute inset-0 p-2 rounded-lg border-2 cursor-pointer hover:shadow-lg transition-all duration-200 ${getBookingStyles(booking.status)}`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => openBookingModal(booking)}
                      >
                        <div className="h-full flex flex-col justify-between text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold truncate">
                              {booking.customer_name}
                            </span>
                            <span className="text-xs">
                              {getStatusIcon(booking.status)}
                            </span>
                          </div>
                          
                          <div className="mt-1">
                            <div className="truncate font-medium">
                              {booking.service_name}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-xs">
                        Libero
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
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-700 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-white">{dayBookings.length}</div>
          <div className="text-sm text-gray-300">Prenotazioni Totali</div>
        </div>
        <div className="bg-gray-700 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-400">
            {dayBookings.filter(b => b.status === 'confirmed').length}
          </div>
          <div className="text-sm text-gray-300">Confermate</div>
        </div>
        <div className="bg-gray-700 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-yellow-400">
            {dayBookings.filter(b => b.status === 'pending').length}
          </div>
          <div className="text-sm text-gray-300">In Attesa</div>
        </div>
      </div>

      {/* Modal per dettagli prenotazione */}
      {isModalOpen && selectedBooking && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeBookingModal}
        >
          <motion.div
            className="bg-gray-800 rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del modal */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">
                📅 Dettagli Prenotazione
              </h3>
              <button
                onClick={closeBookingModal}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            {/* Informazioni cliente */}
            <div className="space-y-4">
              <div className="bg-gray-700 p-4 rounded-lg">
                <h4 className="font-semibold text-white mb-2 flex items-center">
                  👤 Cliente
                </h4>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-300">
                    <strong>Nome:</strong> <span className="text-white">{selectedBooking.customer_name}</span>
                  </p>
                  <p className="text-gray-300">
                    <strong>Telefono:</strong> <span className="text-white">{selectedBooking.customer_phone}</span>
                  </p>
                  {selectedBooking.customer_email && (
                    <p className="text-gray-300">
                      <strong>Email:</strong> <span className="text-white">{selectedBooking.customer_email}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Informazioni appuntamento */}
              <div className="bg-gray-700 p-4 rounded-lg">
                <h4 className="font-semibold text-white mb-2 flex items-center">
                  ✂️ Appuntamento
                </h4>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-300">
                    <strong>Barbiere:</strong> <span className="text-white">{selectedBooking.barber_name}</span>
                  </p>
                  <p className="text-gray-300">
                    <strong>Servizio:</strong> <span className="text-white">{selectedBooking.service_name}</span>
                  </p>
                  <p className="text-gray-300">
                    <strong>Data:</strong> <span className="text-white">
                      {format(parseISO(selectedBooking.booking_date + 'T00:00:00'), 'dd MMMM yyyy', { locale: it })}
                    </span>
                  </p>
                  <p className="text-gray-300">
                    <strong>Ora:</strong> <span className="text-white">{selectedBooking.booking_time}</span>
                  </p>
                  <p className="text-gray-300">
                    <strong>Stato:</strong> 
                    <span className={`ml-2 px-2 py-1 rounded text-xs font-semibold ${
                      selectedBooking.status === 'confirmed' ? 'bg-green-600 text-white' :
                      selectedBooking.status === 'pending' ? 'bg-yellow-600 text-white' :
                      'bg-red-600 text-white'
                    }`}>
                      {getStatusIcon(selectedBooking.status)} {
                        selectedBooking.status === 'confirmed' ? 'Confermato' :
                        selectedBooking.status === 'pending' ? 'In Attesa' :
                        'Annullato'
                      }
                    </span>
                  </p>
                  {selectedBooking.notes && (
                    <p className="text-gray-300">
                      <strong>Note:</strong> <span className="text-white">{selectedBooking.notes}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Pulsanti azioni */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleWhatsAppClick}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    💬 WhatsApp
                  </button>
                  <button
                    onClick={handlePhoneClick}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    📞 Chiama
                  </button>
                </div>

                {/* Pulsanti gestione prenotazione */}
                {selectedBooking.status === 'pending' && (
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={handleConfirmBooking}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      ✅ Conferma
                    </button>
                    <button
                      onClick={handleCancelBooking}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      ❌ Annulla
                    </button>
                  </div>
                )}

                {selectedBooking.status === 'confirmed' && (
                  <button
                    onClick={handleCancelBooking}
                    className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    ❌ Annulla Prenotazione
                  </button>
                )}

                <button
                  onClick={closeBookingModal}
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Chiudi
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
