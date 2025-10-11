import { Metadata } from 'next';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import WaitlistDashboard from '@/components/WaitlistDashboard';

export const metadata: Metadata = {
  title: 'La Mia Lista d\'Attesa | Maskio Barber Concept',
  description: 'Gestisci le tue iscrizioni alla lista d\'attesa',
};

export default async function WaitlistPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/auth/signin?callbackUrl=/dashboard/waitlist');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            🔔 Lista d'Attesa
          </h1>
          <p className="text-gray-400">
            Gestisci le tue iscrizioni alla lista d'attesa. Ti invieremo una notifica push quando si libera un posto.
          </p>
        </div>

        <WaitlistDashboard />
      </div>
    </div>
  );
}
