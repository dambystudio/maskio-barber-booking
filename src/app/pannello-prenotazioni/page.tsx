'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { format, parseISO, addDays, isToday, getDay } from 'date-fns';
import { it } from 'date-fns/locale';
import { motion } from 'framer-motion';
import CalendarGrid from '@/components/CalendarGrid';
// import WaitlistPanel from '@/components/WaitlistPanel'; // TODO: Create component
import BookingSwapModal from '@/components/BookingSwapModal';

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

interface Stats {
  totalBookings: number;
  todayBookings: number;
  selectedDateBookings: number;
  dailyRevenue: number;
  selectedDate: string;
}

// <-- NUOVO COMPONENTE PER LA TABELLA DI TUTTE LE PRENOTAZIONI -->
const AllBookingsTable = ({ 
  bookings,
  onWhatsAppClick,
  onPhoneClick 
}: { 
  bookings: Booking[],
  onWhatsAppClick: (booking: Booking) => void,
  onPhoneClick: (phone: string) => void,
}) => {
  if (bookings.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-800 rounded-lg mt-8">
        <p className="text-gray-400">Nessuna prenotazione trovata nello storico.</p>
      </div>
    );
  }

  // Ordina le prenotazioni dalla più recente alla meno recente
  const sortedBookings = [...bookings].sort((a, b) => 
    new Date(`${b.booking_date}T${b.booking_time}`).getTime() - 
    new Date(`${a.booking_date}T${a.booking_time}`).getTime()
  );

  return (
    <div className="mt-12 bg-gray-900 shadow-lg rounded-lg p-6">
      <h2 className="text-2xl font-bold text-white mb-6 border-b border-gray-700 pb-4">
        Storico Prenotazioni
      </h2>
      <div className="overflow-x-auto">
        <table className="min-w-full text-white">
          <thead className="bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Data</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Ora</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Cliente</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Servizio</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Stato</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Contatti</th>
            </tr>
          </thead>
          <tbody className="bg-gray-800/50 divide-y divide-gray-700">
            {sortedBookings.map(booking => (
              <tr key={booking.id}>
                <td className="px-6 py-4 whitespace-nowrap">{format(parseISO(booking.booking_date), 'dd/MM/yyyy')}</td>
                <td className="px-6 py-4 whitespace-nowrap">{booking.booking_time}</td>
                <td className="px-6 py-4 whitespace-nowrap">{booking.customer_name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{booking.service_name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{booking.status}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => onWhatsAppClick(booking)}
                      className="text-green-400 hover:text-green-300 px-2 py-1 border border-green-500 rounded hover:bg-green-900/50 text-xs flex items-center gap-1"
                      title="Contatta cliente via WhatsApp"
                    >
                      <span role="img" aria-label="whatsapp">💬</span> WhatsApp
                    </button>
                    <button
                      type="button"
                      onClick={() => onPhoneClick(booking.customer_phone)}
                      className="text-blue-400 hover:text-blue-300 px-2 py-1 border border-blue-500 rounded hover:bg-blue-900/50 text-xs flex items-center gap-1"
                      title="Chiama il cliente"
                    >
                      <span role="img" aria-label="phone">📞</span> Chiama
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default function PannelloPrenotazioni() {
  const { data: session, status } = useSession();
  
  // Tutti gli stati devono essere definiti all'inizio, prima di qualsiasi logica condizionale
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [allBookings, setAllBookings] = useState<Booking[]>([]); // <-- NUOVO STATO
  
  // Debug temporaneo
  console.log('🔍 Component render - bookings state:', { bookings, type: typeof bookings, isArray: Array.isArray(bookings), length: bookings?.length });
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDebouncing, setIsDebouncing] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [permissionsChecked, setPermissionsChecked] = useState(false);
  // Nuovi stati per gestione barbieri
  const [currentBarber, setCurrentBarber] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [viewMode, setViewMode] = useState<'own' | 'other'>('own'); // 'own' = proprie prenotazioni, 'other' = dell'altro barbiere
  const [viewingBarber, setViewingBarber] = useState<string>(''); // quale barbiere sta visualizzando quando è in modalità 'other'
  const [displayMode, setDisplayMode] = useState<'grid' | 'table'>('grid'); // Modalità di visualizzazione: griglia o tabella
  
  // Stati per il modal di scambio appuntamenti
  const [swapModalOpen, setSwapModalOpen] = useState(false);
  const [selectedBookingForSwap, setSelectedBookingForSwap] = useState<Booking | null>(null);
  
  // Funzione helper per cambiare barbiere atomicamente
  const switchToBarber = (barberEmail: string) => {
    // Pulisci la cache per il barbiere target per forzare un reload
    const targetCacheKey = `${selectedDate}-${filterStatus}-${barberEmail}`;
    setBookingsCache(prev => {
      const newCache = { ...prev };
      delete newCache[targetCacheKey];
      return newCache;
    });
    
    setViewMode('other');
    setViewingBarber(barberEmail);
  };
  
  const switchToOwnBookings = () => {
    // Pulisci la cache per le proprie prenotazioni per forzare un reload
    const targetCacheKey = `${selectedDate}-${filterStatus}-${currentBarber}`;
    setBookingsCache(prev => {
      const newCache = { ...prev };
      delete newCache[targetCacheKey];
      return newCache;
    });
    
    setViewMode('own');
    setViewingBarber('');
  };
  
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
  const [filterStatus, setFilterStatus] = useState<string>('all');
    // State per giorni di chiusura (aggiornato per supportare barbieri e fasce orarie)
  const [closedDays, setClosedDays] = useState<Set<number>>(new Set([0])); // Domenica chiusa di default
  const [closedDates, setClosedDates] = useState<Set<string>>(new Set()); // Date specifiche chiuse (YYYY-MM-DD)
  
  // Nuova struttura per chiusure per barbiere e fasce orarie
  // Formato: { date: { barber: { morning: boolean, afternoon: boolean } } }
  const [barberClosures, setBarberClosures] = useState<{
    [date: string]: {
      [barberEmail: string]: {
        morning: boolean;
        afternoon: boolean;
      }
    }
  }>({});
  
  const [showClosureSettings, setShowClosureSettings] = useState(false);
  const [newClosureDate, setNewClosureDate] = useState('');
  const [newClosureEndDate, setNewClosureEndDate] = useState('');
  const [newClosureReason, setNewClosureReason] = useState('');  const [selectedClosureBarber, setSelectedClosureBarber] = useState('all'); // 'all', 'fabio.cassano97@icloud.com', 'michelebiancofiore0230@gmail.com'
  const [selectedClosureType, setSelectedClosureType] = useState('full'); // 'full', 'morning', 'afternoon'
  
  // ✅ NUOVO: Checkbox per selezionare barbieri per chiusure specifiche (date)
  const [closureFabioChecked, setClosureFabioChecked] = useState(true);
  const [closureMicheleChecked, setClosureMicheleChecked] = useState(true);

  // Mapping barbieri
  const barberMapping = {
    'fabio.cassano97@icloud.com': 'Fabio Cassano',
    'michelebiancofiore0230@gmail.com': 'Michele Biancofiore'
  };

  // Funzione helper per ottenere email dal nome del barbiere
  const getBarberEmailFromName = (barberName: string): string => {
    const nameLower = barberName.toLowerCase();
    if (nameLower.includes('fabio')) {
      return 'fabio.cassano97@icloud.com';
    } else if (nameLower.includes('michele')) {
      return 'michelebiancofiore0230@gmail.com';
    }
    // Default: ritorna il primo barbiere disponibile
    return Object.keys(barberMapping)[0];
  };

  // Nomi dei giorni della settimana
  const dayNames = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];
  
  const getOtherBarber = (currentEmail: string) => {
    const emails = Object.keys(barberMapping);
    return emails.find(email => email !== currentEmail) || '';
  };

  // Funzioni helper per gestire più barbieri
  const getOtherBarbers = (currentEmail: string) => {
    const emails = Object.keys(barberMapping);
    const others = emails.filter(email => email !== currentEmail);
    return others;
  };  // Verifica permessi tramite API invece che da sessione
  const checkPermissions = async () => {
    try {
      if (!session?.user?.email) return;
      
      const response = await fetch('/api/debug/check-permissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: session.user.email })
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Pannello prenotazioni permissions check:', data);
        const authorized = data.success && (data.permissions.isAdmin || data.permissions.isBarber);
        setIsAuthorized(authorized || false);
        setIsAdmin(data.success && data.permissions.isAdmin || false);
        
        // Imposta il barbiere corrente
        if (data.success && data.permissions.isBarber && !data.permissions.isAdmin) {
          setCurrentBarber(session.user.email);
        }
      } else {
        console.error('Failed to check permissions:', response.status);
        setIsAuthorized(false);
        setIsAdmin(false);
      }
    } catch (error) {
      console.error('Error checking permissions:', error);
      setIsAuthorized(false);
      setIsAdmin(false);
    } finally {
      setPermissionsChecked(true);
    }
  };

  // <-- NUOVA FUNZIONE FETCH ALL BOOKINGS -->
  const fetchAllBarberBookings = async () => {
    if (!session?.user?.email) return;

    console.log(`📡 Inizio fetch di TUTTE le prenotazioni per la modalità calendario`);
    try {
      const params = new URLSearchParams();
      // Per la modalità calendario, vogliamo sempre TUTTE le prenotazioni di TUTTI i barbieri
      // Non filtrare per barbiere specifico
      params.append('fetchAll', 'true');
      params.append('allBarbers', 'true'); // Nuovo parametro per indicare che vogliamo tutti i barbieri

      const response = await fetch(`/api/bookings?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        console.log('✅ TUTTE le prenotazioni di tutti i barbieri ricevute:', data.bookings);
        setAllBookings(data.bookings || []);
      } else {
        console.error('❌ Errore nel fetch di tutte le prenotazioni:', response.statusText);
      }
    } catch (error) {
      console.error('❌ Errore critico nel fetch di tutte le prenotazioni:', error);
    }
  };

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      window.location.href = '/auth/signin';
      return;
    }    checkPermissions();
  }, [session, status]);

  // Esegui il fetch di tutte le prenotazioni una volta che i permessi sono stati verificati
  useEffect(() => {
    if (permissionsChecked && isAuthorized) {
      fetchAllBarberBookings();
      // Carica le chiusure esistenti dei barbieri
      loadBarberClosures();
    }
  }, [permissionsChecked, isAuthorized]);

  // Carica i giorni di chiusura dal localStorage e sincronizza con il server
  useEffect(() => {
    if (typeof window !== 'undefined') {      const savedClosedDays = localStorage.getItem('maskio-closed-days');
      if (savedClosedDays && savedClosedDays !== 'undefined' && savedClosedDays !== 'null') {
        try {
          const parsed = JSON.parse(savedClosedDays);
          setClosedDays(new Set(parsed));
        } catch (error) {
          console.error('Error parsing closed days from localStorage:', error);
        }
      }

      const savedClosedDates = localStorage.getItem('maskio-closed-dates');
      if (savedClosedDates && savedClosedDates !== 'undefined' && savedClosedDates !== 'null') {
        try {
          const parsed = JSON.parse(savedClosedDates);
          setClosedDates(new Set(parsed));
        } catch (error) {
          console.error('Error parsing closed dates from localStorage:', error);
        }
      }
    }
      // Carica le impostazioni dal server (funzione definita più avanti)
    // loadClosureSettingsFromServer();
  }, []);

  // Funzioni per il fetching dei dati (definite prima degli useEffect che le utilizzano)
  const fetchBookings = async (retryCount = 0) => {
    try {
      setLoading(true);
      
      // Costruisci URL con parametri per il server-side filtering
      const params = new URLSearchParams();
      params.append('date', selectedDate);
      if (filterStatus !== 'all') {
        params.append('status', filterStatus);
      }
      
      // Filtro barbiere: solo se non sei admin e stai guardando le tue prenotazioni o quelle dell'altro
      if (!isAdmin && currentBarber) {
        if (viewMode === 'own') {
          params.append('barberEmail', currentBarber);
        } else if (viewMode === 'other' && viewingBarber) {
          params.append('barberEmail', viewingBarber);
        }
      }
      
      const apiUrl = `/api/bookings?${params.toString()}`;
      const response = await fetch(apiUrl);
        if (response.ok) {
        const data = await response.json();
        
        // Estrai l'array bookings dalla response
        const bookingsArray = data.bookings || [];
        
        // Ordina le prenotazioni per ora (crescente)
        const sortedBookingsArray = [...bookingsArray].sort((a, b) => {
          return a.booking_time.localeCompare(b.booking_time);
        });
        
        // Aggiorna cache con chiave che include il barbiere
        const targetBarber = (!isAdmin && currentBarber) 
          ? (viewMode === 'own' ? currentBarber : viewingBarber)
          : 'all';
        const cacheKey = `${selectedDate}-${filterStatus}-${targetBarber}`;
        setBookingsCache(prev => ({
          ...prev,
          [cacheKey]: sortedBookingsArray
        }));
        
        setBookings(sortedBookingsArray);
      } else {
        if (response.status === 429 && retryCount < 3) {
          setTimeout(() => fetchBookings(retryCount + 1), (retryCount + 1) * 1000);
          return;
        }
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Error fetching bookings:', error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };
  const fetchStats = async () => {
    try {
      // Se non è admin, include il filtro per barbiere
      let url = `/api/admin/stats?date=${selectedDate}`;
      if (!isAdmin && currentBarber) {
        url += `&barber=${encodeURIComponent(currentBarber)}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      
      // Aggiorna cache
      setStatsCache(prev => ({
        ...prev,
        [selectedDate]: data
      }));
      
      setStats(data);
    } catch (error) {
      setStats(null);
    }
  };
  // Funzione per caricare le chiusure ricorrenti del barbiere dal server
  const loadClosureSettingsFromServer = async () => {
    try {
      // Per le chiusure ricorrenti, usa la nuova API specifica per barbiere
      const params = new URLSearchParams();
      if (selectedClosureBarber && selectedClosureBarber !== 'all') {
        params.append('barberEmail', selectedClosureBarber);
      } else if (!isAdmin && currentBarber) {
        // Se non admin, carica sempre le proprie chiusure
        params.append('barberEmail', currentBarber);
      }
      
      const recurringUrl = `/api/barber-recurring-closures${params.toString() ? `?${params.toString()}` : ''}`;
      const recurringResponse = await fetch(recurringUrl);
      
      if (recurringResponse.ok) {
        const recurringSettings = await recurringResponse.json();
        setClosedDays(new Set(recurringSettings.closedDays));
        console.log('✅ Recurring closures loaded for barber:', selectedClosureBarber || currentBarber, recurringSettings.closedDays);
      } else {
        console.error('Failed to load recurring closures:', recurringResponse.status);
        setClosedDays(new Set([0])); // Default: domenica chiusa
      }

      // Per le chiusure specifiche (date), continua a usare l'API esistente
      // TODO: Implementare API per chiusure specifiche per barbiere se necessario
      const closureResponse = await fetch('/api/closure-settings');
      if (closureResponse.ok) {
        const closureSettings = await closureResponse.json();
        setClosedDates(new Set(closureSettings.closedDates));
        
        // Sincronizza anche il localStorage per le date
        localStorage.setItem('maskio-closed-dates', JSON.stringify(closureSettings.closedDates));
      }
      
    } catch (error) {
      console.error('❌ Error loading closure settings from server:', error);
      // Fallback
      setClosedDays(new Set([0]));
      setClosedDates(new Set());
    }
  };

  // Debounce per evitare troppe chiamate API consecutive
  useEffect(() => {
    // Controlla se abbiamo già le prenotazioni in cache
    const targetBarber = (!isAdmin && currentBarber) 
      ? (viewMode === 'own' ? currentBarber : viewingBarber)
      : 'all';
    const bookingsCacheKey = `${selectedDate}-${filterStatus}-${targetBarber}`;
    const statsCacheKey = selectedDate; // Le stats dipendono solo dalla data
    
    const hasBookingsCache = bookingsCache[bookingsCacheKey];
    const hasStatsCache = statsCache[statsCacheKey];
    
    if (hasBookingsCache && hasStatsCache) {
      // Ordina le prenotazioni anche dalla cache per ora (crescente)
      const sortedCachedBookings = [...hasBookingsCache].sort((a, b) => {
        return a.booking_time.localeCompare(b.booking_time);
      });
      setBookings(sortedCachedBookings);
      setStats(hasStatsCache);
      setLoading(false);
      return;
    }
    
    setIsDebouncing(true);
    setLoading(true);
    
    // Debounce di 500ms per evitare rate limiting
    const timeoutId = setTimeout(async () => {
      setIsDebouncing(false);
        // Fetch entrambi in parallelo per velocizzare il caricamento
      await Promise.all([
        !hasBookingsCache ? fetchBookings() : Promise.resolve(),
        !hasStatsCache ? fetchStats() : Promise.resolve()
      ]);
    }, 500);

    // Cleanup del timeout se l'effect viene richiamato prima del debounce
    return () => {
      clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, filterStatus, viewMode, viewingBarber, currentBarber, isAdmin]);

  // Inizializza il barbiere selezionato per le chiusure
  useEffect(() => {
    if (!isAdmin && currentBarber) {
      setSelectedClosureBarber(currentBarber);
    } else if (isAdmin) {
      setSelectedClosureBarber('all');
    }
  }, [isAdmin, currentBarber]);

  // Inizializza selectedClosureBarber per barbieri non admin
  useEffect(() => {
    if (permissionsChecked && !isAdmin && currentBarber) {
      console.log('🧔 Initializing selectedClosureBarber for barber:', currentBarber);
      setSelectedClosureBarber(currentBarber);
    }  }, [permissionsChecked, isAdmin, currentBarber]);

  // Ricarica le chiusure ricorrenti quando cambia il barbiere selezionato
  useEffect(() => {
    if (permissionsChecked && (selectedClosureBarber || currentBarber)) {
      console.log('🔄 Reloading closure settings for barber:', selectedClosureBarber || currentBarber);
      loadClosureSettingsFromServer();
    }
  }, [selectedClosureBarber, permissionsChecked, currentBarber]);
  
  // ✅ NUOVO: Inizializza checkbox per barbieri non-admin
  useEffect(() => {
    if (permissionsChecked && !isAdmin && currentBarber) {
      // Barbiere non-admin: pre-seleziona solo sé stesso
      if (currentBarber === 'fabio.cassano97@icloud.com') {
        setClosureFabioChecked(true);
        setClosureMicheleChecked(false);
      } else if (currentBarber === 'michelebiancofiore0230@gmail.com') {
        setClosureFabioChecked(false);
        setClosureMicheleChecked(true);
      }
    } else if (permissionsChecked && isAdmin) {
      // Admin: entrambi selezionati di default
      setClosureFabioChecked(true);
      setClosureMicheleChecked(true);
    }
  }, [permissionsChecked, isAdmin, currentBarber]);

  // If still loading session or permissions, show loading
  if (status === 'loading' || !permissionsChecked) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Caricamento...</p>
        </div>
      </div>
    );
  }

  // If not logged in or not authorized, show access denied
  if (!session || !isAuthorized) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div 
          className="text-center max-w-md mx-auto p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-6xl mb-6">🔒</div>
          <h1 className="text-2xl font-bold text-white mb-4">
            Accesso Negato
          </h1>
          <p className="text-gray-400 text-lg mb-6">
            Solo i barbieri autorizzati possono accedere a questo pannello.
          </p>
          <motion.a
            href="/"
            className="inline-block bg-amber-500 text-black px-6 py-3 rounded-lg font-semibold hover:bg-amber-600 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Torna alla Home
          </motion.a>        </motion.div>
      </div>
    );
  }

  // Funzione per salvare le chiusure ricorrenti per barbiere
  const saveClosureSettingsToServer = async (newClosedDays: Set<number>, newClosedDates: Set<string>) => {
    try {
      // Salva le chiusure ricorrenti per il barbiere specifico
      const targetBarber = selectedClosureBarber && selectedClosureBarber !== 'all' 
        ? selectedClosureBarber 
        : (!isAdmin && currentBarber ? currentBarber : null);
      
      if (!targetBarber) {
        console.error('❌ No target barber specified for saving recurring closures');
        return false;
      }

      const recurringResponse = await fetch('/api/barber-recurring-closures', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          closedDays: Array.from(newClosedDays),
          barberEmail: targetBarber,
        }),
      });

      if (recurringResponse.ok) {
        const recurringResult = await recurringResponse.json();
        console.log('✅ Recurring closures saved for barber:', targetBarber, Array.from(newClosedDays));
      } else {
        console.error('❌ Failed to save recurring closures:', recurringResponse.status);
        return false;
      }

      // Per ora, mantieni il salvataggio delle date specifiche nell'API globale
      // TODO: Implementare API per chiusure specifiche per barbiere se necessario
      if (newClosedDates.size > 0) {
        const datesResponse = await fetch('/api/closure-settings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            closedDays: Array.from(newClosedDays),
            closedDates: Array.from(newClosedDates),
          }),
        });

        if (!datesResponse.ok) {
          console.error('❌ Failed to save specific closure dates:', datesResponse.status);
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('❌ Error saving closure settings to server:', error);
      return false;
    }
  };

  // Funzione per toggle dei giorni di chiusura
  const toggleClosedDay = async (dayIndex: number) => {
    const newClosedDays = new Set(closedDays);
    if (newClosedDays.has(dayIndex)) {
      newClosedDays.delete(dayIndex);
    } else {
      newClosedDays.add(dayIndex);
    }
    
    // Salva immediatamente sul server
    const success = await saveClosureSettingsToServer(newClosedDays, closedDates);
    if (success) {
      setClosedDays(newClosedDays);
      console.log(`✅ Day ${dayIndex} toggled successfully`);
    } else {
      console.error(`❌ Failed to toggle day ${dayIndex}`);
      alert('Errore nel salvare le impostazioni. Riprova.');
    }
  };  // Funzione per aggiungere date specifiche di chiusura
  const addClosureDates = async () => {
    if (!newClosureDate) return;

    if (newClosureEndDate && newClosureEndDate < newClosureDate) {
      alert('La data di fine deve essere successiva alla data di inizio');
      return;
    }
    
    // ✅ NUOVO: Verifica che almeno un barbiere sia selezionato
    if (!closureFabioChecked && !closureMicheleChecked) {
      alert('Seleziona almeno un barbiere per la chiusura');
      return;
    }

    // ✅ NUOVO: Costruisce lista dei barbieri target basandosi sui checkbox
    const targetBarbers = [];
    
    if (isAdmin) {
      // Admin può selezionare entrambi i barbieri tramite checkbox
      if (closureFabioChecked) {
        targetBarbers.push('fabio.cassano97@icloud.com');
      }
      if (closureMicheleChecked) {
        targetBarbers.push('michelebiancofiore0230@gmail.com');
      }
    } else if (currentBarber) {
      // I barbieri possono impostare chiusure per:
      // - Se stessi (sempre)
      // - L'altro barbiere (gestione reciproca)
      if (currentBarber === 'fabio.cassano97@icloud.com') {
        // Fabio può impostare per sé stesso e per Michele
        if (closureFabioChecked) targetBarbers.push('fabio.cassano97@icloud.com');
        if (closureMicheleChecked) targetBarbers.push('michelebiancofiore0230@gmail.com');
      } else if (currentBarber === 'michelebiancofiore0230@gmail.com') {
        // Michele può impostare per sé stesso e per Fabio
        if (closureMicheleChecked) targetBarbers.push('michelebiancofiore0230@gmail.com');
        if (closureFabioChecked) targetBarbers.push('fabio.cassano97@icloud.com');
      }
    }
    
    if (targetBarbers.length === 0) {
      alert('Nessun barbiere valido selezionato');
      return;
    }

    // ✅ NUOVO: Applica chiusura per ogni barbiere selezionato
    try {
      for (const barberEmail of targetBarbers) {
        await addBarberClosureRange(newClosureDate, newClosureEndDate, barberEmail, selectedClosureType);
      }
      
      // Reset form dopo tutte le operazioni
      setNewClosureDate('');
      setNewClosureEndDate('');
      setNewClosureReason('');
      setSelectedClosureType('full');
      // I checkbox rimangono agli stessi valori per facilitare inserimenti multipli
      
      // Mostra messaggio di successo
      const barberNames = targetBarbers.map(email => 
        email === 'fabio.cassano97@icloud.com' ? 'Fabio' : 'Michele'
      ).join(' e ');
      
      const daysCount = newClosureEndDate 
        ? Math.ceil((new Date(newClosureEndDate).getTime() - new Date(newClosureDate).getTime()) / (1000 * 60 * 60 * 24)) + 1
        : 1;
        
      alert(`✅ Chiusura aggiunta per ${barberNames} - ${daysCount} giorno${daysCount > 1 ? 'i' : ''}`);
      
    } catch (error) {
      console.error('❌ Error adding closures:', error);
      alert('Errore nell\'aggiungere le chiusure. Riprova.');
    }
  };

  // Nuova funzione per aggiungere chiusure per barbieri in un intervallo
  const addBarberClosureRange = async (startDate: string, endDate: string | '', barberEmail: string, closureType: string) => {
    try {
      const dates = [];
      
      if (endDate) {
        const start = new Date(startDate + 'T00:00:00');
        const end = new Date(endDate + 'T00:00:00');
        
        let currentDate = new Date(start);
        while (currentDate <= end) {
          dates.push(format(currentDate, 'yyyy-MM-dd'));
          currentDate.setDate(currentDate.getDate() + 1);
        }
      } else {
        dates.push(startDate);
      }

      // Aggiunge le chiusure per ogni data
      for (const dateStr of dates) {
        await addBarberClosure(dateStr, barberEmail, closureType as 'full' | 'morning' | 'afternoon');
      }

      // Reset form (chiamato solo dall'ultima iterazione)
      // Non resettare qui - il reset viene fatto da addClosureDates dopo tutte le iterazioni
      
      // Ricarica le chiusure per aggiornare la visualizzazione
      await loadBarberClosures();
      
      console.log(`✅ Barber closures added for ${barberEmail}: ${dates.length} dates`);
      
    } catch (error) {
      console.error('❌ Error adding barber closure range:', error);
      alert('Errore nell\'aggiungere le chiusure. Riprova.');
    }  };

  // Funzione per rimuovere una data di chiusura
  const removeClosureDate = async (dateStr: string) => {
    const newDates = new Set(closedDates);
    newDates.delete(dateStr);
    
    // Salva immediatamente sul server
    const success = await saveClosureSettingsToServer(closedDays, newDates);
    if (success) {
      setClosedDates(newDates);
      console.log(`✅ Closure date ${dateStr} removed successfully`);
    } else {
      console.error(`❌ Failed to remove closure date ${dateStr}`);
      alert('Errore nel rimuovere la data di chiusura. Riprova.');
    }
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
  };

  // Nuova funzione per controllare chiusure specifiche per barbiere e fascia oraria
  const isBarberClosed = (dateString: string, barberEmail: string, timeSlot?: string) => {
    // Prima controlla le chiusure generali
    if (isDateClosed(dateString)) {
      return true;
    }

    // Controlla le chiusure specifiche per barbiere
    const dayClosures = barberClosures[dateString];
    if (!dayClosures || !dayClosures[barberEmail]) {
      return false;
    }

    const barberClosure = dayClosures[barberEmail];
    
    // Se non è specificata una fascia oraria, controlla se è completamente chiuso
    if (!timeSlot) {
      return barberClosure.morning && barberClosure.afternoon;
    }

    // Determina se il timeSlot è mattutino (prima delle 14:00) o pomeridiano
    const [hours] = timeSlot.split(':').map(Number);
    const isMorning = hours < 14;
    
    return isMorning ? barberClosure.morning : barberClosure.afternoon;
  };
  // Funzione per aggiungere chiusura per barbiere
  const addBarberClosure = async (dateString: string, barberEmail: string, closureType: 'full' | 'morning' | 'afternoon') => {
    try {
      // Salva su server usando il nuovo endpoint
      const response = await fetch('/api/barber-closures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          barberEmail,
          closureDate: dateString,
          closureType,
          reason: newClosureReason || `Chiusura ${closureType} per ${barberMapping[barberEmail as keyof typeof barberMapping]}`
        })
      });

      if (response.ok) {
        console.log(`✅ Barber closure added for ${barberEmail} on ${dateString} (${closureType})`);
        
        // Aggiorna lo stato locale solo se il salvataggio ha successo
        const morning = closureType === 'full' || closureType === 'morning';
        const afternoon = closureType === 'full' || closureType === 'afternoon';

        setBarberClosures(prev => ({
          ...prev,
          [dateString]: {
            ...prev[dateString],
            [barberEmail]: { morning, afternoon }
          }
        }));
      } else {
        const errorData = await response.json();
        console.error('❌ Failed to save barber closure:', errorData);
        
        if (response.status === 409) {
          alert('Questa chiusura esiste già per il barbiere selezionato.');
        } else {
          alert('Errore nel salvare la chiusura. Riprova.');
        }
      }
    } catch (error) {
      console.error('❌ Error adding barber closure:', error);
      alert('Errore di rete nel salvare la chiusura.');
    }
  };

  // Funzione per rimuovere una chiusura di un barbiere
  const removeBarberClosure = async (barberEmail: string, closureDate: string, closureType: 'full' | 'morning' | 'afternoon') => {
    try {
      const response = await fetch('/api/barber-closures', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          barberEmail,
          closureDate,
          closureType
        })
      });

      if (response.ok) {
        console.log(`✅ Barber closure removed for ${barberEmail} on ${closureDate} (${closureType})`);
        
        // Aggiorna lo stato locale rimuovendo la chiusura
        setBarberClosures(prev => {
          const newClosures = { ...prev };
          if (newClosures[closureDate] && newClosures[closureDate][barberEmail]) {
            if (closureType === 'full') {
              // Rimuovi completamente la chiusura per quel barbiere in quella data
              delete newClosures[closureDate][barberEmail];
            } else if (closureType === 'morning') {
              newClosures[closureDate][barberEmail].morning = false;
            } else if (closureType === 'afternoon') {
              newClosures[closureDate][barberEmail].afternoon = false;
            }
            
            // Se non ci sono più chiusure per quella data, rimuovi l'intera data
            if (Object.keys(newClosures[closureDate]).length === 0) {
              delete newClosures[closureDate];
            }
          }
          return newClosures;
        });
        
        const barberName = barberMapping[barberEmail as keyof typeof barberMapping];
        const closureTypeText = closureType === 'full' ? 'giornaliera' : 
                               closureType === 'morning' ? 'mattutina' : 'pomeridiana';
        alert(`Chiusura ${closureTypeText} rimossa per ${barberName} in data ${format(parseISO(closureDate + 'T00:00:00'), 'dd/MM/yyyy', { locale: it })}`);
      } else {
        const errorData = await response.json();
        console.error('❌ Failed to remove barber closure:', errorData);
        
        if (response.status === 404) {
          alert('Chiusura non trovata.');
        } else {
          alert('Errore nel rimuovere la chiusura. Riprova.');
        }
      }
    } catch (error) {
      console.error('❌ Error removing barber closure:', error);
      alert('Errore di rete nel rimuovere la chiusura.');
    }
  };

  // Funzione per caricare le chiusure esistenti dei barbieri
  const loadBarberClosures = async () => {
    try {
      const response = await fetch('/api/barber-closures');
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.closures) {
          // Trasforma i dati dall'API nel formato dello stato
          const closuresMap: {
            [date: string]: {
              [barberEmail: string]: {
                morning: boolean;
                afternoon: boolean;
              }
            }
          } = {};
          
          data.closures.forEach((closure: any) => {
            const { closureDate, barberEmail, closureType } = closure;
            
            if (!closuresMap[closureDate]) {
              closuresMap[closureDate] = {};
            }
            
            if (!closuresMap[closureDate][barberEmail]) {
              closuresMap[closureDate][barberEmail] = { morning: false, afternoon: false };
            }
            
            if (closureType === 'full') {
              closuresMap[closureDate][barberEmail].morning = true;
              closuresMap[closureDate][barberEmail].afternoon = true;
            } else if (closureType === 'morning') {
              closuresMap[closureDate][barberEmail].morning = true;
            } else if (closureType === 'afternoon') {
              closuresMap[closureDate][barberEmail].afternoon = true;
            }
          });
          
          setBarberClosures(closuresMap);
          console.log('✅ Barber closures loaded:', closuresMap);
        }
      } else {
        console.error('❌ Failed to load barber closures');
      }
    } catch (error) {
      console.error('❌ Error loading barber closures:', error);
    }
  };

  const updateBookingStatus = async (bookingId: string, newStatus: 'confirmed' | 'cancelled') => {
    try {
      console.log('🔄 Updating booking status:', { bookingId, newStatus });
      
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
      
      console.log('📡 Response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Booking status updated successfully:', result);
        
        // Invalida la cache per forzare il refresh
        setBookingsCache({});
        setStatsCache({});
        fetchBookings(); // Ricarica le prenotazioni
        fetchStats(); // Ricarica le statistiche
      } else {
        console.error(`❌ Failed to update booking status: ${response.status} ${response.statusText}`);
        
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
      console.error('❌ Error updating booking status:', error);
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

  // Funzioni helper per contattare i clienti
  const openWhatsApp = (phone: string, customerName: string, serviceName: string, bookingDate: string, bookingTime: string) => {
    // Rimuovi tutti i caratteri non numerici dal numero di telefono
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Aggiungi il prefisso internazionale per l'Italia se necessario
    let whatsappPhone = cleanPhone;
    if (cleanPhone.startsWith('3') && cleanPhone.length === 10) {
      whatsappPhone = '39' + cleanPhone;
    } else if (!cleanPhone.startsWith('39') && cleanPhone.length === 10) {
      whatsappPhone = '39' + cleanPhone;
    }
    
    // Crea il messaggio personalizzato
    const message = `Ciao ${customerName}! 👋

Ti contatto da Maskio Barber Concept per la tua prenotazione:

📅 *Data:* ${format(parseISO(bookingDate), 'dd/MM/yyyy', { locale: it })}
🕐 *Orario:* ${bookingTime}
✂️ *Servizio:* ${serviceName}

Se hai domande o hai bisogno di modificare l'appuntamento, fammi sapere!

Grazie per averci scelto 💈`;

    // Apri WhatsApp Web o l'app
    const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const makePhoneCall = (phone: string) => {
    // Rimuovi spazi e caratteri speciali, mantieni solo numeri e il +
    const cleanPhone = phone.replace(/[^\d+]/g, '');
    window.open(`tel:${cleanPhone}`, '_self');
  };

  // Funzione per contattare il barbiere tramite WhatsApp
  const contactBarberWhatsApp = (barberPhone: string, barberName: string, customerName: string, serviceName: string, bookingDate: string, bookingTime: string) => {
    if (!barberPhone) {
      alert('Numero di telefono del barbiere non disponibile');
      return;
    }

    // Rimuovi tutti i caratteri non numerici dal numero di telefono
    const cleanPhone = barberPhone.replace(/\D/g, '');
    
    // Aggiungi il prefisso internazionale per l'Italia se necessario
    let whatsappPhone = cleanPhone;
    if (cleanPhone.startsWith('3') && cleanPhone.length === 10) {
      whatsappPhone = '39' + cleanPhone;
    } else if (!cleanPhone.startsWith('39') && cleanPhone.length === 10) {
      whatsappPhone = '39' + cleanPhone;
    }
    
    // Crea il messaggio personalizzato per il barbiere
    const message = `Ciao ${barberName}! 👋

Ti contatto riguardo alla prenotazione:

👤 *Cliente:* ${customerName}
📅 *Data:* ${format(parseISO(bookingDate), 'dd/MM/yyyy', { locale: it })}
🕐 *Orario:* ${bookingTime}
✂️ *Servizio:* ${serviceName}

Ho una domanda riguardo all'appuntamento.

Grazie! 😊`;

    // Apri WhatsApp Web o l'app
    const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  // Funzioni per il modal di scambio appuntamenti
  const openSwapModal = (booking: Booking) => {
    // ✅ MODIFICA: Michele e Fabio possono gestirsi reciprocamente
    // Verifica solo che l'utente sia un barbiere autenticato
    if (!isAdmin && !currentBarber) {
      alert('Non autorizzato a modificare appuntamenti');
      return;
    }
    
    // Controllo rimosso: barbieri possono modificare appuntamenti di altri barbieri
    
    setSelectedBookingForSwap(booking);
    setSwapModalOpen(true);
  };

  const closeSwapModal = () => {
    setSwapModalOpen(false);
    setSelectedBookingForSwap(null);
  };

  const onSwapComplete = () => {
    // Ricarica le prenotazioni dopo lo scambio
    fetchBookings();
    
    // Se siamo in vista grid, ricarica anche i dati del calendario
    if (displayMode === 'grid') {
      fetchAllBarberBookings();
    }
  };

  // Genera array di date per la selezione orizzontale
  const generateDates = () => {
    const dates = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Determina la data di partenza
    const currentYear = today.getFullYear();
    const september1st = new Date(currentYear, 8, 1); // 8 = September (0-indexed)
    september1st.setHours(0, 0, 0, 0);
    
    // Se siamo prima del 1 settembre, parti dal 1 settembre
    // Altrimenti parti da oggi
    const startDate = today < september1st ? september1st : today;
    
    // Esteso a 60 giorni per coprire fino a dicembre (era 30)
    for (let i = 0; i < 60; i++) {
      dates.push(addDays(startDate, i));
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
    <div className="space-y-4 md:space-y-6 pb-20 md:pb-6">
      {/* Statistiche - Ottimizzate per Mobile */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          <div className="bg-gray-900 border border-gray-800 p-4 md:p-6 rounded-lg shadow-lg">
            <div className="text-lg md:text-2xl font-bold text-white">{stats.totalBookings}</div>
            <div className="text-xs md:text-sm text-gray-300 leading-tight">Prenotazioni Totali</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 p-4 md:p-6 rounded-lg shadow-lg">
            <div className="text-lg md:text-2xl font-bold text-amber-400">{stats.todayBookings}</div>
            <div className="text-xs md:text-sm text-gray-300 leading-tight">Oggi</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 p-4 md:p-6 rounded-lg shadow-lg">
            <div className="text-lg md:text-2xl font-bold text-blue-400">{stats.selectedDateBookings}</div>
            <div className="text-xs md:text-sm text-gray-300 leading-tight">
              {format(parseISO(selectedDate + 'T00:00:00'), 'dd/MM', { locale: it })}
            </div>
          </div>
          <div className="bg-gray-900 border border-gray-800 p-4 md:p-6 rounded-lg shadow-lg">
            <div className="text-lg md:text-2xl font-bold text-green-400">€{stats.dailyRevenue.toFixed(2)}</div>
            <div className="text-xs md:text-sm text-gray-300 leading-tight">
              Ricavi {format(parseISO(selectedDate + 'T00:00:00'), 'dd/MM', { locale: it })}
            </div>
          </div>
        </div>
      )}      {/* Gestione Giorni di Chiusura - Ottimizzata per Mobile */}
      <div className="bg-gray-900 border border-gray-800 p-4 md:p-6 rounded-lg shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
            🗓️ <span className="hidden sm:inline">Gestione</span> Chiusure
          </h2>
          <button
            type="button"
            onClick={() => setShowClosureSettings(!showClosureSettings)}
            className={`px-3 py-2 md:px-4 md:py-2 rounded-lg font-medium transition-all duration-200 text-sm ${
              showClosureSettings
                ? 'bg-amber-600 text-white hover:bg-amber-700'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {showClosureSettings ? '🔼 Nascondi' : '🔽 Configura'}
          </button>
        </div>
          {showClosureSettings && (
          <div className="space-y-6 md:space-y-8 border-t border-gray-700 pt-4 md:pt-6">            {/* Chiusure Ricorrenti - Giorni della Settimana */}
            <div>
              <h3 className="text-base md:text-lg font-semibold text-white mb-3 md:mb-4 flex items-center gap-2">
                🔄 Chiusure Ricorrenti
              </h3>
              <p className="text-xs md:text-sm text-gray-300 mb-3 md:mb-4">
                Seleziona i giorni della settimana in cui vuoi essere sempre chiuso.
              </p>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 md:gap-3">
                {dayNames.map((dayName, index) => {
                  const isClosed = closedDays.has(index);
                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => toggleClosedDay(index)}
                      className={`p-3 md:p-4 rounded-xl border-2 transition-all duration-200 text-center touch-manipulation ${
                        isClosed
                          ? 'border-red-400 bg-red-900/50 text-red-300 shadow-lg'
                          : 'border-green-400 bg-green-900/30 text-green-300 hover:border-green-300 hover:bg-green-900/50'
                      }`}
                    >
                      <div className="text-xl md:text-2xl mb-1 md:mb-2">
                        {isClosed ? '🔒' : '🟢'}
                      </div>
                      <div className="font-semibold text-xs md:text-sm">
                        {dayName.substring(0, 3)}
                        <span className="hidden sm:inline">{dayName.substring(3)}</span>
                      </div>                      <div className="text-xs mt-1">
                        {isClosed ? 'CHIUSO' : 'Aperto'}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Chiusure per Barbiere - Personalizzate */}
            <div className="border-t border-gray-700 pt-4 md:pt-6">
              <h3 className="text-base md:text-lg font-semibold text-white mb-3 md:mb-4 flex items-center gap-2">
                {isAdmin ? '🧔 Chiusure per Barbiere' : '🧔 Le tue Chiusure'}
              </h3>
              <p className="text-xs md:text-sm text-gray-300 mb-4 md:mb-6">
                {isAdmin 
                  ? 'Imposta chiusure specifiche per singoli barbieri in date particolari, anche solo per mattina o pomeriggio.'
                  : 'Imposta le tue chiusure in date specifiche, anche solo per mattina o pomeriggio.'
                }
              </p>

              <div className="bg-gray-800 border border-gray-700 p-4 md:p-6 rounded-xl mb-4 md:mb-6">                <div className="space-y-4">
                  {/* Selezione Barbiere - Solo per Admin */}
                  {isAdmin && (
                    <div className="space-y-2">
                      <label htmlFor="selectedClosureBarber" className="block text-xs md:text-sm font-medium text-gray-300">
                        Barbiere *
                      </label>
                      <select
                        id="selectedClosureBarber"
                        value={selectedClosureBarber}
                        onChange={(e) => setSelectedClosureBarber(e.target.value)}
                        className="w-full px-3 py-3 md:py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-base md:text-sm"
                      >
                        <option value="all">Tutti i barbieri</option>
                        <option value="fabio.cassano97@icloud.com">Fabio Cassano</option>
                        <option value="michelebiancofiore0230@gmail.com">Michele Biancofiore</option>
                      </select>
                    </div>
                  )}

                  {/* Tipo di Chiusura */}
                  <div className="space-y-2">
                    <label className="block text-xs md:text-sm font-medium text-gray-300">
                      Tipo di Chiusura *
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        { value: 'full', label: '🚫 Giornata Intera', desc: 'Chiuso tutto il giorno' },
                        { value: 'morning', label: '🌅 Solo Mattina', desc: 'Chiuso fino alle 14:00' },
                        { value: 'afternoon', label: '🌅 Solo Pomeriggio', desc: 'Chiuso dalle 14:00' }
                      ].map(option => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setSelectedClosureType(option.value as 'full' | 'morning' | 'afternoon')}
                          className={`p-3 rounded-lg border-2 transition-all duration-200 text-left ${
                            selectedClosureType === option.value
                              ? 'border-amber-400 bg-amber-900/30 text-amber-300'
                              : 'border-gray-600 bg-gray-700/50 text-gray-300 hover:border-amber-400/50'
                          }`}
                        >
                          <div className="font-medium text-sm">{option.label}</div>
                          <div className="text-xs opacity-75 mt-1">{option.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>            {/* Chiusure Specifiche - Date - Ottimizzate per Mobile */}
            <div className="border-t border-gray-700 pt-4 md:pt-6">
              <h3 className="text-base md:text-lg font-semibold text-white mb-3 md:mb-4 flex items-center gap-2">
                📅 Chiusure Specifiche
              </h3>
              <p className="text-xs md:text-sm text-gray-300 mb-4 md:mb-6">
                Aggiungi date specifiche di chiusura (es. 2 Giugno, ferie estive, ecc.)
              </p>

              {/* Form per aggiungere nuove chiusure - Mobile Friendly */}
              <div className="bg-gray-800 border border-gray-700 p-4 md:p-6 rounded-xl mb-4 md:mb-6">
                {/* ✅ NUOVO: Checkbox per selezionare barbieri - Gestione Reciproca */}
                <div className="mb-4 pb-4 border-b border-gray-700">
                  <label className="block text-xs md:text-sm font-medium text-gray-300 mb-3">
                    Applica chiusura a: *
                  </label>
                  <div className="flex gap-4">
                    {/* ✅ Fabio checkbox - Visibile per admin e TUTTI i barbieri (gestione reciproca) */}
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={closureFabioChecked}
                        onChange={(e) => setClosureFabioChecked(e.target.checked)}
                        className="w-5 h-5 rounded border-gray-600 text-amber-500 focus:ring-amber-500 focus:ring-offset-gray-800 cursor-pointer"
                      />
                      <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                        🧔 Fabio
                      </span>
                    </label>
                    
                    {/* ✅ Michele checkbox - Visibile per admin e TUTTI i barbieri (gestione reciproca) */}
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={closureMicheleChecked}
                        onChange={(e) => setClosureMicheleChecked(e.target.checked)}
                        className="w-5 h-5 rounded border-gray-600 text-amber-500 focus:ring-amber-500 focus:ring-offset-gray-800 cursor-pointer"
                      />
                      <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                        🧔 Michele
                      </span>
                    </label>
                  </div>
                  {!closureFabioChecked && !closureMicheleChecked && (
                    <p className="text-xs text-red-400 mt-2">⚠️ Seleziona almeno un barbiere</p>
                  )}
                </div>
                
                <div className="space-y-4 md:space-y-0 md:grid md:grid-cols-4 md:gap-4 md:items-end">
                  <div className="space-y-2">
                    <label htmlFor="newClosureDate" className="block text-xs md:text-sm font-medium text-gray-300">
                      Data Inizio *
                    </label>
                    <input
                      type="date"
                      id="newClosureDate"
                      value={newClosureDate}
                      onChange={(e) => setNewClosureDate(e.target.value)}
                      min={getTodayString()}
                      className="w-full px-3 py-3 md:py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-base md:text-sm"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="newClosureEndDate" className="block text-xs md:text-sm font-medium text-gray-300">
                      Data Fine (opzionale)
                    </label>
                    <input
                      type="date"
                      id="newClosureEndDate"
                      value={newClosureEndDate}
                      onChange={(e) => setNewClosureEndDate(e.target.value)}
                      min={newClosureDate || getTodayString()}
                      className="w-full px-3 py-3 md:py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-base md:text-sm"
                      placeholder="Per intervallo di date"
                    />
                    <p className="text-xs text-gray-400">Lascia vuoto per una singola data</p>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="newClosureReason" className="block text-xs md:text-sm font-medium text-gray-300">
                      Motivo (opzionale)
                    </label>
                    <input
                      type="text"
                      id="newClosureReason"
                      value={newClosureReason}
                      onChange={(e) => setNewClosureReason(e.target.value)}
                      placeholder="Es. Festa nazionale, ferie"
                      className="w-full px-3 py-3 md:py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-base md:text-sm"
                    />
                  </div>

                  <div>
                    <button
                      type="button"
                      onClick={addClosureDates}
                      disabled={!newClosureDate}
                      className="w-full px-4 py-3 md:py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:bg-gray-600 disabled:cursor-not-allowed font-medium transition-colors touch-manipulation"
                    >
                      ➕ Aggiungi
                    </button>
                  </div>
                </div>
              </div>

              {/* Lista date chiuse - Mobile Friendly */}
              {closedDates.size > 0 && (
                <div>
                  <h4 className="font-medium text-white mb-3">Date Attualmente Chiuse:</h4>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {Array.from(closedDates)
                      .sort()
                      .map((dateStr) => (
                        <div
                          key={dateStr}
                          className="flex items-center justify-between p-3 bg-red-900/50 border border-red-500 rounded-lg"
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="text-red-400 text-lg">🔒</div>
                            <div className="min-w-0">
                              <div className="font-medium text-red-300 text-sm">
                                {format(parseISO(dateStr + 'T00:00:00'), 'dd/MM/yyyy', { locale: it })}
                              </div>
                              <div className="text-xs text-red-400 truncate">
                                {format(parseISO(dateStr + 'T00:00:00'), 'EEEE', { locale: it })}
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeClosureDate(dateStr)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-800 p-2 rounded transition-colors touch-manipulation ml-2"
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

            {/* Chiusure Barbieri Esistenti - Nuova Sezione */}
            {Object.keys(barberClosures).length > 0 && (
              <div className="border-t border-gray-700 pt-4 md:pt-6">
                <h3 className="text-base md:text-lg font-semibold text-white mb-3 md:mb-4 flex items-center gap-2">
                  🧔 Chiusure Barbieri Attive
                </h3>
                <div className="space-y-4">
                  {Object.entries(barberClosures)
                    .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
                    .map(([date, barbersClosures]) => (
                      <div key={date} className="bg-orange-900/30 border border-orange-500 rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="text-orange-400 text-lg">📅</div>
                          <div>
                            <div className="font-medium text-orange-300">
                              {format(parseISO(date + 'T00:00:00'), 'dd/MM/yyyy', { locale: it })}
                            </div>
                            <div className="text-xs text-orange-400">
                              {format(parseISO(date + 'T00:00:00'), 'EEEE', { locale: it })}
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          {Object.entries(barbersClosures).map(([barberEmail, closures]) => (
                            <div key={barberEmail} className="bg-gray-800/50 rounded-lg p-3">
                              <div className="flex items-center justify-between flex-wrap gap-2">
                                <div className="flex items-center gap-3">
                                  <div className="text-amber-400">🧔</div>
                                  <div>
                                    <div className="font-medium text-white text-sm">
                                      {barberMapping[barberEmail as keyof typeof barberMapping] || barberEmail}
                                    </div>
                                    <div className="text-xs text-gray-400">
                                      {closures.morning && closures.afternoon && 'Chiuso tutto il giorno'}
                                      {closures.morning && !closures.afternoon && 'Chiuso la mattina (9:00-14:00)'}
                                      {!closures.morning && closures.afternoon && 'Chiuso il pomeriggio (14:00-19:00)'}
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="flex gap-1 flex-wrap">
                                  {closures.morning && closures.afternoon ? (
                                    <button
                                      type="button"
                                      onClick={() => removeBarberClosure(barberEmail, date, 'full')}
                                      className="text-red-400 hover:text-red-300 hover:bg-red-800 px-2 py-1 rounded text-xs border border-red-500 transition-colors touch-manipulation"
                                      title="Rimuovi chiusura giornaliera"
                                    >
                                      ❌ Tutto
                                    </button>
                                  ) : (
                                    <>
                                      {closures.morning && (
                                        <button
                                          type="button"
                                          onClick={() => removeBarberClosure(barberEmail, date, 'morning')}
                                          className="text-red-400 hover:text-red-300 hover:bg-red-800 px-2 py-1 rounded text-xs border border-red-500 transition-colors touch-manipulation"
                                          title="Rimuovi chiusura mattutina"
                                        >
                                          ❌ Mattina
                                        </button>
                                      )}
                                      {closures.afternoon && (
                                        <button
                                          type="button"
                                          onClick={() => removeBarberClosure(barberEmail, date, 'afternoon')}
                                          className="text-red-400 hover:text-red-300 hover:bg-red-800 px-2 py-1 rounded text-xs border border-red-500 transition-colors touch-manipulation"
                                          title="Rimuovi chiusura pomeridiana"
                                        >
                                          ❌ Pomeriggio
                                        </button>
                                      )}
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

              <div className="bg-blue-900/50 border border-blue-500 rounded-lg p-4 mt-6">
              <div className="flex items-start gap-3">
                <div className="text-blue-400 text-xl">💡</div>
                <div>
                  <h4 className="font-semibold text-blue-300 mb-1">Come funziona:</h4>                  <ul className="text-sm text-blue-200 space-y-1">
                    <li>• <strong>Chiusure Ricorrenti:</strong> Si applicano ogni settimana (es. sempre chiuso la domenica)</li>
                    <li>• <strong>Chiusure Specifiche:</strong> Per date particolari (es. 2 Giugno, vacanze estive)</li>
                    <li>• <strong>Chiusure per Barbiere:</strong> Solo per singoli barbieri in date specifiche, anche solo mattina (9:00-14:00) o pomeriggio (14:00-19:00)</li>
                    <li>• I giorni chiusi non accetteranno nuove prenotazioni</li>
                    <li>• Le prenotazioni esistenti in quei giorni rimarranno valide</li>
                    <li>• Le impostazioni vengono salvate automaticamente</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>      {/* Filtri - Ottimizzati per Mobile */}
      <div className="bg-gray-900 border border-gray-800 p-4 md:p-6 rounded-lg shadow">        <div className="flex flex-col gap-4 md:gap-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
              📋 Gestione Prenotazioni
            </h2>
            
            {/* Controlli Barbieri - Solo per barbieri */}
            {!isAdmin && currentBarber && (
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="text-sm text-gray-300 flex items-center">
                  👤 {barberMapping[currentBarber as keyof typeof barberMapping] || 'Barbiere'}
                </div>
                
                {/* Pulsante per le proprie prenotazioni */}
                <button
                  onClick={() => switchToOwnBookings()}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    viewMode === 'own' 
                      ? 'bg-amber-600 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  👤 Le tue prenotazioni
                </button>
                
                {/* Pulsanti per gli altri barbieri */}
                {getOtherBarbers(currentBarber).map((otherBarberEmail) => (
                  <button
                    key={otherBarberEmail}
                    onClick={() => switchToBarber(otherBarberEmail)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      viewMode === 'other' && viewingBarber === otherBarberEmail
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    👁️ Vedi {barberMapping[otherBarberEmail as keyof typeof barberMapping] || 'Barbiere'}
                  </button>
                ))}
              </div>
            )}            
            {/* Controlli Admin - Rimosso pulsante obsoleto */}
          </div>
          
          {/* Selezione data orizzontale - Migliorata per mobile */}
          <div>
            <label className="block text-sm md:text-base font-medium text-gray-300 mb-3">
              📅 Seleziona Data
            </label>
            <div className="flex gap-2 md:gap-3 overflow-x-auto pb-3 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 -mx-1 px-1">{datesList.map((date) => {
                const dateStr = format(date, 'yyyy-MM-dd');
                const isSelected = selectedDate === dateStr;
                const isDateToday = isToday(date);
                const isClosedDay = isDateClosed(dateStr);
                
                return (
                  <button
                    key={dateStr}
                    type="button"
                    onClick={() => setSelectedDate(dateStr)}
                    className={`flex-shrink-0 px-3 py-3 md:px-4 md:py-3 rounded-xl border-2 transition-all duration-200 min-w-[90px] md:min-w-[100px] relative touch-manipulation ${
                      isSelected
                        ? isClosedDay
                          ? 'border-red-500 bg-red-900/50 text-red-300 shadow-lg scale-105'
                          : 'border-amber-500 bg-amber-900/50 text-amber-300 shadow-lg scale-105'
                        : isClosedDay
                        ? 'border-red-500 bg-red-900/30 text-red-400 hover:border-red-400 hover:scale-105'
                        : isDateToday
                        ? 'border-blue-500 bg-blue-900/50 text-blue-300 hover:border-blue-400 hover:scale-105'
                        : 'border-gray-600 bg-gray-800 text-gray-300 hover:border-gray-500 hover:bg-gray-700 hover:scale-105'
                    }`}
                  >
                    {isClosedDay && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 md:w-6 md:h-6 bg-red-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">🔒</span>
                      </div>
                    )}
                    <div className="text-center">
                      <div className="text-xs md:text-sm font-medium">
                        {format(date, 'EEE', { locale: it }).toUpperCase()}
                      </div>
                      <div className="text-lg md:text-xl font-bold">
                        {format(date, 'dd')}
                      </div>
                      <div className="text-xs">
                        {format(date, 'MMM', { locale: it })}
                      </div>
                      {isClosedDay && (
                        <div className="text-xs mt-1 font-semibold text-red-400">
                          CHIUSO
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>          {/* Filtro Status e Azioni - Ottimizzati per Mobile */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
            <div className="flex-1 min-w-0">
              <label htmlFor="status" className="block text-sm font-medium text-gray-300 mb-2">
                🔍 Filtra per Status
              </label>
              <select
                id="status"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-3 md:py-2 bg-gray-800 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-base md:text-sm touch-manipulation"
              >
                <option value="all">Tutte le prenotazioni</option>
                <option value="pending">In Attesa</option>
                <option value="confirmed">Confermate</option>
                <option value="cancelled">Annullate</option>
              </select>
            </div>

            {/* Toggle Modalità Visualizzazione */}
            <div className="flex-shrink-0">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                👁️ Modalità Visualizzazione
              </label>
              <div className="flex bg-gray-800 border border-gray-600 rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => setDisplayMode('grid')}
                  className={`px-4 py-3 md:py-2 text-sm font-medium transition-colors ${
                    displayMode === 'grid'
                      ? 'bg-amber-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  📅 Calendario
                </button>
                <button
                  type="button"
                  onClick={() => setDisplayMode('table')}
                  className={`px-4 py-3 md:py-2 text-sm font-medium transition-colors ${
                    displayMode === 'table'
                      ? 'bg-amber-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  📋 Tabella
                </button>
              </div>
            </div>

            {/* Reset filtri - Mobile Friendly */}
            <button
              type="button"
              onClick={() => {
                setSelectedDate(getTodayString());
                setFilterStatus('all');
              }}
              className="px-4 py-3 md:py-2 text-sm text-gray-300 hover:text-white border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors whitespace-nowrap touch-manipulation"
            >
              🔄 Reset Filtri
            </button>
          </div>
        </div>
      </div>      {/* Lista prenotazioni - Modalità Griglia o Tabella */}
      {displayMode === 'grid' ? (
        /* Modalità Calendario a Griglia - Mostra TUTTI i barbieri */
        <CalendarGrid
          bookings={allBookings.filter(booking => booking.booking_date === selectedDate)}
          selectedDate={selectedDate}
          onWhatsAppClick={(booking) => openWhatsApp(
            booking.customer_phone, 
            booking.customer_name, 
            booking.service_name, 
            booking.booking_date, 
            booking.booking_time
          )}
          onPhoneClick={makePhoneCall}
          onCancelBooking={(bookingId) => updateBookingStatus(bookingId, 'cancelled')}
          onModifyBooking={(booking) => openSwapModal(booking)}
          canModifyBookings={isAdmin || !!currentBarber}
          currentUserEmail={currentBarber}
        />
      ) : (
        /* Modalità Tabella Tradizionale */
        <div className="bg-gray-900 border border-gray-800 rounded-lg shadow overflow-hidden">
          {bookings.length === 0 ? (
            <div className="p-8 md:p-12 text-center">
              <div className="text-4xl md:text-6xl mb-4">📅</div>
              <div className="text-gray-400 text-base md:text-lg mb-2">
                Nessuna prenotazione trovata per il {format(parseISO(selectedDate + 'T00:00:00'), 'dd/MM/yyyy', { locale: it })}
                {filterStatus !== 'all' && ` con status "${filterStatus}"`}
              </div>
              <div className="text-gray-500 text-sm mt-2">
                Prova a selezionare un altro giorno o cambiare il filtro status
              </div>
            </div>
          ) : (
          <>
            {/* Vista Mobile - Cards */}
            <div className="block md:hidden">
              <div className="divide-y divide-gray-700">
                {(Array.isArray(bookings) ? bookings : []).map((booking, index) => (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="p-4 hover:bg-gray-800 transition-colors"
                  >
                    {/* Header della card */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-semibold text-lg truncate">
                          {booking.customer_name}
                        </h3>
                        <p className="text-gray-400 text-sm">
                          📞 {booking.customer_phone}
                        </p>
                        {booking.customer_email && (
                          <p className="text-gray-400 text-sm truncate">
                            ✉️ {booking.customer_email}
                          </p>
                        )}
                      </div>
                      <div className="ml-3">
                        {getStatusBadge(booking.status)}
                      </div>
                    </div>

                    {/* Dettagli servizio */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-gray-800 p-3 rounded-lg">
                        <div className="text-gray-400 text-xs mb-1">✂️ Servizio</div>
                        <div className="text-white font-medium text-sm">{booking.service_name}</div>
                      </div>
                      <div className="bg-gray-800 p-3 rounded-lg">
                        <div className="text-gray-400 text-xs mb-1">👨‍💼 Barbiere</div>
                        <div className="text-white font-medium text-sm">{booking.barber_name}</div>
                      </div>
                    </div>

                    {/* Data e ora */}
                    <div className="bg-blue-900/30 border border-blue-500 p-3 rounded-lg mb-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-blue-300 font-semibold">
                            📅 {format(parseISO(booking.booking_date), 'dd/MM/yyyy', { locale: it })}
                          </div>
                          <div className="text-blue-400 text-sm">
                            🕐 {booking.booking_time}
                          </div>
                        </div>
                        <div className="text-blue-300 text-2xl">
                          ⏰
                        </div>
                      </div>
                    </div>

                    {/* Note */}
                    {booking.notes && (
                      <div className="bg-amber-900/30 border border-amber-500 p-3 rounded-lg mb-4">
                        <div className="text-amber-300 text-xs font-medium mb-1">📝 Note</div>                        <div className="text-amber-100 text-sm">{booking.notes}</div>
                      </div>
                    )}                    {/* Azioni */}
                    <div className="space-y-3">
                      {/* Pulsanti di contatto cliente */}
                      <div className="space-y-2">
                        <div className="text-xs text-gray-400 uppercase tracking-wider">Contatta Cliente</div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => openWhatsApp(
                              booking.customer_phone, 
                              booking.customer_name, 
                              booking.service_name, 
                              booking.booking_date, 
                              booking.booking_time
                            )}                            className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-lg font-medium transition-colors touch-manipulation flex items-center justify-center gap-2"                            title="Contatta cliente via WhatsApp"
                          >
                            <span role="img" aria-label="whatsapp">💬</span> WhatsApp
                          </button>
                          <button
                            type="button"
                            onClick={() => makePhoneCall(booking.customer_phone)}
                            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg font-medium transition-colors touch-manipulation flex items-center justify-center gap-2"
                            title="Chiama il cliente"
                          >
                            <span role="img" aria-label="phone">📞</span> Chiama
                          </button>
                        </div>
                      </div>

                      {/* Pulsanti di contatto barbiere - Solo se telefono disponibile */}
                      {booking.barber_phone && (
                        <div className="space-y-2">
                          <div className="text-xs text-gray-400 uppercase tracking-wider">Contatta Barbiere</div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => contactBarberWhatsApp(
                                booking.barber_phone!, 
                                booking.barber_name, 
                                booking.customer_name, 
                                booking.service_name, 
                                booking.booking_date, 
                                booking.booking_time
                              )}                              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-4 py-3 rounded-lg font-medium transition-colors touch-manipulation flex items-center justify-center gap-2"                              title="Contatta barbiere via WhatsApp"
                            >
                              <span role="img" aria-label="whatsapp">💬</span> WhatsApp
                            </button>
                            <button
                              type="button"
                              onClick={() => makePhoneCall(booking.barber_phone!)}
                              className="flex-1 bg-purple-500 hover:bg-purple-600 text-white px-4 py-3 rounded-lg font-medium transition-colors touch-manipulation flex items-center justify-center gap-2"
                              title="Chiama il barbiere"
                            >
                              <span role="img" aria-label="phone">📞</span> Chiama
                            </button>
                          </div>
                        </div>
                      )}

                      {/* ✅ Pulsante per modificare appuntamento - Barbieri possono gestirsi reciprocamente */}
                      {booking.status !== 'cancelled' && (
                        <div className="space-y-2">
                          <div className="text-xs text-gray-400 uppercase tracking-wider">Gestisci Appuntamento</div>
                          <button
                            type="button"
                            onClick={() => openSwapModal(booking)}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-lg font-medium transition-colors touch-manipulation flex items-center justify-center gap-2"
                            title="Modifica data/ora o scambia con altro appuntamento"
                          >
                            🔄 Modifica Appuntamento
                          </button>
                        </div>
                      )}

                      {/* ✅ Pulsante per modificare appuntamento - Barbieri possono gestirsi reciprocamente */}
                      {booking.status !== 'cancelled' && (
                        <div className="space-y-2">
                          <div className="text-xs text-gray-400 uppercase tracking-wider">Gestisci Appuntamento</div>
                          <button
                            type="button"
                            onClick={() => openSwapModal(booking)}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-lg font-medium transition-colors touch-manipulation flex items-center justify-center gap-2"
                            title="Modifica data/ora o scambia con altro appuntamento"
                          >
                            🔄 Modifica Appuntamento
                          </button>
                        </div>
                      )}

                      {/* ✅ Pulsanti di gestione prenotazione - Barbieri possono gestirsi reciprocamente */}
                      <div className="flex gap-2 flex-wrap">
                        {booking.status === 'pending' && (
                          <>
                            <button
                              type="button"
                              onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                              className="flex-1 min-w-[120px] bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-medium transition-colors touch-manipulation flex items-center justify-center gap-2"
                            >
                              ✅ Conferma
                            </button>
                            <button
                              type="button"
                              onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                              className="flex-1 min-w-[120px] bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg font-medium transition-colors touch-manipulation flex items-center justify-center gap-2"
                            >
                              ❌ Annulla
                            </button>
                          </>
                        )}

                        {booking.status === 'confirmed' && (
                          <button
                            type="button"
                            onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                            className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg font-medium transition-colors touch-manipulation flex items-center justify-center gap-2"
                          >
                            ❌ Annulla Prenotazione
                          </button>
                        )}

                        {booking.status === 'cancelled' && (
                          <button
                            type="button"
                            onClick={() => deleteBooking(booking.id)}
                            className="w-full bg-red-800 hover:bg-red-900 text-red-200 px-4 py-3 rounded-lg font-medium transition-colors touch-manipulation flex items-center justify-center gap-2"
                            title="Elimina definitivamente questa prenotazione"
                          >
                            🗑️ Elimina Definitivamente                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>                ))}
              </div>
            </div>
            {/* Vista Desktop - Tabella */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">                
                <thead className="bg-gray-800">
                  <tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
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
                      Contatti
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Azioni
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gray-900 divide-y divide-gray-700">
                  {(Array.isArray(bookings) ? bookings : []).map((booking) => (
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
                          ) : (                            <span className="text-gray-500 italic">Nessuna nota</span>
                          )}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(booking.status)}
                      </td>                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          {/* Pulsanti per contattare il cliente */}
                          <button
                            type="button"
                            onClick={() => openWhatsApp(
                              booking.customer_phone, 
                              booking.customer_name, 
                              booking.service_name, 
                              booking.booking_date, 
                              booking.booking_time
                            )}                            className="text-green-400 hover:text-green-300 px-2 py-1 border border-green-500 rounded hover:bg-green-900/50 text-xs"                            title="Contatta cliente via WhatsApp"
                          >
                            <span role="img" aria-label="whatsapp">💬</span> Cliente
                          </button>
                          <button
                            type="button"
                            onClick={() => makePhoneCall(booking.customer_phone)}
                            className="text-blue-400 hover:text-blue-300 px-2 py-1 border border-blue-500 rounded hover:bg-blue-900/50 text-xs"
                            title="Chiama il cliente"
                          >
                            <span role="img" aria-label="phone">📞</span> Cliente
                          </button>
                          
                          {/* Pulsanti per contattare il barbiere */}
                          {booking.barber_phone && (
                            <>
                              <button
                                type="button"
                                onClick={() => contactBarberWhatsApp(
                                  booking.barber_phone!, 
                                  booking.barber_name, 
                                  booking.customer_name, 
                                  booking.service_name, 
                                  booking.booking_date, 
                                  booking.booking_time
                                )}                                className="text-orange-400 hover:text-orange-300 px-2 py-1 border border-orange-500 rounded hover:bg-orange-900/50 text-xs"                                title="Contatta barbiere via WhatsApp"                              >
                                <span role="img" aria-label="whatsapp">💬</span> Barbiere
                              </button>
                              <button
                                type="button"
                                onClick={() => makePhoneCall(booking.barber_phone!)}
                                className="text-purple-400 hover:text-purple-300 px-2 py-1 border border-purple-500 rounded hover:bg-purple-900/50 text-xs"
                                title="Chiama il barbiere"
                              >
                                <span role="img" aria-label="phone">📞</span> Barbiere
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {/* ✅ Barbieri possono gestirsi reciprocamente */}
                        <div className="flex gap-2 flex-wrap">
                          {/* Pulsante modifica appuntamento */}
                          {booking.status !== 'cancelled' && (
                            <button
                              type="button"
                              onClick={() => openSwapModal(booking)}
                              className="text-indigo-400 hover:text-indigo-300 px-2 py-1 border border-indigo-500 rounded hover:bg-indigo-900/50 text-xs"
                              title="Modifica data/ora o scambia con altro appuntamento"
                            >
                              🔄 Modifica
                            </button>
                          )}

                          {booking.status === 'pending' && (
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
                          )}

                          {booking.status === 'confirmed' && (
                            <button
                              type="button"
                              onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                              className="text-red-400 hover:text-red-300 px-2 py-1 border border-red-500 rounded hover:bg-red-900/50"
                            >
                              Annulla
                            </button>
                          )}

                          {booking.status === 'cancelled' && (                              <button
                              type="button"
                              onClick={() => deleteBooking(booking.id)}className="text-red-300 hover:text-red-200 px-2 py-1 bg-red-900/50 border border-red-500 rounded hover:bg-red-800/70 font-medium"
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
          </>
            )}
        </div>
      )}

      {/* SEZIONE STORICO PRENOTAZIONI - TEMPORANEAMENTE NASCOSTA */}
      {false && isAuthorized && (
        <div className="mt-8">
          <AllBookingsTable 
            bookings={allBookings} 
            onWhatsAppClick={(booking) => openWhatsApp(
              booking.customer_phone, 
              booking.customer_name, 
              booking.service_name, 
              booking.booking_date, 
              booking.booking_time
            )}
            onPhoneClick={makePhoneCall}
          />
        </div>
      )}

      {/* Sezione Lista d'Attesa - Sempre visibile */}
      {/* TODO: Re-enable when WaitlistPanel component is created
      <div className="mt-8">
        <WaitlistPanel 
          selectedDate={selectedDate}
          onRefresh={() => {
            fetchBookings();
            if (displayMode === 'grid') {
              fetchAllBarberBookings();
            }
          }}
        />
      </div>
      */}

      {/* Modal per scambio/modifica appuntamenti */}
      {swapModalOpen && selectedBookingForSwap && (
        <BookingSwapModal
          booking={selectedBookingForSwap}
          allBookings={bookings}
          barberEmail={getBarberEmailFromName(selectedBookingForSwap.barber_name)}
          onClose={closeSwapModal}
          onSwapComplete={onSwapComplete}
        />
      )}
    </div>
  );
}
