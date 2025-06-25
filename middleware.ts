import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // For API routes, let them handle their own logic completely
  if (request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next();
  }
  
  // For other routes, continue normally
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Only run on specific paths, completely exclude API routes
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
