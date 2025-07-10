import type { NextConfig } from "next";
// Usiamo un fork di next-pwa per compatibilità con Next.js 15+
import withPWA from "@ducanh2912/next-pwa";

const pwaConfig = {
  dest: "public",
  register: true,
  skipWaiting: true, // FORZA L'AGGIORNAMENTO IMMEDIATO
  disable: process.env.NODE_ENV === "development",
  reloadOnOnline: true, // Ricarica quando torna online
  // Strategia di caching ottimizzata per aggiornamenti automatici
  runtimeCaching: [
    // Cache-First per risorse statiche (CSS, JS, immagini)
    {
      urlPattern: /\.(?:js|css|png|jpg|jpeg|svg|gif|webp|avif|ico|woff|woff2|ttf|eot)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'static-resources',
        expiration: {
          maxEntries: 1000,
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30 giorni
        },
        cacheableResponse: {
          statuses: [0, 200]
        }
      },
    },
    // Network-First per le API (sempre aggiornate)
    {
      urlPattern: /^https?:\/\/.*\/api\/.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 5, // 5 minuti per le API
        },
        networkTimeoutSeconds: 3,
      },
    },
    // Stale-While-Revalidate per le pagine HTML
    {
      urlPattern: /^https?:\/\/.*\.(?:html|htm)$/,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'pages-cache',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 * 24, // 24 ore
        },
      },
    },
    // Network-First per tutto il resto (fallback)
    {
      urlPattern: /^https?.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'fallback-cache',
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 60 * 60 * 24, // 24 ore
        },
        networkTimeoutSeconds: 3,
      },
    },
  ],
  buildExcludes: [/middleware-manifest\.json$/],
};

const nextConfig: NextConfig = {
  reactStrictMode: true,
  
  // Ottimizzazioni per produzione ultra-sicure
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  trailingSlash: false,
  
  // Ottimizzazioni immagini
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 anno
    dangerouslyAllowSVG: false,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },  
  // Ottimizzazioni experimental per performance
  experimental: {
    optimizePackageImports: ['framer-motion', 'next-auth'],
  },
  
  // Redirect da non-www a www
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'maskiobarberconcept.it',
          },
        ],
        destination: 'https://www.maskiobarberconcept.it/:path*',
        permanent: true,
      },
    ];
  },
  
  // Header di sicurezza avanzati
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: https:; font-src 'self' data: https:; connect-src 'self' https:; media-src 'self' https:; object-src 'none'; base-uri 'self';"
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=()'
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'off'
          },
          // Rimuovo i cache headers troppo restrittivi per le pagine normali
        ]
      },
      // Headers specifici per pagine statiche - permettiamo caching per SEO
      {
        source: '/:path((?!api|_next|pannello-prenotazioni|auth).*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, stale-while-revalidate=86400'
          }
        ]
      },
      // Headers specifici per API routes - permettiamo accesso completo ai bot
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*'
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, HEAD, OPTIONS, POST, PUT, DELETE'
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization, User-Agent'
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600'
          }
        ]
      },
      // Headers specifici per sitemap XML - permettiamo accesso a Google
      {
        source: '/sitemap.xml',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/xml; charset=utf-8'
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=43200'
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*'
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, HEAD, OPTIONS'
          }
        ]
      },
      // Headers permissivi per tutti i bot di ricerca
      {
        source: '/(.*)',
        has: [
          {
            type: 'header',
            key: 'user-agent',
            value: '.*(bot|crawler|spider|crawling).*'
          }
        ],
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*'
          },
          {
            key: 'Access-Control-Allow-Methods', 
            value: 'GET, HEAD, OPTIONS'
          }
        ]
      }
    ];
  }
};

export default withPWA(pwaConfig)(nextConfig);
