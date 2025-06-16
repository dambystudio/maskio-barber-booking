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
  booking_date: string;
  booking_time: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  created_at: string;
  notes?: string;
  service_price?: number;
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
  }, [session, realPermissions, effectiveIsAdmin, effectiveIsBarber, effectiveHasManagementAccess]);
  // Aggiorna il tab iniziale in base al ruolo
  useEffect(() => {
    if (effectiveHasManagementAccess) {
      setActiveTab('profile'); // Admin e barbieri iniziano dal profilo
    }
  }, [effectiveHasManagementAccess]);
  
  // Hook per gestire il telefono richiesto
  const { showPhoneModal, handlePhoneComplete, userEmail, userName } = usePhoneRequired();

  const fetchUserBookings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/bookings?userId=${session?.user?.id}`);
      if (!response.ok) throw new Error('Errore nel caricamento delle prenotazioni');
      
      const data = await response.json();
      setBookings(data.bookings || []);
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

  const upcomingBookings = bookings.filter(booking => 
    new Date(booking.booking_date + 'T' + booking.booking_time) > new Date() && 
    booking.status !== 'cancelled'
  );
  
  const pastBookings = bookings.filter(booking => 
    new Date(booking.booking_date + 'T' + booking.booking_time) <= new Date() ||
    booking.status === 'cancelled'
  );

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

          {/* Debug Info - Solo per davide431@outlook.it */}
          {session?.user?.email === 'davide431@outlook.it' && (
            <div className="mb-4 p-3 bg-purple-900/20 border border-purple-500/30 rounded-lg">
              <div className="text-xs text-purple-200 space-y-1">
                <div><strong>Debug Info:</strong></div>
                <div>Session Role: {session?.user?.role || 'None'}</div>
                <div>Real Admin: {realPermissions.isAdmin ? 'Yes' : 'No'}</div>
                <div>Real Barber: {realPermissions.isBarber ? 'Yes' : 'No'}</div>
                <div>Effective Management: {effectiveHasManagementAccess ? 'Yes' : 'No'}</div>
                <div>Permissions Checked: {realPermissions.checked ? 'Yes' : 'No'}</div>
              </div>
            </div>
          )}          {/* Tab Navigation */}
          <div className="flex justify-center pb-3">
            <div className="flex bg-gray-800/50 rounded-xl p-1 space-x-1">
              {!isBarber && (
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
              )}
              
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
        {activeTab === 'appointments' && !isBarber && (
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
              {effectiveHasManagementAccess ? (
                <Link
                  href="/pannello-prenotazioni"
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold py-4 px-6 rounded-xl transition duration-300 flex items-center justify-center space-x-2 shadow-lg"
                >
                  <span>⚙️</span>
                  <span>Pannello {effectiveIsAdmin ? 'Admin' : 'Gestione'}</span>
                </Link>
              ) : (
                <Link
                  href="/prenota"
                  className="w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-black font-bold py-4 px-6 rounded-xl transition duration-300 flex items-center justify-center space-x-2 shadow-lg"
                >
                  <span>✨</span>
                  <span>Prenota Nuovo Appuntamento</span>
                </Link>
              )}
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
                <div className="space-y-4">
                  {upcomingBookings.map((booking) => (
                    <div key={booking.id} className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
                      <div className="flex flex-col space-y-3">
                        <div className="flex justify-between items-start">
                          <h3 className="text-lg font-bold text-white">{booking.service_name}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                            {getStatusText(booking.status)}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-300">
                          <div className="flex items-center space-x-2">
                            <span>👨‍💼</span>
                            <span>{booking.barber_name}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span>🕐</span>
                            <span>{booking.booking_time}</span>
                          </div>
                          <div className="flex items-center space-x-2 md:col-span-2">
                            <span>📅</span>
                            <span>{booking.booking_date ? format(parseISO(booking.booking_date), 'EEEE d MMMM yyyy', { locale: it }) : 'Data non disponibile'}</span>
                          </div>
                          {booking.notes && (
                            <div className="flex items-center space-x-2 md:col-span-2">
                              <span>📝</span>
                              <span>{booking.notes}</span>
                            </div>
                          )}                        </div>
                        {booking.status !== 'cancelled' && (
                          <div className="mt-3">
                            {canCancelBooking(booking.booking_date, booking.booking_time) ? (
                              <button
                                onClick={() => handleCancelBooking(booking.id)}
                                className="bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white px-4 py-2 rounded-lg transition duration-300 text-sm font-medium"
                              >
                                Cancella Prenotazione
                              </button>
                            ) : (
                              <div className="text-xs text-gray-500 italic">
                                ⚠️ Non è più possibile cancellare (meno di 48h dall'appuntamento)
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
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
                    </div>
                  </div>
                  
                  {/* Pannello di accesso rapido per barbieri e admin */}
                  {effectiveHasManagementAccess && (
                    <div className="mt-6 pt-6 border-t border-blue-500/20">
                      <h3 className="text-lg font-semibold text-white mb-4">Accesso Rapido</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <Link
                          href="/pannello-prenotazioni"
                          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition duration-300 flex items-center justify-center space-x-2"
                        >
                          <span>📊</span>
                          <span>Gestione Prenotazioni</span>
                        </Link>
                        {effectiveIsAdmin && (
                          <Link
                            href="/admin/users"
                            className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-lg transition duration-300 flex items-center justify-center space-x-2"
                          >
                            <span>👥</span>
                            <span>Gestione Utenti</span>
                          </Link>
                        )}
                        <Link
                          href="/calendario"
                          className="bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg transition duration-300 flex items-center justify-center space-x-2"
                        >
                          <span>📅</span>
                          <span>Calendario</span>
                        </Link>
                      </div>
                    </div>
                  )}
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
