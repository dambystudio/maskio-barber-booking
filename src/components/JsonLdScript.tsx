'use client';

import { useEffect } from 'react';

export default function JsonLdScript() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Schema principale per HairSalon / LocalBusiness
      const businessSchema = {
        "@context": "https://schema.org",
        "@type": ["HairSalon", "LocalBusiness"],
        "name": "Maskio Barber Concept",
        "alternateName": "Maskio Barber",
        "description": "Barbiere professionale a San Giovanni Rotondo specializzato in tagli moderni, trattamenti barba e styling maschile di alta qualità.",
        "image": [
          "https://maskiobarberconcept.it/logo.png",
          "https://maskiobarberconcept.it/og-image-1200x630.jpg"
        ],
        "url": "https://maskiobarberconcept.it",
        "telephone": "+39 331 710 0730",
        "email": "fabio.cassano97@icloud.com",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "Via Sant'Agata 24",
          "addressLocality": "San Giovanni Rotondo",
          "addressRegion": "Puglia", 
          "postalCode": "71013",
          "addressCountry": "IT"
        },
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": 41.7089,
          "longitude": 15.7181
        },
        "openingHoursSpecification": [
          {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Friday", "Saturday"],
            "opens": "09:00",
            "closes": "13:00"
          },
          {
            "@type": "OpeningHoursSpecification", 
            "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Friday", "Saturday"],
            "opens": "15:00",
            "closes": "18:00"
          }
        ],
        "priceRange": "€€",
        "paymentAccepted": ["Cash", "Credit Card"],
        "currenciesAccepted": "EUR",
        "hasOfferCatalog": {
          "@type": "OfferCatalog",
          "name": "Servizi Barbiere",
          "itemListElement": [
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "Taglio Capelli Uomo",
                "description": "Taglio professionale con consulenza stilistica personalizzata"
              },
              "price": "18",
              "priceCurrency": "EUR"
            },
            {
              "@type": "Offer", 
              "itemOffered": {
                "@type": "Service",
                "name": "Barba",
                "description": "Rasatura e styling barba professionale"
              },
              "price": "10",
              "priceCurrency": "EUR"
            }
          ]
        },
        "areaServed": {
          "@type": "City",
          "name": "San Giovanni Rotondo",
          "containedInPlace": {
            "@type": "AdministrativeArea",
            "name": "Puglia"
          }
        },
        "founder": {
          "@type": "Fabio Cassano",
          "name": "Maskio Barber Team"
        },
        "foundingDate": "2023",
        "knowsAbout": [
          "Taglio capelli maschile",
          "Rasatura tradizionale", 
          "Styling barba",
          "Trattamenti capelli",
          "Consulenza stilistica"
        ]
      };

      // Schema per WebSite
      const websiteSchema = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "Maskio Barber Concept",
        "url": "https://maskiobarberconcept.it",
        "potentialAction": {
          "@type": "SearchAction",
          "target": "https://maskiobarberconcept.it/search?q={search_term_string}",
          "query-input": "required name=search_term_string"
        }
      };

      // Rimuovi script esistenti
      const existingScripts = document.querySelectorAll('script[type="application/ld+json"]');
      existingScripts.forEach(script => script.remove());

      // Aggiungi schema business
      const businessScript = document.createElement('script');
      businessScript.type = 'application/ld+json';
      businessScript.textContent = JSON.stringify(businessSchema);
      document.head.appendChild(businessScript);      // Aggiungi schema website
      const websiteScript = document.createElement('script');
      websiteScript.type = 'application/ld+json';
      websiteScript.textContent = JSON.stringify(websiteSchema);
      document.head.appendChild(websiteScript);
    }
  }, []);

  return null;
}
