'use client';

import { useEffect, useState } from 'react';
import { isChristmasThemeActive } from '../config/christmas-theme';

export default function PannelloChristmasWrapper({ children }: { children: React.ReactNode }) {
  const [christmasActive, setChristmasActive] = useState(false);

  useEffect(() => {
    setChristmasActive(isChristmasThemeActive());
  }, []);

  if (!christmasActive) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      {/* 🎄 Header Natalizio per il Pannello */}
      <div className="bg-gradient-to-r from-red-900/20 via-green-900/20 to-red-900/20 border-b-2 border-yellow-500/30 py-3 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-3">
          <span className="text-2xl">🎄</span>
          <h2 className="text-white font-bold text-lg md:text-xl">
            Buon Natale! 🎅 Gestisci le prenotazioni festive
          </h2>
          <span className="text-2xl">🎁</span>
        </div>
      </div>

      {/* Stella natalizia decorativa mobile */}
      <div className="fixed top-24 right-4 z-50 christmas-star text-4xl hidden md:block">
        ⭐
      </div>

      {children}
    </div>
  );
}
