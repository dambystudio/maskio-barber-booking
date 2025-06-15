'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { 
  HomeIcon, 
  InformationCircleIcon, 
  ScissorsIcon, 
  MapPinIcon, 
  UserIcon 
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  InformationCircleIcon as InformationCircleIconSolid,
  ScissorsIcon as ScissorsIconSolid,
  MapPinIcon as MapPinIconSolid,
  UserIcon as UserIconSolid
} from '@heroicons/react/24/solid';

export default function MobileBottomNav() {
  const [isStandalone, setIsStandalone] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();

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

  // Non mostrare la navbar se non è in modalità standalone
  if (!isStandalone) {
    return null;
  }

  const navItems = [
    {
      name: 'Home',
      href: '/',
      icon: HomeIcon,
      iconSolid: HomeIconSolid,
    },    {
      name: 'Chi Siamo',
      href: '/chi-siamo',
      icon: InformationCircleIcon,
      iconSolid: InformationCircleIconSolid,
    },    {
      name: 'Prenota',
      href: '/prenota',
      icon: ScissorsIcon,
      iconSolid: ScissorsIconSolid,
      isHighlight: true,
    },
    {
      name: 'Location',
      href: '/location',
      icon: MapPinIcon,
      iconSolid: MapPinIconSolid,
    },
    {
      name: 'Profilo',
      href: session ? '/area-personale' : '/auth/signin',
      icon: UserIcon,
      iconSolid: UserIconSolid,
    },
  ];
  return (
    <nav className="fixed bottom-4 left-4 right-4 z-50 bg-white/90 backdrop-blur-md border border-gray-200 rounded-2xl shadow-xl dark:bg-gray-900/90 dark:border-gray-700 standalone-only">
      <div className="grid grid-cols-5 h-20 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const IconComponent = isActive ? item.iconSolid : item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex flex-col items-center justify-center space-y-1 transition-colors duration-200
                ${isActive 
                  ? 'text-amber-600 dark:text-amber-400' 
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }                ${item.isHighlight 
                  ? 'text-white bg-amber-600 rounded-xl px-3 py-2' 
                  : ''
                }
              `}            >
              <IconComponent className={`w-7 h-7 ${item.isHighlight ? 'text-white' : ''}`} />
              <span className={`text-xs font-medium ${item.isHighlight ? 'text-white' : ''}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
