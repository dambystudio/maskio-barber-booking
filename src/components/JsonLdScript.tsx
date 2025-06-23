'use client';

import { useEffect } from 'react';

export default function JsonLdScript() {
  useEffect(() => {
    // Solo lato client, aggiungi lo script JSON-LD
    if (typeof window !== 'undefined') {
      const jsonLdData = {
        "@context": "https://schema.org",
        "@type": "HairSalon",
        "name": "Maskio Barber Concept",        "image": "https://maskiobarberconcept.it/logo.png",
        "url": "https://maskiobarberconcept.it",
        "telephone": "+39 02 1234567",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "Via Sant'Agata 24",
          "addressLocality": "San Giovanni Rotondo",
          "postalCode": "71013",
          "addressCountry": "IT"
        },
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": "41.7089",
          "longitude": "15.7181"
        },
        "openingHoursSpecification": [
          {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Friday"],
            "opens": "09:00",
            "closes": "13:00"
          },
          {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Friday"],
            "opens": "15:00",
            "closes": "18:00"
          }
        ],
        "priceRange": "$$"
      };

      // Controlla se lo script esiste già
      const existingScript = document.querySelector('script[type="application/ld+json"]');
      if (!existingScript) {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(jsonLdData);
        document.head.appendChild(script);
      }
    }
  }, []);

  // Questo componente non renderizza nulla di visibile
  return null;
}
