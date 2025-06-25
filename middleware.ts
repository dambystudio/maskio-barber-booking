import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Temporarily disabled middleware to allow Googlebot access to sitemap
// export function middleware(request: NextRequest) {
//   // Let API routes handle their own logic, no interference
//   return NextResponse.next();
// }

// export const config = {
//   matcher: [
//     // Exclude API routes completely
//     '/((?!api/|_next/static|_next/image|favicon.ico).*)',
//   ],
// };
