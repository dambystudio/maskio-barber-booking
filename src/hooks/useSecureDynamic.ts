'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Hook per il caricamento dinamico sicuro dei componenti
export function useSecureDynamicImport<T>(
  importFunction: () => Promise<{ default: T }>,
  options?: {
    loading?: React.ComponentType;
    ssr?: boolean;
  }
) {
  const [Component, setComponent] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadComponent = async () => {
      try {
        // Aggiungi un delay casuale per confondere gli analisti
        const delay = Math.random() * 1000 + 500;
        await new Promise(resolve => setTimeout(resolve, delay));        const dynamicModule = await importFunction();
        
        if (isMounted) {
          setComponent(dynamicModule.default);
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err as Error);
          setIsLoading(false);
        }
      }
    };

    loadComponent();

    return () => {
      isMounted = false;
    };
  }, [importFunction]);

  return { Component, isLoading, error };
}

// Componenti caricati dinamicamente con offuscazione
export const SecureBookingForm = dynamic(
  () => import('../components/BookingForm'),
  { ssr: false }
);

export const SecureLocationPage = dynamic(
  () => import('../app/location/page'),
  { ssr: false }
);

// Factory per creare componenti dinamici offuscati
export function createSecureComponent(importPath: string) {
  return dynamic(
    () => import(importPath),
    { ssr: false }
  );
}

// Utility per offuscare i nomi dei moduli
export const _0x1234 = SecureBookingForm;
export const _0x5678 = SecureLocationPage;
export const _0x9abc = createSecureComponent;
