#!/usr/bin/env node
/**
 * Checks public/admin/config.yml against the Astro content model.
 *
 * Decap writes frontmatter; Astro validates it. If the two drift apart you only
 * find out when a build fails after you press Publish. This script compares them
 * up front:
 *
 *   npm run check:cms
 *
 * It verifies that
 *   · the YAML parses and the backend / media settings are what the project expects
 *   · every collection points at a folder that exists
 *   · every field Decap can write is allowed by src/content.config.ts
 *   · every required schema field is present in the CMS
 *   · every required field has a label and a known widget
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const configPath = path.join(root, 'public/admin/config.yml');
const schemaPath = path.join(root, 'src/content.config.ts');

const problems = [];
const notes = [];
const fail = (message) => problems.push(message);

/* ------------------------------- Decap config ----------------------------- */

const config = yaml.load(fs.readFileSync(configPath, 'utf8'));

if (config.backend?.name !== 'git-gateway') {
  fail(`backend.name is "${config.backend?.name}" — this project is set up for git-gateway`);
}
if (!config.backend?.branch) fail('backend.branch is missing');
if (config.media_folder !== 'public/uploads') fail(`media_folder is "${config.media_folder}"`);
if (config.public_folder !== '/uploads') fail(`public_folder is "${config.public_folder}"`);

/* ------------------------- the Astro schema, parsed ----------------------- */

const schema = fs.readFileSync(schemaPath, 'utf8');

/** Pull the field names each collection declares, plus which are required. */
function parseSchema(source) {
  const out = {};
  const collectionRe = /const\s+(\w+)\s*=\s*defineCollection\(\{[\s\S]*?schema:\s*z\.object\(\{([\s\S]*?)\n\s*\}\)/g;
  let match;
  while ((match = collectionRe.exec(source))) {
    const [, name, body] = match;
    const fields = {};
    for (const line of body.split('\n')) {
      const fieldMatch = /^\s*(\w+):\s*z\.([\w.]+)(.*)$/.exec(line);
      if (!fieldMatch) continue;
      const [, field, base, rest] = fieldMatch;
      const optional = /\.optional\(\)/.test(rest) || /\.default\(/.test(rest);
      fields[field] = { required: !optional, base };
    }
    out[name] = fields;
  }
  return out;
}

const collections = parseSchema(schema);
if (!Object.keys(collections).length) fail('could not read any collections from src/content.config.ts');

/* --------------------------- compare the two worlds ----------------------- */

const KNOWN_WIDGETS = new Set([
  'string', 'text', 'markdown', 'datetime', 'boolean', 'list', 'image', 'number',
  'hidden', 'select', 'file', 'object', 'relation',
]);

const bodyFields = [];

function checkFields(collectionName, cmsFields, schemaFields, where) {
  const seen = new Set();
  for (const field of cmsFields) {
    const name = field.name ?? field;
    if (field.name) {
      if (!field.label) fail(`${where}: field "${name}" has no label`);
      if (!field.widget) fail(`${where}: field "${name}" has no widget`);
      else if (!KNOWN_WIDGETS.has(field.widget)) fail(`${where}: unknown widget "${field.widget}" on "${name}"`);
    }
    seen.add(name);

    /* `body` is not frontmatter: Decap writes it as the markdown file's body,
       which Astro exposes as entry.body rather than through the schema. */
    if (name === 'body') {
      if (field.widget && field.widget !== 'markdown') fail(`${where}: "body" should use the markdown widget`);
      bodyFields.push(where);
      continue;
    }

    if (!schemaFields[name]) {
      fail(`${where}: field "${name}" is not in the Astro schema — the build would ignore or reject it`);
    }
  }
  for (const [name, info] of Object.entries(schemaFields)) {
    if (!seen.has(name)) {
      /* Optional schema fields may be left out of the CMS; required ones may not. */
      if (info.required) fail(`${where}: schema requires "${name}" but the CMS cannot write it`);
      else notes.push(`${where}: optional field "${name}" is not editable in the CMS`);
    }
  }
}

for (const collection of config.collections ?? []) {
  const name = collection.name;
  const schemaFields = collections[name];
  if (!schemaFields) {
    fail(`collection "${name}" has no matching schema in src/content.config.ts`);
    continue;
  }

  if (collection.folder) {
    const folder = path.join(root, collection.folder);
    if (!fs.existsSync(folder)) fail(`collection "${name}": folder ${collection.folder} does not exist`);
    checkFields(name, collection.fields ?? [], schemaFields, `collection "${name}"`);
  } else {
    for (const file of collection.files ?? []) {
      const target = path.join(root, file.file);
      if (!fs.existsSync(target)) fail(`collection "${name}": file ${file.file} does not exist`);
      checkFields(`${name}/${file.name}`, file.fields ?? [], schemaFields, `collection "${name}" (${file.name})`);
    }
  }
}

/**
 * The blog collection must have a markdown body editor (that is where the
 * writing goes). Resource-style collections are frontmatter only, so a missing
 * body there is reported as a note rather than a failure.
 */
const BLOG_FOLDER = 'src/content/blog';

function hasBody(fields) {
  return (fields ?? []).some((f) => f.name === 'body' && (f.widget ?? 'markdown') === 'markdown');
}

for (const collection of config.collections ?? []) {
  const groups = collection.folder
    ? [{ label: collection.name, folder: collection.folder, fields: collection.fields ?? [] }]
    : (collection.files ?? []).map((f) => ({ label: `${collection.name}/${f.name}`, folder: null, fields: f.fields ?? [] }));

  for (const group of groups) {
    if (hasBody(group.fields)) continue;
    if (group.folder === BLOG_FOLDER) {
      fail(`collection "${group.label}" points at ${BLOG_FOLDER} but has no markdown "body" field`);
    } else {
      notes.push(`collection "${group.label}" has no body field (frontmatter only)`);
    }
  }
}

/* ---------------------------------- report -------------------------------- */

console.log('');
if (notes.length) {
  for (const note of notes) console.log(`  note  ${note}`);
  console.log('');
}
if (problems.length) {
  for (const problem of problems) console.log(`  FAIL  ${problem}`);
  console.log(`\n  ${problems.length} problem(s) in public/admin/config.yml\n`);
  process.exit(1);
}
console.log('  The CMS config and the Astro content model agree.\n');
