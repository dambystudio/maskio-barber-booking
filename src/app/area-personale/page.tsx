'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';
import Link from 'next/link';
import PhoneRequiredModal from '@/components/PhoneRequiredModal';
import { usePhoneRequired } from '@/hooks/usePhoneRequired';

interface UserBooking {
  id: string;
  service_name: string;
  barber_name: string;
  barber_phone?: string;
  booking_date: string;
  booking_time: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  created_at: string;
  notes?: string;
  service_price?: number;
  customer_name?: string; // <-- CAMPO AGGIUNTO
}

type TabType = 'appointments' | 'profile' | 'account';

export default function AreaPersonale() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [bookings, setBookings] = useState<UserBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<TabType>('appointments');  // Verifica se l'utente è un barbiere o admin
  const isBarber = session?.user?.role === 'barber';
  const isAdmin = session?.user?.role === 'admin';
  const hasManagementAccess = isBarber || isAdmin;
  
  // Stato per i permessi reali dal backend
  const [realPermissions, setRealPermissions] = useState({
    isAdmin: false,
    isBarber: false,
    hasManagementAccess: false,
    checked: false
  });  // Check permessi tramite API
  useEffect(() => {
    if (session?.user?.email === 'davide431@outlook.it') {
      console.log('🔍 Checking permissions for davide431@outlook.it...');
      
      // Usa il nuovo endpoint che non richiede autenticazione
      fetch('/api/debug/check-permissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: session.user.email })
      })
        .then(res => {
          console.log('🌐 API Response Status:', res.status);
          return res.json();
        })
        .then(data => {
          console.log('📋 API Response Data:', data);
          if (data.success && data.permissions) {
            const newPermissions = {
              isAdmin: data.permissions.isAdmin,
              isBarber: data.permissions.isBarber,
              hasManagementAccess: data.permissions.hasManagementAccess,
              checked: true
            };
            console.log('✅ Setting real permissions:', newPermissions);
            setRealPermissions(newPermissions);
          } else {
            console.log('⚠️ No permissions in API response or API failed:', data);
            setRealPermissions({
              isAdmin: false,
              isBarber: false,
              hasManagementAccess: false,
              checked: true
            });
          }
        })
        .catch(err => {
          console.error('❌ Error checking permissions:', err);
          setRealPermissions({
            isAdmin: false,
            isBarber: false,
            hasManagementAccess: false,
            checked: true
          });
        });
    } else {
      setRealPermissions({
        isAdmin: false,
        isBarber: false,
        hasManagementAccess: false,
        checked: true
      });
    }
  }, [session?.user?.email]);

  // Usa i permessi reali per davide431@outlook.it, altrimenti usa la sessione
  const effectiveIsAdmin = session?.user?.email === 'davide431@outlook.it' ? realPermissions.isAdmin : isAdmin;
  const effectiveIsBarber = session?.user?.email === 'davide431@outlook.it' ? realPermissions.isBarber : isBarber;
  const effectiveHasManagementAccess = session?.user?.email === 'davide431@outlook.it' ? realPermissions.hasManagementAccess : hasManagementAccess;
    // Debug temporaneo
  console.log('🔍 Session Debug:', {
    email: session?.user?.email,
    role: session?.user?.role,
    isAdmin,
    isBarber,
    hasManagementAccess,
    fullSession: session
  });  const [sessionUpdateAttempted, setSessionUpdateAttempted] = useState(false);  // Debug visibile
  useEffect(() => {
    if (session?.user?.email === 'davide431@outlook.it' && realPermissions.checked) {
      const debugInfo = {
        email: session.user.email,
        sessionRole: session.user.role,
        sessionIsAdmin: isAdmin,
        sessionIsBarber: isBarber,
        sessionHasManagement: hasManagementAccess,
        realIsAdmin: realPermissions.isAdmin,
        realIsBarber: realPermissions.isBarber,
        realHasManagement: realPermissions.hasManagementAccess,
        effectiveIsAdmin,
        effectiveIsBarber,
        effectiveHasManagementAccess
      };
      
      console.log('🎯 Debug Info for davide431@outlook.it:', debugInfo);
      
      // Debug aggiuntivo per il rendering condizionale
      console.log('🖼️ Rendering conditions:');
      console.log('- Will show management access?', effectiveHasManagementAccess);
      console.log('- Will show admin features?', effectiveIsAdmin);
      console.log('- Permissions checked?', realPermissions.checked);
      
      // Se c'è una discrepanza tra session e real permissions
      if (session.user.role === 'customer' && effectiveIsAdmin) {
        console.log('⚠️ Role mismatch: session shows customer but API shows admin');
        console.log('✅ Using API permissions instead of session');
      }
    }
  }, [session, realPermissions, effectiveIsAdmin, effectiveIsBarber, effectiveHasManagementAccess]);  // Aggiorna il tab iniziale in base al ruolo
  useEffect(() => {
    // Tutti iniziano da 'appointments', sia customer che barbieri che admin
    setActiveTab('appointments');
  }, [effectiveHasManagementAccess]);
  
  // Hook per gestire il telefono richiesto
  const { showPhoneModal, handlePhoneComplete, userEmail, userName } = usePhoneRequired();

  const fetchUserBookings = useCallback(async () => {
    if (!session?.user?.id) return;

    try {
      setLoading(true);

      // --- LOGICA MODIFICATA ---
      // Se l'utente è un barbiere, carica le prenotazioni in cui è il barbiere.
      // Altrimenti, carica quelle in cui è il cliente.
      const isBarberUser = session.user.role === 'barber';
      const params = new URLSearchParams();

      if (isBarberUser) {
        // I barbieri vedono gli appuntamenti a loro assegnati
        params.append('barberEmail', session.user.email);
      } else {
        // I clienti vedono gli appuntamenti prenotati da loro
        params.append('userId', session.user.id);
      }
      
      const response = await fetch(`/api/bookings?${params.toString()}`);
      // --- FINE LOGICA MODIFICATA ---

      if (!response.ok) throw new Error('Errore nel caricamento delle prenotazioni');
      
      const data = await response.json();
      
      // La risposta dell'API include un campo customer_name, che usiamo per i barbieri
      // e un campo barber_name, che usiamo per i clienti.
      // L'interfaccia UserBooking può essere arricchita se necessario.
      const bookingsData = data.bookings.map((b: UserBooking) => ({ // <-- TIPO AGGIUNTO
        ...b,
        customer_name: b.customer_name, // Assicuriamoci che il nome cliente sia presente
      }));

      setBookings(bookingsData || []);
    } catch (err) {
      setError('Impossibile caricare le prenotazioni');
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  const fetchUserProfile = useCallback(async () => {
    try {
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const data = await response.json();
        setUserProfile(data.profile);
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
    }
  }, []);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/auth/signin?callbackUrl=' + encodeURIComponent('/area-personale'));
      return;
    }
    
    fetchUserBookings();
    fetchUserProfile();
  }, [session, status, router, fetchUserBookings, fetchUserProfile]);
  const canCancelBooking = (bookingDate: string, bookingTime: string) => {
    try {
      const bookingDateTime = new Date(`${bookingDate}T${bookingTime}`);
      const now = new Date();
      const timeDifference = bookingDateTime.getTime() - now.getTime();
      const hoursDifference = timeDifference / (1000 * 60 * 60);
      
      return hoursDifference >= 48; // Almeno 48 ore prima
    } catch (error) {
      console.error('Error calculating booking time difference:', error);
      return false;
    }
  };
  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Sei sicuro di voler cancellare questa prenotazione?')) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/bookings?id=${bookingId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Errore nella cancellazione');
      }

      await fetchUserBookings(); // Refresh bookings
      alert('Prenotazione cancellata con successo');
    } catch (err) {
      console.error('Error cancelling booking:', err);
      alert('Errore nella cancellazione della prenotazione: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'text-green-400 bg-green-900/20';
      case 'pending': return 'text-yellow-400 bg-yellow-900/20';
      case 'cancelled': return 'text-red-400 bg-red-900/20';
      default: return 'text-gray-400 bg-gray-900/20';
    }
  };
  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confermata';
      case 'pending': return 'In attesa';
      case 'cancelled': return 'Cancellata';
      default: return status;
    }
  };

  const generateWhatsAppLink = (phone: string, barberName: string, serviceName: string, date: string, time: string) => {
    if (!phone) return '';
    
    // Pulisce il numero di telefono da spazi e caratteri speciali, mantiene solo numeri e +
    const cleanPhone = phone.replace(/[^\d+]/g, '');
    
    // Crea il messaggio per WhatsApp
    const message = `Ciao ${barberName}! Ti scrivo per la mia prenotazione del ${date} alle ${time} per ${serviceName}.`;
    
    // Codifica il messaggio per URL
    const encodedMessage = encodeURIComponent(message);
    
    return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
  };
  const handleLogout = async () => {
    if (confirm('Sei sicuro di voler uscire?')) {
      await signOut({ callbackUrl: '/' });
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-500 mx-auto"></div>
          <p className="mt-4 text-xl">Caricamento...</p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  // Ordina tutte le prenotazioni per data prima di filtrarle
  const sortedBookings = [...bookings].sort((a, b) => 
    new Date(`${a.booking_date}T${a.booking_time}`).getTime() - 
    new Date(`${b.booking_date}T${b.booking_time}`).getTime()
  );

  const upcomingBookings = sortedBookings.filter(booking => 
    new Date(booking.booking_date + 'T' + booking.booking_time) > new Date() && 
    booking.status !== 'cancelled'
  );
  
  const pastBookings = sortedBookings.filter(booking => 
    new Date(booking.booking_date + 'T' + booking.booking_time) <= new Date() ||
    booking.status === 'cancelled'
  ).reverse(); // .reverse() per avere il più recente in cima

  const tabVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  return (
    <div className="min-h-screen bg-black">      {/* Header con Tab Navigation */}
      <div className="bg-gray-900/50 backdrop-blur-sm sticky top-0 z-40 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">          {/* Welcome Header */}
          <div className="py-4 text-center">
            <h1 className="text-xl md:text-2xl font-bold text-white mb-1">
              Ciao, {session.user.name?.split(' ')[0]}! 👋
            </h1>
            <p className="text-gray-400 text-xs md:text-sm">
              La tua area personale
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex justify-center pb-3">            <div className="flex bg-gray-800/50 rounded-xl p-1 space-x-1">
              <button
                onClick={() => setActiveTab('appointments')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === 'appointments' 
                    ? 'bg-amber-600 text-black shadow-lg' 
                    : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                <span>📅</span>
                <span className="hidden sm:inline">Appuntamenti</span>
              </button>
              
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === 'profile' 
                    ? 'bg-amber-600 text-black shadow-lg' 
                    : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                <span>👤</span>
                <span className="hidden sm:inline">Profilo</span>
              </button>

              <button
                onClick={() => setActiveTab('account')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === 'account'
                    ? 'bg-amber-600 text-black shadow-lg' 
                    : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                <span>⚙️</span>
                <span className="hidden sm:inline">Account</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">        {/* Appointments Tab - Solo per clienti */}
        {activeTab === 'appointments' && (
          <motion.div
            key="appointments"
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 text-center">
                <h3 className="text-2xl md:text-3xl font-bold text-amber-500 mb-1">{upcomingBookings.length}</h3>
                <p className="text-gray-300 text-sm">Prossimi</p>
              </div>
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 text-center">
                <h3 className="text-2xl md:text-3xl font-bold text-blue-500 mb-1">{pastBookings.length}</h3>
                <p className="text-gray-300 text-sm">Completati</p>
              </div>
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 text-center col-span-2 md:col-span-1">
                <h3 className="text-2xl md:text-3xl font-bold text-green-500 mb-1">{bookings.filter(b => b.status === 'confirmed').length}</h3>
                <p className="text-gray-300 text-sm">Confermati</p>
              </div>
            </div>            {/* Quick Action */}
            <div className="mb-8">
              <Link
                href="/prenota"
                className="w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-black font-bold py-4 px-6 rounded-xl transition duration-300 flex items-center justify-center space-x-2 shadow-lg"
              >
                <span>✨</span>
                <span>Prenota Nuovo Appuntamento</span>
              </Link>
            </div>

            {/* Upcoming Bookings */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <span className="mr-2">🔜</span>
                Prossimi Appuntamenti
              </h2>
              {upcomingBookings.length === 0 ? (
                <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-8 text-center">
                  <div className="text-6xl mb-4">📅</div>
                  <p className="text-gray-300 text-lg mb-4">Nessun appuntamento programmato</p>
                  <Link
                    href="/prenota"
                    className="inline-block bg-amber-600 hover:bg-amber-700 text-black font-bold py-2 px-6 rounded-lg transition duration-300"
                  >
                    Prenota ora
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {upcomingBookings.map((booking) => (
                    <motion.div
                      key={booking.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="bg-gray-800 border border-gray-700 rounded-xl shadow-lg overflow-hidden"
                    >
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-white">{booking.service_name}</h3>
                            {/* --- LOGICA DI VISUALIZZAZIONE MODIFICATA --- */}
                            {isBarber ? (
                              <p className="text-gray-300">Cliente: {booking.customer_name}</p>
                            ) : (
                              <p className="text-gray-300">Barbiere: {booking.barber_name}</p>
                            )}
                          </div>
                          <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(booking.status)}`}>
                            {getStatusText(booking.status)}
                          </div>
                        </div>

                        <div className="space-y-3 text-gray-400">
                          <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            <span>{format(parseISO(booking.booking_date), 'EEEE d MMMM yyyy', { locale: it })}</span>
                          </div>
                          <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <span>Ore: {booking.booking_time}</span>
                          </div>
                          {booking.service_price && !isBarber && (
                            <div className="flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                              <span>Prezzo: {booking.service_price.toFixed(2)} €</span>
                            </div>
                          )}
                        </div>

                        {booking.status === 'confirmed' && !isBarber && (
                          <div className="mt-6 pt-4 border-t border-gray-700 flex flex-col sm:flex-row gap-3">
                              {canCancelBooking(booking.booking_date, booking.booking_time) ? (
                                  <button
                                      onClick={() => handleCancelBooking(booking.id)}
                                      className="w-full bg-red-800 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
                                  >
                                      Cancella Prenotazione
                                  </button>
                              ) : (
                                  <button
                                      disabled
                                      className="w-full bg-gray-600 text-gray-400 font-bold py-2 px-4 rounded-lg cursor-not-allowed"
                                      title="La cancellazione è disponibile fino a 48 ore prima dell'appuntamento."
                                  >
                                      Non cancellabile
                                  </button>
                              )}
                            <a
                              href={generateWhatsAppLink(booking.barber_phone || '', booking.barber_name, booking.service_name, booking.booking_date, booking.booking_time)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full text-center bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
                            >
                              Contatta su WhatsApp
                            </a>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Past Bookings */}
            {pastBookings.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                  <span className="mr-2">📋</span>
                  Ultimi Appuntamenti
                </h2>
                <div className="space-y-3">
                  {pastBookings.slice(0, 3).map((booking) => (
                    <div key={booking.id} className="bg-gray-900/50 border border-gray-700 rounded-xl p-4 opacity-75">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-white font-semibold">{booking.service_name}</h3>
                          <p className="text-gray-400 text-sm">
                            {booking.booking_date ? format(parseISO(booking.booking_date), 'dd/MM/yyyy', { locale: it }) : 'N/A'} - {booking.booking_time}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                          {getStatusText(booking.status)}
                        </span>
                      </div>
                    </div>
                  ))}
                  {pastBookings.length > 3 && (
                    <div className="text-center">
                      <button className="text-amber-500 hover:text-amber-400 text-sm font-medium">
                        Vedi tutti ({pastBookings.length - 3} altri)
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <motion.div
            key="profile"
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.3 }}
          >            {userProfile ? (
              <div className="space-y-6">
                {/* Profile Header */}
                <div className={`bg-gradient-to-r ${isBarber ? 'from-blue-600/10 to-blue-500/10 border-blue-500/20' : 'from-amber-600/10 to-amber-500/10 border-amber-500/20'} border rounded-xl p-6`}>
                  <div className="flex items-center space-x-4">
                    <div className={`w-16 h-16 ${isBarber ? 'bg-blue-500' : 'bg-amber-500'} rounded-full flex items-center justify-center text-2xl font-bold text-${isBarber ? 'white' : 'black'}`}>
                      {isBarber ? '✂️' : (userProfile.name?.charAt(0) || '👤')}
                    </div>                    <div>
                      <h2 className="text-2xl font-bold text-white">{userProfile.name}</h2>                      <p className={`${effectiveHasManagementAccess ? 'text-blue-400' : 'text-amber-400'}`}>
                        {effectiveIsAdmin ? 'Amministratore' : effectiveIsBarber ? 'Barbiere' : `Cliente dal ${userProfile.createdAt ? format(parseISO(userProfile.createdAt), 'MMMM yyyy', { locale: it }) : 'N/A'}`}
                      </p>
                    </div>                  </div>
                </div>

                {/* Profile Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
                    <h3 className="text-amber-500 font-semibold mb-2 flex items-center">
                      <span className="mr-2">📧</span>
                      Email
                    </h3>
                    <p className="text-white">{userProfile.email}</p>
                  </div>
                  
                  <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
                    <h3 className="text-amber-500 font-semibold mb-2 flex items-center">
                      <span className="mr-2">📱</span>
                      Telefono
                    </h3>
                    <p className="text-white">{userProfile.phone || 'Non specificato'}</p>
                  </div>

                  <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
                    <h3 className="text-amber-500 font-semibold mb-2 flex items-center">
                      <span className="mr-2">📅</span>
                      Membro dal
                    </h3>
                    <p className="text-white">
                      {userProfile.createdAt ? format(parseISO(userProfile.createdAt), 'dd MMMM yyyy', { locale: it }) : 'N/A'}
                    </p>
                  </div>

                  <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
                    <h3 className="text-amber-500 font-semibold mb-2 flex items-center">
                      <span className="mr-2">⏰</span>
                      Ultimo accesso
                    </h3>
                    <p className="text-white">
                      {userProfile.lastLogin ? format(parseISO(userProfile.lastLogin), 'dd/MM/yyyy HH:mm', { locale: it }) : 'Primo accesso'}
                    </p>
                  </div>
                </div>

                {/* Stats */}
                <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-6">
                  <h3 className="text-white font-bold mb-4 flex items-center">
                    <span className="mr-2">📊</span>
                    Le tue statistiche
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-amber-500">{bookings.length}</div>
                      <div className="text-gray-400 text-sm">Appuntamenti totali</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-500">{bookings.filter(b => b.status === 'confirmed').length}</div>
                      <div className="text-gray-400 text-sm">Confermati</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-500">{pastBookings.length}</div>
                      <div className="text-gray-400 text-sm">Completati</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-amber-500">{upcomingBookings.length}</div>
                      <div className="text-gray-400 text-sm">In programma</div>
                    </div>
                  </div>
                </div>

                {/* Edit Profile Button */}
                <div className="text-center">
                  <Link
                    href="/area-personale/profilo"
                    className="inline-flex items-center space-x-2 bg-amber-600 hover:bg-amber-700 text-black font-bold py-3 px-6 rounded-lg transition duration-300"
                  >
                    <span>✏️</span>
                    <span>Modifica Profilo</span>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="animate-pulse text-gray-400">Caricamento profilo...</div>
              </div>
            )}
          </motion.div>
        )}

        {/* Account Tab */}
        {activeTab === 'account' && (
          <motion.div
            key="account"
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Account Status */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <span className="mr-2">🔐</span>
                Stato Account
              </h2>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300">Il tuo account è attivo e verificato</p>
                  <p className="text-green-400 text-sm font-medium mt-1">✓ Account verificato</p>
                </div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
            </div>

            {/* Account Actions */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4">Azioni Account</h3>
              
              <Link
                href="/area-personale/profilo"
                className="w-full bg-gray-800/50 border border-gray-700 hover:border-amber-500/50 rounded-xl p-4 flex items-center justify-between transition duration-300 group"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">✏️</span>
                  <div>
                    <h4 className="font-semibold text-white group-hover:text-amber-400 transition duration-300">Modifica Profilo</h4>
                    <p className="text-gray-400 text-sm">Aggiorna le tue informazioni personali</p>
                  </div>
                </div>
                <span className="text-gray-400 group-hover:text-amber-400 transition duration-300">→</span>
              </Link>

              <Link
                href="/prenota"
                className="w-full bg-gray-800/50 border border-gray-700 hover:border-amber-500/50 rounded-xl p-4 flex items-center justify-between transition duration-300 group"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">📅</span>
                  <div>
                    <h4 className="font-semibold text-white group-hover:text-amber-400 transition duration-300">Nuova Prenotazione</h4>
                    <p className="text-gray-400 text-sm">Prenota il tuo prossimo appuntamento</p>
                  </div>
                </div>
                <span className="text-gray-400 group-hover:text-amber-400 transition duration-300">→</span>
              </Link>
            </div>

            {/* Logout Section */}
            <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <span className="mr-2">⚠️</span>
                Zona Pericolosa
              </h3>
              <p className="text-gray-300 mb-4">
                Disconnessione dal tuo account. Dovrai effettuare nuovamente l'accesso.
              </p>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 flex items-center space-x-2"
              >
                <span>🚪</span>
                <span>Disconnetti Account</span>
              </button>
            </div>

            {/* App Info */}
            <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Informazioni App</h3>
              <div className="space-y-2 text-sm text-gray-400">
                <p>Versione: 1.0.0</p>
                <p>Ultimo aggiornamento: {new Date().toLocaleDateString('it-IT')}</p>
                <p>Sviluppato con ❤️ per Maskio Barber Concept</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
      
      {/* Modal per richiesta telefono */}
      <PhoneRequiredModal
        isOpen={showPhoneModal}
        userEmail={userEmail}
        userName={userName}
        onComplete={handlePhoneComplete}
      />
    </div>
  );
}
