#!/usr/bin/env node
/**
 * Checks the built /admin/ page and its self-hosted Decap CMS runtime.
 *
 * Decap 3.16.3 is code-split across its entry bundle and numbered chunks. A
 * tiny placeholder at the entry path still lets Astro build successfully, but
 * leaves the editor stuck on its boot screen, so this check verifies the real
 * bundle, Identity widget, every runtime chunk reference and the built URLs.
 *
 * Run after `npm run build`:
 *
 *   npm run check:admin
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distDir = path.join(root, 'dist');
const adminDir = path.join(distDir, 'admin');
const vendorDir = path.join(adminDir, 'vendor');
const indexPath = path.join(adminDir, 'index.html');
const problems = [];
const fail = (message) => problems.push(message);

if (!fs.existsSync(indexPath)) {
  fail('dist/admin/index.html is missing — run `npm run build` first');
}
if (!fs.existsSync(vendorDir)) {
  fail('dist/admin/vendor/ is missing from the build');
}

if (fs.existsSync(indexPath)) {
  const html = fs.readFileSync(indexPath, 'utf8');
  const scriptSources = [...html.matchAll(/<script\b[^>]*\bsrc\s*=\s*["']([^"']+)["'][^>]*>/gi)]
    .map((match) => match[1].split('?')[0]);

  for (const expected of [
    '/admin/vendor/netlify-identity-widget.js',
    '/admin/vendor/decap-cms.js',
  ]) {
    if (!scriptSources.includes(expected)) {
      fail(`admin/index.html must load ${expected}`);
    }
  }

  const remoteScripts = scriptSources.filter((source) => /^https?:\/\//i.test(source));
  if (remoteScripts.length) {
    fail(`admin/index.html still loads scripts from a remote URL: ${remoteScripts.join(', ')}`);
  }
  if (/This page loads Decap CMS from unpkg/i.test(html)) {
    fail('admin/index.html still contains the old unpkg-blocked fallback page');
  }
}

function checkFile(name, minBytes, predicate, description) {
  const file = path.join(vendorDir, name);
  if (!fs.existsSync(file)) {
    fail(`dist/admin/vendor/${name} is missing`);
    return '';
  }

  const size = fs.statSync(file).size;
  if (size < minBytes) {
    fail(`dist/admin/vendor/${name} is only ${size} bytes; expected ${description}`);
  }
  const contents = fs.readFileSync(file, 'utf8');
  if (predicate && !predicate(contents)) {
    fail(`dist/admin/vendor/${name} does not look like ${description}`);
  }
  return contents;
}

const cmsBundle = checkFile(
  'decap-cms.js',
  1_000_000,
  (contents) => contents.includes('decap-cms 3.16.3'),
  'the real Decap CMS 3.16.3 bundle',
);
checkFile(
  'netlify-identity-widget.js',
  100_000,
  (contents) => contents.includes('netlifyIdentity'),
  'the bundled Netlify Identity widget',
);
if (!fs.existsSync(path.join(vendorDir, 'cms.css'))) {
  fail('dist/admin/vendor/cms.css is missing');
}
for (const name of [
  'decap-cms.LICENSE',
  'decap-cms.js.LICENSE.txt',
  'netlify-identity-widget.LICENSE',
]) {
  const file = path.join(vendorDir, name);
  if (!fs.existsSync(file) || fs.statSync(file).size === 0) {
    fail(`dist/admin/vendor/${name} is missing or empty`);
  }
}

const chunkFiles = fs.existsSync(vendorDir)
  ? fs.readdirSync(vendorDir).filter((name) => /^\d+\.decap-cms\.js$/.test(name))
  : [];
const chunkIds = new Set();
const bundleSources = [cmsBundle];

for (const name of chunkFiles) {
  const file = path.join(vendorDir, name);
  const contents = fs.readFileSync(file, 'utf8');
  const id = Number(name.match(/^(\d+)\.decap-cms\.js$/)[1]);
  chunkIds.add(id);
  bundleSources.push(contents);
  if (!contents.includes('webpackChunkDecapCms')) {
    fail(`dist/admin/vendor/${name} is not a Decap CMS chunk`);
  }
}

if (!chunkFiles.length) {
  fail('no code-split Decap CMS chunks were found in dist/admin/vendor/');
}

/*
 * Find Webpack's lazy-chunk imports in the entry and in its chunks. Scanning
 * every bundle matters: optional image-encoding chunks import their own chunks.
 */
const referencedChunkIds = new Set();
const chunkImport = /\b[\w$]+\.e\((\d+)\)/g;
for (const source of bundleSources) {
  chunkImport.lastIndex = 0;
  let match;
  while ((match = chunkImport.exec(source))) referencedChunkIds.add(Number(match[1]));
}

for (const id of referencedChunkIds) {
  if (!chunkIds.has(id)) fail(`Decap CMS chunk ${id}.decap-cms.js is missing`);
}

const wasmReferences = new Set();
const wasmReference = /["']([a-f0-9]{20}\.wasm)["']/g;
for (const source of bundleSources) {
  wasmReference.lastIndex = 0;
  let match;
  while ((match = wasmReference.exec(source))) wasmReferences.add(match[1]);
}
if (!wasmReferences.size) fail('no local WebP codec WASM references were found');
for (const name of wasmReferences) {
  const file = path.join(vendorDir, name);
  if (!fs.existsSync(file)) {
    fail(`Decap CMS WebP codec ${name} is missing`);
  } else if (fs.statSync(file).size < 100_000) {
    fail(`Decap CMS WebP codec ${name} is unexpectedly small`);
  }
}

const unreferencedChunks = [...chunkIds].filter((id) => !referencedChunkIds.has(id));
if (unreferencedChunks.length) {
  fail(`unreferenced Decap CMS chunk file(s): ${unreferencedChunks.join(', ')}`);
}

console.log('');
if (problems.length) {
  for (const problem of problems) console.log(`  FAIL  ${problem}`);
  console.log(`\n  ${problems.length} problem(s) with the built admin assets\n`);
  process.exit(1);
}

console.log(`  Decap CMS 3.16.3 and Netlify Identity are self-hosted in the build.`);
console.log(`  All ${chunkFiles.length} code-split CMS chunks are present and referenced.`);
console.log('  All WebP codecs and vendor license notices are included.');
console.log('  No remote script is used to bootstrap /admin/.');
console.log('');
