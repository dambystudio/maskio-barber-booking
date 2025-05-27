'use client';

import { useState, useEffect } from 'react';
import { format, parseISO, addDays, isToday } from 'date-fns';
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
  };
  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const [filterStatus, setFilterStatus] = useState<string>('all');  // Debounce per evitare troppe chiamate API consecutive
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
  };
  const deleteBooking = async (bookingId: string) => {
    if (!confirm('Sei sicuro di voler eliminare definitivamente questa prenotazione?')) {
      return;
    }

    try {
      const response = await fetch(`/api/bookings?id=${bookingId}`, {
        method: 'DELETE',
      });      if (response.ok) {
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
      confirmed: { bg: 'bg-green-100', text: 'text-green-800', label: 'Confermata' },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'In Attesa' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: 'Annullata' }
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
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-2xl font-bold text-gray-900">{stats.totalBookings}</div>
            <div className="text-gray-600">Prenotazioni Totali</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-2xl font-bold text-amber-600">{stats.todayBookings}</div>
            <div className="text-gray-600">Prenotazioni Oggi</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-2xl font-bold text-blue-600">{stats.selectedDateBookings}</div>
            <div className="text-gray-600">
              Prenotazioni {format(parseISO(selectedDate + 'T00:00:00'), 'dd/MM', { locale: it })}
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-2xl font-bold text-green-600">€{stats.dailyRevenue.toFixed(2)}</div>
            <div className="text-gray-600">
              Ricavi {format(parseISO(selectedDate + 'T00:00:00'), 'dd/MM', { locale: it })}
            </div>
          </div>
        </div>
      )}

      {/* Filtri */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-bold text-gray-900">Gestione Prenotazioni</h2>
          
          {/* Selezione data orizzontale */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Seleziona Data
            </label>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              {datesList.map((date) => {
                const dateStr = format(date, 'yyyy-MM-dd');
                const isSelected = selectedDate === dateStr;
                const isDateToday = isToday(date);
                
                return (
                  <button
                    key={dateStr}
                    onClick={() => setSelectedDate(dateStr)}
                    className={`flex-shrink-0 px-4 py-3 rounded-lg border-2 transition-all duration-200 min-w-[100px] ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50 text-amber-900 shadow-md'
                        : isDateToday
                        ? 'border-blue-300 bg-blue-50 text-blue-900 hover:border-blue-400'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-sm font-medium">
                        {format(date, 'EEE', { locale: it }).toUpperCase()}
                      </div>
                      <div className="text-lg font-bold">
                        {format(date, 'dd')}
                      </div>
                      <div className="text-xs">
                        {format(date, 'MMM', { locale: it })}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Filtro Status */}
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Filtra per Status
              </label>
              <select
                id="status"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500"
              >
                <option value="all">Tutte le prenotazioni</option>
                <option value="pending">In Attesa</option>
                <option value="confirmed">Confermate</option>
                <option value="cancelled">Annullate</option>
              </select>
            </div>
              {/* Reset filtri */}
            <button
              onClick={() => {
                setSelectedDate(getTodayString());
                setFilterStatus('all');
              }}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Reset Filtri
            </button>
          </div>
        </div>
      </div>      {/* Lista prenotazioni */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {bookings.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-gray-500 text-lg">
              Nessuna prenotazione trovata per il {format(parseISO(selectedDate + 'T00:00:00'), 'dd/MM/yyyy', { locale: it })}
              {filterStatus !== 'all' && ` con status "${filterStatus}"`}
            </div>
            <div className="text-gray-400 text-sm mt-2">
              Prova a selezionare un altro giorno o cambiare il filtro status
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Servizio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Barbiere
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data & Ora
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Note Aggiuntive
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Azioni
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {booking.customer_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {booking.customer_phone}
                        </div>
                        {booking.customer_email && (
                          <div className="text-sm text-gray-500">
                            {booking.customer_email}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{booking.service_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{booking.barber_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {format(parseISO(booking.booking_date), 'dd/MM/yyyy', { locale: it })}
                      </div>
                      <div className="text-sm text-gray-500">{booking.booking_time}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs">
                        {booking.notes ? (
                          <div className="bg-blue-50 p-2 rounded text-xs border-l-4 border-blue-400">
                            {booking.notes}
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">Nessuna nota</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(booking.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2 flex-wrap">
                        {booking.status === 'pending' && (
                          <>
                            <button
                              onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                              className="text-green-600 hover:text-green-900 px-2 py-1 border border-green-300 rounded hover:bg-green-50"
                            >
                              Conferma
                            </button>
                            <button
                              onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                              className="text-red-600 hover:text-red-900 px-2 py-1 border border-red-300 rounded hover:bg-red-50"
                            >
                              Annulla
                            </button>
                          </>
                        )}
                        {booking.status === 'confirmed' && (
                          <button
                            onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                            className="text-red-600 hover:text-red-900 px-2 py-1 border border-red-300 rounded hover:bg-red-50"
                          >
                            Annulla
                          </button>
                        )}
                        {booking.status === 'cancelled' && (
                          <button
                            onClick={() => deleteBooking(booking.id)}
                            className="text-red-700 hover:text-red-900 px-2 py-1 bg-red-100 border border-red-400 rounded hover:bg-red-200 font-medium"
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
