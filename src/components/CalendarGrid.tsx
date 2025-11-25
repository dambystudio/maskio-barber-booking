'use client';

import { useState, useMemo, useEffect } from 'react';
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

interface WaitlistEntry {
  id: string;
  user_name: string;
  user_email: string;
  user_phone?: string;
  barber_name: string;
  date: string;
  preferred_time?: string;
  status: string;
  created_at: string;
}

interface CalendarGridProps {
  bookings: Booking[];
  selectedDate: string;
  onWhatsAppClick: (booking: Booking) => void;
  onPhoneClick: (phone: string) => void;
  onCancelBooking: (bookingId: string) => void;
  onModifyBooking?: (booking: Booking) => void;
  canModifyBookings?: boolean;
  currentUserEmail?: string;
}

const CalendarGrid = ({ 
  bookings, 
  selectedDate, 
  onWhatsAppClick, 
  onPhoneClick,
  onCancelBooking,
  onModifyBooking,
  canModifyBookings = false,
  currentUserEmail
}: CalendarGridProps) => {
  const [waitlistEntries, setWaitlistEntries] = useState<WaitlistEntry[]>([]);
  const [loadingWaitlist, setLoadingWaitlist] = useState(false);
  
  // Definisco i barbieri fissi
  const BARBERS = [
    { name: 'Fabio', email: 'fabio.cassano97@icloud.com' },
    { name: 'Michele', email: 'michelebiancofiore0230@gmail.com' },
    { name: 'Nicolò', email: 'nicolodesantis069@gmail.com' }
  ];

  // Fetch liste d'attesa per la data selezionata
  useEffect(() => {
    const fetchWaitlist = async () => {
      try {
        setLoadingWaitlist(true);
        console.log('🔍 Fetching waitlist for date:', selectedDate);
        const response = await fetch(`/api/waitlist?date=${selectedDate}`);
        console.log('📡 Response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('📊 Waitlist data received:', data);
          setWaitlistEntries(data.entries || []);
        } else {
          console.error('❌ Response not OK:', await response.text());
        }
      } catch (error) {
        console.error('❌ Errore caricando liste d\'attesa:', error);
      } finally {
        setLoadingWaitlist(false);
      }
    };

    fetchWaitlist();
  }, [selectedDate]);

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
    
    if (dayOfWeek === 1) { // Lunedì - solo pomeriggio fino alle 18:00
      for (let hour = 15; hour <= 18; hour++) {
        if (hour === 18) {
          slots.push(`${hour.toString().padStart(2, '0')}:00`); // Solo 18:00, no 18:30
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
  // Escludo le prenotazioni cancellate per liberare gli slot
  const bookingGrid = useMemo(() => {
    const grid: { [key: string]: Booking } = {};
    
    dayBookings.forEach(booking => {
      // Non mostrare le prenotazioni cancellate nel calendario
      // Questo libera gli slot per nuove prenotazioni
      if (booking.status !== 'cancelled') {
        // Normalizziamo il nome del barbiere per la chiave
        // La chiave deve corrispondere esattamente al nome in BARBERS
        let barberKey = booking.barber_name;
        
        // Gestione dei vari formati di nome che potrebbero arrivare dal database
        if (booking.barber_name.toLowerCase().includes('fabio')) {
          barberKey = 'Fabio';
        } else if (booking.barber_name.toLowerCase().includes('michele')) {
          barberKey = 'Michele';
        } else if (booking.barber_name.toLowerCase().includes('nicolò') || 
                   booking.barber_name.toLowerCase().includes('nicolo') ||
                   booking.barber_name.toLowerCase().includes('de santis')) {
          barberKey = 'Nicolò';
        }
        
        const key = `${barberKey}-${booking.booking_time}`;
        grid[key] = booking;
      }
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
  const getBookingStyles = (status: string, serviceName?: string) => {
    // Solo per prenotazioni confermate, usa colori per servizio
    if (status === 'confirmed' && serviceName) {
      const service = serviceName.toLowerCase();
      
      // Taglio e Barba (controlla per primo perché contiene "barba")
      if (service.includes('taglio') && service.includes('barba')) {
        return 'bg-blue-600 border-blue-400 text-white';
      }
      
      // Solo Barba
      if (service.includes('barba') && !service.includes('taglio')) {
        return 'bg-yellow-600 border-yellow-400 text-white';
      }
      
      // Solo Taglio
      if (service.includes('taglio') && !service.includes('barba')) {
        return 'bg-green-600 border-green-400 text-white';
      }
      
      // Default per servizi confermati non riconosciuti
      return 'bg-green-600 border-green-400 text-white';
    }
    
    // Stati diversi da confirmed
    switch (status) {
      case 'pending':
        return 'bg-orange-600 border-orange-400 text-white';
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
        <div className="min-w-[280px] sm:min-w-[500px] lg:min-w-[700px]">
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
                        className={`absolute inset-0 p-1 rounded border-2 cursor-pointer hover:shadow-lg transition-all duration-200 ${getBookingStyles(booking.status, booking.service_name)}`}
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
          <div className="text-lg sm:text-2xl font-bold text-white">
            {dayBookings.filter(b => b.status !== 'cancelled').length}
          </div>
          <div className="text-xs sm:text-sm text-gray-300">Attive</div>
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

      {/* Legenda Colori Servizi */}
      <div className="mt-4 bg-gray-700 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-white mb-3">📋 Legenda Servizi</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-600 border-2 border-green-400 rounded"></div>
            <span className="text-sm text-gray-300">Taglio</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-600 border-2 border-yellow-400 rounded"></div>
            <span className="text-sm text-gray-300">Barba</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-600 border-2 border-blue-400 rounded"></div>
            <span className="text-sm text-gray-300">Taglio e Barba</span>
          </div>
        </div>
        <div className="mt-2 pt-2 border-t border-gray-600">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span>Altri stati:</span>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-orange-600 border border-orange-400 rounded"></div>
              <span>In attesa</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-600 border border-red-400 rounded"></div>
              <span>Annullata</span>
            </div>
          </div>
        </div>
      </div>

      {/* Liste d'Attesa per questa data */}
      <div className="mt-6 bg-gray-800 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            🔔 Liste d'Attesa del {format(parseISO(selectedDate), 'dd/MM/yyyy')}
          </h3>
          {loadingWaitlist && (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-500"></div>
          )}
        </div>

        {waitlistEntries.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p className="text-sm">📭 Nessuna lista d'attesa per questa data</p>
          </div>
        ) : (
          <div className="space-y-3">
            {waitlistEntries.map((entry, index) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-gray-700 rounded-lg p-3 border-l-4 border-yellow-500"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-white">{entry.user_name}</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        entry.status === 'active' || entry.status === 'waiting' ? 'bg-yellow-500 text-black' :
                        entry.status === 'notified' ? 'bg-blue-500 text-white' :
                        entry.status === 'booked' ? 'bg-green-500 text-white' :
                        'bg-gray-500 text-white'
                      }`}>
                        {entry.status === 'active' || entry.status === 'waiting' ? '⏳ In Attesa' :
                         entry.status === 'notified' ? '🔔 Notificato' :
                         entry.status === 'booked' ? '✅ Prenotato' :
                         '❌ Scaduto'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-300 space-y-1">
                      <div className="flex items-center gap-2">
                        <span>🧔 {entry.barber_name}</span>
                        {entry.preferred_time && (
                          <span className="text-yellow-400">• ⏰ {entry.preferred_time}</span>
                        )}
                      </div>
                      {entry.user_phone && (
                        <div className="flex items-center gap-2">
                          <span>📞 {entry.user_phone}</span>
                        </div>
                      )}
                      <div className="text-xs text-gray-400">
                        Iscritto: {format(parseISO(entry.created_at), 'dd/MM/yyyy HH:mm')}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {entry.user_phone && (
                      <>
                        <button
                          onClick={() => {
                            const phone = entry.user_phone!.replace(/\D/g, '');
                            const message = encodeURIComponent(
                              `Ciao ${entry.user_name}! 🎉 Ti contattiamo dalla Barberia Maskio. Riguardo alla tua richiesta in lista d'attesa per il ${format(parseISO(selectedDate), 'dd MMMM yyyy', { locale: it })}, ti informiamo che ora è disponibile un posto! Puoi prenotare sul nostro sito. Grazie! ✂️`
                            );
                            window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
                          }}
                          className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-medium transition-colors"
                          title="Contatta via WhatsApp"
                        >
                          💬 WhatsApp
                        </button>
                        <button
                          onClick={() => onPhoneClick(entry.user_phone!)}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition-colors"
                          title="Chiama"
                        >
                          📞 Chiama
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
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
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getBookingStyles(selectedBooking.status, selectedBooking.service_name)}`}>
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
            <div className="sticky bottom-0 bg-gray-800 p-3 border-t border-gray-700 rounded-b-lg space-y-2">
              {/* Prima riga: Pulsante modifica (se disponibile e autorizzato) */}
              {onModifyBooking && canModifyBookings && selectedBooking.status !== 'cancelled' && (
                <button
                  onClick={() => {
                    onModifyBooking(selectedBooking);
                    closeBookingModal();
                  }}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  🔄 Modifica Appuntamento
                </button>
              )}
              
              {/* Seconda riga: Azioni di contatto e annullamento */}
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
                {/* Pulsante Annulla - solo se la prenotazione non è già annullata */}
                {selectedBooking.status !== 'cancelled' && (
                  <button
                    onClick={() => {
                      if (confirm(`Sei sicuro di voler annullare la prenotazione di ${selectedBooking.customer_name}?`)) {
                        onCancelBooking(selectedBooking.id);
                        closeBookingModal();
                      }
                    }}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-1 text-sm"
                  >
                    ❌ Annulla
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default CalendarGrid;
