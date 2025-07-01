import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contatti',
  description: 'Contatta Maskio Barber Concept a San Giovanni Rotondo. Telefono: +39 331 710 0730. Via Sant\'Agata, 24. Prenota il tuo appuntamento.',
  keywords: ['contatti barbiere', 'maskio barber contatti', 'telefono barbiere san giovanni rotondo', 'orari barbiere'],
  openGraph: {
    title: 'Contatti | Maskio Barber Concept',
    description: 'Contatta Maskio Barber Concept. Tel: +39 331 710 0730. Via Sant\'Agata, 24, San Giovanni Rotondo.',
    type: 'website',
    locale: 'it_IT',
    url: 'https://www.maskiobarberconcept.it/contatti',
  },
  alternates: {
    canonical: 'https://www.maskiobarberconcept.it/contatti',
  }
};

export default function ContattiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 