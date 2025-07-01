import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Accedi',
  description: 'Accedi al tuo account Maskio Barber Concept per gestire le tue prenotazioni.',
  openGraph: {
    title: 'Accedi | Maskio Barber Concept',
    description: 'Accedi al tuo account per gestire le tue prenotazioni.',
    type: 'website',
    locale: 'it_IT',
    url: 'https://www.maskiobarberconcept.it/auth/signin',
  },
  alternates: {
    canonical: 'https://www.maskiobarberconcept.it/auth/signin',
  },
  robots: {
    index: false, // Non indicizzare le pagine di autenticazione
    follow: false,
    noarchive: true,
    nosnippet: true,
  }
};

export default function SigninLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 