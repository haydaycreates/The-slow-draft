# Deploying The Slow Draft

Everything here is free. You will end up with: a GitHub repository that holds your
writing, a host that rebuilds the site automatically on every push, and a private
writing desk at `/write/` for publishing from your phone or laptop without
touching code.

## Which one should you pick?

**My recommendation: GitHub for the code, Netlify for the website.**

GitHub stores your writing and its full history; Netlify builds and serves it.

The writing desk works **identically on every host** — it commits to GitHub from
your browser with your own token, so there is no gateway, no OAuth worker and no
Identity service to switch on anywhere. Pick the host on price and convenience
alone.

| | Netlify (recommended) | GitHub Pages | Cloudflare Pages |
|---|---|---|---|
| Where your code lives | GitHub | GitHub | GitHub |
| Who builds and serves it | Netlify | GitHub Actions | Cloudflare |
| The writing desk at `/write/` | Works as-is | Works as-is | Works as-is |
| The *legacy* `/admin/` dashboard | Two toggles, done | Needs a GitHub OAuth worker | Needs a GitHub OAuth worker |
| Works with any repo name | Yes | **Only if the repo is `USER.github.io`** — see below | Yes |
| Bandwidth, free | 100 GB/month | ~100 GB/month (soft) | Unlimited |

### The one thing that trips people up on GitHub Pages

GitHub Pages serves a repository called `the-slow-draft` at
`https://USER.github.io/the-slow-draft/` — a **subpath**. Every link in this site
is root-absolute (`/styles.css`, `/blog/`), so at a subpath the design, the fonts
and the navigation would all 404.

GitHub Pages therefore works cleanly in exactly two cases:

- **A.** The repository is named `<your-username>.github.io` (serves at the root)
- **B.** You add a custom domain on Pages (serves at the root)

Any other repo name needs base-path support added to the site first. Nothing is
wrong with that — it is a change to 25 links and the font stylesheet — but it is
not needed on Netlify or Cloudflare.

---

Two hosts are covered in detail. **Pick one, then follow that path.**

- **Netlify** — ~5 minutes (Step B)
- **Cloudflare Pages** — unlimited bandwidth, ~10 minutes (Step C)
- **GitHub Pages** — everything inside GitHub, no third party; use the repo
  naming rule above, ~5 minutes (Step E)

Whichever you choose, the only setup the writing desk needs is a GitHub token
(Step B.5, two minutes, once). Steps B.2–B.3 and C.2–C.3 belong to the *legacy*
Decap dashboard at `/admin/` — skip them unless you want that editor too.

---

## Step 0 — Before you push (5 minutes)

These four edits make the site yours. Do them in a terminal, in the project
folder (the root of this repository, where `package.json` lives).

### 0.1 Check the project is ready

```bash
npm install
npm run verify        # CMS config, admin bundle, the writing desk, build, every link
```

You should see:

```
  The CMS config and the Astro content model agree.
  … 17 page(s) built …
  Decap CMS 3.16.3 and Netlify Identity are self-hosted in the build.
  All 94 code-split CMS chunks are present and referenced.
  All WebP codecs and vendor license notices are included.
  No remote script is used to bootstrap /admin/.
  55 checks passed. …The writing desk is safe to publish from.
  89 checks passed across 9 sessions.
  Every local link, font path and asset resolves. Safe to deploy.
```

The two desk suites matter most: they prove the editor still writes frontmatter
the site can build, and that unlocking, writing, publishing, drafting and
renaming all still work after any change you make.

### 0.2 Your domain — nothing to do

**Skip this step.** Netlify and Cloudflare both pass the deployed site's own
address into the build (`URL` and `CF_PAGES_URL`), and `astro.config.mjs` reads
it, so the RSS feed, sitemap, canonical tags and the CMS "view live" links all
point at the right place from the first deploy.

Set `SITE_URL` yourself only to force a specific address — for example if you add
a custom domain and want the feed to use it immediately, or want deploy previews
to advertise the production URL. It overrides everything else:

```bash
SITE_URL=https://chiragyadav.com npm run build
```

### 0.3 Name your site

Open `src/site.config.js` — the masthead, tagline, hero copy, author details,
newsletter wording and typography all live there. It was generated from your old
`data/db.json`, so your existing text is already in place.

### 0.4 Optional — make the first deploy yours alone

By default the site ships with your migrated posts and a **draft** that is not
published. That is fine to make public. If you would rather start empty, delete
the files in `src/content/blog/` except one, and edit it.

---

## Step A — Put the project on GitHub

### A.1 Create the repository

Go to **https://github.com/new** and fill it in:

- **Repository name:** `the-slow-draft` (or anything you like)
- **Visibility:** **Public** is simplest (free hosts can build public repos; all
  of them also build private ones on the free tier)
- **Do not** tick "Add a README", `.gitignore` or a licence — the project already
  has them

Press **Create repository**. GitHub shows you a page with setup commands. Ignore
them for now.

### A.2 Push your project

In your terminal, inside the project folder:

```bash
git init
git branch -M main
git add .
git commit -m "The Slow Draft — Astro blog with Decap CMS"

# replace YOUR-USERNAME and the repo name if you changed it
git remote add origin https://github.com/YOUR-USERNAME/the-slow-draft.git
git push -u origin main
```

If git asks who you are:

```bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
```

If it asks for a password, use a **personal access token**, not your GitHub
password: **GitHub → Settings → Developer settings → Personal access tokens →
Tokens (classic) → Generate new token**, tick `repo`, and paste the token as the
password. (Or install the GitHub CLI with `gh auth login`, which handles it.)

### A.3 Check what you pushed

Open the repository in your browser. You should see `astro.config.mjs`, `src/`,
`public/`, and a green tick with a run of the **Build and verify** workflow under
the **Actions** tab — that is the CI I added. It runs your CMS check, a build and
the link audit on every push, so a broken post can never reach your live site
unnoticed.

> `dist/` and `node_modules/` are ignored on purpose. The host generates `dist/`
> on every deploy, so it is never stored in git.

---

## Step B — Deploy on Netlify (dashboard login works out of the box)

### B.1 Connect the repository

1. Sign up at **https://app.netlify.com** (free; "Sign up with GitHub" is easiest).
2. **Add new site → Import an existing project → GitHub.**
3. Authorise Netlify if asked, then pick your `the-slow-draft` repository.
4. Netlify reads `netlify.toml`, so the build settings are already filled in:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
   - **Node version:** 22.12.0 (from `netlify.toml`)
5. Press **Deploy site**.

Your site is live in about a minute at something like
`https://sparkly-otter-1234.netlify.app`. Every future `git push` to `main`
rebuilds it automatically.

### B.2 – B.3 Nothing to do (unless you want the legacy dashboard)

The writing desk at `/write/` needs **no Netlify settings at all** — no Identity,
no Git Gateway, no invitation email. Go straight to B.4.

If you also want the old Decap dashboard at `/admin/`, do **B.6** after your
first deploy.

### B.4 Your domain (optional)

Nothing needed — Netlify's own `URL` variable is picked up automatically, so the
feed, sitemap and canonical tags are already correct on your `*.netlify.app`
address.

If you later add a custom domain under **Domain management**, that becomes the
`URL` and everything follows it on the next deploy. To pin a specific address
instead, add **Site configuration → Environment variables** →
`SITE_URL = https://yourdomain.com`, then **Deploys → Trigger deploy → Clear
cache and deploy site**.

### B.5 Publish your first post from the browser

**Make a GitHub token once (two minutes).**

1. Open **GitHub → Settings → Developer settings → Fine-grained tokens →
   Generate new token**: <https://github.com/settings/personal-access-tokens/new>
2. **Repository access:** *Only select repositories* → your site's repository.
3. **Permissions → Repository permissions → Contents:** `Read and write`.
   Nothing else is needed.
4. **Generate token** and copy the `github_pat_…` string.

**Then write.**

1. Go to `https://your-site.netlify.app/write/` (or tap **Write** in the header).
2. Paste the token, choose *Keep on this device*, and press **Unlock the desk**.
3. **New post** → type a title (the address fills itself in) → write.
4. Leave the switch on **Draft** while you work — a draft is excluded from the
   build entirely. Tap **✎ Pens** for the colours, highlighters and typefaces.
5. Switch to **Published** and press **Publish**.

The desk commits the markdown file to GitHub. Netlify notices and rebuilds; the
page watches for the new post and tells you when it is live — usually about a
minute, with its own page, an entry on the blog index, a tag page and a place in
the RSS feed.

Anyone else who opens `/write/` sees only the lock screen: without your token the
page cannot read or write a single file, and it makes no network request at all.

---

### B.6 Only if you also want the legacy /admin/ dashboard

Everything below belongs to the old Decap dashboard, which is still in the
repository but no longer linked from the site. If `/write/` is enough — it is —
skip this section entirely; nothing else in this guide depends on it.

<details>
<summary>Turn on Netlify Identity and Git Gateway for <code>/admin/</code></summary>

**B.2 — the dashboard login.** In your new site's dashboard:

1. **Site configuration → Identity → Enable Identity.**
2. **Identity → Registration → Registration preferences → Invite only.**
   *Do not skip this.* "Open" lets anyone on the internet create an account and
   commit to your repository.
3. **Identity → Services → Git Gateway → Enable.**
   This is the piece that lets the dashboard commit to GitHub without you storing
   a GitHub token anywhere.
4. **Identity → Invite users** → type your own email → **Send**.

**B.3 — accept the invitation.** Check your inbox for *"You've been invited to
join…"*, press the link, and set a password. The invitation link lands on your
home page with a login token in the URL; by default the site ignores it, so open
`/admin/` and sign in there. To be dropped straight into the editor instead, set
`identityWidget: true` in `src/site.config.js` and push.

**Writing in it:** `/admin/` → Blog posts → New Post → write → toggle Draft off →
Publish. It commits to the same folder, so the two editors can be used
interchangeably.

</details>

---

## Step C — Deploy on Cloudflare Pages (unlimited bandwidth)

Everything in Step A still applies — the repository is the same. Only the host
changes. The writing desk at `/write/` needs **nothing extra on Cloudflare**: no
OAuth app, no worker, no secret. Do C.1, then C.4, then C.5.

### C.1 Connect the repository

1. Sign up at **https://dash.cloudflare.com** (free).
2. **Workers & Pages → Create → Pages → Connect to Git.**
3. Authorise GitHub and choose your repository.
4. Build settings:
   - **Framework preset:** Astro
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
5. **Environment variables → Add:** `NODE_VERSION` = `22.12.0`
   *(Cloudflare's default Node is older than Astro 7 needs — without this the
   build fails.)*
6. **Save and Deploy.**

### C.2 – C.3 Only for the legacy /admin/ dashboard — skip these

> **The desk needs none of this.** `/write/` talks to GitHub directly with your
> own token, so there is no OAuth app to register, no worker to deploy and no
> secret to store. Go to **C.4**.
>
> What follows is kept only for the old Decap dashboard, which on Cloudflare has
> to borrow a GitHub OAuth helper because Cloudflare has no Netlify-Identity
> equivalent. Once, five minutes:

1. **Create a GitHub OAuth app** — **GitHub → Settings → Developer settings →
   OAuth Apps → New OAuth App:**
   - **Application name:** `The Slow Draft CMS`
   - **Homepage URL:** `https://your-site.pages.dev`
   - **Authorization callback URL:** `https://YOUR-WORKER-NAME.workers.dev/callback`
     (you will fill the real worker address in step 3; you can edit this later)
   - Press **Register application**, then **Generate a new client secret**.
   - Keep the **Client ID** and **Client secret** to hand.
2. **Deploy the OAuth helper** — the maintained one is
   [`sveltia-cms-auth`](https://github.com/sveltia/sveltia-cms-auth), which works
   for Decap too. Press its **Deploy to Cloudflare Workers** button, or from a
   terminal:
   ```bash
   git clone https://github.com/sveltia/sveltia-cms-auth
   cd sveltia-cms-auth
   npx wrangler deploy
   ```
   In the Cloudflare dashboard for that worker, add two **environment variables**
   (as secrets): `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` from step 1.
3. **Point the OAuth app back at the worker** — set its callback URL to
   `https://YOUR-WORKER-NAME.workers.dev/callback` if it is not already.

*(still C.2–C.3, legacy dashboard only)* Switch the CMS backend to GitHub by
editing `public/admin/config.yml` — the instructions are at the bottom of that
file as well:

```yaml
backend:
  name: github
  repo: YOUR-USERNAME/the-slow-draft
  branch: main
  base_url: https://YOUR-WORKER-NAME.workers.dev
  auth_endpoint: auth
```

Then commit and push:

```bash
git add public/admin/config.yml
git commit -m "CMS: use the GitHub backend on Cloudflare Pages"
git push
```

Cloudflare rebuilds automatically; the login button on `/admin/` now signs you in
with GitHub instead of Netlify.

### C.4 Your domain (optional)

`CF_PAGES_URL` is read automatically, so the feed and sitemap already use your
`*.pages.dev` address. To pin a custom domain instead, add
**Settings → Environment variables** → `SITE_URL = https://yourdomain.com`, then
**Deployments → Retry deployment**.

(You still need `NODE_VERSION = 22.12.0` from Step C.1 — that one is required,
not optional.)

### C.5 Publish a post

Same as B.5 — open `https://your-site.pages.dev/write/`, paste your GitHub token,
write, switch to **Published**, press **Publish**. Cloudflare rebuilds on the new
commit. The token is the only setup, and it is the same token you would use on
Netlify or GitHub Pages.

---

## Step D — Verify it is working end to end

Run through this once after your first deploy. Every line should hold.

| # | Check | How |
|---|---|---|
| 1 | Site loads | Open your URL — the warm paper design, fonts loaded (headings in Playfair Display, body in Lora) |
| 2 | Every page works | Home, About, Resources, Blog, one post — no 404s |
| 3 | Feed and sitemap | `/rss.xml` shows your posts, the author and your domain; `/sitemap.xml` lists every page |
| 4 | The desk is private | `/write/` shows the lock screen — and in a private window with no token, the browser's Network panel shows **no requests at all** |
| 5 | The desk unlocks | Paste your token (B.5) → your library of posts appears, each marked Live or Draft |
| 6 | A post publishes | New post → switch to **Published** → **Publish** → the done screen counts down and the post appears on the live site in about a minute |
| 7 | A draft stays private | Save a post as **Draft** → it appears nowhere on the site, and the deploy still succeeds |
| 8 | Images upload | Tap 🖼 in the toolbar and choose a photo → it is committed to `public/uploads/` and shows in the post |
| 9 | Writing survives | Write a line, close the tab, reopen `/write/` → the library offers the unfinished post back |
| 10 | Your CI is green | GitHub → **Actions** → the latest run has ticks next to every step |

If check 6 fails, look at **Deploys** on Netlify (or the build log on Cloudflare).
The most common causes are a mistyped frontmatter field — your CI run on GitHub
would have caught it first — or a build that needs `NODE_VERSION` set. If the desk
itself reports a GitHub error, the message names the permission that is missing.

---

## Step E — Deploy entirely on GitHub Pages

Use this only if you want no third-party host and your repository is named
`<your-username>.github.io` (or you have added a custom domain). Otherwise use
Step B — Netlify does the same job with less to configure.

### E.1 Name the repository correctly

If you have not created it yet: **https://github.com/new** → the repository name
must be exactly `<your-username>.github.io` — for example, `chiragyadav.github.io`.
The username part must match your GitHub username exactly.

Already created it with another name? Two options: rename it under **Settings →
General → Repository name**, or add a custom domain in E.4.

### E.2 Enable Pages

1. **Settings → Pages.**
2. Under **Build and deployment → Source**, choose **GitHub Actions**.

### E.3 Let the workflow run

The repository already contains `.github/workflows/deploy-github-pages.yml`.
It stays skipped until you switch it on:

1. **Settings → Secrets and variables → Actions → Variables → New repository
   variable.**
2. Name: `DEPLOY_TO_PAGES` — Value: `true`.
3. Push anything (or **Actions → Deploy to GitHub Pages → Run workflow**).

The site appears at `https://<your-username>.github.io/` in about a minute, and
every future push rebuilds it. The build also runs your CMS check and link audit,
so a broken post fails the deploy instead of going live.

> Why the extra switch? Without it, this workflow would attempt to deploy on
> every push even before Pages was enabled, and you would see failed runs. The
> variable keeps things quiet until you have decided.

### E.4 Add a custom domain (optional)

**Settings → Pages → Custom domain**, enter your domain, and add the `CNAME`
record your DNS provider asks for. Once the domain resolves, the site is served
at the root of it — the URL GitHub passes to the build updates automatically.

### E.5 Writing from the browser on GitHub Pages

**Nothing to do.** The desk at `/write/` commits to GitHub from your browser with
your own token, so it works on GitHub Pages exactly as it does everywhere else —
no OAuth app, no worker. Follow B.5 to make the token, then open
`https://YOUR-USERNAME.github.io/write/`.

One difference to expect: after publishing, the desk watches for the new page and
GitHub Actions takes a little longer than Netlify to rebuild. It keeps checking
for about five minutes and tells you when the post is up.

<details>
<summary>The legacy <code>/admin/</code> dashboard on GitHub Pages</summary>

GitHub Pages cannot log you in, so Decap needs a GitHub OAuth app and the same
small worker described in Step C.2. Follow that step, then in
`public/admin/config.yml` set:

```yaml
backend:
  name: github
  repo: YOUR-USERNAME/YOUR-REPO
  branch: main
  base_url: https://YOUR-WORKER-NAME.workers.dev
  auth_endpoint: auth
```

**Or skip it entirely** — which is what `/write/` is for. Editing the markdown
directly on github.com also works: open `src/content/blog/`, press **Add file →
Create new file**, write the frontmatter and body, and commit.

</details>

---

## Day-to-day writing

**From your phone or laptop:** `https://your-site/write/` → unlock with your token
(it is remembered on the device) → **New post** → write → **Publish**. That is the
whole loop. Tap **✎ Pens** for the nine pens, six highlighters and nine typefaces;
🖼 uploads a photo from the camera roll into `public/uploads/`.

**Half-finished?** Leave it on **Draft** and press **Save draft**. It is committed
to the repository but excluded from the build, so it exists nowhere on the live
site. Open it from the library later and switch it to **Published**.

**From your laptop's terminal:** add a markdown file to `src/content/blog/`,
`git push`, and the host builds it.

```markdown
---
title: "The headline"
date: "2026-10-05"
tags: ["writing", "habits"]
summary: "One or two sentences for cards and the feed."
draft: false
---

Your post starts here.
```

**Editing something already published:** open it from the library, change it,
press **Save changes**. Renaming the address moves the file, so a post never ends
up published twice. Because every change is a git commit, you can always see what
changed and undo it — **GitHub → Commits** is the full history of your writing.

**Losing your phone, or a lost token:** nothing is lost. Your writing lives in
GitHub, and you can revoke the token at
<https://github.com/settings/personal-access-tokens> and make a new one in two
minutes.

### If the desk cannot reach GitHub

The desk says what went wrong in plain words — an expired token, a missing
permission, a protected branch, a rate limit — and it keeps your writing in the
browser meanwhile, so nothing is lost while you fix it.

- **"GitHub rejected that token"** → make a new fine-grained token (B.5) and
  unlock again.
- **"That token can read this repository but not write to it"** → the token needs
  *Contents: Read and write*.
- **"That repository is not visible to this token"** → the token was not granted
  this repository, or `writeDesk.owner` / `writeDesk.repo` in `src/site.config.js`
  does not match it.
- **"GitHub refused this step"** on a protected `main` → press **Commit to a
  branch** and merge the pull request it links to.
- **"Could not reach api.github.com"** → a network block, or a privacy extension
  stopping the request.

### If the legacy `/admin/` says the editor could not load

That dashboard is optional now — use `/write/` instead. If you do want it, its CMS
bundle, Identity widget and code-split chunks are served from
`public/admin/vendor/`, so:

1. Confirm the host deployed the latest commit from the branch it watches.
2. Open `https://your-site/admin/` directly in a tab and hard-refresh it.
3. In the browser Network panel, check that `/admin/vendor/decap-cms.js`,
   `/admin/vendor/netlify-identity-widget.js`, and the requested
   `*.decap-cms.js` chunks return successfully.
4. On Netlify, confirm Identity **and** Git Gateway are both enabled (B.6) and
   that you accepted the invitation email.

`npm run verify` validates those local assets, so a missing chunk is caught before
publishing. Your writing remains in `src/content/blog/` in git either way.

---

## Costs, limits and what happens if you outgrow them

| | Free tier | What happens past it |
|---|---|---|
| GitHub | Public repos, unlimited Actions minutes on public repos | Private repos get 2,000 minutes/month — you use seconds per build |
| Netlify | 100 GB bandwidth, 300 build minutes | Builds pause until next month, or about $19/month |
| Cloudflare Pages | Unlimited requests, 500 builds/month | Static sites rarely reach it |
| Decap CMS | Free, open source | Nothing to outgrow — it is a page in your own site |
| Fonts and images | Self-hosted in your repo | Nothing to outgrow |

**Your content is never locked in.** Posts are markdown files in your own git
repository, the fonts are files in the repository, and the design is one CSS file.
Moving to another host means pointing that host at the same repository — the
Deploys section of the README covers GitHub Pages and plain servers too.

**One thing to keep in mind:** the free tiers are for personal sites. If the blog
takes off, the first limit you will meet is Netlify's 100 GB — that is a lot of
readers for a personal essay site, and switching to Cloudflare Pages is a
15-minute job at that point.
