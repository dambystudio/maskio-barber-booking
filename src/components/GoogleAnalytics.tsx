'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useCookieConsent } from './CookieConsentContext';

declare global {
  interface Window {
    gtag: (command: string, targetId: string, config?: Record<string, any>) => void;
  }
}

export function GoogleAnalytics() {
  const pathname = usePathname();
  const { consent } = useCookieConsent();

  useEffect(() => {
    // DO NOT load GA if consent is not granted
    if (consent !== 'granted') {
      return;
    }

    const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

    if (!GA_MEASUREMENT_ID) {
      return;
    }

    // Load Google Analytics script
    // Check if script already exists to avoid duplicates
    if (!document.querySelector(`script[src*="${GA_MEASUREMENT_ID}"]`)) {
      const script1 = document.createElement('script');
      script1.async = true;
      script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
      document.head.appendChild(script1);

      const script2 = document.createElement('script');
      script2.innerHTML = `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}', {
            page_title: document.title,
            page_location: window.location.href,
          });
        `;
      document.head.appendChild(script2);
    }
  }, [consent]); // Re-run when consent changes

  // Pageview tracking
  useEffect(() => {
    // Only track if consent is granted
    if (consent !== 'granted') return;

    const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

    if (!GA_MEASUREMENT_ID || !window.gtag) {
      return;
    }

    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: pathname,
      page_title: document.title,
      page_location: window.location.href,
    });
  }, [pathname, consent]);

  return null;
}

// Helper function to track events
export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Helper function to track conversions
export const trackConversion = (event_name: string, parameters?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', event_name, parameters);
  }
};
