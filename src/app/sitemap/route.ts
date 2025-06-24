import { NextResponse } from 'next/server';

export async function GET() {
  const baseUrl = 'https://maskiobarberconcept.it';
  const currentDate = new Date().toISOString().split('T')[0];
  
  const routes = [
    { url: '', changefreq: 'weekly', priority: '1.0' },
    { url: '/chi-siamo', changefreq: 'monthly', priority: '0.8' },
    { url: '/servizi', changefreq: 'monthly', priority: '0.9' },
    { url: '/prodotti', changefreq: 'monthly', priority: '0.7' },
    { url: '/prenota', changefreq: 'weekly', priority: '0.9' },
    { url: '/contatti', changefreq: 'monthly', priority: '0.8' },
    { url: '/location', changefreq: 'yearly', priority: '0.7' },
    { url: '/reviews', changefreq: 'weekly', priority: '0.6' },
    { url: '/testimonianze', changefreq: 'monthly', priority: '0.6' },
    { url: '/lavora-con-noi', changefreq: 'monthly', priority: '0.5' },
    { url: '/auth/signin', changefreq: 'yearly', priority: '0.3' },
    { url: '/auth/signup', changefreq: 'yearly', priority: '0.3' },
    { url: '/privacy-policy', changefreq: 'yearly', priority: '0.2' },
    { url: '/cookie-policy', changefreq: 'yearly', priority: '0.2' },
    { url: '/termini-servizio', changefreq: 'yearly', priority: '0.2' },
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map(
    (route) => `  <url>
    <loc>${baseUrl}${route.url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  return new NextResponse(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=86400, stale-while-revalidate=43200',
    },
  });
}
