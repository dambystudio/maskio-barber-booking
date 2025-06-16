'use client';

import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function PannelloLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { data: session } = useSession();

  // Il controllo di accesso è gestito dalla pagina stessa, non dal layout
  return (
    <div className="min-h-screen bg-black">
      {/* Header del pannello (solo se l'utente è autorizzato) - Ottimizzato per mobile */}
      {session?.user?.role === 'barber' || session?.user?.role === 'admin' ? (
        <div className="bg-gray-900 border-b border-gray-800 shadow-lg sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-3 md:py-4">
              <div className="flex items-center min-w-0 flex-1">
                <h1 className="text-lg md:text-xl font-bold text-white truncate mr-3">
                  📋 <span className="hidden sm:inline">Pannello</span> Prenotazioni
                </h1>
                <span className="px-2 py-1 bg-amber-600 text-white text-xs rounded-full whitespace-nowrap">
                  {session?.user?.role === 'admin' ? '👑 Admin' : '✂️ Barbiere'}
                </span>
              </div>
              <div className="flex gap-2 md:gap-3 ml-2">
                {session?.user?.role === 'admin' && (
                  <button
                    onClick={() => router.push('/admin/users')}
                    className="px-3 py-2 md:px-4 md:py-2 text-xs md:text-sm text-gray-300 hover:text-white transition-colors border border-gray-600 rounded-lg hover:bg-gray-700 whitespace-nowrap"
                  >
                    👥 <span className="hidden sm:inline">Gestione </span>Utenti
                  </button>
                )}
                <button
                  onClick={() => router.push('/')}
                  className="px-3 py-2 md:px-4 md:py-2 text-xs md:text-sm text-gray-300 hover:text-white transition-colors border border-gray-600 rounded-lg hover:bg-gray-700 whitespace-nowrap"
                >
                  🏠 <span className="hidden sm:inline">Sito</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Contenuto - Ottimizzato padding per mobile */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6">
        {children}
      </div>
    </div>
  );
}
