import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Content model.
 *
 * blog      — one markdown file per post in src/content/blog/
 * resources — one file per recommended link in src/content/resources/
 * pages     — the About and Resources page copy in src/content/pages/
 *
 * Every field is validated at build time: a typo in frontmatter stops the build
 * with a clear message instead of shipping a broken page.
 */

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    summary: z.string().default(''),
    cover: z.string().default(''),
    featured: z.boolean().default(false),
    /** draft: true keeps a post out of the build entirely. */
    draft: z.boolean().default(false),
  }),
});

const resources = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/resources' }),
  schema: z.object({
    title: z.string(),
    url: z.string().url(),
    category: z.string().default('General'),
    description: z.string().default(''),
    order: z.number().default(0),
  }),
});

const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: z.object({
    eyebrow: z.string().default(''),
    heading: z.string().default(''),
  }),
});

export const collections = { blog, resources, pages };
