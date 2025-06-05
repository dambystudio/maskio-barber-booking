'use client';

import { useEffect } from 'react';
import SecurityManager from '../lib/security';

interface SecurityProviderProps {
  children: React.ReactNode;
}

export default function SecurityProvider({ children }: SecurityProviderProps) {
  useEffect(() => {    // Check if we're in development mode
    const isDevelopment = process.env.NODE_ENV === 'development' || 
                         typeof window !== 'undefined' && (
                           window.location.hostname === 'localhost' ||
                           window.location.hostname === '127.0.0.1'
                         );
    
    // Check if we're on mobile device
    const isMobile = typeof window !== 'undefined' && (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
      (window.innerWidth <= 768) ||
      ('ontouchstart' in window)
    );
    
    // Initialize security protections
    SecurityManager.getInstance();
    
    // Additional runtime protections (only in production and NOT mobile)
    if (!isDevelopment && !isMobile) {      // Rimuoviamo tutte le protezioni che interferiscono con l'esperienza utente normale
      const protectPage = () => {
        // NON disabilitiamo più il click destro (contextmenu)
        // NON disabilitiamo più la selezione del testo
        // NON disabilitiamo più drag and drop
                
        // Manteniamo alcune protezioni di base per la console
        const clearConsole = () => {
          if (typeof console.clear === 'function') {
            console.clear();
          }
        };
        
        // Riduciamo la frequenza per migliorare le prestazioni
        setInterval(clearConsole, 5000);

        // Manteniamo l'obfuscamento dei messaggi di errore
        window.addEventListener('error', (e) => {
          e.preventDefault();
          e.stopPropagation();
          return false;
        });
      };

      protectPage();      // Protezione solo per F12 e ispezione elementi
      const antiInspection = () => {
        // Rilevamento degli strumenti di sviluppo tramite F12 e scorciatoie da tastiera
        document.addEventListener('keydown', (e) => {
          // Rileva solo F12 e combinazioni specifiche per gli strumenti di sviluppo
          if (
            e.key === 'F12' ||
            (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) ||
            (e.ctrlKey && e.key === 'U')
          ) {
            e.preventDefault();
            // Reindirizza solo in questi casi specifici
            window.location.replace('about:blank');
            return false;
          }
        });
        
        // Sostituiamo il rilevamento basato su debugger con uno più leggero
        // e lo facciamo eseguire meno frequentemente
        let detectCount = 0;
        setInterval(() => {
          try {
            detectCount++;
            
            // Eseguiamo il controllo solo ogni 5 volte per ridurre l'impatto
            if (detectCount % 5 !== 0) return;
            
            const start = +new Date();
            debugger;
            const end = +new Date();
            
            // Aumentiamo significativamente la soglia per evitare falsi positivi
            if (end - start > 300) {
              // Reindirizza in caso di debugger attivo
              window.location.replace('about:blank');
            }
          } catch (e) {
            // Ignoriamo gli errori
          }
        }, 3000);
                
        // NON controlliamo più le dimensioni della finestra 
        // perché interferisce con lo zoom e altre funzionalità normali
      };

      antiInspection();
    }

    // Cleanup function
    return () => {
      // Cleanup if needed
    };
  }, []);

  return <>{children}</>;
}
