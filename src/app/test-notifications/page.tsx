// Pagina per testare le notifiche push
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import PushNotificationManager from '@/components/PushNotificationManager';

export default async function TestNotificationsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/signin');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            🔔 Test Notifiche Push PWA
          </h1>
          <p className="text-gray-300 text-lg">
            Sistema di notifiche per prenotazioni barbiere
          </p>
        </div>

        <div className="grid gap-6">
          {/* Componente gestione notifiche */}
          <PushNotificationManager />

          {/* Informazioni utente */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">
              👤 Account Corrente
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-300">Email:</span>
                <span className="text-white font-semibold">{session.user?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Nome:</span>
                <span className="text-white font-semibold">{session.user?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">ID:</span>
                <span className="text-white font-mono text-sm">{session.user?.id}</span>
              </div>
            </div>
          </div>

          {/* Istruzioni */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">
              📋 Istruzioni per il Test
            </h3>
            <div className="space-y-3 text-gray-300">
              <div className="flex items-start gap-3">
                <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</span>
                <div>
                  <p><strong>Attiva le notifiche</strong> cliccando il pulsante sopra</p>
                  <p className="text-sm text-gray-400">Il browser chiederà il permesso per le notifiche</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</span>
                <div>
                  <p><strong>Clicca "Test Notifica"</strong> per inviare una notifica di prova</p>
                  <p className="text-sm text-gray-400">Riceverai una notifica push sul dispositivo</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</span>
                <div>
                  <p><strong>Verifica funzionamento</strong> anche con l&apos;app chiusa</p>
                  <p className="text-sm text-gray-400">Le notifiche arrivano anche quando non stai usando l&apos;app</p>
                </div>
              </div>
            </div>
          </div>

          {/* Link di ritorno */}
          <div className="text-center">
            <a 
              href="/pannello-prenotazioni"
              className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              ← Torna al Pannello Prenotazioni
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
