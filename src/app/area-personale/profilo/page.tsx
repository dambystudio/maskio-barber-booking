'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import UserWaitlist from '@/components/UserWaitlist';
import PushNotificationManager from '@/components/PushNotificationManager';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  image?: string;
}

export default function ProfiloUtente() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fetchProfileData = useCallback(async () => {
    if (!session) return; // Guard clause for session
    
    try {
      setLoading(true);
      console.log('🔄 Fetching profile data for:', session.user.email);
      
      const response = await fetch('/api/user/profile');
      console.log('📡 Profile API response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Profile data from API:', data); // Debug log
        setProfile({
          id: data.profile.id,
          name: data.profile.name,
          email: data.profile.email,
          phone: data.profile.phone || '',
          image: data.profile.image || ''
        });
        console.log('📞 Phone value set:', data.profile.phone || 'empty');
      } else {
        console.error('❌ Error fetching profile:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('📄 Error response:', errorText);
        
        // Fallback to session data
        setProfile({
          id: session!.user.id,
          name: session!.user.name,
          email: session!.user.email,
          phone: '', // We'll need to fetch this from the database
          image: session!.user.image || ''
        });
      }
    } catch (error) {
      console.error('❌ Error fetching profile:', error);
      // Fallback to session data
      setProfile({
        id: session!.user.id,
        name: session!.user.name,
        email: session!.user.email,
        phone: '',
        image: session!.user.image || ''
      });
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/auth/signin?callbackUrl=' + encodeURIComponent('/area-personale/profilo'));
      return;
    }
    // Fetch complete profile data from database
    fetchProfileData();
  }, [session, status, router, fetchProfileData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: profile.name,
          phone: profile.phone,
        }),
      });

      if (!response.ok) {
        throw new Error('Errore nell\'aggiornamento del profilo');
      }

      setSuccess(true);
      // Update the session with new data
      await update({
        name: profile.name,
      });
      
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError('Impossibile aggiornare il profilo');
    } finally {
      setSaving(false);
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

  if (!session || !profile) return null;

  return (
    <div className="min-h-screen bg-black py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-white mb-4">Il Mio Profilo</h1>
          <p className="text-gray-300">Gestisci le tue informazioni personali</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800 border border-gray-700 rounded-xl p-8"
        >
          {error && (
            <div className="mb-6 bg-red-900/20 border border-red-500 text-red-400 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 bg-green-900/20 border border-green-500 text-green-400 px-4 py-3 rounded">
              Profilo aggiornato con successo!
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar */}            <div className="flex justify-center mb-8">
              <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center text-3xl text-white">
                {profile.image ? (
                  <Image src={profile.image} alt="Avatar" width={96} height={96} className="w-24 h-24 rounded-full object-cover" />
                ) : (
                  profile.name.charAt(0).toUpperCase()
                )}
              </div>
            </div>

            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                Nome Completo *
              </label>
              <input
                type="text"
                id="name"
                required
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Il tuo nome completo"
              />
            </div>            {/* Email (readonly) */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={profile.email}
                readOnly
                className="w-full px-4 py-3 bg-gray-600 border border-gray-600 rounded-lg text-gray-300 cursor-not-allowed"
                placeholder="La tua email"
              />
              <p className="text-sm text-gray-400 mt-1">L'email non può essere modificata</p>
            </div>            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
                Numero di Telefono
              </label>
              <input
                type="tel"
                id="phone"
                value={profile.phone || ''}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Es. +39 333 1234567"
              />
              <p className="text-sm text-gray-400 mt-1">Il numero di telefono è richiesto per le prenotazioni</p>
            </div>

            {/* Account Info */}
            <div className="bg-gray-900 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-2">Informazioni Account</h3>
              <div className="space-y-2 text-gray-300">
                <p><span className="font-medium">Ruolo:</span> {session.user.role === 'admin' ? 'Amministratore' : session.user.role === 'barber' ? 'Barbiere' : 'Cliente'}</p>
                <p><span className="font-medium">ID Utente:</span> {profile.id}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-800 text-black font-bold py-3 px-6 rounded-lg transition duration-300"
              >
                {saving ? 'Salvando...' : 'Salva Modifiche'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/area-personale')}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition duration-300"
              >
                Torna all'Area Personale
              </button>
            </div>
          </form>
        </motion.div>

        {/* Gestione Notifiche Push */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 bg-gray-800 border border-gray-700 rounded-xl p-8"
        >
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
            <span className="mr-3">🔔</span>
            Notifiche Push
          </h2>
          <p className="text-gray-300 mb-6">
            Gestisci le notifiche push per rimanere aggiornato su liste d'attesa, promemoria e conferme.
          </p>
          <PushNotificationManager />
        </motion.div>

        {/* Lista d'Attesa dell'Utente */}
        {session?.user?.email && <UserWaitlist userEmail={session.user.email} />}
      </div>
    </div>
  );
}
