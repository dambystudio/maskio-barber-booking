'use client';

import { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';

interface Booking {
  id: string;
  service_name: string;
  barber_name: string;
  booking_date: string;
  booking_time: string;
  customer_name: string;
  customer_phone: string;
  status: 'confirmed' | 'pending' | 'cancelled';
}

interface BookingSwapModalProps {
  booking: Booking;
  allBookings: Booking[];
  barberEmail: string;
  onClose: () => void;
  onSwapComplete: () => void;
}

// Componente per la griglia degli slot orari con colori
interface TimeSlotGridProps {
  selectedDate: string;
  selectedTime: string;
  barberEmail: string;
  barberName: string; // ✅ AGGIUNTO: Nome del barbiere per logica lunedì
  excludeBookingId: string;
  allBookings: Booking[];
  onTimeSelect: (time: string, availability: { available: boolean; occupiedBy?: any }) => void;
}

function TimeSlotGrid({
  selectedDate,
  selectedTime,
  barberEmail,
  barberName, // ✅ AGGIUNTO
  excludeBookingId,
  allBookings,
  onTimeSelect
}: TimeSlotGridProps) {
  const [slotsAvailability, setSlotsAvailability] = useState<{
    [time: string]: { available: boolean; occupiedBy?: any; loading: boolean }
  }>({});

  // Genera gli slot orari basati sulla data (sabato ha orari diversi)
  const generateTimeSlots = () => {
    const slots = [];
    const date = new Date(selectedDate);
    const dayOfWeek = date.getDay();
    
    // ✅ LUNEDÌ (giorno 1) - Logica speciale
    if (dayOfWeek === 1) {
      // Michele: NO mattina, pomeriggio 15:00-18:00
      // Fabio: CHIUSO completamente
      const barberNameLower = barberName.toLowerCase();
      
      if (barberNameLower === 'fabio') {
        // Fabio è chiuso il lunedì - nessuno slot
        return [];
      } else if (barberNameLower === 'michele') {
        // Michele: solo pomeriggio 15:00-18:00 (7 slot)
        for (let hour = 15; hour <= 18; hour++) {
          if (hour === 18) {
            slots.push('18:00'); // Solo 18:00, no 18:30
          } else {
            slots.push(`${hour.toString().padStart(2, '0')}:00`);
            slots.push(`${hour.toString().padStart(2, '0')}:30`);
          }
        }
        return slots;
      }
    }
    
    // Mattina: 9:00-12:30 (tutti gli altri giorni eccetto lunedì)
    if (dayOfWeek !== 1) {
      for (let hour = 9; hour <= 12; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          if (hour === 12 && minute > 30) break;
          const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
          slots.push(time);
        }
      }
    }
    
    // Pomeriggio: dipende dal giorno
    if (dayOfWeek === 6) {
      // ✅ SABATO: 14:30-17:00 (NO 17:30)
      slots.push('14:30');
      for (let hour = 15; hour <= 17; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          if (hour === 17 && minute > 0) break; // Stop at 17:00 (no 17:30)
          const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
          slots.push(time);
        }
      }
    } else if (dayOfWeek !== 1) {
      // Altri giorni (non lunedì): 15:00-17:30
      for (let hour = 15; hour <= 17; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          if (hour === 17 && minute > 30) break;
          const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
          slots.push(time);
        }
      }
    }
    
    return slots;
  };

  // Controlla disponibilità per tutti gli slot quando cambia la data
  useEffect(() => {
    const checkAllSlots = () => {
      const slots = generateTimeSlots();
      
      // 🔍 DEBUG: Log informazioni controllo slot
      console.log('🔍 TimeSlotGrid checkAllSlots:', {
        selectedDate,
        barberName,
        slotsGenerated: slots.length,
        slots: slots,
        totalBookings: allBookings.length,
        bookingsForBarber: allBookings.filter(b => b.barber_name === barberName).length,
        bookingsForDate: allBookings.filter(b => b.booking_date === selectedDate).length,
        bookingsForBarberAndDate: allBookings.filter(b => 
          b.barber_name === barberName && b.booking_date === selectedDate
        ).length
      });
      
      // Controlla gli slot usando le prenotazioni esistenti
      const slotsMap: typeof slotsAvailability = {};
      
      slots.forEach(time => {
        // Cerca una prenotazione esistente per questo slot
        const existingBooking = allBookings.find(booking => 
          booking.booking_date === selectedDate && 
          booking.booking_time === time && 
          booking.id !== excludeBookingId && 
          booking.status !== 'cancelled' &&
          booking.barber_name === barberName // ✅ Filtra per barbiere specifico
        );

        if (existingBooking) {
          // Slot occupato
          slotsMap[time] = {
            available: false,
            occupiedBy: {
              id: existingBooking.id,
              customerName: existingBooking.customer_name
            },
            loading: false
          };
        } else {
          // Slot libero
          slotsMap[time] = {
            available: true,
            loading: false
          };
        }
      });

      setSlotsAvailability(slotsMap);
    };

    if (selectedDate && allBookings) {
      checkAllSlots();
    }
  }, [selectedDate, allBookings, excludeBookingId]);

  const handleTimeClick = (time: string) => {
    const availability = slotsAvailability[time];
    if (availability && !availability.loading) {
      onTimeSelect(time, {
        available: availability.available,
        occupiedBy: availability.occupiedBy
      });
    }
  };

  const getSlotClassName = (time: string) => {
    const availability = slotsAvailability[time];
    const isSelected = selectedTime === time;
    
    if (availability?.loading) {
      return 'p-3 rounded-lg border-2 border-gray-600 bg-gray-700 text-gray-400 cursor-wait animate-pulse';
    }
    
    if (isSelected) {
      return 'p-3 rounded-lg border-2 border-blue-500 bg-blue-600 text-white cursor-pointer transform scale-105 shadow-lg';
    }
    
    if (availability?.available) {
      return 'p-3 rounded-lg border-2 border-green-500 bg-green-600 text-white cursor-pointer hover:bg-green-700 transition-all hover:scale-105';
    } else {
      return 'p-3 rounded-lg border-2 border-red-500 bg-red-600 text-white cursor-pointer hover:bg-red-700 transition-all hover:scale-105';
    }
  };

  const getSlotIcon = (time: string) => {
    const availability = slotsAvailability[time];
    
    if (availability?.loading) return '⏳';
    if (selectedTime === time) return '👆';
    if (availability?.available) return '✅';
    return '❌';
  };

  return (
    <div className="space-y-4">
      {/* 🔍 DEBUG BANNER TimeSlotGrid */}
      <div className="bg-blue-900/50 border border-blue-500 rounded-lg p-2 mb-3 text-xs">
        <div className="font-bold text-blue-300 mb-1">🔍 TimeSlotGrid DEBUG:</div>
        <div className="text-white space-y-1">
          <div>Barbiere: <span className="font-bold text-yellow-300">{barberName}</span></div>
          <div>Slot generati: <span className="font-bold text-yellow-300">{generateTimeSlots().length}</span></div>
          <div>Prenotazioni barber per data: <span className="font-bold text-yellow-300">
            {allBookings.filter(b => b.barber_name === barberName && b.booking_date === selectedDate).length}
          </span></div>
        </div>
      </div>
      
      {/* Slot mattutini */}
      <div>
        <h4 className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
          🌅 Mattina (9:00 - 12:30)
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {generateTimeSlots().filter(time => {
            const hour = parseInt(time.split(':')[0]);
            return hour >= 9 && hour <= 12;
          }).map(time => (
            <button
              key={time}
              onClick={() => handleTimeClick(time)}
              disabled={slotsAvailability[time]?.loading}
              className={getSlotClassName(time)}
            >
              <div className="text-center">
                <div className="text-lg mb-1">{getSlotIcon(time)}</div>
                <div className="font-medium">{time}</div>
                {slotsAvailability[time]?.occupiedBy && (
                  <div className="text-xs mt-1 opacity-80">
                    {slotsAvailability[time].occupiedBy.customerName}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Slot pomeridiani */}
      <div>
        <h4 className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
          🌆 Pomeriggio (15:00 - 17:30)
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {generateTimeSlots().filter(time => {
            const hour = parseInt(time.split(':')[0]);
            return hour >= 15 && hour <= 17;
          }).map(time => (
            <button
              key={time}
              onClick={() => handleTimeClick(time)}
              disabled={slotsAvailability[time]?.loading}
              className={getSlotClassName(time)}
            >
              <div className="text-center">
                <div className="text-lg mb-1">{getSlotIcon(time)}</div>
                <div className="font-medium">{time}</div>
                {slotsAvailability[time]?.occupiedBy && (
                  <div className="text-xs mt-1 opacity-80">
                    {slotsAvailability[time].occupiedBy.customerName}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function BookingSwapModal({
  booking,
  allBookings,
  barberEmail,
  onClose,
  onSwapComplete
}: BookingSwapModalProps) {
  const [swapMode, setSwapMode] = useState<'move' | 'swap'>('move');
  const [selectedDate, setSelectedDate] = useState(booking.booking_date);
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedBookingForSwap, setSelectedBookingForSwap] = useState<Booking | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [slotAvailability, setSlotAvailability] = useState<{ available: boolean; occupiedBy?: any } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // ✅ NUOVO: State per prenotazioni del barbiere corretto
  const [barberBookings, setBarberBookings] = useState<Booking[]>(allBookings);
  const [loadingBarberBookings, setLoadingBarberBookings] = useState(true);

  // ✅ NUOVO: Fetch prenotazioni del barbiere dell'appuntamento
  useEffect(() => {
    const fetchBarberBookings = async () => {
      try {
        setLoadingBarberBookings(true);
        console.log('🔄 Fetching bookings for barber:', barberEmail);
        
        const response = await fetch(`/api/bookings?barberEmail=${encodeURIComponent(barberEmail)}`);
        if (response.ok) {
          const data = await response.json();
          const bookingsArray = data.bookings || [];
          console.log('✅ Fetched bookings:', bookingsArray.length);
          setBarberBookings(bookingsArray);
        } else {
          console.error('❌ Failed to fetch barber bookings:', response.status);
          setBarberBookings(allBookings); // Fallback
        }
      } catch (error) {
        console.error('❌ Error fetching barber bookings:', error);
        setBarberBookings(allBookings); // Fallback
      } finally {
        setLoadingBarberBookings(false);
      }
    };
    
    fetchBarberBookings();
  }, [barberEmail]); // Dipende solo da barberEmail

  // 🔍 DEBUG: Log props ricevute
  useEffect(() => {
    console.log('📋 BookingSwapModal Props:', {
      bookingId: booking.id,
      barberName: booking.barber_name,
      barberEmail: barberEmail,
      bookingDate: booking.booking_date,
      bookingTime: booking.booking_time,
      totalBookings: allBookings.length,
      bookingsForBarber: allBookings.filter(b => b.barber_name === booking.barber_name).length,
      barberBookingsLoaded: barberBookings.length
    });
  }, [booking, barberEmail, allBookings, barberBookings]);

  // Generiamo gli slot orari disponibili (basati sulla data selezionata)
  const generateTimeSlots = () => {
    const slots = [];
    const date = new Date(selectedDate);
    const dayOfWeek = date.getDay();
    
    // ✅ LUNEDÌ (giorno 1) - Logica speciale
    if (dayOfWeek === 1) {
      // Michele: NO mattina, pomeriggio 15:00-18:00
      // Fabio: CHIUSO completamente
      const barberName = booking.barber_name.toLowerCase();
      
      if (barberName === 'fabio') {
        // Fabio è chiuso il lunedì - nessuno slot
        return [];
      } else if (barberName === 'michele') {
        // Michele: solo pomeriggio 15:00-18:00 (7 slot)
        for (let hour = 15; hour <= 18; hour++) {
          if (hour === 18) {
            slots.push('18:00'); // Solo 18:00, no 18:30
          } else {
            slots.push(`${hour.toString().padStart(2, '0')}:00`);
            slots.push(`${hour.toString().padStart(2, '0')}:30`);
          }
        }
        return slots;
      }
    }
    
    // Mattina: 9:00-12:30 (tutti gli altri giorni eccetto lunedì)
    if (dayOfWeek !== 1) {
      for (let hour = 9; hour <= 12; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          if (hour === 12 && minute > 30) break;
          const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
          slots.push(time);
        }
      }
    }
    
    // Pomeriggio: dipende dal giorno
    if (dayOfWeek === 6) {
      // ✅ SABATO: 14:30-17:00 (NO 17:30)
      slots.push('14:30');
      for (let hour = 15; hour <= 17; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          if (hour === 17 && minute > 0) break; // Stop at 17:00 (no 17:30)
          const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
          slots.push(time);
        }
      }
    } else if (dayOfWeek !== 1) {
      // Altri giorni (non lunedì): 15:00-17:30
      for (let hour = 15; hour <= 17; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          if (hour === 17 && minute > 30) break;
          const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
          slots.push(time);
        }
      }
    }
    
    return slots;
  };

  // Controlla disponibilità dello slot
  const checkSlotAvailability = async (date: string, time: string) => {
    if (!time) return;
    
    setIsChecking(true);
    try {
      const response = await fetch(
        `/api/booking-swap?barberEmail=${barberEmail}&date=${date}&time=${time}&excludeBookingId=${booking.id}`
      );
      const data = await response.json();
      setSlotAvailability(data);
    } catch (error) {
      console.error('Errore nel controllo disponibilità:', error);
    } finally {
      setIsChecking(false);
    }
  };

  // Esegui lo scambio/spostamento
  const handleSwap = async () => {
    setIsProcessing(true);
    try {
      let payload;
      
      if (swapMode === 'move') {
        payload = {
          booking1Id: booking.id,
          swapType: 'move',
          newDate: selectedDate,
          newTime: selectedTime
        };
      } else {
        if (!selectedBookingForSwap) {
          alert('Seleziona un appuntamento con cui scambiare');
          setIsProcessing(false);
          return;
        }
        payload = {
          booking1Id: booking.id,
          booking2Id: selectedBookingForSwap.id,
          swapType: 'swap'
        };
      }

      console.log('📤 Invio richiesta swap:', payload);

      const response = await fetch('/api/booking-swap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      console.log('📥 Risposta status:', response.status);

      const data = await response.json();
      console.log('📥 Risposta data:', data);
      
      if (data.success) {
        alert(data.message);
        onSwapComplete();
        onClose();
      } else {
        alert(data.error || 'Errore durante lo scambio');
        if (data.details) {
          console.error('Dettagli errore:', data.details);
        }
      }
    } catch (error) {
      console.error('❌ Errore nello scambio:', error);
      alert('Errore durante lo scambio: ' + (error instanceof Error ? error.message : 'Errore sconosciuto'));
    } finally {
      setIsProcessing(false);
    }
  };

  // Filtra le prenotazioni per lo scambio (escludi quella corrente)
  const availableBookingsForSwap = barberBookings.filter(b => 
    b.id !== booking.id && 
    b.status !== 'cancelled'
  );

  // Genera le date future (prossimi 30 giorni)
  const generateDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      // Salta le domeniche (giorno 0)
      if (date.getDay() !== 0) {
        dates.push(format(date, 'yyyy-MM-dd'));
      }
    }
    return dates;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 1rem))' }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-4xl flex flex-col"
        style={{ 
          maxHeight: 'calc(90vh - 100px)', // Ridotto per lasciare spazio alla navbar
          marginBottom: '80px' // Spazio extra per la navbar in basso
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-700 flex-shrink-0">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            🔄 Modifica Appuntamento
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-2"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4" style={{ paddingBottom: '120px' }}>
          
          {/* 🔍 DEBUG BANNER - Visibile su telefono */}
          <div className="bg-purple-900/50 border border-purple-500 rounded-lg p-3 mb-4 text-xs">
            <div className="font-bold text-purple-300 mb-2">🔍 DEBUG INFO:</div>
            <div className="text-white space-y-1">
              <div>Barbiere appuntamento: <span className="font-bold text-yellow-300">{booking.barber_name}</span></div>
              <div>Email ricevuta: <span className="font-bold text-yellow-300">{barberEmail}</span></div>
              <div>Prenotazioni totali (prop): <span className="font-bold text-yellow-300">{allBookings.length}</span></div>
              <div>Prenotazioni {booking.barber_name} (prop): <span className="font-bold text-yellow-300">
                {allBookings.filter(b => b.barber_name === booking.barber_name).length}
              </span></div>
              <div>✅ Prenotazioni caricate (API): <span className="font-bold text-green-300">
                {loadingBarberBookings ? 'Caricamento...' : barberBookings.length}
              </span></div>
              <div>Data selezionata: <span className="font-bold text-yellow-300">{selectedDate}</span></div>
            </div>
          </div>

          {/* Info appuntamento corrente */}
          <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-amber-400 mb-2">Appuntamento da modificare:</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-gray-400">Cliente</div>
              <div className="text-white font-medium">{booking.customer_name}</div>
            </div>
            <div>
              <div className="text-gray-400">Servizio</div>
              <div className="text-white">{booking.service_name}</div>
            </div>
            <div>
              <div className="text-gray-400">Data</div>
              <div className="text-white">{format(parseISO(booking.booking_date), 'dd/MM/yyyy', { locale: it })}</div>
            </div>
            <div>
              <div className="text-gray-400">Ora</div>
              <div className="text-white">{booking.booking_time}</div>
            </div>
          </div>
        </div>

        {/* Mode Selection */}
        <div className="mb-6">
          <div className="flex gap-4 mb-4">
            <button
              onClick={() => setSwapMode('move')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                swapMode === 'move' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              📅 Sposta in slot libero
            </button>
            <button
              onClick={() => setSwapMode('swap')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                swapMode === 'swap' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              🔄 Scambia con altro appuntamento
            </button>
          </div>
        </div>

        {swapMode === 'move' ? (
          /* Modalità Sposta */
          <div className="space-y-6">
            {/* Selezione Data - Scorrimento orizzontale con 3 date visibili */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">Seleziona nuova data:</label>
              <div className="relative">
                <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 px-1">
                  {generateDates().map(date => (
                    <button
                      key={date}
                      onClick={() => {
                        setSelectedDate(date);
                        setSelectedTime('');
                        setSlotAvailability(null);
                      }}
                      className={`flex-shrink-0 p-4 rounded-xl border-2 transition-all min-w-[100px] ${
                        selectedDate === date
                          ? 'border-blue-500 bg-blue-900/50 text-blue-300 shadow-lg scale-105'
                          : 'border-gray-600 bg-gray-800 text-gray-300 hover:border-gray-500 hover:scale-105'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-xs font-medium mb-1">{format(parseISO(date), 'EEE', { locale: it }).toUpperCase()}</div>
                        <div className="text-xl font-bold mb-1">{format(parseISO(date), 'dd')}</div>
                        <div className="text-xs">{format(parseISO(date), 'MMM', { locale: it })}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Selezione Ora con colori per disponibilità */}
            {selectedDate && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Seleziona orario per {format(parseISO(selectedDate), 'dd/MM/yyyy', { locale: it })}:
                </label>
                
                {/* ✅ NUOVO: Messaggio se nessuno slot disponibile (es. Fabio il lunedì) */}
                {generateTimeSlots().length === 0 ? (
                  <div className="bg-red-900/30 border border-red-500 rounded-lg p-6 text-center">
                    <div className="text-red-400 text-4xl mb-3">🔒</div>
                    <div className="text-red-300 font-semibold text-lg mb-2">Giorno chiuso</div>
                    <div className="text-gray-300 text-sm">
                      {booking.barber_name} è chiuso il{' '}
                      {format(parseISO(selectedDate), 'EEEE', { locale: it })}
                    </div>
                    <div className="mt-4 text-xs text-gray-400">
                      Seleziona un'altra data per spostare l'appuntamento
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Legenda colori */}
                    <div className="flex gap-4 mb-4 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded"></div>
                        <span className="text-gray-400">Libero</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded"></div>
                        <span className="text-gray-400">Occupato</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded"></div>
                        <span className="text-gray-400">Selezionato</span>
                      </div>
                    </div>

                    <TimeSlotGrid 
                      selectedDate={selectedDate}
                      selectedTime={selectedTime}
                      barberEmail={barberEmail}
                      barberName={booking.barber_name} 
                      excludeBookingId={booking.id}
                      allBookings={barberBookings}
                      onTimeSelect={(time, availability) => {
                        setSelectedTime(time);
                        setSlotAvailability(availability);
                      }}
                    />
                  </>
                )}
              </div>
            )}

            {/* Risultato selezione slot */}
            {selectedTime && slotAvailability && (
              <div className="bg-gray-800 rounded-lg p-4">
                {slotAvailability.available ? (
                  <div className="flex items-center gap-3">
                    <div className="text-green-400 text-2xl">✅</div>
                    <div>
                      <div className="text-green-400 font-semibold">Slot libero!</div>
                      <div className="text-gray-300 text-sm">Puoi spostare l'appuntamento alle {selectedTime}</div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="text-red-400 text-2xl">❌</div>
                      <div>
                        <div className="text-red-400 font-semibold">Slot occupato</div>
                        <div className="text-gray-300 text-sm">Cliente: {slotAvailability.occupiedBy?.customerName}</div>
                      </div>
                    </div>
                    <div className="bg-amber-900/30 border border-amber-500 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-amber-400">💡</span>
                        <span className="text-amber-300 font-medium">Vuoi scambiare i due appuntamenti?</span>
                      </div>
                      <button
                        onClick={() => {
                          // Trova l'appuntamento che occupa lo slot
                          const occupiedBooking = allBookings.find(b => 
                            b.booking_date === selectedDate && 
                            b.booking_time === selectedTime &&
                            b.id !== booking.id
                          );
                          if (occupiedBooking) {
                            setSelectedBookingForSwap(occupiedBooking);
                            setSwapMode('swap');
                          }
                        }}
                        className="w-full bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        🔄 Scambia con {slotAvailability.occupiedBy?.customerName}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          /* Modalità Scambio */
          <div className="space-y-6">
            {selectedBookingForSwap ? (
              /* Conferma scambio specifico */
              <div className="bg-blue-900/30 border border-blue-500 rounded-lg p-6">
                <h3 className="text-lg font-medium text-blue-300 mb-4 flex items-center gap-2">
                  🔄 Conferma scambio appuntamenti
                </h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Appuntamento corrente */}
                  <div className="bg-gray-800 rounded-lg p-4">
                    <div className="text-amber-400 font-medium mb-3 flex items-center gap-2">
                      📤 {booking.customer_name} andrà a:
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Data:</span>
                        <span className="text-white">{format(parseISO(selectedBookingForSwap.booking_date), 'dd/MM/yyyy')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Ora:</span>
                        <span className="text-white">{selectedBookingForSwap.booking_time}</span>
                      </div>
                    </div>
                  </div>

                  {/* Appuntamento da scambiare */}
                  <div className="bg-gray-800 rounded-lg p-4">
                    <div className="text-green-400 font-medium mb-3 flex items-center gap-2">
                      📥 {selectedBookingForSwap.customer_name} andrà a:
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Data:</span>
                        <span className="text-white">{format(parseISO(booking.booking_date), 'dd/MM/yyyy')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Ora:</span>
                        <span className="text-white">{booking.booking_time}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() => {
                      setSelectedBookingForSwap(null);
                      setSwapMode('move');
                    }}
                    className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    ← Torna indietro
                  </button>
                </div>
              </div>
            ) : (
              /* Selezione appuntamento da scambiare */
              <div>
                <h3 className="text-lg font-medium text-white mb-4">Seleziona l'appuntamento con cui scambiare:</h3>
                {availableBookingsForSwap.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 bg-gray-800 rounded-lg">
                    <div className="text-4xl mb-2">📅</div>
                    <div>Nessun altro appuntamento disponibile per lo scambio</div>
                    <button
                      onClick={() => setSwapMode('move')}
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Torna a spostamento semplice
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {availableBookingsForSwap.map(b => (
                      <motion.button
                        key={b.id}
                        onClick={() => setSelectedBookingForSwap(b)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full p-4 rounded-lg border-2 border-gray-600 bg-gray-800 hover:border-blue-500 hover:bg-gray-700 transition-all text-left"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="font-medium text-white text-lg">{b.customer_name}</div>
                          <div className="text-blue-400 text-sm">{b.service_name}</div>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <span className="text-gray-400">📅</span>
                            <span className="text-white">{format(parseISO(b.booking_date), 'dd/MM/yyyy')}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-gray-400">🕐</span>
                            <span className="text-white">{b.booking_time}</span>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        </div>

        {/* Actions - Fixed at bottom with safe area */}
        <div 
          className="flex gap-4 px-6 py-4 border-t border-gray-700 bg-gray-900 flex-shrink-0"
          style={{ 
            paddingBottom: 'max(1rem, calc(env(safe-area-inset-bottom, 0px) + 1rem))',
            boxShadow: '0 -4px 6px -1px rgba(0, 0, 0, 0.1), 0 -2px 4px -1px rgba(0, 0, 0, 0.06)'
          }}
        >
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Annulla
          </button>
          
          {swapMode === 'move' && selectedTime && slotAvailability ? (
            slotAvailability.available ? (
              <button
                onClick={handleSwap}
                disabled={isProcessing}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {isProcessing ? '⏳ Spostamento...' : '📅 Sposta in slot libero'}
              </button>
            ) : (
              <button
                onClick={() => {
                  // Trova l'appuntamento che occupa lo slot e passa alla modalità scambio
                  const occupiedBooking = allBookings.find(b => 
                    b.booking_date === selectedDate && 
                    b.booking_time === selectedTime &&
                    b.id !== booking.id
                  );
                  if (occupiedBooking) {
                    setSelectedBookingForSwap(occupiedBooking);
                    setSwapMode('swap');
                  }
                }}
                className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors flex items-center gap-2"
              >
                🔄 Scambia con {slotAvailability.occupiedBy?.customerName}
              </button>
            )
          ) : swapMode === 'swap' && selectedBookingForSwap ? (
            <button
              onClick={handleSwap}
              disabled={isProcessing}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isProcessing ? '⏳ Scambio...' : `🔄 Scambia con ${selectedBookingForSwap.customer_name}`}
            </button>
          ) : (
            <button
              disabled
              className="px-6 py-3 bg-gray-600 text-gray-400 rounded-lg cursor-not-allowed"
            >
              {swapMode === 'move' ? 'Seleziona data e ora' : 'Seleziona appuntamento da scambiare'}
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}