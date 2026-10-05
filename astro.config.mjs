import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
import { satteri } from '@astrojs/markdown-satteri';
import { site } from './src/site.config.js';

/**
 * The Slow Draft — static build settings.
 *
 * Output goes to `dist/` — the directory Netlify and Cloudflare Pages expect by
 * default, so neither host needs any extra configuration.
 */

/**
 * Dev-server only: serve `public/<dir>/` as `public/<dir>/index.html`.
 *
 * Astro's dev server matches static files by exact path, so /admin/ 404s while
 * /admin/index.html works. Production hosts (Netlify, Vercel, GitHub Pages) all
 * resolve the directory index, and the built output does too — this just makes
 * the dev server behave the same, so `npm run dev` and the deployed site can be
 * used interchangeably while writing.
 */
function publicDirectoryIndex() {
  return {
    name: 'public-directory-index',
    hooks: {
      'astro:config:setup': ({ updateConfig, config }) => {
        const publicDir = fileURLToPath(config.publicDir);
        updateConfig({
          vite: {
            plugins: [
              {
                name: 'public-directory-index',
                apply: 'serve',
                configureServer(server) {
                  server.middlewares.use((req, _res, next) => {
                    if (req.method !== 'GET' || !req.url) return next();
                    const [pathname, query] = req.url.split('?');
                    if (!pathname.endsWith('/')) return next();
                    const candidate = path.join(publicDir, pathname, 'index.html');
                    if (fs.existsSync(candidate)) {
                      req.url = `${pathname}index.html${query ? `?${query}` : ''}`;
                    }
                    next();
                  });
                },
              },
            ],
          },
        });
      },
    },
  };
}

/**
 * Where the site's own URL comes from, in order of precedence:
 *
 *   1. SITE_URL      — set it yourself to override everything
 *   2. URL           — Netlify's built-in variable: your site's primary address,
 *                      so the RSS feed, sitemap and canonical tags are correct
 *                      on the very first deploy with no configuration at all
 *   3. CF_PAGES_URL  — Cloudflare Pages' equivalent
 *   4. site.url      — the value in src/site.config.js, used locally
 */
const SITE_URL =
  process.env.SITE_URL ||
  process.env.URL ||
  process.env.CF_PAGES_URL ||
  site.url;

/**
 * Build-time: stamp the real site URL into the deployed Decap config.
 *
 * public/admin/config.yml has to carry your domain for its "view live" links,
 * but the domain is only known at deploy time. This rewrites site_url and
 * display_url in the *output* copy from SITE_URL, so the source file can keep
 * its placeholder and you never edit it by hand.
 */
function stampCmsConfig() {
  let siteUrl = SITE_URL;
  return {
    name: 'stamp-cms-config',
    hooks: {
      'astro:config:done': ({ config }) => {
        if (config.site) siteUrl = String(config.site).replace(/\/$/, '');
      },
      'astro:build:done': ({ dir, logger }) => {
        const target = path.join(fileURLToPath(dir), 'admin', 'config.yml');
        if (!fs.existsSync(target)) return;
        const original = fs.readFileSync(target, 'utf8');
        const stamped = original
          .replace(/^site_url:.*$/m, `site_url: ${siteUrl}`)
          .replace(/^display_url:.*$/m, `display_url: ${siteUrl}`);
        if (stamped !== original) {
          fs.writeFileSync(target, stamped);
          logger.info(`admin/config.yml → site_url ${siteUrl}`);
        }
      },
    },
  };
}

export default defineConfig({
  /* Absolute URLs in RSS, the sitemap, canonical tags and the CMS config.
     Edit site.url in src/site.config.js, or set SITE_URL when building. */
  site: SITE_URL,

  server: ({ command }) => ({
    /* `astro preview` is often viewed through a proxy or tunnel whose
       hostname Vite's host check rejects. Preview only, accept any host —
       `astro dev` on localhost stays strict. */
    ...(command === 'preview' ? { allowedHosts: true } : {}),
  }),

  /* Netlify and Cloudflare Pages both default to publishing `dist/`. */
  outDir: './dist',

  integrations: [publicDirectoryIndex(), stampCmsConfig()],

  markdown: {
    /**
     * Astro 7's markdown engine (satteri). Smart punctuation is turned off so
     * quotes, dashes and ellipses render exactly as typed — the same behaviour
     * as the renderer the dynamic site used. GFM (tables, strikethrough,
     * autolinks) stays on by default.
     */
    processor: satteri({ features: { smartPunctuation: false } }),

    /* Code blocks stay unstyled for the stylesheet to paint — no Shiki spans. */
    syntaxHighlight: false,
  },

  build: {
    /* /blog/post-name/index.html — the same URLs the dynamic site served. */
    format: 'directory',
  },

  devToolbar: { enabled: false },
});
