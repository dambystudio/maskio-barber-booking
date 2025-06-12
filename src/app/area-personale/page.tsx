'use client';

import { useSession } from 'next-auth/react';
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

export default function AreaPersonale() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [bookings, setBookings] = useState<UserBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
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
      return;    }
    
    fetchUserBookings();
    fetchUserProfile();
  }, [session, status, router, fetchUserBookings, fetchUserProfile]);

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Sei sicuro di voler cancellare questa prenotazione?')) return;

    try {
      const response = await fetch('/api/bookings/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bookingId }),
      });

      if (!response.ok) throw new Error('Errore nella cancellazione');

      await fetchUserBookings(); // Refresh bookings
    } catch (err) {
      alert('Errore nella cancellazione della prenotazione');
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

  return (
    <div className="min-h-screen bg-black py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-white mb-4">
            Ciao, {session.user.name}!
          </h1>
          <p className="text-gray-300 text-lg">
            Benvenuto nella tua area personale
          </p>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 text-center">
            <h3 className="text-3xl font-bold text-amber-500 mb-2">{upcomingBookings.length}</h3>
            <p className="text-gray-300">Prossimi Appuntamenti</p>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 text-center">
            <h3 className="text-3xl font-bold text-blue-500 mb-2">{pastBookings.length}</h3>
            <p className="text-gray-300">Storico Appuntamenti</p>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 text-center">
            <h3 className="text-3xl font-bold text-green-500 mb-2">{bookings.filter(b => b.status === 'confirmed').length}</h3>
            <p className="text-gray-300">Appuntamenti Confermati</p>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap gap-4 justify-center mb-12"
        >
          <Link
            href="/prenota"
            className="bg-amber-600 hover:bg-amber-700 text-black font-bold py-3 px-6 rounded-lg transition duration-300"
          >
            📅 Nuova Prenotazione
          </Link>
          <Link
            href="/area-personale/profilo"
            className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition duration-300"
          >
            👤 Modifica Profilo
          </Link>
        </motion.div>

        {/* User Profile Info */}
        {userProfile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-bold text-white mb-6">📋 Le tue informazioni</h2>
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-gray-700/30 p-4 rounded-lg">
                  <h3 className="text-gray-400 text-sm font-medium mb-2">Nome Completo</h3>
                  <p className="text-white font-semibold">{userProfile.name}</p>
                </div>
                <div className="bg-gray-700/30 p-4 rounded-lg">
                  <h3 className="text-gray-400 text-sm font-medium mb-2">Email</h3>
                  <p className="text-white font-semibold">{userProfile.email}</p>
                </div>
                <div className="bg-gray-700/30 p-4 rounded-lg">
                  <h3 className="text-gray-400 text-sm font-medium mb-2">Telefono</h3>
                  <p className="text-white font-semibold">{userProfile.phone || 'Non specificato'}</p>
                </div>
                <div className="bg-gray-700/30 p-4 rounded-lg">
                  <h3 className="text-gray-400 text-sm font-medium mb-2">Cliente dal</h3>
                  <p className="text-white font-semibold">
                    {userProfile.createdAt ? format(parseISO(userProfile.createdAt), 'dd MMMM yyyy', { locale: it }) : 'N/A'}
                  </p>
                </div>
                <div className="bg-gray-700/30 p-4 rounded-lg">
                  <h3 className="text-gray-400 text-sm font-medium mb-2">Ultimo accesso</h3>
                  <p className="text-white font-semibold">
                    {userProfile.lastLogin ? format(parseISO(userProfile.lastLogin), 'dd/MM/yyyy HH:mm', { locale: it }) : 'Primo accesso'}
                  </p>
                </div>
                <div className="bg-gray-700/30 p-4 rounded-lg">
                  <h3 className="text-gray-400 text-sm font-medium mb-2">Stato Account</h3>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-900/20 text-green-400 border border-green-500/30">
                    ✓ Attivo
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Profile Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800 border border-gray-700 rounded-xl p-6 mb-12"
        >
          <h2 className="text-2xl font-bold text-white mb-4">Informazioni Profilo</h2>
          {userProfile ? (            <div className="text-gray-300 space-y-2">
              <p><span className="font-semibold">Nome:</span> {userProfile.name}</p>
              <p><span className="font-semibold">Email:</span> {userProfile.email}</p>
              <p><span className="font-semibold">Telefono:</span> {userProfile.phone || 'Non fornito'}</p>
              <p><span className="font-semibold">Data di registrazione:</span> {userProfile.createdAt ? format(parseISO(userProfile.createdAt), 'dd MMMM yyyy', { locale: it }) : 'N/A'}</p>
            </div>
          ) : (
            <p className="text-gray-400">Caricamento informazioni profilo...</p>
          )}
        </motion.div>

        {/* Upcoming Bookings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-white mb-6">Prossimi Appuntamenti</h2>
          {upcomingBookings.length === 0 ? (
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-8 text-center">
              <p className="text-gray-300 text-lg">Non hai appuntamenti programmati</p>
              <Link
                href="/prenota"
                className="inline-block mt-4 bg-amber-600 hover:bg-amber-700 text-black font-bold py-2 px-4 rounded transition duration-300"
              >
                Prenota ora
              </Link>
            </div>
          ) : (
            <div className="grid gap-4">
              {upcomingBookings.map((booking) => (
                <div key={booking.id} className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="flex-1 mb-4 md:mb-0">
                      <h3 className="text-xl font-bold text-white mb-2">{booking.service_name}</h3>                      <div className="text-gray-300 space-y-1">
                        <p>👨‍💼 Barbiere: {booking.barber_name}</p>
                        <p>📅 Data: {booking.booking_date ? format(parseISO(booking.booking_date), 'EEEE d MMMM yyyy', { locale: it }) : 'Data non disponibile'}</p>
                        <p>🕐 Ora: {booking.booking_time}</p>
                        {booking.notes && <p>📝 Note: {booking.notes}</p>}
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                        {getStatusText(booking.status)}
                      </span>
                      {booking.status !== 'cancelled' && (
                        <button
                          onClick={() => handleCancelBooking(booking.id)}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition duration-300"
                        >
                          Cancella
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Past Bookings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-2xl font-bold text-white mb-6">Storico Appuntamenti</h2>
          {pastBookings.length === 0 ? (
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-8 text-center">
              <p className="text-gray-300 text-lg">Nessun appuntamento passato</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {pastBookings.slice(0, 5).map((booking) => (
                <div key={booking.id} className="bg-gray-900 border border-gray-700 rounded-xl p-6 opacity-75">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white mb-2">{booking.service_name}</h3>                      <div className="text-gray-400 space-y-1">
                        <p>👨‍💼 Barbiere: {booking.barber_name}</p>
                        <p>📅 Data: {booking.booking_date ? format(parseISO(booking.booking_date), 'EEEE d MMMM yyyy', { locale: it }) : 'Data non disponibile'}</p>
                        <p>🕐 Ora: {booking.booking_time}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                      {getStatusText(booking.status)}
                    </span>
                  </div>
                </div>
              ))}
              {pastBookings.length > 5 && (
                <Link
                  href="/area-personale/storico"
                  className="block text-center bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-xl transition duration-300"
                >
                  Vedi tutto lo storico ({pastBookings.length - 5} altri)
                </Link>
              )}
            </div>
          )}        </motion.div>
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
