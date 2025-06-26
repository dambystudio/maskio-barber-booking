import { NextResponse } from 'next/server';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.maskiobarberconcept.it';

  // List of routes to include in the sitemap
  const routes = [
    '',
    '/servizi',
    '/chi-siamo',
    '/contatti',
    '/prenota',
    '/lavora-con-noi',
    '/prodotti',
    '/location',
    '/reviews',
    '/testimonianze',
    '/privacy-policy',
    '/cookie-policy',
    '/termini-servizio',
  ];

  // Create sitemap XML content
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${routes.map(route => `
  <url>
    <loc>${baseUrl}${route}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${route === '' ? '1.0' : '0.8'}</priority>
  </url>
  `).join('')}
</urlset>`;

  // Return sitemap XML with appropriate headers
  return new NextResponse(sitemap, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, stale-while-revalidate=43200',
    },
  });
}
