import { NextRequest, NextResponse } from 'next/server';

// Rate limiting storage (in production use Redis or database)
const requestCounts = new Map<string, { count: number; resetTime: number }>();

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

const defaultConfig: RateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100 // requests per window
};

const apiLimits: Record<string, RateLimitConfig> = {
  '/api/bookings': { windowMs: 60 * 1000, maxRequests: 10 }, // 10 per minute
  '/api/bookings/slots': { windowMs: 60 * 1000, maxRequests: 20 },
  '/api/contact': { windowMs: 60 * 1000, maxRequests: 5 }
};

function getClientIP(request: NextRequest): string {
  // Try to get real IP from various headers
  const xForwardedFor = request.headers.get('x-forwarded-for');
  const xRealIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  
  if (xForwardedFor) {
    return xForwardedFor.split(',')[0].trim();
  }
  
  if (xRealIP) {
    return xRealIP;
  }
  
  if (cfConnectingIP) {
    return cfConnectingIP;
  }
    // Fallback to a default IP address
  return 'unknown';
}

function isRateLimited(ip: string, path: string): boolean {
  const config = apiLimits[path] || defaultConfig;
  const key = `${ip}:${path}`;
  const now = Date.now();
  
  const record = requestCounts.get(key);
  
  if (!record || now > record.resetTime) {
    // First request or window expired
    requestCounts.set(key, {
      count: 1,
      resetTime: now + config.windowMs
    });
    return false;
  }
  
  if (record.count >= config.maxRequests) {
    return true;
  }
  
  record.count++;
  return false;
}

function cleanupOldRecords(): void {
  const now = Date.now();
  for (const [key, record] of requestCounts.entries()) {
    if (now > record.resetTime) {
      requestCounts.delete(key);
    }
  }
}

// Clean up every 5 minutes
setInterval(cleanupOldRecords, 5 * 60 * 1000);

function addSecurityHeaders(response: NextResponse): NextResponse {
  // Enhanced security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
  response.headers.set('X-DNS-Prefetch-Control', 'off');
  response.headers.set('X-Permitted-Cross-Domain-Policies', 'none');
  response.headers.set('Cross-Origin-Embedder-Policy', 'require-corp');
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  response.headers.set('Cross-Origin-Resource-Policy', 'same-origin');
  
  // Hide server information
  response.headers.delete('Server');
  response.headers.delete('X-Powered-By');
  
  return response;
}

function detectSuspiciousActivity(request: NextRequest): boolean {
  const userAgent = request.headers.get('user-agent') || '';
  const suspiciousPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /postman/i,
    /curl/i,
    /wget/i,
    /python/i,
    /php/i,
    /java/i
  ];
  
  return suspiciousPatterns.some(pattern => pattern.test(userAgent));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for static files and images
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/api/_next/') ||
    pathname.match(/\.(jpg|jpeg|png|gif|svg|ico|css|js|woff|woff2|ttf|eot)$/)
  ) {
    return NextResponse.next();
  }

  const ip = getClientIP(request);
  
  // Detect suspicious activity
  if (detectSuspiciousActivity(request)) {
    return new NextResponse('Access Denied', { status: 403 });
  }
  
  // Apply rate limiting for API routes
  if (pathname.startsWith('/api/')) {
    if (isRateLimited(ip, pathname)) {
      return new NextResponse(
        JSON.stringify({ 
          error: 'Too many requests',
          retryAfter: '60 seconds'
        }),
        { 
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': '60'
          }
        }
      );
    }
  }
  
  // Apply general rate limiting
  if (isRateLimited(ip, 'general')) {
    return new NextResponse('Too Many Requests', { status: 429 });
  }
  
  const response = NextResponse.next();
  return addSecurityHeaders(response);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
