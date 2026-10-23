import type { ImageMetadata } from 'astro';

/* All images uploaded through the CMS land in src/assets/uploads, so Astro can
   optimize them (WebP, right sizes) at build time. The CMS stores paths like
   "/src/assets/uploads/gustav.jpg", and this resolves them to real image imports. */
const uploads = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/uploads/*.{jpg,jpeg,png,webp,avif,gif,JPG,JPEG,PNG,WEBP}',
  { eager: true },
);

export function resolveImage(path?: string | null): ImageMetadata | undefined {
  if (!path) return undefined;
  const clean = path.trim();
  const key = clean.startsWith('/src/') ? clean : `/src/assets/uploads/${clean.split('/').pop()}`;
  return uploads[key]?.default;
}

/* Splits a heading into the part before, the highlighted part and the part after.
   If the highlight text is empty or not found, everything ends up in "before". */
export function splitHighlight(text: string, mark?: string) {
  const i = mark ? text.indexOf(mark) : -1;
  if (!mark || i < 0) return { before: text, mark: '', after: '' };
  return { before: text.slice(0, i), mark, after: text.slice(i + mark.length) };
}

/* Text fields use blank lines between paragraphs. */
export function paragraphs(text = ''): string[] {
  return text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
}

export const telHref = (phone: string) => `tel:+46${phone.replace(/\D/g, '').replace(/^0/, '')}`;
