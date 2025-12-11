'use client';

import { useEffect, useState } from 'react';
import { isChristmasThemeActive, CHRISTMAS_THEME_CONFIG } from '../config/christmas-theme';

export default function ChristmasDecorations() {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    setIsActive(isChristmasThemeActive());
  }, []);

  if (!isActive) return null;

  return (
    <>
      {/* ❄️ NEVE ANIMATA */}
      {CHRISTMAS_THEME_CONFIG.snowEnabled && <SnowEffect />}
      
      {/* 💡 LUCI DI NATALE */}
      {CHRISTMAS_THEME_CONFIG.christmasLightsEnabled && <ChristmasLights />}
      
      {/* 🎄 DECORAZIONI EXTRA */}
      <ChristmasExtraDecorations />
    </>
  );
}

// ❄️ COMPONENTE NEVE
function SnowEffect() {
  const snowflakes = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    animationDuration: `${Math.random() * 3 + 5}s`,
    animationDelay: `${Math.random() * 5}s`,
    fontSize: `${Math.random() * 0.5 + 0.5}em`,
    opacity: Math.random() * 0.6 + 0.4,
  }));

  return (
    <div className="christmas-snow">
      {snowflakes.map((flake) => (
        <div
          key={flake.id}
          className="snowflake"
          style={{
            left: flake.left,
            animationDuration: flake.animationDuration,
            animationDelay: flake.animationDelay,
            fontSize: flake.fontSize,
            opacity: flake.opacity,
          }}
        >
          ❄
        </div>
      ))}
    </div>
  );
}

// 💡 COMPONENTE LUCI DI NATALE
function ChristmasLights() {
  const lights = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    color: ['red', 'green', 'yellow', 'blue', 'white'][i % 5],
    left: `${(i * 5) + 2.5}%`,
  }));

  return (
    <div className="christmas-lights-container">
      <div className="christmas-lights-wire" />
      {lights.map((light) => (
        <div
          key={light.id}
          className={`christmas-light christmas-light-${light.color}`}
          style={{
            left: light.left,
            top: '15px',
          }}
        />
      ))}
    </div>
  );
}

// 🎄 DECORAZIONI EXTRA
function ChristmasExtraDecorations() {
  return (
    <>
      {/* Stelle decorative negli angoli */}
      <div className="christmas-decoration top-20 left-10 hidden md:block">
        <div className="christmas-star text-4xl">⭐</div>
      </div>
      
      <div className="christmas-decoration top-32 right-16 hidden md:block">
        <div className="christmas-star text-3xl" style={{ animationDelay: '1s' }}>✨</div>
      </div>

      {/* Fiocchi di neve decorativi grandi */}
      <div className="christmas-decoration bottom-32 left-20 hidden lg:block floating">
        <div className="christmas-snowflake-decoration text-6xl opacity-30">❄️</div>
      </div>

      <div className="christmas-decoration bottom-40 right-24 hidden lg:block floating" style={{ animationDelay: '2s' }}>
        <div className="christmas-snowflake-decoration text-5xl opacity-20">❄️</div>
      </div>

      {/* Campanelli decorativi */}
      <div className="christmas-decoration top-1/3 right-8 hidden xl:block floating" style={{ animationDelay: '1.5s' }}>
        <div className="text-4xl opacity-40">🔔</div>
      </div>

      <div className="christmas-decoration top-2/3 left-12 hidden xl:block floating" style={{ animationDelay: '3s' }}>
        <div className="text-3xl opacity-30">🎁</div>
      </div>
    </>
  );
}
