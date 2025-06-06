'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PannelloLayout({
  children,
}: {
  children: React.ReactNode;
}) {  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  // Credenziali per il pannello prenotazioni
  const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'barber2025'
  };

  useEffect(() => {
    // Imposta che siamo lato client
    setIsClient(true);
    
    // Controlla se è già autenticato solo lato client
    if (typeof window !== 'undefined') {
      const authStatus = sessionStorage.getItem('pannello_auth');
      if (authStatus === 'authenticated') {
        setIsAuthenticated(true);
      }
    }
    setLoading(false);
  }, []);
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      setIsAuthenticated(true);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('pannello_auth', 'authenticated');
      }
    } else {
      setError('Credenziali non valide');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('pannello_auth');
    }
    setUsername('');
    setPassword('');
  };
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black to-gray-900 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">
                Pannello Prenotazioni
              </h1>
              <p className="text-gray-300">
                Accesso riservato al personale autorizzato
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-600 text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="Inserisci username"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-600 text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="Inserisci password"
                  required
                />
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-900/50 border border-red-500">
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-amber-600 text-white py-3 px-4 rounded-lg hover:bg-amber-700 transition-colors font-medium"
              >
                Accedi al Pannello
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-700">
              <div className="flex items-center justify-center">
                <button
                  onClick={() => router.push('/')}
                  className="text-amber-400 hover:text-amber-300 text-sm font-medium"
                >
                  ← Torna al sito principale
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header del pannello */}
      <div className="bg-gray-900 border-b border-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-white">Pannello Prenotazioni</h1>
              <span className="ml-3 px-2 py-1 bg-amber-600 text-white text-xs rounded-full">
                Accesso Riservato
              </span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => router.push('/')}
                className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
              >
                Sito Principale
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Esci
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenuto */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </div>
    </div>
  );
}
