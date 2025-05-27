'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
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
  EnvelopeIcon
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Home', href: '/', icon: HomeIcon },
  { name: 'Chi Siamo', href: '/chi-siamo', icon: UserGroupIcon },
  { name: 'Servizi', href: '/servizi', icon: ScissorsIcon },
  { name: 'Prodotti', href: '/prodotti', icon: ShoppingBagIcon },
  { name: 'Blog', href: '/blog', icon: NewspaperIcon },
  { name: 'Location', href: '/location', icon: MapPinIcon },
  { name: 'Contatti', href: '/contatti', icon: EnvelopeIcon },
];

const menuItemVariants = {
  closed: { 
    opacity: 0,
    x: 20,
    transition: {
      duration: 0.2
    }
  },
  open: { 
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.2
    }
  }
};

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-white shadow-sm">
      {/* Desktop Navbar */}
      <div className="mx-auto">
        <div className="flex items-center justify-between p-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo.jpg"
              alt="Maskio Barber Concept"
              width={40}
              height={40}
              className="rounded-full"
              priority
            />
            <span className="text-lg font-semibold">
              Maskio Barber Concept
            </span>
          </Link>          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:items-center lg:gap-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm font-medium text-gray-900 hover:text-gray-600 transition-colors duration-200"
              >
                {item.name}
              </Link>
            ))}
            
            {/* Admin Link */}
            <Link
              href="/admin"
              className="text-sm font-medium text-amber-600 hover:text-amber-700 transition-colors duration-200"
              title="Dashboard Admin"
            >
              Admin
            </Link>
            
            <BookingButton size="sm" className="ml-4">
              Prenota
            </BookingButton>
          </div>

          {/* Mobile menu button */}
          <motion.button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden"
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
          >
            <Bars3Icon className="h-6 w-6" />
          </motion.button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
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
              className="fixed inset-y-0 right-0 w-[300px] bg-white shadow-xl z-50"
            >
              <div className="flex flex-col h-full">
                {/* Header */}
                <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="px-6 pt-6 pb-4 border-b border-gray-200"
                >
                  <div className="flex items-center justify-between">
                    <Link
                      href="/"
                      className="flex items-center gap-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Image
                        src="/logo.jpg"
                        alt="Maskio Barber Concept"
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                      <span className="text-lg font-semibold">
                        Maskio Barber Concept
                      </span>
                    </Link>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </motion.button>
                  </div>
                </motion.div>

                {/* Navigation items */}
                <motion.div 
                  className="flex-1 py-6 px-6 overflow-y-auto"
                  initial="closed"
                  animate="open"
                  exit="closed"
                  variants={{
                    open: {
                      transition: { staggerChildren: 0.07, delayChildren: 0.2 }
                    },
                    closed: {
                      transition: { staggerChildren: 0.05, staggerDirection: -1 }
                    }
                  }}
                >                  <nav className="space-y-4">
                    {navigation.map((item, i) => {
                      const Icon = item.icon;
                      return (
                        <motion.div
                          key={item.name}
                          variants={menuItemVariants}
                        >
                          <Link
                            href={item.href}
                            className="flex items-center gap-3 px-3 py-2 text-base font-medium text-gray-900 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <Icon className="h-5 w-5" aria-hidden="true" />
                            {item.name}
                          </Link>
                        </motion.div>
                      );
                    })}
                    
                    {/* Admin Link Mobile */}
                    <motion.div variants={menuItemVariants}>
                      <Link
                        href="/admin"
                        className="flex items-center gap-3 px-3 py-2 text-base font-medium text-amber-600 rounded-lg hover:bg-amber-50 transition-colors duration-200"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Admin
                      </Link>
                    </motion.div>
                    
                    {/* Mobile Booking Button */}
                    <motion.div
                      variants={menuItemVariants}
                      className="pt-4 border-t border-gray-200"
                    >
                      <div onClick={() => setMobileMenuOpen(false)}>
                        <BookingButton className="w-full">
                          Prenota Ora
                        </BookingButton>
                      </div>
                    </motion.div>
                  </nav>
                </motion.div>                {/* Footer */}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
