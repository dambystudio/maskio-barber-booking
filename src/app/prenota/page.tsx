'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import BookingForm from '../../components/BookingForm';
import { motion } from 'framer-motion';

export default function Page() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return; // Still loading
    if (!session) {
      // Redirect to signin with return URL
      router.push('/auth/signin?callbackUrl=' + encodeURIComponent('/prenota'));
      return;
    }
  }, [session, status, router]);  // Show loading while checking auth
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-500 mx-auto"></div>
          <p className="mt-4 text-xl">Caricamento...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if not authenticated (will redirect)
  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl mb-4">
            Prenota il tuo appuntamento
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Scegli il servizio perfetto per te e prenota con il nostro team di professionisti
          </p>
        </motion.div>
          <BookingForm userSession={session} />
      </div>
    </div>
  );
}
