import { getCollection, render } from 'astro:content';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { site } from '../site.config.js';
import { excerptOf } from '../lib/format.js';

/**
 * /rss.xml — the full-text feed, built at build time.
 *
 * Markdown entries compile to components, so the container API renders each one
 * back to an HTML string. The result is the same markup readers get on the page.
 */
export async function GET(context) {
  const base = (context.site?.href || site.url).replace(/\/$/, '');
  const posts = (await getCollection('blog', ({ data }) => !data.draft))
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
    .slice(0, 30);

  /* The author travels with the feed: managingEditor names the person
     responsible for the writing, dc:creator names each item's author. */
  const editorLine = site.author.email
    ? `\n    <managingEditor>${escapeXml(site.author.email)} (${escapeXml(site.author.name)})</managingEditor>`
    : '';
  const copyrightLine = `\n    <copyright>© ${new Date().getFullYear()} ${escapeXml(site.author.name)}</copyright>`;

  const container = await AstroContainer.create();
  const items = [];

  for (const post of posts) {
    const { Content } = await render(post);
    const html = await container.renderToString(Content, { props: {} });
    items.push({ post, html });
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(site.title)}</title>
    <link>${base}</link>
    <description>${escapeXml(site.tagline)}</description>
    <language>en</language>${editorLine}${copyrightLine}
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${base}/rss.xml" rel="self" type="application/rss+xml"/>
${items.map(({ post, html }) => `    <item>
      <title>${escapeXml(post.data.title)}</title>
      <link>${base}/blog/${post.id}/</link>
      <guid isPermaLink="true">${base}/blog/${post.id}/</guid>
      <description>${escapeXml(excerptOf(post, 200))}</description>
      <content:encoded><![CDATA[${html}]]></content:encoded>
      <dc:creator>${escapeXml(site.author.name)}</dc:creator>
      <pubDate>${new Date(post.data.date).toUTCString()}</pubDate>
    </item>`).join('\n')}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}

function escapeXml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
