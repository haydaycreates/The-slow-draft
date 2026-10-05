/**
 * The typeface library — one source of truth.
 *
 * `stack` is what reaches CSS. Every stack ends in a family that exists on the
 * reader's machine, so the site still reads well if a font file is missing.
 * Fonts are self-hosted in public/fonts/ (see public/fonts.css).
 */

export const FONTS = [
  {
    id: 'lora',
    label: 'Lora',
    group: 'Serif',
    note: 'Warm, bookish, quietly modern',
    stack: '"Lora", "Iowan Old Style", Georgia, serif',
  },
  {
    id: 'merriweather',
    label: 'Merriweather',
    group: 'Serif',
    note: 'Sturdy and screen-friendly',
    stack: '"Merriweather", Georgia, serif',
  },
  {
    id: 'playfair',
    label: 'Playfair Display',
    group: 'Display',
    note: 'High-contrast, for headlines',
    stack: '"Playfair Display", "Iowan Old Style", Georgia, serif',
  },
  {
    id: 'inter',
    label: 'Inter',
    group: 'Sans',
    note: 'Modern interface sans',
    stack: '"Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
  },
  {
    id: 'poppins',
    label: 'Poppins',
    group: 'Sans',
    note: 'Geometric, friendly headings',
    stack: '"Poppins", system-ui, -apple-system, "Segoe UI", sans-serif',
  },
  {
    id: 'jetbrains',
    label: 'JetBrains Mono',
    group: 'Mono',
    note: 'Coding typeface with character',
    stack: '"JetBrains Mono", ui-monospace, Menlo, Consolas, monospace',
  },
  /* Generic, always-available fallbacks — no downloads, never fail. */
  {
    id: 'serif',
    label: 'Literary serif',
    group: 'Serif',
    note: 'Palatino / Iowan',
    stack: '"Iowan Old Style", "Palatino Linotype", Palatino, "Book Antiqua", Georgia, "Times New Roman", serif',
  },
  {
    id: 'sans',
    label: 'Modern sans',
    group: 'Sans',
    note: 'Your device’s own interface font',
    stack: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  {
    id: 'mono',
    label: 'Technical mono',
    group: 'Mono',
    note: 'Your device’s own monospace',
    stack: 'ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace',
  },
];

export const TEXT_SIZES = ['small', 'medium', 'large'];

export const byId = (id) => FONTS.find((f) => f.id === id) || null;
export const ids = () => FONTS.map((f) => f.id);
export const stackFor = (id) => (byId(id) || byId('serif')).stack;
export const labelFor = (id) => (byId(id) || byId('serif')).label;

export const fonts = { FONTS, TEXT_SIZES, byId, ids, stackFor, labelFor };
export default fonts;
