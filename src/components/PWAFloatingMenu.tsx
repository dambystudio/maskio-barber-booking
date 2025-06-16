'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  ScissorsIcon,
  MapPinIcon,
  PhoneIcon,
  BriefcaseIcon,
  CogIcon,
  StarIcon,
  ShoppingBagIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

export default function PWAFloatingMenu() {
  const [isStandalone, setIsStandalone] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Rileva se l'app è in modalità standalone (PWA installata)
    const checkStandalone = () => {
      const standalone = window.matchMedia('(display-mode: standalone)').matches ||
                        window.matchMedia('(display-mode: fullscreen)').matches ||
                        (window.navigator as any).standalone === true;
      setIsStandalone(standalone);
    };

    checkStandalone();

    // Ascolta i cambi di modalità
    const standaloneQuery = window.matchMedia('(display-mode: standalone)');
    standaloneQuery.addEventListener('change', checkStandalone);

    return () => {
      standaloneQuery.removeEventListener('change', checkStandalone);
    };
  }, []);

  // Non mostrare se non è in modalità standalone
  if (!isStandalone) {
    return null;
  }

  const menuItems = [
    {
      name: 'Home',
      href: '/',
      icon: HomeIcon,
      description: 'Torna alla homepage'
    },
    {
      name: 'Chi Siamo',
      href: '/chi-siamo',
      icon: InformationCircleIcon,
      description: 'La nostra storia'
    },    {
      name: 'Servizi',
      href: '/servizi',
      icon: ScissorsIcon,
      description: 'I nostri servizi'
    },
    // {
    //   name: 'Prodotti',
    //   href: '/prodotti',
    //   icon: ShoppingBagIcon,
    //   description: 'Prodotti per capelli'
    // }, // Temporaneamente nascosto
    {
      name: 'Location',
      href: '/location',
      icon: MapPinIcon,
      description: 'Dove siamo'
    },
    {
      name: 'Contatti',
      href: '/contatti',
      icon: PhoneIcon,
      description: 'Come contattarci'
    },
    {
      name: 'Testimonianze',
      href: '/testimonianze',
      icon: StarIcon,
      description: 'Cosa dicono di noi'
    },
    {
      name: 'Lavora con noi',
      href: '/lavora-con-noi',
      icon: BriefcaseIcon,
      description: 'Unisciti al team'
    }
  ];

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 standalone-only"
          onClick={() => setIsOpen(false)}
        />
      )}      {/* FAB Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          fixed top-4 right-4 z-50 w-16 h-16 rounded-full shadow-lg 
          transition-all duration-300 transform hover:scale-110
          ${isOpen 
            ? 'bg-red-500 hover:bg-red-600' 
            : 'bg-amber-600 hover:bg-amber-700'
          }
          text-white standalone-only flex items-center justify-center
        `}
        style={{ padding: 0 }}
        aria-label={isOpen ? 'Chiudi menu' : 'Altre informazioni'}
      >
        <div className="flex items-center justify-center w-full h-full">
          {isOpen ? (
            <XMarkIcon className="w-8 h-8" style={{ margin: 0, padding: 0 }} />
          ) : (
            <Bars3Icon className="w-8 h-8" style={{ margin: 0, padding: 0 }} />
          )}
        </div>
      </button>

      {/* Menu dropdown */}
      {isOpen && (
        <div className="fixed top-20 right-4 z-50 w-80 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden standalone-only">
          {/* Header */}
          <div className="bg-amber-600 text-white p-4">
            <h3 className="font-bold text-lg">Esplora il Sito</h3>
            <p className="text-amber-100 text-sm">Tutte le sezioni disponibili</p>
          </div>

          {/* Menu items */}
          <div className="max-h-96 overflow-y-auto">
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
                    <IconComponent className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {item.name}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {item.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 dark:bg-gray-800 p-3 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Maskio Barber • PWA Mode
            </p>
          </div>
        </div>
      )}
    </>
  );
}
