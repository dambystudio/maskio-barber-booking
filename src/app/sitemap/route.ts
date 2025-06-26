import { NextResponse } from 'next/server';

// Reindirizzare le richieste a questa route alla sitemap.xml principale
export async function GET() {
  return NextResponse.redirect(new URL('/sitemap.xml', process.env.NEXT_PUBLIC_APP_URL || 'https://www.maskiobarberconcept.it'));
}
