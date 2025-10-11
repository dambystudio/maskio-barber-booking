import type { NextConfig } from "next";
// Usiamo un fork di next-pwa per compatibilità con Next.js 15+
import withPWA from "@ducanh2912/next-pwa";

const pwaConfig = {
  dest: "public",
  register: false, // Disabilita la registrazione automatica, la gestiamo noi
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  // Disabilita completamente next-pwa, usiamo solo il nostro SW
  disable: true, // DISABILITATO - usiamo sw.js statico
};

const nextConfig: NextConfig = {
  reactStrictMode: true,
  
  // Escludi web-push dal bundling Webpack (richiede moduli Node.js)
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [...(config.externals || []), 'web-push'];
    }
    return config;
  },
  
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
