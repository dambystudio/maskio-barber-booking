'use client';

import { useEffect } from 'react';
import SecurityManager from '../lib/security';

interface SecurityProviderProps {
  children: React.ReactNode;
}

export default function SecurityProvider({ children }: SecurityProviderProps) {
  useEffect(() => {
    // Check if we're in development mode
    const isDevelopment = process.env.NODE_ENV === 'development' || 
                         typeof window !== 'undefined' && (
                           window.location.hostname === 'localhost' ||
                           window.location.hostname === '127.0.0.1'
                         );
      // Initialize security protections
    SecurityManager.getInstance();
    
    // Additional runtime protections (only in production)
    if (!isDevelopment) {
      const protectPage = () => {
        // Disable right-click
        document.addEventListener('contextmenu', (e) => {
          e.preventDefault();
          return false;
        });

        // Disable text selection
        document.addEventListener('selectstart', (e) => {
          e.preventDefault();
          return false;
        });

        // Disable drag and drop
        document.addEventListener('dragstart', (e) => {
          e.preventDefault();
          return false;
        });

        // Clear console periodically
        const clearConsole = () => {
          if (typeof console.clear === 'function') {
            console.clear();
          }
        };
        
        setInterval(clearConsole, 1000);

        // Obfuscate error messages
        window.addEventListener('error', (e) => {
          e.preventDefault();
          e.stopPropagation();
          return false;
        });

        // Prevent unhandled promise rejections from showing
        window.addEventListener('unhandledrejection', (e) => {
          e.preventDefault();
          return false;
        });
      };

      protectPage();

      // Anti-inspection measures
      const antiInspection = () => {
        let devtools = false;
        
        // Detect dev tools by measuring timing
        setInterval(() => {
          const start = +new Date();
          debugger;
          const end = +new Date();
          
          if (end - start > 100) {
            devtools = true;
            // Redirect or disable functionality
            window.location.replace('about:blank');
          }
        }, 1000);

        // Detect if window is being inspected
        let widthThreshold = window.outerWidth - window.innerWidth > 200;
        let heightThreshold = window.outerHeight - window.innerHeight > 200;
        
        setInterval(() => {
          if (widthThreshold || heightThreshold) {
            window.location.replace('about:blank');
          }
        }, 500);
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
