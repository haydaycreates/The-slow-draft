import { site } from '../site.config.js';

/**
 * /robots.txt — generated so the sitemap URL always matches your domain.
 *
 * The two private routes are disallowed: /write/ is the writing desk and /admin/
 * is the old Decap dashboard. Neither has anything to offer a search engine, and
 * both are also marked noindex in the HTML and by a response header.
 */
export async function GET(context) {
  const base = (context.site?.href || site.url).replace(/\/$/, '');
  const body = `User-agent: *
Allow: /
Disallow: /write/
Disallow: /admin/

Sitemap: ${base}/sitemap.xml
`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
