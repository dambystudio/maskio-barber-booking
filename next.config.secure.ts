import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  
  // Ottimizzazioni per produzione ultra-sicure
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  trailingSlash: false,
  
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
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self';"
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
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate'
          }
        ],
      },
    ];
  },
  
  // Configurazione webpack per offuscazione estrema
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // Solo in produzione
      try {
        const WebpackObfuscator = require('webpack-obfuscator');
        const TerserPlugin = require('terser-webpack-plugin');
        
        // Abilita minificazione aggressiva
        config.optimization.minimize = true;
        config.optimization.usedExports = true;
        config.optimization.sideEffects = false;
        
        // Configurazione Terser ultra-aggressiva
        config.optimization.minimizer = [
          new TerserPlugin({
            terserOptions: {
              mangle: {
                toplevel: true,
                keep_fnames: false,
                keep_classnames: false
              },
              compress: {
                drop_console: true,
                drop_debugger: true,
                pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn', 'console.error'],
                dead_code: true,
                conditionals: true,
                evaluate: true,
                booleans: true,
                loops: true,
                unused: true
              },
              format: {
                comments: false,
                ascii_only: true
              }
            }
          })
        ];

        // Offuscazione avanzata del codice
        config.plugins.push(
          new WebpackObfuscator({
            rotateStringArray: true,
            stringArray: true,
            stringArrayEncoding: ['rc4'],
            selfDefending: true,
            compact: true,
            controlFlowFlattening: true,
            controlFlowFlatteningThreshold: 0.75,
            deadCodeInjection: true,
            deadCodeInjectionThreshold: 0.4,
            debugProtection: true,
            debugProtectionInterval: 2000,
            disableConsoleOutput: true,
            domainLockRedirectUrl: 'about:blank',
            identifierNamesGenerator: 'hexadecimalNumber',
            log: false,
            numbersToExpressions: true,
            simplify: true,
            sourceMap: false,
            splitStrings: true,
            splitStringsChunkLength: 10,
            target: 'browser',
            transformObjectKeys: true
          }, [])
        );

        // Code splitting più aggressivo
        config.optimization.splitChunks = {
          chunks: 'all',
          minSize: 0,
          maxSize: 244000,
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              maxSize: 244000,
            },
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              maxSize: 244000,
            }
          }
        };
      } catch (error) {
        console.warn('Security plugins not available in development');
      }
    }
    return config;
  }
};

export default nextConfig;
