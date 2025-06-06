'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BookingButton from './BookingButton';
import RotatingPhrases from './RotatingPhrases';
import { 
  Bars3Icon, 
  XMarkIcon,
  HomeIcon,
  UserGroupIcon,
  ScissorsIcon,
  ShoppingBagIcon,  
  NewspaperIcon,
  MapPinIcon,
  StarIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Home', href: '/', icon: HomeIcon },
  { name: 'Chi Siamo', href: '/chi-siamo', icon: UserGroupIcon },
  { name: 'Servizi', href: '/servizi', icon: ScissorsIcon },
  { name: 'Prodotti', href: '/prodotti', icon: ShoppingBagIcon },
  { name: 'Blog', href: '/blog', icon: NewspaperIcon },
  { name: 'Location', href: '/location', icon: MapPinIcon },
  { name: 'Contatti', href: '/contatti', icon: PhoneIcon },
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
  }, []);
  
  return (
    <>
      <header className="fixed inset-x-0 top-0 z-[100] bg-black/90 backdrop-blur-md shadow-none">
        <div className="mx-auto">
          <div className="flex items-center justify-between p-2 py-4 relative">
            {/* Left side with rotating phrases (visible on desktop) */}
            <div className="hidden lg:block w-56">
              <RotatingPhrases />
            </div>
            
            {/* Empty space for mobile (to keep logo centered) */}
            <div className="w-6 lg:hidden"></div>
            
            {/* Logo al centro sia per mobile che desktop */}            <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center justify-center">
              <Link href="/" className="flex items-center">
                <Image
                  src="/LogoSimboloNome_BiancoOrizzontale_BUONO.png"
                  alt="Maskio Barber Concept"
                  width={400}
                  height={100}
                  className="h-20 w-auto"
                  priority
                  quality={85}
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                />
              </Link>
            </div>
            
            {/* Right side with booking button (desktop) and menu button */}
            <div className="flex items-center space-x-3">
              {/* Desktop booking button (visible only on desktop) */}
              <div className="hidden lg:block">
                <BookingButton className="px-4 py-2 text-sm">
                  Prenota
                </BookingButton>
              </div>
              
              {/* Menu button */}
              <motion.button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-white flex items-center justify-center z-10"
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.05 }}
              >
                {mobileMenuOpen ? (
                  <XMarkIcon className="h-7 w-7" />
                ) : (
                  <Bars3Icon className="h-7 w-7" />
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Navigation menu (both mobile and desktop) - OUTSIDE header but with proper z-index */}      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Overlay - semi-transparent, shows content but darkened */}
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[90]" />
            
            {/* Click handler overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-[95]"
              onClick={() => setMobileMenuOpen(false)}
            />
            
            {/* Menu panel - increased z-index and added top padding */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ 
                type: "spring",
                damping: 30,
                stiffness: 300
              }}
              className="fixed inset-y-0 right-0 w-72 bg-black shadow-xl z-[99] border-l border-gray-800"
            >
              <div className="flex flex-col h-full pt-24">
                {/* Navigation items */}
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
                    
                    {/* Lavora con noi Link */}
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
                
                {/* Booking Button - Fixed at bottom */}
                <div className="px-6 pb-6 border-t border-gray-900 mt-2">
                  <div className="pt-4" onClick={() => setMobileMenuOpen(false)}>
                    <BookingButton className="w-full block text-base font-semibold">
                      Prenota
                    </BookingButton>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
