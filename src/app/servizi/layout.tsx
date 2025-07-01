import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Servizi',
  description: 'Scopri i servizi di barbiere professionali di Maskio Barber Concept. Taglio capelli, barba, trattamenti specializzati a San Giovanni Rotondo.',
  keywords: ['servizi barbiere', 'taglio capelli', 'barba', 'trattamenti capelli', 'maskio barber servizi', 'barbiere san giovanni rotondo'],
  openGraph: {
    title: 'Servizi | Maskio Barber Concept',
    description: 'Servizi professionali di barbiere: taglio capelli moderni, cura della barba, trattamenti personalizzati.',
    type: 'website',
    locale: 'it_IT',
    url: 'https://www.maskiobarberconcept.it/servizi',
  },
  alternates: {
    canonical: 'https://www.maskiobarberconcept.it/servizi',
  }
};

export default function ServiziLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 