'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BookingButton from './BookingButton';
import { 
  Bars3Icon, 
  XMarkIcon,
  HomeIcon,
  UserGroupIcon,
  ScissorsIcon,
  ShoppingBagIcon,  NewspaperIcon,
  MapPinIcon,
  StarIcon
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Home', href: '/', icon: HomeIcon },
  { name: 'Chi Siamo', href: '/chi-siamo', icon: UserGroupIcon },
  { name: 'Servizi', href: '/servizi', icon: ScissorsIcon },
  { name: 'Prodotti', href: '/prodotti', icon: ShoppingBagIcon },
  { name: 'Blog', href: '/blog', icon: NewspaperIcon },
  { name: 'Location', href: '/location', icon: MapPinIcon },
  { name: 'Cosa dicono di noi', href: '/testimonianze', icon: StarIcon },
];

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Chiudi il menu mobile quando si passa al desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) { // lg breakpoint
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);  return (
    <>
      <header className="fixed inset-x-0 top-0 z-[80] bg-black/80 backdrop-blur-md shadow-lg border-b border-gray-900/30">
      {/* Desktop Navbar */}
      <div className="mx-auto">        <div className="flex items-center justify-between p-4">          {/* Logo e testo mobile */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/LogoSimboloNome_Bianco(1).png"
                alt="Maskio Barber Concept"
                width={180}
                height={45}
                className="h-10 w-auto"
                priority              />
            </Link>
            
            {/* Testo visibile solo da mobile */}
            <div className="lg:hidden text-center">
              <span className="text-white text-lg font-semibold">
                Maskio Barber Concept
              </span>
            </div>
          </div>{/* Desktop Navigation */}
          <div className="hidden lg:flex lg:items-center lg:gap-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm font-medium text-white hover:text-amber-400 transition-colors duration-200"
              >
                {item.name}
              </Link>
            ))}
              {/* Lavora con noi Link */}
            <Link
              href="/lavora-con-noi"
              className="text-sm font-medium text-amber-400 hover:text-amber-300 transition-colors duration-200"
              title="Opportunità di lavoro"
            >
              Lavora con noi
            </Link>
            
            <BookingButton size="sm" className="ml-4">
              Prenota
            </BookingButton>
          </div>          {/* Mobile menu button */}
          <motion.button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden text-white"
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
          >
            {mobileMenuOpen ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3Icon className="h-6 w-6" />
            )}          </motion.button>
        </div>
      </div>
      </header>

      {/* Mobile menu - OUTSIDE header */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>            {/* Overlay - semi-transparent, shows content but darkened */}
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] lg:hidden" />
            
            {/* Click handler overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-[65] lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Menu panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ 
                type: "spring",
                damping: 30,
                stiffness: 300
              }}
              className="fixed inset-y-0 right-0 w-72 bg-black shadow-xl z-[70] border-l border-gray-800"
            >
              <div className="flex flex-col h-screen">{/* Header */}
                <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="px-6 pt-6 pb-4 border-b border-gray-900"
                >
                  <div className="flex items-center justify-between">                    <Link
                      href="/"
                      className="flex items-center gap-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Image
                        src="/LogoSimboloNome_Bianco(1).png"
                        alt="Maskio Barber Concept"
                        width={140}
                        height={35}
                        className="h-8 w-auto"
                      />
                    </Link>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-gray-500 hover:text-white transition-colors"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </motion.button>
                  </div>
                </motion.div>                {/* Navigation items */}
                <div className="flex-1 px-6 py-6">
                  <nav className="space-y-1">
                    {navigation.map((item) => {
                      const Icon = item.icon;
                      return (
                        <div key={item.name}>
                          <Link
                            href={item.href}
                            className="flex items-center gap-3 px-4 py-3 text-base font-medium text-white rounded-lg hover:bg-gray-900/50 transition-colors duration-200"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <Icon className="h-5 w-5" aria-hidden="true" />
                            {item.name}
                          </Link>
                        </div>
                      );
                    })}
                    
                    {/* Lavora con noi Link Mobile */}
                    <div>
                      <Link
                        href="/lavora-con-noi"
                        className="flex items-center gap-3 px-4 py-3 text-base font-medium text-amber-400 rounded-lg hover:bg-gray-900/50 transition-colors duration-200"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6z" />
                        </svg>
                        Lavora con noi
                      </Link>
                    </div>
                </nav>
                </div>
                
                {/* Mobile Booking Button - Fixed at bottom */}
                <div className="px-6 pb-6 border-t border-gray-900">
                  <div className="pt-4" onClick={() => setMobileMenuOpen(false)}>
                    <BookingButton className="w-full">
                      Prenota Ora
                    </BookingButton>
                  </div>
                </div>{/* Footer */}
              </div>
            </motion.div>
          </>        )}
      </AnimatePresence>
    </>
  );
}
