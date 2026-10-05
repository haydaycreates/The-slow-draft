import { site } from '../site.config.js';

/** /robots.txt — generated so the sitemap URL always matches your domain. */
export async function GET(context) {
  const base = (context.site?.href || site.url).replace(/\/$/, '');
  const body = `User-agent: *
Allow: /

Sitemap: ${base}/sitemap.xml
`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
