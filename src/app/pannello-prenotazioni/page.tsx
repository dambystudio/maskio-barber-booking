'use client';

import { useState, useEffect } from 'react';
import { format, parseISO, addDays, isToday, getDay } from 'date-fns';
import { it } from 'date-fns/locale';

interface Booking {
  id: string;
  service_name: string;
  barber_name: string;
  booking_date: string;
  booking_time: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  created_at: string;
  notes?: string;
}

interface Stats {
  totalBookings: number;
  todayBookings: number;
  selectedDateBookings: number;
  dailyRevenue: number;
  selectedDate: string;
}

export default function PannelloPrenotazioni() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDebouncing, setIsDebouncing] = useState(false);

  // Cache per prenotazioni e statistiche separate
  const [bookingsCache, setBookingsCache] = useState<{[key: string]: Booking[]}>({});
  const [statsCache, setStatsCache] = useState<{[key: string]: Stats}>({});

  // Funzione per ottenere la data di oggi in formato sicuro
  const getTodayString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  // State per giorni di chiusura
  const [closedDays, setClosedDays] = useState<Set<number>>(new Set([0])); // Domenica chiusa di default
  const [closedDates, setClosedDates] = useState<Set<string>>(new Set()); // Date specifiche chiuse (YYYY-MM-DD)
  const [showClosureSettings, setShowClosureSettings] = useState(false);
  const [newClosureDate, setNewClosureDate] = useState('');
  const [newClosureEndDate, setNewClosureEndDate] = useState('');
  const [newClosureReason, setNewClosureReason] = useState('');

  // Nomi dei giorni della settimana
  const dayNames = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];

  // Carica i giorni di chiusura dal localStorage
  useEffect(() => {
    const savedClosedDays = localStorage.getItem('maskio-closed-days');
    if (savedClosedDays) {
      try {
        const parsed = JSON.parse(savedClosedDays);
        setClosedDays(new Set(parsed));
      } catch (error) {
        console.error('Error parsing closed days from localStorage:', error);
      }
    }

    const savedClosedDates = localStorage.getItem('maskio-closed-dates');
    if (savedClosedDates) {
      try {
        const parsed = JSON.parse(savedClosedDates);
        setClosedDates(new Set(parsed));
      } catch (error) {
        console.error('Error parsing closed dates from localStorage:', error);
      }
    }
  }, []);

  // Salva i giorni di chiusura nel localStorage quando cambiano
  useEffect(() => {
    localStorage.setItem('maskio-closed-days', JSON.stringify(Array.from(closedDays)));
  }, [closedDays]);

  // Salva le date di chiusura nel localStorage quando cambiano
  useEffect(() => {
    localStorage.setItem('maskio-closed-dates', JSON.stringify(Array.from(closedDates)));
  }, [closedDates]);

  // Funzione per toggle dei giorni di chiusura
  const toggleClosedDay = (dayIndex: number) => {
    setClosedDays(prev => {
      const newSet = new Set(prev);
      if (newSet.has(dayIndex)) {
        newSet.delete(dayIndex);
      } else {
        newSet.add(dayIndex);
      }
      return newSet;
    });
  };

  // Funzione per aggiungere date specifiche di chiusura
  const addClosureDates = () => {
    if (!newClosureDate) return;

    if (newClosureEndDate && newClosureEndDate < newClosureDate) {
      alert('La data di fine deve essere successiva alla data di inizio');
      return;
    }

    const newDates = new Set(closedDates);
    
    if (newClosureEndDate) {
      // Aggiunge un intervallo di date
      const startDate = new Date(newClosureDate + 'T00:00:00');
      const endDate = new Date(newClosureEndDate + 'T00:00:00');
      
      let currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        const dateStr = format(currentDate, 'yyyy-MM-dd');
        newDates.add(dateStr);
        currentDate.setDate(currentDate.getDate() + 1);
      }
    } else {
      // Aggiunge una singola data
      newDates.add(newClosureDate);
    }

    setClosedDates(newDates);
    setNewClosureDate('');
    setNewClosureEndDate('');
    setNewClosureReason('');
  };

  // Funzione per rimuovere una data di chiusura
  const removeClosureDate = (dateStr: string) => {
    const newDates = new Set(closedDates);
    newDates.delete(dateStr);
    setClosedDates(newDates);
  };

  // Controlla se una data è chiusa (sia per giorno della settimana che per data specifica)
  const isDateClosed = (dateString: string) => {
    // Controlla se è una data specifica chiusa
    if (closedDates.has(dateString)) {
      return true;
    }
    
    // Controlla se è un giorno della settimana chiuso
    const date = new Date(dateString + 'T00:00:00');
    const dayOfWeek = getDay(date);
    return closedDays.has(dayOfWeek);
  };// Debounce per evitare troppe chiamate API consecutive
  useEffect(() => {
    console.log('🔄 Effect triggered - selectedDate:', selectedDate, 'filterStatus:', filterStatus);
    
    // Controlla se abbiamo già le prenotazioni in cache
    const bookingsCacheKey = `${selectedDate}-${filterStatus}`;
    const statsCacheKey = selectedDate; // Le stats dipendono solo dalla data
    
    const hasBookingsCache = bookingsCache[bookingsCacheKey];
    const hasStatsCache = statsCache[statsCacheKey];
    
    if (hasBookingsCache && hasStatsCache) {
      console.log('💾 Using cached data for:', bookingsCacheKey, statsCacheKey);
      setBookings(hasBookingsCache);
      setStats(hasStatsCache);
      setLoading(false);
      return;
    }
    
    setIsDebouncing(true);
    setLoading(true);
    
    // Debounce di 500ms per evitare rate limiting
    const timeoutId = setTimeout(async () => {
      console.log('⏱️ Debounce completed, fetching data...');
      setIsDebouncing(false);
      
      // Fetch entrambi in parallelo per velocizzare il caricamento
      await Promise.all([
        !hasBookingsCache ? fetchBookings() : Promise.resolve(),
        !hasStatsCache ? fetchStats() : Promise.resolve()
      ]);
    }, 500);

    // Cleanup del timeout se l'effect viene richiamato prima del debounce
    return () => {
      console.log('🧹 Cleaning up previous timeout');
      clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, filterStatus]);  const fetchBookings = async (retryCount = 0) => {
    try {
      setLoading(true);
      console.log('📡 Fetching bookings for date:', selectedDate, 'status:', filterStatus);
      
      // Costruisci URL con parametri per il server-side filtering
      const params = new URLSearchParams();
      params.append('date', selectedDate);
      if (filterStatus !== 'all') {
        params.append('status', filterStatus);
      }
      // Aggiungi timestamp per cache busting
      params.append('_t', Date.now().toString());
      
      const url = `/api/bookings?${params.toString()}`;
      console.log('📡 Fetching URL:', url);
      
      const response = await fetch(url, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📊 API Response:', data);
        const fetchedBookings = data.bookings || [];
        console.log(`✅ Found ${fetchedBookings.length} bookings for ${selectedDate}`);
        
        // Salva in cache delle prenotazioni
        const bookingsCacheKey = `${selectedDate}-${filterStatus}`;
        setBookingsCache(prev => ({
          ...prev,
          [bookingsCacheKey]: fetchedBookings
        }));
        
        setBookings(fetchedBookings);
      } else if (response.status === 429 && retryCount < 3) {
        // Rate limited - retry dopo un delay crescente
        const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
        console.log(`🔄 Rate limited, retrying in ${delay}ms... (attempt ${retryCount + 1}/3)`);
        setTimeout(() => {
          fetchBookings(retryCount + 1);
        }, delay);
        return; // Non impostare loading a false, stiamo facendo retry
      } else {
        console.error('❌ Failed to fetch bookings:', response.status, response.statusText);
        if (response.status === 429) {
          console.log('⚠️ Too many requests - try clicking more slowly between dates');
        }
      }
    } catch (error) {
      console.error('❌ Error fetching bookings:', error);
    } finally {
      if (retryCount === 0 || retryCount >= 3) { // Solo alla fine del primo tentativo o quando finiscono i retry
        setLoading(false);
      }
    }
  };  const fetchStats = async () => {
    try {
      console.log('📊 Fetching stats for date:', selectedDate);
      const response = await fetch(`/api/admin/stats?date=${selectedDate}`, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      if (response.ok) {
        const data = await response.json();
        console.log('📈 Stats received:', data);
        
        // Salva in cache delle statistiche
        const statsCacheKey = selectedDate;
        setStatsCache(prev => ({
          ...prev,
          [statsCacheKey]: data
        }));
        
        setStats(data);
      }
    } catch (error) {
      console.error('Errore nel caricamento statistiche:', error);
    }
  };
  const updateBookingStatus = async (bookingId: string, newStatus: 'confirmed' | 'cancelled') => {
    try {
      const response = await fetch('/api/bookings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: bookingId,
          status: newStatus
        }),
      });      if (response.ok) {
        // Invalida la cache per forzare il refresh
        setBookingsCache({});
        setStatsCache({});
        fetchBookings(); // Ricarica le prenotazioni
        fetchStats(); // Ricarica le statistiche
      } else {
        console.error(`Failed to update booking status: ${response.status} ${response.statusText}`);
        
        // Prova a leggere il corpo della risposta se disponibile
        try {
          const responseText = await response.text();
          if (responseText) {
            console.error('Response body:', responseText);
          }
        } catch (parseError) {
          console.error('Could not parse error response');
        }
        
        alert(`Errore nell'aggiornamento dello stato: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error updating booking status:', error);
      alert('Errore di rete nell\'aggiornamento dello stato');
    }
  };  const deleteBooking = async (bookingId: string) => {
    try {
      const response = await fetch(`/api/bookings?id=${bookingId}`, {
        method: 'DELETE',
      });if (response.ok) {
        // Invalida la cache per forzare il refresh
        setBookingsCache({});
        setStatsCache({});
        fetchBookings(); // Ricarica le prenotazioni
        fetchStats(); // Ricarica le statistiche
      } else {
        console.error(`Failed to delete booking: ${response.status} ${response.statusText}`);
        
        // Prova a leggere il corpo della risposta se disponibile
        try {
          const responseText = await response.text();
          if (responseText) {
            console.error('Response body:', responseText);
          }
        } catch (parseError) {
          console.error('Could not parse error response');
        }
        
        alert(`Errore nell'eliminazione della prenotazione: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting booking:', error);
      alert('Errore di rete nell\'eliminazione della prenotazione');
    }
  };

  // Genera array di date per la selezione orizzontale
  const generateDates = () => {
    const dates = [];
    const today = new Date();
    
    // Aggiungi 30 giorni a partire da oggi
    for (let i = 0; i < 30; i++) {
      dates.push(addDays(today, i));
    }
    return dates;
  };

  const datesList = generateDates();
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      confirmed: { bg: 'bg-green-900/50', text: 'text-green-300', label: 'Confermata' },
      pending: { bg: 'bg-yellow-900/50', text: 'text-yellow-300', label: 'In Attesa' },
      cancelled: { bg: 'bg-red-900/50', text: 'text-red-300', label: 'Annullata' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    );
  }
  return (
    <div className="space-y-6">      {/* Statistiche */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-lg shadow">
            <div className="text-2xl font-bold text-white">{stats.totalBookings}</div>
            <div className="text-gray-300">Prenotazioni Totali</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-lg shadow">
            <div className="text-2xl font-bold text-amber-400">{stats.todayBookings}</div>
            <div className="text-gray-300">Prenotazioni Oggi</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-lg shadow">
            <div className="text-2xl font-bold text-blue-400">{stats.selectedDateBookings}</div>
            <div className="text-gray-300">
              Prenotazioni {format(parseISO(selectedDate + 'T00:00:00'), 'dd/MM', { locale: it })}
            </div>
          </div>
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-lg shadow">
            <div className="text-2xl font-bold text-green-400">€{stats.dailyRevenue.toFixed(2)}</div>
            <div className="text-gray-300">
              Ricavi {format(parseISO(selectedDate + 'T00:00:00'), 'dd/MM', { locale: it })}
            </div>
          </div>
        </div>      )}      {/* Gestione Giorni di Chiusura */}
      <div className="bg-gray-900 border border-gray-800 p-6 rounded-lg shadow">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">🗓️ Gestione Chiusure</h2>
          <button
            type="button"
            onClick={() => setShowClosureSettings(!showClosureSettings)}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              showClosureSettings
                ? 'bg-amber-600 text-white hover:bg-amber-700'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {showClosureSettings ? '🔼 Nascondi' : '🔽 Configura'}
          </button>
        </div>
        
        {showClosureSettings && (
          <div className="space-y-8 border-t pt-6">            {/* Chiusure Ricorrenti - Giorni della Settimana */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                🔄 Chiusure Ricorrenti
              </h3>
              <p className="text-sm text-gray-300 mb-4">
                Seleziona i giorni della settimana in cui vuoi essere sempre chiuso.
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                {dayNames.map((dayName, index) => {
                  const isClosed = closedDays.has(index);
                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => toggleClosedDay(index)}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 text-center ${
                        isClosed
                          ? 'border-red-300 bg-red-50 text-red-800 shadow-lg transform scale-105'
                          : 'border-green-200 bg-green-50 text-green-800 hover:border-green-300 hover:bg-green-100'
                      }`}
                    >
                      <div className="text-2xl mb-2">
                        {isClosed ? '🔒' : '🟢'}
                      </div>
                      <div className="font-semibold text-sm">
                        {dayName}
                      </div>
                      <div className="text-xs mt-1">
                        {isClosed ? 'CHIUSO' : 'Aperto'}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>            {/* Chiusure Specifiche - Date */}
            <div className="border-t border-gray-700 pt-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                📅 Chiusure Specifiche
              </h3>
              <p className="text-sm text-gray-300 mb-6">
                Aggiungi date specifiche di chiusura (es. 2 Giugno, ferie estive, ecc.)
              </p>

              {/* Form per aggiungere nuove chiusure */}
              <div className="bg-gray-800 border border-gray-700 p-6 rounded-xl mb-6">
                <div className="grid md:grid-cols-4 gap-4 items-end">
                  <div>
                    <label htmlFor="newClosureDate" className="block text-sm font-medium text-gray-300 mb-2">
                      Data Inizio *
                    </label>
                    <input
                      type="date"
                      id="newClosureDate"
                      value={newClosureDate}
                      onChange={(e) => setNewClosureDate(e.target.value)}
                      min={getTodayString()}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="newClosureEndDate" className="block text-sm font-medium text-gray-300 mb-2">
                      Data Fine (opzionale)
                    </label>
                    <input
                      type="date"
                      id="newClosureEndDate"
                      value={newClosureEndDate}
                      onChange={(e) => setNewClosureEndDate(e.target.value)}
                      min={newClosureDate || getTodayString()}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      placeholder="Per intervallo di date"
                    />
                    <p className="text-xs text-gray-400 mt-1">Lascia vuoto per una singola data</p>
                  </div>

                  <div>
                    <label htmlFor="newClosureReason" className="block text-sm font-medium text-gray-300 mb-2">
                      Motivo (opzionale)
                    </label>
                    <input
                      type="text"
                      id="newClosureReason"
                      value={newClosureReason}
                      onChange={(e) => setNewClosureReason(e.target.value)}
                      placeholder="Es. Festa nazionale, ferie"
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <button
                      type="button"
                      onClick={addClosureDates}
                      disabled={!newClosureDate}
                      className="w-full px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:bg-gray-600 disabled:cursor-not-allowed font-medium transition-colors"
                    >
                      ➕ Aggiungi
                    </button>
                  </div>
                </div>
              </div>              {/* Lista date chiuse */}
              {closedDates.size > 0 && (
                <div>
                  <h4 className="font-medium text-white mb-3">Date Attualmente Chiuse:</h4>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {Array.from(closedDates)
                      .sort()
                      .map((dateStr) => (
                        <div
                          key={dateStr}
                          className="flex items-center justify-between p-3 bg-red-900/50 border border-red-500 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className="text-red-400">🔒</div>
                            <div>
                              <div className="font-medium text-red-300">
                                {format(parseISO(dateStr + 'T00:00:00'), 'dd/MM/yyyy', { locale: it })}
                              </div>
                              <div className="text-xs text-red-400">
                                {format(parseISO(dateStr + 'T00:00:00'), 'EEEE', { locale: it })}
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeClosureDate(dateStr)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-800 p-1 rounded transition-colors"
                            title="Rimuovi questa chiusura"
                          >
                            ❌
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
              <div className="bg-blue-900/50 border border-blue-500 rounded-lg p-4 mt-6">
              <div className="flex items-start gap-3">
                <div className="text-blue-400 text-xl">💡</div>
                <div>
                  <h4 className="font-semibold text-blue-300 mb-1">Come funziona:</h4>
                  <ul className="text-sm text-blue-200 space-y-1">
                    <li>• <strong>Chiusure Ricorrenti:</strong> Si applicano ogni settimana (es. sempre chiuso la domenica)</li>
                    <li>• <strong>Chiusure Specifiche:</strong> Per date particolari (es. 2 Giugno, vacanze estive)</li>
                    <li>• I giorni chiusi non accetteranno nuove prenotazioni</li>
                    <li>• Le prenotazioni esistenti in quei giorni rimarranno valide</li>
                    <li>• Le impostazioni vengono salvate automaticamente</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>      {/* Filtri */}
      <div className="bg-gray-900 border border-gray-800 p-6 rounded-lg shadow">
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-bold text-white">Gestione Prenotazioni</h2>
          
          {/* Selezione data orizzontale */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Seleziona Data
            </label>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">{datesList.map((date) => {
                const dateStr = format(date, 'yyyy-MM-dd');
                const isSelected = selectedDate === dateStr;
                const isDateToday = isToday(date);
                const isClosedDay = isDateClosed(dateStr);
                
                return (
                  <button
                    key={dateStr}
                    type="button"
                    onClick={() => setSelectedDate(dateStr)}                    className={`flex-shrink-0 px-4 py-3 rounded-lg border-2 transition-all duration-200 min-w-[100px] relative ${
                      isSelected
                        ? isClosedDay
                          ? 'border-red-500 bg-red-900/50 text-red-300 shadow-md'
                          : 'border-amber-500 bg-amber-900/50 text-amber-300 shadow-md'
                        : isClosedDay
                        ? 'border-red-500 bg-red-900/30 text-red-400 hover:border-red-400'
                        : isDateToday
                        ? 'border-blue-500 bg-blue-900/50 text-blue-300 hover:border-blue-400'
                        : 'border-gray-600 bg-gray-800 text-gray-300 hover:border-gray-500 hover:bg-gray-700'
                    }`}
                  >
                    {isClosedDay && (
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">🔒</span>
                      </div>
                    )}
                    <div className="text-center">
                      <div className="text-sm font-medium">
                        {format(date, 'EEE', { locale: it }).toUpperCase()}
                      </div>
                      <div className="text-lg font-bold">
                        {format(date, 'dd')}
                      </div>
                      <div className="text-xs">
                        {format(date, 'MMM', { locale: it })}
                      </div>                      {isClosedDay && (
                        <div className="text-xs mt-1 font-semibold text-red-400">
                          CHIUSO
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>          {/* Filtro Status */}
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-300 mb-1">
                Filtra per Status
              </label>
              <select
                id="status"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 bg-gray-800 border border-gray-600 text-white rounded-md focus:ring-amber-500 focus:border-amber-500"
              >
                <option value="all">Tutte le prenotazioni</option>
                <option value="pending">In Attesa</option>
                <option value="confirmed">Confermate</option>
                <option value="cancelled">Annullate</option>
              </select>
            </div>              {/* Reset filtri */}
            <button
              type="button"
              onClick={() => {
                setSelectedDate(getTodayString());
                setFilterStatus('all');
              }}
              className="px-4 py-2 text-sm text-gray-300 hover:text-white border border-gray-600 rounded-md hover:bg-gray-700"
            >
              Reset Filtri
            </button>
          </div>
        </div>
      </div>      {/* Lista prenotazioni */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg shadow overflow-hidden">
        {bookings.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-gray-400 text-lg">
              Nessuna prenotazione trovata per il {format(parseISO(selectedDate + 'T00:00:00'), 'dd/MM/yyyy', { locale: it })}
              {filterStatus !== 'all' && ` con status "${filterStatus}"`}
            </div>
            <div className="text-gray-500 text-sm mt-2">
              Prova a selezionare un altro giorno o cambiare il filtro status
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Servizio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Barbiere
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Data & Ora
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Note Aggiuntive
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Azioni
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-900 divide-y divide-gray-700">
                {bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-800">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-white">
                          {booking.customer_name}
                        </div>
                        <div className="text-sm text-gray-400">
                          {booking.customer_phone}
                        </div>
                        {booking.customer_email && (
                          <div className="text-sm text-gray-400">
                            {booking.customer_email}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white">{booking.service_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white">{booking.barber_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white">
                        {format(parseISO(booking.booking_date), 'dd/MM/yyyy', { locale: it })}
                      </div>
                      <div className="text-sm text-gray-400">{booking.booking_time}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-white max-w-xs">
                        {booking.notes ? (
                          <div className="bg-blue-900/50 border border-blue-500 p-2 rounded text-xs border-l-4 border-l-blue-400">
                            {booking.notes}
                          </div>
                        ) : (
                          <span className="text-gray-500 italic">Nessuna nota</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(booking.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2 flex-wrap">                        {booking.status === 'pending' && (
                          <>
                            <button
                              type="button"
                              onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                              className="text-green-400 hover:text-green-300 px-2 py-1 border border-green-500 rounded hover:bg-green-900/50"
                            >
                              Conferma
                            </button>
                            <button
                              type="button"
                              onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                              className="text-red-400 hover:text-red-300 px-2 py-1 border border-red-500 rounded hover:bg-red-900/50"
                            >
                              Annulla
                            </button>
                          </>
                        )}                        {booking.status === 'confirmed' && (
                          <button
                            type="button"
                            onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                            className="text-red-400 hover:text-red-300 px-2 py-1 border border-red-500 rounded hover:bg-red-900/50"
                          >
                            Annulla
                          </button>
                        )}                        {booking.status === 'cancelled' && (
                          <button
                            type="button"
                            onClick={() => deleteBooking(booking.id)}
                            className="text-red-300 hover:text-red-200 px-2 py-1 bg-red-900/50 border border-red-500 rounded hover:bg-red-800/70 font-medium"
                            title="Elimina definitivamente questa prenotazione"
                          >
                            🗑️ Elimina
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
