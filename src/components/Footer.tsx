'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

const socialLinks = [
  {
    name: 'Instagram',
    href: 'https://www.instagram.com/maskio_barberconcept/',
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
      </svg>
    ),
  },
  {
    name: 'Facebook',
    href: 'https://www.facebook.com/p/Maskio-barber-concept-100092091309931/',
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
  },
  {
    name: 'TikTok', 
    href: 'https://www.tiktok.com/@maskio_barberconcept',
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
      </svg>
    ),
  },
];

export default function Footer() {
  return (    <footer className="bg-black text-white border-t border-gray-800 standalone-hidden">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-start">
          
          {/* Contatti - Area Sinistra (Centrata) */}
          <div className="flex flex-col items-center text-center">
            <h3 className="font-semibold text-xl mb-6 text-amber-400">Contatti</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-3">
                <svg className="w-5 h-5 text-amber-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>                <a href="tel:+393317100730" className="text-gray-300 hover:text-white transition-colors">
                  +39 331 710 0730
                </a>
              </div>
              <div className="flex items-center justify-center space-x-3">
                <svg className="w-5 h-5 text-amber-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>                <a href="mailto:fabio.cassano97@icloud.com" className="text-gray-300 hover:text-white transition-colors">
                  fabio.cassano97@icloud.com
                </a>
              </div>
              <div className="flex flex-col items-center space-y-2 mt-6">
                <div className="flex items-center space-x-2 mb-2">
                  <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-gray-300 text-sm font-medium">Orari</span>
                </div>
                <div className="text-gray-300 text-sm text-center">
                  <div>Lun-Sab: 9:00-13:00</div>
                  <div>15:00-18:00</div>
                  <div className="text-red-400 mt-2">Giovedì e Domenica: Chiuso</div>
                </div>
              </div>
            </div>
          </div>{/* Logo e Social - Area Centro (Perfettamente Centrata) */}
          <div className="flex flex-col items-center text-center">
            <Link href="/" className="flex justify-center mb-6">
              <Image
                src="/LogoSimboloNome_BiancoOrizzontale_BUONO.png"
                alt="Maskio Barber Concept"
                width={280}
                height={70}
                className="h-20 w-auto"
                loading="lazy"
                quality={75}
              />
            </Link>
            <p className="text-gray-400 text-sm mb-6 max-w-xs leading-relaxed">
              Il tuo barbiere di fiducia per un look sempre perfetto. Tradizione, stile e innovazione in un unico posto.
            </p>
              {/* Social Media */}
            <h3 className="font-semibold text-xl mb-4 text-amber-400">Seguici</h3>
            <div className="flex justify-center space-x-6">
              {socialLinks.map((item) => (
                <motion.a
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-amber-400 transition-colors duration-200 p-2 rounded-lg hover:bg-gray-800/50"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  title={item.name}
                >
                  <div className="w-8 h-8 flex items-center justify-center">
                    {item.icon}
                  </div>
                </motion.a>
              ))}
            </div>
          </div>          {/* Location - Area Destra (Centrata) */}
          <div className="flex flex-col items-center text-center">
            <h3 className="font-semibold text-xl mb-6 text-amber-400">Dove Siamo</h3>
            <div className="space-y-4">
              <div className="flex flex-col items-center space-y-3">
                <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div>
                  <p className="text-gray-300 leading-relaxed">
                    Via Sant'Agata, 24<br />
                    San Giovanni Rotondo (FG)
                  </p>
                </div>
              </div>
              <a 
                href="https://www.google.com/maps/search/?api=1&query=Via+Sant'Agata+24,+San+Giovanni+Rotondo,+FG,+Italy"
                target="_blank"
                rel="noopener noreferrer" 
                className="inline-flex items-center space-x-2 text-amber-400 hover:text-amber-300 transition-colors text-sm mt-4 px-3 py-2 rounded-lg hover:bg-gray-800/50"
              >
                <span>Visualizza sulla mappa</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        </div>
        
        {/* Divider */}
        <div className="border-t border-gray-800 mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex flex-col items-center md:items-start space-y-2">
              <p className="text-gray-400 text-sm">
                &copy; {new Date().getFullYear()} Maskio Barber Concept. Tutti i diritti riservati.
              </p>
              <p className="text-gray-500 text-xs">
                Sito realizzato da{' '}
                <a 
                  href="https://linktr.ee/dambystudio" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-amber-400 hover:text-amber-300 transition-colors font-medium"
                >
                  dambystudio
                </a>
              </p>
            </div>            <div className="flex space-x-6 text-sm">
              <Link href="/privacy-policy" className="text-gray-400 hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="/cookie-policy" className="text-gray-400 hover:text-white transition-colors">
                Cookie Policy
              </Link>
              <Link href="/termini-servizio" className="text-gray-400 hover:text-white transition-colors">
                Termini di Servizio
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
