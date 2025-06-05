import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '../components/Navbar';
import SecurityProvider from '../components/SecurityProvider';
import DailyUpdateManager from '../components/DailyUpdateManager';

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
  
  other: {
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff'
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">      <head>
        {/* Viewport meta tag for responsive design */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        {/* Additional security meta tags */}
        <meta httpEquiv="X-Frame-Options" content="DENY" />
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
        <meta httpEquiv="Strict-Transport-Security" content="max-age=63072000; includeSubDomains; preload" />
        <meta httpEquiv="Referrer-Policy" content="strict-origin-when-cross-origin" />
        <meta httpEquiv="Permissions-Policy" content="camera=(), microphone=(), geolocation=(), payment=()" />
          {/* Prevent caching of sensitive pages */}
        <meta httpEquiv="Cache-Control" content="no-store, no-cache, must-revalidate, proxy-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
        
        {/* Schema.org structured data per il business locale */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",              "@type": "HairSalon",
              "name": "Maskio Barber Concept",
              "image": "https://maskio-barber-booking.vercel.app/logo.png",
              "url": "https://maskio-barber-booking.vercel.app",
              "telephone": "+39 02 1234567",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Via Sant'Agata 24",
                "addressLocality": "San Giovanni Rotondo",
                "postalCode": "71013",
                "addressCountry": "IT"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": "41.7089",
                "longitude": "15.7181"
              },
              "openingHoursSpecification": [
                {
                  "@type": "OpeningHoursSpecification",
                  "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Friday"],
                  "opens": "09:00",
                  "closes": "13:00"
                },
                {
                  "@type": "OpeningHoursSpecification",
                  "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Friday"],
                  "opens": "15:00",
                  "closes": "18:00"
                }
              ],
              "priceRange": "$$"
            })
          }}
        />
      </head>      <body className={inter.className}>
        <SecurityProvider>
          <DailyUpdateManager />          <Navbar />
          <main className="min-h-screen pt-[58px]">
            {children}
          </main>
        </SecurityProvider>
        {/* Script per nascondere i blocchi di codice se non è attiva l'ispezione */}
        <script src="/js/dev-tools-detector.js" defer></script>
      </body>
    </html>
  );
}
