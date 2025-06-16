'use client';

import { useEffect } from 'react';

export default function DynamicManifest() {
  useEffect(() => {
    // Funzione per aggiornare il manifest in base al tema del sistema
    const updateManifest = () => {
      // Rileva il tema del sistema
      const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const theme = isDarkMode ? 'dark' : 'light';
      
      // Trova il link del manifest esistente
      let manifestLink = document.querySelector('link[rel="manifest"]') as HTMLLinkElement;
      
      if (manifestLink) {
        // Aggiorna l'URL del manifest con il tema
        const url = new URL('/api/manifest', window.location.origin);
        url.searchParams.set('theme', theme);
        manifestLink.href = url.toString();
        
        console.log(`🎨 Manifest updated for ${theme} theme`);
      }
      
      // Aggiorna anche le favicon dinamicamente
      updateFavicons(theme);
    };
    
    // Funzione per aggiornare le favicon
    const updateFavicons = (theme: string) => {
      const iconFolder = theme === 'light' ? 'nero' : 'bianco';
      
      // Aggiorna favicon 16x16
      let favicon16 = document.querySelector('link[rel="icon"][sizes="16x16"]') as HTMLLinkElement;
      if (favicon16) {
        favicon16.href = `/icone/${iconFolder}/16x16.png`;
      }
      
      // Aggiorna favicon 32x32
      let favicon32 = document.querySelector('link[rel="icon"][sizes="32x32"]') as HTMLLinkElement;
      if (favicon32) {
        favicon32.href = `/icone/${iconFolder}/32x32.png`;
      }
      
      // Aggiorna Apple Touch Icon
      let appleTouchIcon = document.querySelector('link[rel="apple-touch-icon"]') as HTMLLinkElement;
      if (appleTouchIcon) {
        appleTouchIcon.href = `/icone/${iconFolder}/180x180.png`;
      }
      
      console.log(`🍎 Favicons updated for ${theme} theme (${iconFolder})`);
    };
    
    // Aggiorna immediatamente
    updateManifest();
    
    // Ascolta i cambiamenti del tema del sistema
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleThemeChange = (e: MediaQueryListEvent) => {
      console.log('🔄 System theme changed:', e.matches ? 'dark' : 'light');
      updateManifest();
    };
    
    // Ascolta i cambiamenti (supporto per browser moderni)
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleThemeChange);
    } else {
      // Fallback per browser più vecchi
      mediaQuery.addListener(handleThemeChange);
    }
    
    // Cleanup
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleThemeChange);
      } else {
        mediaQuery.removeListener(handleThemeChange);
      }
    };
  }, []);

  return null; // Questo componente non renderizza nulla
}
