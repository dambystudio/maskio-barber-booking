'use client';

import { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { BookingService } from '@/services/bookingService';

interface Barber {
  id: string;
  name: string;
}

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
  selectedBarber: string | 'all'; // ✅ MODIFICATO: può essere email specifica o 'all'
  currentBarberName: string; // ✅ AGGIUNTO: Nome del barbiere dell'appuntamento corrente
  excludeBookingId: string;
  allBookings: Booking[];
  barbers: Barber[];
  onTimeSelect: (time: string, availability: { available: boolean; occupiedBy?: any; barberName?: string }) => void;
}

function TimeSlotGrid({
  selectedDate,
  selectedTime,
  selectedBarber,
  currentBarberName,
  excludeBookingId,
  allBookings,
  barbers,
  onTimeSelect
}: TimeSlotGridProps) {
  const [slotsAvailability, setSlotsAvailability] = useState<{
    [key: string]: { // key format: "time|barberName"
      available: boolean; 
      occupiedBy?: any; 
      loading: boolean;
      barberName: string;
    }
  }>({});

  // Genera gli slot orari basati sulla data (sabato ha orari diversi)
  const generateTimeSlots = () => {
    const slots = [];
    const date = new Date(selectedDate);
    const dayOfWeek = date.getDay();
    
    // Mattina: 9:00-12:30 (domenica esclusa)
    if (dayOfWeek !== 0) {
      for (let hour = 9; hour <= 12; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          if (hour === 12 && minute > 30) break;
          const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
          slots.push(time);
        }
      }
    }
    
    if (selectedDate === '2026-04-11') {
      // 11 aprile 2026: chiusura ore 15, orario continuato (ultimo slot 14:30)
      slots.push('13:00', '13:30', '14:00', '14:30');
      return slots;
    }
    
    // Pomeriggio: dipende dal giorno
    if (dayOfWeek === 6) {
      // ✅ SABATO: 14:30-17:00
      slots.push('14:30');
      for (let hour = 15; hour <= 17; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          if (hour === 17 && minute > 0) break;
          const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
          slots.push(time);
        }
      }
    } else if (dayOfWeek !== 0) {
      // Altri giorni (non domenica): 15:00-18:00
      for (let hour = 15; hour <= 18; hour++) {
        if (hour === 18) {
          slots.push('18:00');
        } else {
          slots.push(`${hour.toString().padStart(2, '0')}:00`);
          slots.push(`${hour.toString().padStart(2, '0')}:30`);
        }
      }
    }
    
    return slots;
  };

  // Controlla disponibilità per tutti gli slot quando cambia la data
  useEffect(() => {
    const checkAllSlots = async () => {
      const barbersToCheck = selectedBarber === 'all' 
        ? ['Fabio', 'Michele', 'Nicolò'] 
        : [selectedBarber];
      
      const slotsMap: typeof slotsAvailability = {};
      
      await Promise.all(barbersToCheck.map(async barberName => {
        // Find by name
        const barberId = barbers.find(b => b.name === barberName || b.name.includes(barberName))?.id;
        if (!barberId) return;

        try {
          // getAvailableSlots ritornerebbe TUTTI gli slot validi per quella data 
          const slotsFromServer = await BookingService.getAvailableSlots(selectedDate, barberId);
          
          slotsFromServer.forEach(({ time }) => {
            const key = `${time}|${barberName}`;
            
            // Cerca una prenotazione esistente per questo slot e barbiere
            const existingBooking = allBookings.find(booking => 
              booking.booking_date === selectedDate && 
              booking.booking_time === time && 
              booking.id !== excludeBookingId && 
              booking.status !== 'cancelled' &&
              booking.barber_name === barberName
            );

            if (existingBooking) {
              slotsMap[key] = {
                available: false,
                occupiedBy: {
                  id: existingBooking.id,
                  customerName: existingBooking.customer_name,
                  serviceName: existingBooking.service_name
                },
                loading: false,
                barberName: barberName
              };
            } else {
              slotsMap[key] = {
                available: true,
                loading: false,
                barberName: barberName
              };
            }
          });
        } catch (error) {
           console.error(`Errore caricamento slot per ${barberName}:`, error);
        }
      }));

      setSlotsAvailability(slotsMap);
    };

    if (selectedDate && allBookings && barbers.length > 0) {
      checkAllSlots();
    }
  }, [selectedDate, allBookings, excludeBookingId, selectedBarber]);

  const handleTimeClick = (time: string, barberName: string) => {
    const key = `${time}|${barberName}`;
    const availability = slotsAvailability[key];
    if (availability && !availability.loading) {
      onTimeSelect(time, {
        available: availability.available,
        occupiedBy: availability.occupiedBy,
        barberName: barberName
      });
    }
  };

  const getSlotClassName = (time: string, barberName: string) => {
    const key = `${time}|${barberName}`;
    const availability = slotsAvailability[key];
    const isSelected = selectedTime === time;
    
    if (!availability) {
      // Slot non disponibile per questo barbiere (es. chiusura)
      return 'p-3 rounded-lg border-2 border-gray-700 bg-gray-800 text-gray-600 cursor-not-allowed opacity-50';
    }
    
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

  const getSlotIcon = (time: string, barberName: string) => {
    const key = `${time}|${barberName}`;
    const availability = slotsAvailability[key];
    
    if (!availability) return '🔒';
    if (availability?.loading) return '⏳';
    if (selectedTime === time) return '👆';
    if (availability?.available) return '✅';
    return '❌';
  };

  const getAllSlotsToRender = (barberName: string) => {
    const standardSlots = generateTimeSlots();
    const standardSet = new Set(standardSlots);
    const extraSlots = Object.keys(slotsAvailability)
      .filter(k => k.endsWith(`|${barberName}`))
      .map(k => k.split('|')[0])
      .filter(time => !standardSet.has(time));
      
    return [...standardSlots, ...extraSlots].sort((a, b) => {
      const [ah, am] = a.split(':').map(Number);
      const [bh, bm] = b.split(':').map(Number);
      return (ah * 60 + am) - (bh * 60 + bm);
    });
  };

  // Check if closed (no slots)
  const isBarberClosed = (barberName: string) => {
    return Object.keys(slotsAvailability).filter(k => k.endsWith(`|${barberName}`)).length === 0;
  };

  return (
    <div className="space-y-4">
      {selectedBarber === 'all' ? (
        // Vista per tutti i barbieri
        <>
          {['Fabio', 'Michele', 'Nicolò'].map(barberName => (
            <div key={barberName} className="border-2 border-gray-700 rounded-lg p-4 bg-gray-800/30">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                💈 {barberName}
                {barberName === currentBarberName && (
                  <span className="text-xs bg-amber-600 px-2 py-1 rounded">Barbiere corrente</span>
                )}
              </h3>
              
              {isBarberClosed(barberName) ? (
                <div className="bg-red-900/30 border border-red-500 rounded-lg p-6 text-center my-4">
                  <div className="text-red-400 text-3xl mb-2">🔒</div>
                  <div className="text-red-300 font-semibold text-md">Nessuno slot disponibile</div>
                </div>
              ) : (
                <>
                  {/* Mattina */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-400 mb-2">🌅 Mattina</h4>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                      {getAllSlotsToRender(typeof barberName !== 'undefined' ? barberName : (selectedBarber as string)).filter(time => {
                        const hour = parseInt(time.split(':')[0]);
                        return hour >= 9 && hour <= 12;
                      }).map(time => {
                        const key = `${time}|${barberName}`;
                        const availability = slotsAvailability[key];
                        
                        if (!availability) {
                          return (
                            <div key={time} className={getSlotClassName(time, barberName)}>
                              <div className="text-center">
                                <div className="text-lg mb-1">🔒</div>
                                <div className="text-xs">{time}</div>
                              </div>
                            </div>
                          );
                        }
                        
                        return (
                          <button
                            key={time}
                            onClick={() => handleTimeClick(time, barberName)}
                            disabled={slotsAvailability[key]?.loading}
                            className={getSlotClassName(time, barberName)}
                          >
                            <div className="text-center">
                              <div className="text-lg mb-1">{getSlotIcon(time, barberName)}</div>
                              <div className="text-xs font-medium">{time}</div>
                              {slotsAvailability[key]?.occupiedBy && (
                                <div className="text-[10px] mt-1 opacity-80 truncate">
                                  {slotsAvailability[key].occupiedBy.customerName}
                                </div>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Pomeriggio */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-2">🌆 Pomeriggio</h4>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                      {getAllSlotsToRender(typeof barberName !== 'undefined' ? barberName : (selectedBarber as string)).filter(time => {
                        const hour = parseInt(time.split(':')[0]);
                        return hour >= 15;
                      }).map(time => {
                        const key = `${time}|${barberName}`;
                        const availability = slotsAvailability[key];
                        
                        if (!availability) {
                          return (
                            <div key={time} className={getSlotClassName(time, barberName)}>
                              <div className="text-center">
                                <div className="text-lg mb-1">🔒</div>
                                <div className="text-xs">{time}</div>
                              </div>
                            </div>
                          );
                        }
                        
                        return (
                          <button
                            key={time}
                            onClick={() => handleTimeClick(time, barberName)}
                            disabled={slotsAvailability[key]?.loading}
                            className={getSlotClassName(time, barberName)}
                          >
                            <div className="text-center">
                              <div className="text-lg mb-1">{getSlotIcon(time, barberName)}</div>
                              <div className="text-xs font-medium">{time}</div>
                              {slotsAvailability[key]?.occupiedBy && (
                                <div className="text-[10px] mt-1 opacity-80 truncate">
                                  {slotsAvailability[key].occupiedBy.customerName}
                                </div>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </>
      ) : (
        // Vista per singolo barbiere (layout originale)
        <>
          {isBarberClosed(selectedBarber as string) ? (
            <div className="bg-red-900/30 border border-red-500 rounded-lg p-6 text-center shadow-lg my-6">
              <div className="text-red-400 text-5xl mb-4">🔒</div>
              <div className="text-red-300 font-bold text-xl mb-2">Giorno chiuso per {selectedBarber}</div>
              <div className="text-gray-300">
                Seleziona un altro barbiere o un'altra data.
              </div>
            </div>
          ) : (
            <>
              {/* Slot mattutini */}
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                  🌅 Mattina (9:00 - 12:30)
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {getAllSlotsToRender(selectedBarber as string).filter(time => {
                    const hour = parseInt(time.split(':')[0]);
                    return hour >= 9 && hour <= 12;
                  }).map(time => {
                    const key = `${time}|${selectedBarber}`;
                    return (
                      <button
                        key={time}
                        onClick={() => handleTimeClick(time, selectedBarber as string)}
                        disabled={slotsAvailability[key]?.loading}
                        className={getSlotClassName(time, selectedBarber as string)}
                      >
                        <div className="text-center">
                          <div className="text-lg mb-1">{getSlotIcon(time, selectedBarber as string)}</div>
                          <div className="font-medium">{time}</div>
                          {slotsAvailability[key]?.occupiedBy && (
                            <div className="text-xs mt-1 opacity-80">
                              {slotsAvailability[key].occupiedBy.customerName}
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Slot pomeridiani */}
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                  🌆 Pomeriggio (15:00 - 18:00)
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {getAllSlotsToRender(selectedBarber as string).filter(time => {
                    const hour = parseInt(time.split(':')[0]);
                    return hour >= 15 && hour <= 18;
                  }).map(time => {
                    const key = `${time}|${selectedBarber}`;
                    return (
                      <button
                        key={time}
                        onClick={() => handleTimeClick(time, selectedBarber as string)}
                        disabled={slotsAvailability[key]?.loading}
                        className={getSlotClassName(time, selectedBarber as string)}
                      >
                        <div className="text-center">
                          <div className="text-lg mb-1">{getSlotIcon(time, selectedBarber as string)}</div>
                          <div className="font-medium">{time}</div>
                          {slotsAvailability[key]?.occupiedBy && (
                            <div className="text-xs mt-1 opacity-80">
                              {slotsAvailability[key].occupiedBy.customerName}
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </>
      )}
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
  const [selectedDate, setSelectedDate] = useState(booking.booking_date);
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedBarber, setSelectedBarber] = useState<string>('all'); // ✅ NUOVO: 'all' o nome barbiere
  const [selectedBarberName, setSelectedBarberName] = useState<string>(''); // ✅ NUOVO: Nome barbiere selezionato
  const [isChecking, setIsChecking] = useState(false);
  const [slotAvailability, setSlotAvailability] = useState<{ available: boolean; occupiedBy?: any; barberName?: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false); // ✅ NUOVO: Mostra finestra conferma
  
  // ✅ NUOVO: Fetch TUTTE le prenotazioni (non solo del barbiere corrente)
  const [allBarberBookings, setAllBarberBookings] = useState<Booking[]>(allBookings);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [barbersList, setBarbersList] = useState<Barber[]>([]);

  useEffect(() => {
    fetch('/api/barbers')
      .then(r => r.json())
      .then(data => setBarbersList(data))
      .catch(err => console.error('Error fetching barbers:', err));
  }, []);

  // ✅ NUOVO: Fetch TUTTE le prenotazioni
  useEffect(() => {
    const fetchAllBookings = async () => {
      try {
        setLoadingBookings(true);
        
        console.log('🔄 Fetching all bookings...');
        
        // Fetch prenotazioni di TUTTI i barbieri usando il parametro allBarbers
        const response = await fetch('/api/bookings?fetchAll=true&allBarbers=true');
        if (response.ok) {
          const data = await response.json();
          const bookingsArray = data.bookings || [];
          
          console.log('✅ Bookings fetched:', bookingsArray.length);
          console.log('📊 Sample booking:', bookingsArray[0]);
          console.log('📊 Keys:', bookingsArray[0] ? Object.keys(bookingsArray[0]) : []);
          
          // Raggruppa per barbiere per debug
          const byBarber: Record<string, number> = {};
          bookingsArray.forEach((b: Booking) => {
            if (!byBarber[b.barber_name]) byBarber[b.barber_name] = 0;
            byBarber[b.barber_name]++;
          });
          console.log('📊 Bookings per barber:', byBarber);
          
          setAllBarberBookings(bookingsArray);
        } else {
          console.error('❌ Failed to fetch all bookings:', response.status);
          setAllBarberBookings(allBookings); // Fallback
        }
      } catch (error) {
        console.error('❌ Error fetching all bookings:', error);
        setAllBarberBookings(allBookings); // Fallback
      } finally {
        setLoadingBookings(false);
      }
    };
    
    fetchAllBookings();
  }, []);

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
      // Check if we're swapping with an occupied slot or moving to a free slot
      const isSwapping = slotAvailability && !slotAvailability.available;
      const targetBarberName = slotAvailability?.barberName || booking.barber_name;
      
      let payload;
      
      if (isSwapping && slotAvailability?.occupiedBy) {
        // Find the booking that occupies the slot
        const occupiedBooking = allBarberBookings.find(b => 
          b.booking_date === selectedDate && 
          b.booking_time === selectedTime &&
          b.id !== booking.id &&
          b.barber_name === targetBarberName
        );
        
        if (!occupiedBooking) {
          alert('Errore: impossibile trovare l\'appuntamento da scambiare');
          setIsProcessing(false);
          return;
        }
        
        payload = {
          booking1Id: booking.id,
          booking2Id: occupiedBooking.id,
          swapType: 'swap',
          crossBarber: booking.barber_name !== occupiedBooking.barber_name
        };
      } else {
        payload = {
          booking1Id: booking.id,
          swapType: 'move',
          newDate: selectedDate,
          newTime: selectedTime,
          newBarberName: targetBarberName, // ✅ NUOVO: Barbiere di destinazione
          crossBarber: booking.barber_name !== targetBarberName
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

  // Blocca lo scroll del body quando la modale è aperta
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      onTouchMove={(e) => e.stopPropagation()}
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

        {/* Modalità Sposta in slot libero */}
        <div className="space-y-6">
            {/* ✅ NUOVO: Selezione Barbiere */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">Seleziona barbiere:</label>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setSelectedBarber('all');
                    setSelectedTime('');
                    setSlotAvailability(null);
                  }}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    selectedBarber === 'all'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  💈 Tutti i barbieri
                </button>
                {['Fabio', 'Michele', 'Nicolò'].map(barberName => (
                  <button
                    key={barberName}
                    onClick={() => {
                      setSelectedBarber(barberName);
                      setSelectedTime('');
                      setSlotAvailability(null);
                    }}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      selectedBarber === barberName
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {barberName}
                    {barberName === booking.barber_name && (
                      <span className="ml-1 text-xs">⭐</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Selezione Data - Scorrimento orizzontale con 3 date visibili */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">Seleziona nuova data:</label>
              <div className="relative">
                <div 
                  className="flex gap-3 overflow-x-auto pb-3 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 px-1"
                  style={{ touchAction: 'pan-x', overscrollBehavior: 'contain' }}
                  onTouchMove={(e) => e.stopPropagation()}
                >
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
                
                <>
                    {/* Legenda colori */}
                    <div className="flex flex-wrap gap-4 mb-4 text-xs">
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
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-gray-700 rounded"></div>
                        <span className="text-gray-400">Chiuso</span>
                      </div>
                    </div>

                    <TimeSlotGrid 
                      selectedDate={selectedDate}
                      selectedTime={selectedTime}
                      selectedBarber={selectedBarber}
                      currentBarberName={booking.barber_name} 
                      excludeBookingId={booking.id}
                      allBookings={allBarberBookings}
                      barbers={barbersList}
                      onTimeSelect={(time, availability) => {
                        setSelectedTime(time);
                        setSlotAvailability(availability);
                        setSelectedBarberName(availability.barberName || '');
                      }}
                    />
                  </>
              </div>
            )}

            {/* Risultato selezione slot */}
            {selectedTime && slotAvailability && (
              <div className="bg-gray-800 rounded-lg p-4">
                {slotAvailability.available ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="text-green-400 text-2xl">✅</div>
                      <div>
                        <div className="text-green-400 font-semibold">Slot libero!</div>
                        <div className="text-gray-300 text-sm">
                          Barbiere: <span className="font-semibold">{slotAvailability.barberName}</span> - {selectedTime}
                        </div>
                      </div>
                    </div>
                    {slotAvailability.barberName !== booking.barber_name && (
                      <div className="bg-blue-900/30 border border-blue-500 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <span className="text-blue-400">🔄</span>
                          <span className="text-blue-300 text-sm">
                            Stai spostando l'appuntamento da <strong>{booking.barber_name}</strong> a <strong>{slotAvailability.barberName}</strong>
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="text-amber-400 text-2xl">⚠️</div>
                      <div>
                        <div className="text-amber-400 font-semibold">Slot occupato</div>
                        <div className="text-gray-300 text-sm">
                          Cliente: <span className="font-semibold">{slotAvailability.occupiedBy?.customerName}</span>
                        </div>
                        <div className="text-gray-400 text-xs">
                          Barbiere: {slotAvailability.barberName} - Servizio: {slotAvailability.occupiedBy?.serviceName}
                        </div>
                      </div>
                    </div>
                    <div className="bg-amber-900/30 border border-amber-500 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <span className="text-amber-400">💡</span>
                        <span className="text-amber-300 text-sm">
                          Clicca il pulsante "Scambia" in basso per scambiare i due appuntamenti
                          {slotAvailability.barberName !== booking.barber_name && (
                            <span className="block mt-1 font-semibold">
                              Scambio tra barbieri: {booking.barber_name} ↔️ {slotAvailability.barberName}
                            </span>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
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
          
          {selectedTime && slotAvailability ? (
            <button
              onClick={() => setShowConfirmation(true)}
              disabled={isProcessing}
              className={`px-6 py-3 text-white rounded-lg disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex items-center gap-2 ${
                slotAvailability.available 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-amber-600 hover:bg-amber-700'
              }`}
            >
              {slotAvailability.available ? (
                '📅 Conferma spostamento'
              ) : (
                `🔄 Conferma scambio`
              )}
            </button>
          ) : (
            <button
              disabled
              className="px-6 py-3 bg-gray-600 text-gray-400 rounded-lg cursor-not-allowed"
            >
              Seleziona data e ora
            </button>
          )}
        </div>
      </motion.div>

      {/* ✅ NUOVO: Finestra di Conferma */}
      <AnimatePresence>
        {showConfirmation && selectedTime && slotAvailability && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-[60] flex items-start justify-center p-4 overflow-y-auto"
            onClick={(e) => e.target === e.currentTarget && setShowConfirmation(false)}
            onTouchMove={(e) => e.stopPropagation()}
            style={{ 
              touchAction: 'pan-y',
              paddingBottom: 'max(120px, calc(env(safe-area-inset-bottom, 0px) + 120px))'
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800 border-2 border-blue-500 rounded-xl p-6 max-w-2xl w-full my-4"
              style={{ 
                touchAction: 'pan-y',
                overscrollBehavior: 'contain'
              }}
              onTouchMove={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                {slotAvailability.available ? '📅 Conferma Spostamento' : '🔄 Conferma Scambio'}
              </h3>

              <div className="space-y-4">
                {slotAvailability.available ? (
                  /* Spostamento in slot libero */
                  <>
                    <div className="bg-gray-700 rounded-lg p-4">
                      <div className="text-amber-400 font-semibold mb-3">📤 Appuntamento da spostare:</div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <div className="text-gray-400">Cliente</div>
                          <div className="text-white font-medium">{booking.customer_name}</div>
                        </div>
                        <div>
                          <div className="text-gray-400">Servizio</div>
                          <div className="text-white">{booking.service_name}</div>
                        </div>
                        <div>
                          <div className="text-gray-400">Barbiere</div>
                          <div className="text-white">{booking.barber_name}</div>
                        </div>
                        <div>
                          <div className="text-gray-400">Data/Ora Attuale</div>
                          <div className="text-white">
                            {format(parseISO(booking.booking_date), 'dd/MM/yyyy')} - {booking.booking_time}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-center text-blue-400 text-2xl">
                      ⬇️
                    </div>

                    <div className="bg-green-900/30 border border-green-500 rounded-lg p-4">
                      <div className="text-green-400 font-semibold mb-3">📥 Nuova posizione:</div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <div className="text-gray-400">Nuovo Barbiere</div>
                          <div className="text-white font-medium">{slotAvailability.barberName}</div>
                        </div>
                        <div>
                          <div className="text-gray-400">Nuova Data/Ora</div>
                          <div className="text-white">
                            {format(parseISO(selectedDate), 'dd/MM/yyyy')} - {selectedTime}
                          </div>
                        </div>
                      </div>
                      {booking.barber_name !== slotAvailability.barberName && (
                        <div className="mt-3 bg-blue-900/50 border border-blue-500 rounded p-2 text-blue-300 text-sm">
                          <strong>⚠️ Cambio barbiere:</strong> da {booking.barber_name} a {slotAvailability.barberName}
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  /* Scambio tra due appuntamenti */
                  <>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-gray-700 rounded-lg p-4">
                        <div className="text-amber-400 font-semibold mb-3">📤 Appuntamento 1:</div>
                        <div className="space-y-2 text-sm">
                          <div>
                            <div className="text-gray-400">Cliente</div>
                            <div className="text-white font-medium">{booking.customer_name}</div>
                          </div>
                          <div>
                            <div className="text-gray-400">Servizio</div>
                            <div className="text-white">{booking.service_name}</div>
                          </div>
                          <div>
                            <div className="text-gray-400">Barbiere</div>
                            <div className="text-white">{booking.barber_name}</div>
                          </div>
                          <div>
                            <div className="text-gray-400">Attuale</div>
                            <div className="text-white">
                              {format(parseISO(booking.booking_date), 'dd/MM/yyyy')} - {booking.booking_time}
                            </div>
                          </div>
                          <div className="pt-2 border-t border-gray-600">
                            <div className="text-green-400 text-xs">ANDRÀ A ⬇️</div>
                            <div className="text-green-300 font-semibold">
                              {format(parseISO(selectedDate), 'dd/MM/yyyy')} - {selectedTime}
                            </div>
                            {slotAvailability.barberName !== booking.barber_name && (
                              <div className="text-green-300 text-xs">
                                con {slotAvailability.barberName}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-700 rounded-lg p-4">
                        <div className="text-blue-400 font-semibold mb-3">📥 Appuntamento 2:</div>
                        <div className="space-y-2 text-sm">
                          <div>
                            <div className="text-gray-400">Cliente</div>
                            <div className="text-white font-medium">{slotAvailability.occupiedBy?.customerName}</div>
                          </div>
                          <div>
                            <div className="text-gray-400">Servizio</div>
                            <div className="text-white">{slotAvailability.occupiedBy?.serviceName}</div>
                          </div>
                          <div>
                            <div className="text-gray-400">Barbiere</div>
                            <div className="text-white">{slotAvailability.barberName}</div>
                          </div>
                          <div>
                            <div className="text-gray-400">Attuale</div>
                            <div className="text-white">
                              {format(parseISO(selectedDate), 'dd/MM/yyyy')} - {selectedTime}
                            </div>
                          </div>
                          <div className="pt-2 border-t border-gray-600">
                            <div className="text-green-400 text-xs">ANDRÀ A ⬇️</div>
                            <div className="text-green-300 font-semibold">
                              {format(parseISO(booking.booking_date), 'dd/MM/yyyy')} - {booking.booking_time}
                            </div>
                            {slotAvailability.barberName !== booking.barber_name && (
                              <div className="text-green-300 text-xs">
                                con {booking.barber_name}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {booking.barber_name !== slotAvailability.barberName && (
                      <div className="bg-purple-900/30 border border-purple-500 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <span className="text-purple-400 text-xl">🔄</span>
                          <div className="text-purple-300">
                            <strong>Scambio tra barbieri!</strong>
                            <div className="text-sm mt-1">
                              {booking.customer_name} passerà da {booking.barber_name} a {slotAvailability.barberName}
                              <br />
                              {slotAvailability.occupiedBy?.customerName} passerà da {slotAvailability.barberName} a {booking.barber_name}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="flex gap-3 mt-6 pb-4 sticky bottom-0 bg-gray-800 pt-4 -mx-6 px-6 border-t border-gray-700">
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="flex-1 px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  ← Annulla
                </button>
                <button
                  onClick={() => {
                    setShowConfirmation(false);
                    handleSwap();
                  }}
                  disabled={isProcessing}
                  className={`flex-1 px-6 py-3 text-white rounded-lg disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors ${
                    slotAvailability.available 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-amber-600 hover:bg-amber-700'
                  }`}
                >
                  {isProcessing ? '⏳ Elaborazione...' : '✅ Conferma'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}