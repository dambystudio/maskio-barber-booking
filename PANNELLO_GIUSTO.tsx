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
  weeklyRevenue: number;
  popularService: string;
}

export default function PannelloPrenotazioni() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Funzione per ottenere la data odierna in modo timezone-safe
  function getTodayString(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  useEffect(() => {
    console.log('🔄 Effect triggered - selectedDate:', selectedDate, 'filterStatus:', filterStatus);
    fetchBookings();
    fetchStats();
  }, [selectedDate, filterStatus]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      console.log('📡 Fetching bookings for date:', selectedDate, 'status:', filterStatus);
      
      // Costruisci URL con parametri per il server-side filtering
      const params = new URLSearchParams();
      if (selectedDate) {
        params.append('date', selectedDate);
      }
      if (filterStatus !== 'all') {
        params.append('status', filterStatus);
      }
      // Aggiungi timestamp per evitare cache
      params.append('_t', Date.now().toString());
      
      const url = `/api/bookings?${params.toString()}`;
      console.log('🌐 API URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      console.log('📦 Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Raw API response:', data);
        
        let filteredBookings = data.bookings || [];
        console.log('📊 Filtered bookings count:', filteredBookings.length);
        
        // Log delle prenotazioni per debug
        if (filteredBookings.length > 0) {
          console.log('📋 First booking sample:', {
            id: filteredBookings[0].id,
            date: filteredBookings[0].booking_date,
            customer: filteredBookings[0].customer_name,
            status: filteredBookings[0].status
          });
        }

        setBookings(filteredBookings);
      } else {
        console.error('❌ API Error:', response.status, response.statusText);
        setBookings([]);
      }
    } catch (error) {
      console.error('💥 Fetch error:', error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      console.log('📊 Fetching stats...');
      const response = await fetch(`/api/admin/stats?_t=${Date.now()}`, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      });
      if (response.ok) {
        const data = await response.json();
        console.log('📈 Stats loaded:', data);
        setStats(data);
      }
    } catch (error) {
      console.error('📊 Error loading stats:', error);
    }
  };

  const updateBookingStatus = async (bookingId: string, newStatus: 'confirmed' | 'cancelled') => {
    try {
      console.log('🔄 Updating booking status:', bookingId, 'to', newStatus);
      const response = await fetch('/api/bookings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: bookingId,
          status: newStatus
        }),
      });

      if (response.ok) {
        console.log('✅ Booking status updated successfully');
        fetchBookings(); // Ricarica le prenotazioni
      } else {
        const responseData = await response.json();
        console.error('❌ Failed to update booking status:', responseData);
      }
    } catch (error) {
      console.error('💥 Error updating booking status:', error);
    }
  };

  const deleteBooking = async (bookingId: string) => {
    if (!confirm('Sei sicuro di voler eliminare definitivamente questa prenotazione?')) {
      return;
    }

    try {
      console.log('🗑️ Deleting booking:', bookingId);
      const response = await fetch(`/api/bookings?id=${bookingId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        console.log('✅ Booking deleted successfully');
        fetchBookings(); // Ricarica le prenotazioni
      } else {
        const responseData = await response.json();
        console.error('❌ Failed to delete booking:', responseData);
        alert('Errore nell\'eliminazione della prenotazione');
      }
    } catch (error) {
      console.error('💥 Error deleting booking:', error);
      alert('Errore nell\'eliminazione della prenotazione');
    }
  };

  // Funzione per cambiare data selezionata
  const handleDateChange = (newDate: string) => {
    console.log('📅 Changing date from', selectedDate, 'to', newDate);
    setSelectedDate(newDate);
  };

  // Funzione per reset filtri
  const resetFilters = () => {
    const todayString = getTodayString();
    console.log('🔄 Resetting filters to today:', todayString);
    setSelectedDate(todayString);
    setFilterStatus('all');
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
        <div className="ml-4 text-gray-600">Caricamento prenotazioni per {selectedDate}...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Debug Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="text-sm text-blue-800">
          <strong>🔍 Debug Info:</strong> Data selezionata: {selectedDate} | Status filtro: {filterStatus} | Prenotazioni caricate: {bookings.length}
          <br />
          <strong>⏰ Ultimo aggiornamento:</strong> {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Statistiche */}
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
            <div className="text-2xl font-bold text-green-600">€{stats.weeklyRevenue}</div>
            <div className="text-gray-600">Ricavi Settimana</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-lg font-bold text-blue-600">{stats.popularService}</div>
            <div className="text-gray-600">Servizio Popolare</div>
          </div>
        </div>
      )}

      {/* Filtri */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-bold text-gray-900">Gestione Prenotazioni - VERSIONE CORRETTA</h2>
          
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
                    onClick={() => handleDateChange(dateStr)}
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
                onChange={(e) => {
                  console.log('🔄 Changing status filter to:', e.target.value);
                  setFilterStatus(e.target.value);
                }}
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
              onClick={resetFilters}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Reset Filtri
            </button>

            {/* Refresh manuale */}
            <button
              onClick={() => {
                console.log('🔄 Manual refresh triggered');
                fetchBookings();
              }}
              className="px-4 py-2 text-sm text-amber-600 hover:text-amber-900 border border-amber-300 rounded-md hover:bg-amber-50"
            >
              🔄 Aggiorna
            </button>
          </div>
        </div>
      </div>

      {/* Lista prenotazioni */}
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
            <div className="text-xs text-gray-400 mt-4">
              🔍 Debug: selectedDate={selectedDate}, filterStatus={filterStatus}
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
