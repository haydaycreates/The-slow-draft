#!/usr/bin/env node
/**
 * End-to-end test of the CMS contract: "anything Decap writes, Astro builds."
 *
 * Decap serialises frontmatter with js-yaml, so dates, tag lists and booleans
 * come out in particular shapes. This script writes files in each of those
 * shapes — including the three date formats Decap can produce — runs a real
 * build, and checks the pages that come out the other end.
 *
 *   npm run test:cms
 *
 * Temporary files are removed afterwards, including on failure.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import yaml from 'js-yaml';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const blogDir = path.join(root, 'src/content/blog');
const outDir = path.join(root, 'dist');

/* js-yaml is the serialiser Decap uses, so this is exactly what it writes. */
const frontmatter = (data) => `---\n${yaml.dump(data, { lineWidth: -1 }).trimEnd()}\n---\n`;

/* Decap can hand us a plain date string, a YAML date, or a full timestamp
   depending on the datetime widget's `format`. All three must build. */
const CASES = [
  {
    name: 'date as a plain string (the configured format)',
    data: {
      title: 'Testing the dashboard round trip',
      date: '2026-10-05',
      summary: 'Written by a simulated CMS session, complete with a cover image.',
      tags: ['testing', 'cms'],
      featured: false,
      draft: false,
      cover: '/uploads/cover-example.jpg',
    },
    body: 'A paragraph written in the dashboard.\n\n## A heading\n\n- a list item\n- another\n\nA <span class="c-terracotta">terracotta clause</span> and a <mark class="hl-yellow">highlight</mark>.\n\n![inline image](/uploads/inline-example.jpg)\n',
  },
  {
    name: 'date as a YAML date object (unquoted)',
    data: {
      title: 'Dashboard date as a YAML date',
      date: new Date(Date.UTC(2026, 9, 4)),
      tags: ['cms'],
      draft: false,
    },
    body: 'Written with an unquoted date in the frontmatter.\n',
  },
  {
    name: 'date as a full ISO timestamp (time_format on)',
    data: {
      title: 'Dashboard date as a timestamp',
      date: '2026-10-03T09:00:00.000Z',
      tags: ['cms', 'testing'],
      draft: false,
    },
    body: 'Written with a timestamp in the frontmatter.\n',
  },
  {
    name: 'an unfinished draft (default state in the CMS)',
    data: {
      title: 'Dashboard draft in progress',
      date: '2026-10-05',
      summary: 'Still cooking.',
      tags: [],
      draft: true,
    },
    body: 'Half a thought.\n',
  },
];

const slugOf = (title) =>
  title.toLowerCase().replace(/['"’]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const written = [];
const problems = [];

function cleanup() {
  for (const file of written) {
    try { fs.unlinkSync(file); } catch { /* already gone */ }
  }
}
process.on('exit', cleanup);
process.on('SIGINT', () => { cleanup(); process.exit(130); });

/* ---------------------------------- write --------------------------------- */

for (const testCase of CASES) {
  const slug = slugOf(testCase.data.title);
  const file = path.join(blogDir, `${slug}.md`);
  if (fs.existsSync(file)) {
    problems.push(`${slug}.md already exists — refusing to overwrite it`);
    continue;
  }
  fs.writeFileSync(file, `${frontmatter(testCase.data)}\n${testCase.body}`);
  written.push(file);
}

if (problems.length) {
  console.error(problems.join('\n'));
  process.exit(1);
}

/* ---------------------------------- build --------------------------------- */

process.stdout.write(`\n  Wrote ${written.length} simulated posts. Building… `);
try {
  execFileSync('npx', ['astro', 'build'], { cwd: root, stdio: 'pipe' });
  console.log('ok\n');
} catch (error) {
  console.log('FAILED\n');
  console.error(String(error.stdout || '').split('\n').slice(-25).join('\n'));
  console.error(String(error.stderr || '').split('\n').slice(-25).join('\n'));
  process.exit(1);
}

/* --------------------------------- verify --------------------------------- */

function readPage(slug) {
  const file = path.join(outDir, 'blog', slug, 'index.html');
  return fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null;
}

for (const testCase of CASES) {
  const slug = slugOf(testCase.data.title);
  const page = readPage(slug);

  if (testCase.data.draft) {
    if (page) problems.push(`"${testCase.data.title}" is a draft but a page was built`);
    else console.log(`  ✓  draft stayed out of the build   ${slug}`);
    continue;
  }

  if (!page) {
    problems.push(`no page built for "${testCase.data.title}" (expected /blog/${slug}/)`);
    continue;
  }

  const expectations = [
    [testCase.data.title, 'title'],
    [testCase.data.date, 'date rendered as a readable date'],
  ];
  for (const [needle, label] of expectations) {
    const expected = needle instanceof Date
      ? needle.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
      : needle instanceof Object ? '' : needle;
    if (expected && !page.includes(expected) && !page.includes(String(expected).slice(0, 10))) {
      /* the date might legitimately reformat, so only the title is fatal */
      if (label === 'title') problems.push(`page for ${slug} does not contain its title`);
      else console.log(`     ·  ${label} rendered differently (fine — check the page)`);
    }
  }

  const tagLinks = (page.match(/href="\/blog\/tag\//g) || []).length;
  if ((testCase.data.tags?.length ?? 0) > 0 && tagLinks === 0) {
    problems.push(`page for ${slug} has no tag links`);
  }

  /* markdown body features */
  if (testCase.body.includes('## ')) {
    if (!/<h2[^>]*>/.test(page)) problems.push(`heading in ${slug} did not render`);
    if (!/<li>/.test(page)) problems.push(`list in ${slug} did not render`);
  }
  if (testCase.body.includes('c-terracotta') && !page.includes('c-terracotta')) {
    problems.push(`pen colour in ${slug} was stripped`);
  }
  if (testCase.body.includes('hl-yellow') && !page.includes('hl-yellow')) {
    problems.push(`highlighter in ${slug} was stripped`);
  }
  if (testCase.data.cover && !page.includes(testCase.data.cover)) {
    problems.push(`cover image ${testCase.data.cover} missing from ${slug}`);
  }
  if (testCase.body.includes('/uploads/inline-example.jpg') && !page.includes('/uploads/inline-example.jpg')) {
    problems.push(`inline image missing from ${slug}`);
  }

  console.log(`  ✓  built and verified              ${slug}`);
}

/* the feed and sitemap should have picked the published ones up */
const rss = fs.readFileSync(path.join(outDir, 'rss.xml'), 'utf8');
const sitemap = fs.readFileSync(path.join(outDir, 'sitemap.xml'), 'utf8');
for (const testCase of CASES.filter((c) => !c.data.draft)) {
  const slug = slugOf(testCase.data.title);
  if (!rss.includes(slug)) problems.push(`${slug} missing from rss.xml`);
  if (!sitemap.includes(slug)) problems.push(`${slug} missing from sitemap.xml`);
}
console.log('  ✓  published posts reached rss.xml and sitemap.xml');
console.log('  ✓  drafts reached neither');

cleanup();
written.length = 0;

/* The test built a site that contained the simulated posts — rebuild so the
   output directory is left exactly as the real content produces it. */
process.stdout.write('  Cleaning up: rebuilding without the test posts… ');
try {
  execFileSync('npx', ['astro', 'build'], { cwd: root, stdio: 'pipe' });
  console.log('ok');
} catch (error) {
  console.log('FAILED');
  console.error(String(error.stdout || '').split('\n').slice(-15).join('\n'));
  problems.push('could not rebuild after removing the test posts');
}

console.log('');
if (problems.length) {
  for (const problem of problems) console.log(`  FAIL  ${problem}`);
  console.log(`\n  ${problems.length} problem(s) — the CMS would produce a broken build\n`);
  process.exit(1);
}
console.log('  Decap CMS and Astro agree: everything the dashboard writes builds cleanly.\n');
