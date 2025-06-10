import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SecurityProvider from '../components/SecurityProvider';
import DailyUpdateManager from '../components/DailyUpdateManager';
import SessionProvider from '../components/SessionProvider';
// Importazione URL per metadataBase
import { URL } from 'url';
import JsonLdScript from '../components/JsonLdScript';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Maskio Barber Concept',
  description: 'Una nuova concezione del barbiere - Barbiere di qualità a San Giovanni Rotondo',
  robots: 'index, follow', // Allow indexing by search engines
  keywords: 'barbiere, barbiere San Giovanni Rotondo, taglio capelli, barba, Maskio, trattamenti capelli',
  
  // Open Graph meta tags per migliorare la condivisione sui social media
  openGraph: {
    title: 'Maskio Barber Concept | Barbiere di Qualità a San Giovanni Rotondo',
    description: 'Una nuova concezione del barbiere: tagli moderni, trattamenti professionali, esperienza premium a San Giovanni Rotondo.',
    url: 'https://maskio-barber-booking.vercel.app',
    siteName: 'Maskio Barber',
    images: [
      {
        url: '/og-image.jpg', // Sostituisci con il percorso della tua immagine
        width: 1200,
        height: 630,
        alt: 'Maskio Barber Concept - San Giovanni Rotondo',
      }
    ],
    locale: 'it_IT',
    type: 'website',
  },
  
  // Twitter Card meta tags per ottimizzare la condivisione su Twitter
  twitter: {
    card: 'summary_large_image',
    title: 'Maskio Barber Concept | San Giovanni Rotondo',
    description: 'Una nuova concezione del barbiere a San Giovanni Rotondo. Prenota ora!',
    images: ['/twitter-image.jpg'], // Sostituisci con il percorso della tua immagine
    creator: '@maskiobarber', // Sostituisci con il vostro handle Twitter
  },
  // Canonical URL per prevenire contenuti duplicati
  alternates: {
    canonical: 'https://maskio-barber-booking.vercel.app',
  },
  
  // Security and caching headers
  other: {
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  },
    // Base URL per i metadati
  metadataBase: new URL('https://maskio-barber-booking.vercel.app')
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {  return (
    <html lang="it">      
    <head>
        <link rel="preload" as="image" href="/sediaOro.jpg" />
        <link rel="preload" as="image" href="/LogoSimboloNome_BiancoOrizzontale_BUONO.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
      </head>      
      <body className={inter.className}>
        <SessionProvider>
          <SecurityProvider>
            <DailyUpdateManager />
            <Navbar />
            <main className="min-h-screen pt-[70px]"> {/* Aumentato da 58px a 70px per adattarsi alla navbar più grande */}
              {children}
            </main>
            <Footer />
          </SecurityProvider>
        </SessionProvider>
        {/* Script per nascondere i blocchi di codice se non è attiva l'ispezione */}
        <script src="/js/dev-tools-detector.js" defer></script>
        {/* Schema.org JSON-LD script */}
        <JsonLdScript />
      </body></html>
  );
}
