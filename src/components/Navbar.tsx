'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession, signOut } from 'next-auth/react';
import { usePWA } from '@/hooks/usePWA';
import BookingButton from './BookingButton';
import RotatingPhrases from './RotatingPhrases';
import { 
  Bars3Icon, 
  XMarkIcon,
  HomeIcon,
  UserGroupIcon,
  ScissorsIcon,
  ShoppingBagIcon,  
  MapPinIcon,
  StarIcon,
  PhoneIcon,
  UserIcon,
  ArrowRightStartOnRectangleIcon
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Home', href: '/', icon: HomeIcon },
  { name: 'Chi Siamo', href: '/chi-siamo', icon: UserGroupIcon },
  { name: 'Servizi', href: '/servizi', icon: ScissorsIcon },
  // { name: 'Prodotti', href: '/prodotti', icon: ShoppingBagIcon }, // Temporaneamente nascosto
  { name: 'Location', href: '/location', icon: MapPinIcon },
  { name: 'Contatti', href: '/contatti', icon: PhoneIcon },
  { name: 'Cosa dicono di noi', href: '/testimonianze', icon: StarIcon },
];

export default function Navbar() {
  const { data: session, status } = useSession();
  const { isStandalone } = usePWA();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<'bottom' | 'top'>('bottom');
  const userMenuRef = useRef<HTMLDivElement>(null);
  const userButtonRef = useRef<HTMLButtonElement>(null);
  // Check user roles
  const isBarber = session?.user?.role === 'barber';
  const isAdmin = session?.user?.role === 'admin';// Chiudi il menu mobile quando si passa al desktop
  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== 'undefined' && window.innerWidth >= 1024) { // lg breakpoint
        setMobileMenuOpen(false);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);
  // Chiudi il menu utente quando si clicca fuori
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [userMenuOpen]);

  // Calcola la posizione del dropdown in base allo spazio disponibile
  const calculateDropdownPosition = () => {
    if (userButtonRef.current) {
      const buttonRect = userButtonRef.current.getBoundingClientRect();
      const dropdownHeight = 150; // Altezza stimata del dropdown
      const spaceBelow = window.innerHeight - buttonRect.bottom;
      const spaceAbove = buttonRect.top;
      
      // Se non c'è abbastanza spazio sotto, aprilo sopra
      if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
        setDropdownPosition('top');
      } else {
        setDropdownPosition('bottom');
      }
    }
  };

  const handleUserMenuToggle = () => {
    if (!userMenuOpen) {
      calculateDropdownPosition();
    }
    setUserMenuOpen(!userMenuOpen);
  };
    return (
    <>
      <header className={`fixed inset-x-0 top-0 z-[100] backdrop-blur-md shadow-none ${
        isStandalone ? 'standalone-hidden' : 'bg-black/90'
      }`}>
        <div className="mx-auto">
          <div className="flex items-center justify-between p-2 py-4 relative">
            {/* Left side with rotating phrases (visible on desktop) */}
            <div className="hidden lg:block w-56">
              <RotatingPhrases />
            </div>
            
            {/* Empty space for mobile (to keep logo centered) */}
            <div className="w-6 lg:hidden"></div>
              {/* Logo al centro sia per mobile che desktop */}
            <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center justify-center">
              <Link href="/" className="flex items-center">
                <Image
                  src="/LogoSimboloNome_BiancoOrizzontale_BUONO.png"
                  alt="Maskio Barber Concept"
                  width={400}
                  height={100}
                  className="h-16 w-auto"
                  priority
                  quality={85}
                />
              </Link>
            </div>
              {/* Right side with booking button and user menu */}
            <div className="flex items-center space-x-3">              {/* Desktop booking/panel button */}
              <div className="hidden lg:block">
                {isBarber ? (
                  <Link
                    href="/pannello-prenotazioni"
                    className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 text-sm rounded-lg font-semibold transition-all duration-300 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h2a2 2 0 002-2z" />
                    </svg>
                    Pannello Prenotazioni
                  </Link>
                ) : (
                  <BookingButton className="px-4 py-2 text-sm">
                    Prenota
                  </BookingButton>
                )}
              </div>
                {/* User menu (desktop) */}
              {session && (
                <div className="hidden lg:block relative" ref={userMenuRef}>                  <button
                    ref={userButtonRef}
                    onClick={handleUserMenuToggle}
                    className="flex items-center space-x-2 text-white hover:text-yellow-400 transition-colors"
                  >
                    <UserIcon className="h-6 w-6" />
                    <span className="text-sm font-medium">{session.user.name}</span>
                  </button>
                    {/* User dropdown menu */}
                  <AnimatePresence>
                    {userMenuOpen && (                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="absolute right-0 w-56 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-[9999] mt-2"
                        style={{ 
                          position: 'fixed',
                          top: (userButtonRef.current?.getBoundingClientRect().bottom || 0) + 8 + 'px',
                          right: Math.max(16, window.innerWidth - (userButtonRef.current?.getBoundingClientRect().right || 0)) + 'px',
                          zIndex: 9999,
                          maxHeight: Math.min(300, window.innerHeight - (userButtonRef.current?.getBoundingClientRect().bottom || 0) - 40) + 'px',
                          overflow: 'auto'
                        }}
                      >                        <Link
                          href="/area-personale"
                          className="block px-4 py-2 text-sm text-white hover:bg-gray-700 transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          📊 Area Personale
                        </Link>
                        <Link
                          href="/area-personale/profilo"
                          className="block px-4 py-2 text-sm text-white hover:bg-gray-700 transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          👤 Profilo
                        </Link>                        {(isAdmin || isBarber) && (
                          <Link
                            href="/admin/users"
                            className="block px-4 py-2 text-sm text-yellow-400 hover:bg-gray-700 transition-colors font-medium"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            🛠️ Pannello Admin
                          </Link>
                        )}
                        <button
                          onClick={() => {
                            setUserMenuOpen(false);
                            signOut();
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700 transition-colors"
                        >
                          🚪 Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
              
              {/* Login button for non-authenticated users */}
              {!session && status !== 'loading' && (
                <div className="hidden lg:block">
                  <Link
                    href="/auth/signin"
                    className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-white hover:text-yellow-400 transition-colors"
                  >
                    <UserIcon className="h-5 w-5" />
                    <span>Accedi</span>
                  </Link>
                </div>
              )}
              
              {/* Menu button */}              <motion.button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-white flex items-center justify-center z-10"
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.05 }}
                aria-label={mobileMenuOpen ? "Chiudi menu di navigazione" : "Apri menu di navigazione"}
                aria-expanded={mobileMenuOpen}
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
              }}              className="fixed inset-y-0 right-0 w-72 bg-black shadow-xl z-[99] border-l border-gray-800"
            >
              <div className="flex flex-col h-full pt-20">
                {/* Navigation items - Con scroll per evitare overflow */}
                <div className="flex-1 overflow-y-auto px-6 py-4" style={{ maxHeight: 'calc(100vh - 180px)' }}>
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
                        className="flex items-center gap-3 px-4 py-3 text-base font-medium text-yellow-400 rounded-lg hover:bg-gray-900/50 transition-colors duration-200"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6z" />
                        </svg>
                        Lavora con noi
                      </Link>                    </div>

                    {/* User menu items (mobile) */}
                    {session && (
                      <>
                        <div className="border-t border-gray-700 pt-4 mt-4">
                          <div className="px-4 py-2 text-sm font-medium text-gray-400">
                            Ciao, {session.user.name}!
                          </div>
                          
                          {/* Sezione Account - Sempre visibile */}
                          <div className="space-y-1 mb-3">
                            <Link
                              href="/area-personale"
                              className="flex items-center gap-3 px-4 py-3 text-base font-medium text-white rounded-lg hover:bg-gray-900/50 transition-colors duration-200"
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              <UserIcon className="h-5 w-5" />
                              Area Personale
                            </Link>
                            <Link
                              href="/area-personale/profilo"
                              className="flex items-center gap-3 px-4 py-3 text-base font-medium text-white rounded-lg hover:bg-gray-900/50 transition-colors duration-200"
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              Profilo
                            </Link>
                          </div>

                          {/* Pannello Admin se disponibile */}
                          {(isAdmin || isBarber) && (
                            <div className="mb-3">
                              <Link
                                href="/admin/users"
                                className="flex items-center gap-3 px-4 py-3 text-base font-medium text-yellow-400 rounded-lg hover:bg-gray-900/50 transition-colors duration-200"
                                onClick={() => setMobileMenuOpen(false)}
                              >
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                </svg>
                                Pannello Admin
                              </Link>
                            </div>
                          )}

                          {/* Logout - Sempre visibile */}
                          <div className="pt-2 border-t border-gray-800">
                            <button
                              onClick={() => {
                                setMobileMenuOpen(false);
                                signOut();
                              }}
                              className="flex items-center gap-3 px-4 py-3 text-base font-medium text-red-400 rounded-lg hover:bg-gray-900/50 transition-colors duration-200 w-full text-left"
                            >
                              <ArrowRightStartOnRectangleIcon className="h-5 w-5" />
                              Logout
                            </button>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Login option for non-authenticated users */}
                    {!session && status !== 'loading' && (
                      <div className="border-t border-gray-700 pt-4 mt-4">
                        <Link
                          href="/auth/signin"
                          className="flex items-center gap-3 px-4 py-3 text-base font-medium text-yellow-400 rounded-lg hover:bg-gray-900/50 transition-colors duration-200"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <UserIcon className="h-5 w-5" />
                          Accedi
                        </Link>
                      </div>
                    )}
                  </nav>
                </div>                  {/* Booking/Panel Button - Fixed at bottom sempre visibile */}
                <div className="flex-shrink-0 px-6 pb-6 border-t border-gray-900 bg-black">
                  <div className="pt-4" onClick={() => setMobileMenuOpen(false)}>
                    {isBarber ? (
                      <Link
                        href="/pannello-prenotazioni"
                        className="w-full block text-base font-semibold bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-3 rounded-lg transition-all duration-300 text-center"
                      >
                        <div className="flex items-center justify-center gap-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h2a2 2 0 002-2z" />
                          </svg>
                          Pannello Prenotazioni
                        </div>
                      </Link>
                    ) : (
                      <BookingButton className="w-full block text-base font-semibold">
                        Prenota
                      </BookingButton>
                    )}
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
