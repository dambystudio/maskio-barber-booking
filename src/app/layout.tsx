import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '../components/Navbar';
import SecurityProvider from '../components/SecurityProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Maskio Barber Concept',
  description: 'Una nuova concezione del barbiere',
  robots: 'noindex, nofollow', // Prevent indexing in production
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
    <html lang="it">
      <head>
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
      </head>
      <body className={inter.className}>
        <SecurityProvider>
          <Navbar />
          <main className="min-h-screen pt-20">
            {children}
          </main>
        </SecurityProvider>
      </body>
    </html>
  );
}
