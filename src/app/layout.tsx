import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import '../styles/pwa.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SecurityProvider from '../components/SecurityProvider';
import DailyUpdateManager from '../components/DailyUpdateManager';
import SessionProvider from '../components/SessionProvider';
import { GoogleAnalytics } from '../components/GoogleAnalytics';

import MobileBottomNav from '../components/MobileBottomNav';
import PWAFloatingMenu from '../components/PWAFloatingMenu';
import AddToHomeBanner from '../components/AddToHomeBanner';
import DynamicManifest from '../components/DynamicManifest';
// Importazione URL per metadataBase
import { URL } from 'url';
import JsonLdScript from '../components/JsonLdScript';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://www.maskiobarberconcept.it'),
  title: {
    default: 'Maskio Barber Concept | Barbiere a San Giovanni Rotondo',
    template: '%s | Maskio Barber Concept'
  },
  description: 'Barbiere professionale a San Giovanni Rotondo. Tagli moderni, trattamenti barba, prenotazione online. Esperienza premium dal 2024.',
  applicationName: 'Maskio Barber Concept',
  authors: [{ name: 'Maskio Barber Concept' }],
  generator: 'Next.js',
  keywords: [
    'barbiere',
    'barbiere San Giovanni Rotondo', 
    'taglio capelli uomo',
    'trattamenti barba',
    'Maskio',
    'barber shop',
    'prenotazione online',
    'taglio moderno',
    'fade',
    'rasatura tradizionale',
    'San Giovanni Rotondo parrucchiere',
    'barbiere professionale'
  ],
  referrer: 'origin-when-cross-origin',
  creator: 'Maskio Barber Concept',
  publisher: 'Maskio Barber Concept',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/api/manifest',
  
  // Open Graph avanzato
  openGraph: {
    type: 'website',
    locale: 'it_IT',
    url: 'https://www.maskiobarberconcept.it',
    siteName: 'Maskio Barber Concept',
    title: 'Maskio Barber Concept | Barbiere Professionale a San Giovanni Rotondo',
    description: 'Scopri una nuova concezione del barbiere: tagli moderni, trattamenti barba professionali, atmosfera accogliente. Prenota online il tuo appuntamento.',
    images: [
      {
        url: '/og-image-1200x630.jpg',
        width: 1200,
        height: 630,
        alt: 'Maskio Barber Concept - Interno del negozio a San Giovanni Rotondo',
        type: 'image/jpeg',
      },
      {
        url: '/og-image-square.jpg',
        width: 400,
        height: 400,
        alt: 'Logo Maskio Barber Concept',
        type: 'image/jpeg',
      }
    ],
  },
    // Twitter Cards ottimizzato
  twitter: {
    card: 'summary_large_image',
    site: '@maskiobarber',
    creator: '@maskiobarber',
    title: 'Maskio Barber Concept | San Giovanni Rotondo',
    description: 'Barbiere professionale a San Giovanni Rotondo. Prenota online il tuo taglio di capelli e trattamenti barba.',
    images: ['/twitter-image.jpg'],
  },
  
  // Canonical URL per prevenire contenuti duplicati
  alternates: {
    canonical: 'https://www.maskiobarberconcept.it',
  },
  
  // Security headers (rimossi i cache headers troppo restrittivi)
  other: {
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()'
  },
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
        </head>        <body className={inter.className}>
          <GoogleAnalytics />
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
