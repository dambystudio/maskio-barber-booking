import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import '../styles/pwa.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SecurityProvider from '../components/SecurityProvider';
import DailyUpdateManager from '../components/DailyUpdateManager';
import SessionProvider from '../components/SessionProvider';

import MobileBottomNav from '../components/MobileBottomNav';
import PWAFloatingMenu from '../components/PWAFloatingMenu';
import AddToHomeBanner from '../components/AddToHomeBanner';
import DynamicManifest from '../components/DynamicManifest';
// Importazione URL per metadataBase
import { URL } from 'url';
import JsonLdScript from '../components/JsonLdScript';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Maskio Barber Concept',
  description: 'Una nuova concezione del barbiere - Barbiere di qualità a San Giovanni Rotondo',
  robots: 'index, follow', // Allow indexing by search engines
  keywords: 'barbiere, barbiere San Giovanni Rotondo, taglio capelli, barba, Maskio, trattamenti capelli',
  manifest: '/api/manifest',
  
  // Open Graph meta tags per migliorare la condivisione sui social media
  openGraph: {
    title: 'Maskio Barber Concept | Barbiere di Qualità a San Giovanni Rotondo',
    description: 'Una nuova concezione del barbiere: tagli moderni, trattamenti professionali, esperienza premium a San Giovanni Rotondo.',
    url: 'https://maskiobarberconcept.it',
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
    canonical: 'https://maskiobarberconcept.it',
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
  metadataBase: new URL('https://maskiobarberconcept.it')
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {  return (      <html lang="it">
        <head>
          <link rel="preload" as="video" href="/videoLoopCompresso.mp4" type="video/mp4" />
          <link rel="preload" as="image" href="/sediaOro.webp" />        
          <link rel="preload" as="image" href="/LogoSimboloNome_BiancoOrizzontale_BUONO.png" />
          
          {/* PWA Meta Tags */}
          <meta name="application-name" content="Maskio Barber" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="black" />
          <meta name="apple-mobile-web-app-title" content="Maskio Barber" />
          <meta name="format-detection" content="telephone=no" />
          <meta name="mobile-web-app-capable" content="yes" />
          <meta name="msapplication-config" content="/browserconfig.xml" />
          <meta name="msapplication-TileColor" content="#000000" />
          <meta name="msapplication-tap-highlight" content="no" />
          <meta name="theme-color" content="#000000" />
            {/* Apple Touch Icons */}
          <link rel="apple-touch-icon" href="/icone/predefinita/180x180.png" />
          <link rel="apple-touch-icon" sizes="152x152" href="/icone/predefinita/180x180.png" />
          <link rel="apple-touch-icon" sizes="180x180" href="/icone/predefinita/180x180.png" />
          <link rel="apple-touch-icon" sizes="167x167" href="/icone/predefinita/180x180.png" />
          
          {/* Favicon */}
          <link rel="icon" type="image/png" sizes="32x32" href="/icone/predefinita/32x32.png" />
          <link rel="icon" type="image/png" sizes="16x16" href="/icone/predefinita/16x16.png" />
          <link rel="shortcut icon" href="/icone/predefinita/32x32.png" />
        </head>
        <body className={inter.className}>
          <SessionProvider>
            <SecurityProvider>
              <DynamicManifest />
              <DailyUpdateManager />
              <Navbar />
              <main className="min-h-screen pt-[70px] standalone:pt-0">
                {children}
              </main>
              <Footer />
              <MobileBottomNav />
              <PWAFloatingMenu />
            </SecurityProvider>
          </SessionProvider>
          <AddToHomeBanner />
          {/* Script per nascondere i blocchi di codice se non è attiva l'ispezione */}
          <script src="/js/dev-tools-detector.js" defer></script>
          {/* Schema.org JSON-LD script */}
          <JsonLdScript />
        </body>
      </html>
  );
}
