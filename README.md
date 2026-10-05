# The Slow Draft — Astro static site

A personal blog with essays, an about page, recommended resources and an RSS feed.
Built with **Astro 7** as a fully static site: `npm run build` writes plain HTML,
CSS and fonts — no server, no database, no runtime dependencies. Drop the output
on Netlify, Vercel, Cloudflare Pages, GitHub Pages, S3 or any web host.

The design is the same warm-paper look as before: the same stylesheet, the same
self-hosted typefaces, the same layout, verified page by page against the
original build.

---

## Quick start

```bash
npm install
npm run dev        # http://localhost:4321 — writing with live reload
npm run build      # → ./dist   (16 pages, ~1s)
npm run preview    # serve ./dist locally to check the real output
npm run verify     # CMS config + local admin bundle + build + link audit

npm run check:cms  # CMS config still matches the content schema?
npm run test:cms   # prove anything the dashboard writes builds and publishes
```

Requires **Node 22.12+** (Astro 7's minimum).

---

## Writing from the browser

There is a dashboard at **/admin/** — Decap CMS. Sign in, write, press Publish,
and it commits markdown to this git repo; the host rebuilds and the post is live.
No code editor, no local setup. It is a static admin page, so there is no server
or database to run. Decap CMS and the Netlify Identity widget (including Decap's
code-split chunks) are vendored under `public/admin/vendor/`, so loading the
editor does not depend on unpkg.

### One-time setup (Netlify)

`public/admin/config.yml` uses the **git-gateway** backend, which is Netlify's
Identity-backed proxy to your repository. In the Netlify UI:

1. **Deploy the site** (this repo includes `netlify.toml`: build `npm run build`,
   publish `dist`).
2. **Site configuration → Identity → Enable Identity.**
3. **Identity → Registration → "Invite only"** — so strangers cannot sign up.
4. **Identity → Services → Git Gateway → Enable.** This is what lets the
   dashboard commit to your repo without giving it a GitHub token.
5. **Identity → Invite users** → your own address. Accept the invitation, set a
   password, and you land in the editor.
6. Open `https://your-site.netlify.app/admin/` any time you want to write.

Roughly a minute after you press Publish, the commit triggers a rebuild and the
post appears on the home page, the blog index, the tag page, the RSS feed and the
sitemap. Set `identityWidget: true` in `src/site.config.js` if you want
invitation emails to work when they land on the home page rather than `/admin/`
(the setting is explained in that file).

### Editing locally, with no account needed

```bash
npm run dev            # terminal 1 — the site on :4321
npx decap-server       # terminal 2 — a local CMS backend on :8081
```

Then open **http://localhost:4321/admin/** and press *Login* — no password. Decap
writes straight to your working copy, so `git diff` shows you exactly what the
dashboard changed. (`local_backend: true` in the config is what enables this, and
it only activates while that local proxy is running.)

### What you can edit

| Collection | Writes to | Fields |
|---|---|---|
| **Blog posts** | `src/content/blog/*.md` | title, date, updated, summary, tags, featured, draft, cover image, markdown body |
| **Resources** | `src/content/resources/*.md` | title, URL, category, description, sort order |
| **Pages** | `src/content/pages/*.md` | the About page and the Resources intro — heading and body |

New posts start as **drafts** (`draft: true`), so a half-finished post never
reaches the live site. Flip the *Draft* switch off and save to publish. Uploaded
images land in `public/uploads/` and are committed with the post that uses them.

### Verification built in

```bash
npm run check:cms   # does config.yml still match the Astro content schema?
npm run test:cms    # write posts the way Decap does, build, check the pages
```

`check:cms` fails if a CMS field has no matching schema entry — which is exactly
how a dashboard field silently stops working after a refactor. `test:cms` writes
posts in each shape Decap can produce (including all three date formats), runs a
real build, verifies the pages, feed and sitemap, confirms drafts stay out, and
then cleans up after itself.

### Hosted somewhere other than Netlify?

`git-gateway` is a Netlify service. On Vercel, GitHub Pages or your own server,
switch the `backend` block at the top of `public/admin/config.yml` to the GitHub
backend (there is a ready-to-paste snippet at the bottom of that file) — the
collections and fields stay exactly the same.

---

## Writing a post

Create a markdown file in `src/content/blog/`. The filename becomes the URL:
`src/content/blog/my-new-post.md` → `/blog/my-new-post/`.

```markdown
---
title: "The headline readers will see"
date: 2026-10-05
tags: ["writing", "habits"]
summary: "One or two sentences used on cards, in search results and in the RSS feed."
featured: false       # true puts it in the big slot on the home page
draft: false          # true keeps it out of the build entirely
cover: "/uploads/a-photo.jpg"   # optional
---

Your post starts here. Everything the old editor could do still works, because
the renderer understands the same markup:

- **bold**, *italic*, ~~strikethrough~~, `inline code`
- lists, tables, quotes, dividers and links
- fenced code blocks with a language
- raw HTML for the pen colours:

A <span class="c-terracotta">terracotta clause</span>, a
<span class="c-blue">blue aside</span>, a <mark class="hl-yellow">highlight</mark>
and a switch of typeface: <span class="f-playfair">Playfair</span>.
```

Every field is validated when you build. A typo in the frontmatter or a bad URL
stops the build with a message naming the file, instead of shipping a broken page.

**Drafts** (`draft: true`) never reach the output — no page, no feed entry, no
sitemap listing. Flip the flag when the post is ready.

### The nine typefaces and the pens

The full palette is in `public/styles.css`; these are the class names the old
writing desk produced, and they work exactly the same here:

| | |
|---|---|
| Pens | `c-ink` `c-terracotta` `c-blue` `c-green` `c-plum` `c-amber` `c-crimson` `c-indigo` `c-teal` |
| Highlighters | `hl-yellow` `hl-mint` `hl-sky` `hl-rose` `hl-lavender` `hl-peach` |
| Typefaces | `f-lora` `f-merriweather` `f-playfair` `f-inter` `f-poppins` `f-jetbrains` `f-serif` `f-sans` `f-mono` |

Site-wide typography (which face the body and headings use, and the reading
size) lives in `src/site.config.js` under `typography`.

---

## What lives where

```
The-slow-draft/
├── astro.config.mjs          build settings (site URL, outDir, markdown engine)
├── package.json              two dependencies: astro + its markdown engine
├── netlify.toml              build settings + admin noindex header
├── public/
│   ├── admin/
│   │   ├── index.html        dashboard shell and local script references
│   │   ├── config.yml        collections, fields, media folder, backend
│   │   └── vendor/           self-hosted Decap bundle, chunks and Identity widget
│   ├── uploads/              images uploaded from the dashboard
│   ├── fonts/                10 self-hosted woff2 files (Lora, Merriweather,
│   │                         Playfair Display, Inter, Poppins, JetBrains Mono)
│   ├── fonts.css             generated @font-face rules
│   ├── styles.css            the whole design — warm paper theme, pens, fonts
│   ├── site.js               nav, newsletter form, copy-link, blog search
│   └── favicon.svg
├── scripts/
│   ├── migrate-from-db.mjs        the migration that produced src/content/*
│   ├── validate-cms-config.mjs    CMS fields vs the Astro content schema
│   ├── check-admin-assets.mjs     built Decap bundle and split chunks
│   ├── test-cms-roundtrip.mjs     write posts as Decap does, build, verify
│   └── compare-with-dynamic.py    page-by-page fidelity check (see below)
└── src/
    ├── content.config.ts     the content model — blog, resources, pages
    ├── content/
    │   ├── blog/             one markdown file per post
    │   ├── resources/        one file per recommended link
    │   └── pages/            about.md, resources.md
    ├── site.config.js        masthead, hero, author, newsletter, typography
    ├── layouts/BaseLayout.astro
    ├── components/           Header, Footer, Newsletter, PostCard
    ├── lib/                  fonts.js, format.js
    └── pages/
        ├── index.astro           home: hero, featured, latest, about, resources
        ├── blog/[...page].astro  /blog/ with 9-per-page pagination
        ├── blog/[slug].astro     the post page
        ├── blog/tag/[tag].astro  a page per topic
        ├── about.astro
        ├── resources.astro
        ├── 404.astro
        └── rss.xml.js, sitemap.xml.js, robots.txt.js
```

---

## Migrating more posts from the old app

The original dynamic app (writing desk + `data/db.json`) is untouched at
`../blog`. If you add posts there and want them here:

```bash
npm run migrate                      # reads ../blog/data/db.json
npm run migrate -- --from /path/to/db.json
npm run migrate -- --force           # overwrite files that already exist
```

It writes posts, resources and both prose pages, and refreshes
`src/site.config.js`. Existing files are kept unless you pass `--force`, so
local edits are safe.

**Or skip the old app entirely** — a markdown file in `src/content/blog/` is all a
post ever needed.

---

## The newsletter form

A static site has no server to collect addresses, so `src/site.config.js` offers
two honest options:

```js
newsletter: {
  heading: 'Letters, occasionally',
  blurb: '…',
  endpoint: '',        // ← paste a form service URL here
  mode: 'mailto',
}
```

- **Leave `endpoint` empty** (the default): the form hands the address to your
  inbox through the visitor's own mail app. No third party, works immediately.
- **Set `endpoint`** to a form service — Buttondown, Formspree, Mailchimp,
  ConvertKit — and the form POSTs `{"email": "…"}` there instead, showing
  "Subscribing…" and a thank-you note.

---

## Search, tags and pagination

- **Search** is a browser-side filter over the posts already on the page (with a
  `?q=` in the address bar so the state is shareable). No index to maintain.
- **Tags** are real pages: `/blog/tag/writing/`, generated from the posts.
- **Pagination** appears automatically past 9 posts per page
  (`postsPerPage` in `src/site.config.js`).

---

## Verifying the port

`scripts/compare-with-dynamic.py` fetches every page from the old dynamic app and
compares it against the built HTML: visible text, class names, and counts of
cards, tags and links. With the old app running on port 3010 it reports:

```
PASS  /                                 text ✓  classes ✓
PASS  /blog                             text ✓  classes ✓
PASS  /about                            text ✓  classes ✓
PASS  /resources                        text ✓  classes ✓
PASS  /blog/the-pen-menu-and-how-to-use-it   text ✓  classes ✓
… ALL PAGES MATCH
```

---

## Deploying

The full walkthrough — GitHub, host setup, dashboard login, and a verification
checklist — is in **[DEPLOYMENT.md](DEPLOYMENT.md)**. The short version:

1. `npm run verify`, then push the repo to GitHub.
2. Point Netlify or Cloudflare Pages at it: build command `npm run build`,
   publish directory `dist`, and `NODE_VERSION=22.12.0`.
3. Set `SITE_URL` to your domain in the host's environment variables.
4. For the `/admin/` dashboard: enable Identity + Git Gateway (Netlify), or add a
   GitHub OAuth helper (Cloudflare Pages).

Manual deploys work too:

```bash
SITE_URL=https://yourdomain.com npm run build   # → dist/, plain static files
```

- **Vercel** — framework preset Astro, output directory `dist`
- **GitHub Pages** — publish the contents of `dist/` (set `base` in
  `astro.config.mjs` if the site lives at a subpath)
- **Any host** — copy the folder with `rsync`/`scp`; nothing needs to run

Every push to `main` runs the workflow in `.github/workflows/ci.yml`, which builds
the site and fails the run if a post's frontmatter is wrong or a link is broken.

---

## Notes on behaviour changes from the dynamic app

- Publish is now a commit: the dashboard writes markdown into the repo and the
  host rebuilds. Your words are in git with a full history, and the deploy is the
  review step.
- The **view counter** on posts is gone (nothing to count with), as is the
  subscriber list — a static site has nowhere to keep them. The newsletter form
  hands addresses to your inbox or to a form service; see below.
- The About page's *"I usually write about"* chips are drawn from your three
  favourite posts, matching the old templates. Swap `favourites` for `posts` in
  `src/pages/about.astro` to list every topic you have ever used.
- Raw HTML in markdown is passed straight through, as before. One difference: the
  old renderer escaped a stray `<` in prose (`5 &lt; 10`), the new engine passes
  it through — write `&lt;` if you need a literal less-than sign in a sentence.
