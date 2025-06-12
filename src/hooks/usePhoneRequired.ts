'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';

export function usePhoneRequired() {
  const { data: session, update } = useSession();
  const [showPhoneModal, setShowPhoneModal] = useState(false);

  useEffect(() => {
    // Verifica se l'utente ha bisogno del telefono
    if (session?.user && (session.user as any).needsPhone) {
      setShowPhoneModal(true);
    }
  }, [session]);

  const handlePhoneComplete = async () => {
    setShowPhoneModal(false);
    // Aggiorna la sessione per rimuovere il flag needsPhone
    await update();
  };

  return {
    showPhoneModal,
    handlePhoneComplete,
    userEmail: session?.user?.email || '',
    userName: session?.user?.name || 'Utente',
  };
}
