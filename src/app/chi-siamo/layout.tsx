import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Chi Siamo',
  description: 'Scopri la storia di Maskio Barber Concept. Barbiere professionale a San Giovanni Rotondo, tradizione e modernità nel grooming maschile.',
  keywords: ['chi siamo maskio barber', 'barbiere san giovanni rotondo', 'storia maskio barber', 'barbiere professionale'],
  openGraph: {
    title: 'Chi Siamo | Maskio Barber Concept',
    description: 'La nostra storia, i nostri valori. Esperienza e passione nel grooming maschile a San Giovanni Rotondo.',
    type: 'website',
    locale: 'it_IT',
    url: 'https://www.maskiobarberconcept.it/chi-siamo',
  },
  alternates: {
    canonical: 'https://www.maskiobarberconcept.it/chi-siamo',
  }
};

export default function ChiSiamoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 