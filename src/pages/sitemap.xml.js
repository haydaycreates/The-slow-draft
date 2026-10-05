import { getCollection } from 'astro:content';
import { site } from '../site.config.js';

/** /sitemap.xml — every page and every published post. */
export async function GET(context) {
  const base = (context.site?.href || site.url).replace(/\/$/, '');
  const posts = (await getCollection('blog', ({ data }) => !data.draft))
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());

  const staticPages = ['/', '/about/', '/resources/', '/blog/'];
  const entries = [
    ...staticPages.map((path) => ({ loc: base + path, lastmod: null })),
    ...posts.map((post) => ({
      loc: `${base}/blog/${post.id}/`,
      lastmod: (post.data.updated || post.data.date).toISOString().slice(0, 10),
    })),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.map((entry) => `  <url>
    <loc>${entry.loc}</loc>${entry.lastmod ? `\n    <lastmod>${entry.lastmod}</lastmod>` : ''}
  </url>`).join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}
