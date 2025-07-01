import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Prenota',
  description: 'Prenota il tuo appuntamento online da Maskio Barber Concept. Sistema di prenotazione facile e veloce per il tuo taglio e cura della barba.',
  keywords: ['prenota barbiere', 'prenotazione online', 'maskio barber prenota', 'appuntamento barbiere'],
  openGraph: {
    title: 'Prenota | Maskio Barber Concept',
    description: 'Prenota online il tuo appuntamento. Sistema di prenotazione semplice e veloce.',
    type: 'website',
    locale: 'it_IT',
    url: 'https://www.maskiobarberconcept.it/prenota',
  },
  alternates: {
    canonical: 'https://www.maskiobarberconcept.it/prenota',
  },
  robots: {
    index: false, // Non indicizzare la pagina di prenotazione che richiede login
    follow: true,
  }
};

export default function PrenotaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 