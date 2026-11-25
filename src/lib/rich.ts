import { Marked } from 'marked';

/* Text fields edited with the CMS rich text editor are stored as Markdown.
   Only links, bold, italic, line breaks and lists come through. Anything else
   (raw HTML, images, headings, tables, code) is shown as plain text, and links
   must point to a page on the site, a web address, an e-mail or a phone number. */

const escape = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

function safeHref(href: string): string | null {
  const h = href.trim();
  if (/^(\/(?!\/)|#)/.test(h)) return h;                     // /kontakt/ or #faq
  if (/^(mailto:|tel:)/i.test(h)) return h;
  try {
    const u = new URL(h);
    return u.protocol === 'https:' || u.protocol === 'http:' ? u.toString() : null;
  } catch {
    // "www.example.se" or "example.se/sida" without https://
    return /^[\w-]+(\.[\w-]+)+(\/\S*)?$/.test(h) ? `https://${h}` : null;
  }
}

const md = new Marked({ gfm: true, breaks: true });
md.use({
  renderer: {
    html(token) { return escape(token.text); },
    heading(token) { return `<p>${this.parser.parseInline(token.tokens)}</p>\n`; },
    image(token) { return escape(token.text || ''); },
    code(token) { return `<p>${escape(token.text)}</p>\n`; },
    codespan(token) { return escape(token.text); },
    blockquote(token) { return this.parser.parse(token.tokens); },
    hr() { return ''; },
    table(token) { return `<p>${escape(token.raw)}</p>\n`; },
    del(token) { return this.parser.parseInline(token.tokens); },
    link(token) {
      const text = this.parser.parseInline(token.tokens);
      // Bare www addresses typed in the text become links; use https for them
      const raw = token.raw.startsWith('[') ? token.href : token.href.replace(/^http:\/\/www\./i, 'https://www.');
      const href = safeHref(raw);
      return href ? `<a href="${escape(href)}">${text}</a>` : text;
    },
  },
});

/** Full text: paragraphs and lists. */
export function richBlock(text?: string | null): string {
  const t = (text ?? '').trim();
  return t ? (md.parse(t) as string) : '';
}

/** One paragraph without the surrounding <p>, for text that sits inside an existing tag. */
export function richInline(text?: string | null): string {
  const t = (text ?? '').trim();
  return t ? (md.parseInline(t) as string).replace(/\n/g, '<br>') : '';
}

/** True when the text needs more than one paragraph or contains a list. */
export function isMultiBlock(text?: string | null): boolean {
  const t = (text ?? '').trim();
  return /\n\s*\n/.test(t) || /^\s*([-*+]|\d+[.)])\s+/m.test(t);
}

/** Plain text without Markdown, for meta tags and structured data. */
export function richPlain(text?: string | null): string {
  const html = richBlock(text);
  return html
    .replace(/<\/(p|li)>\s*/g, '\n')
    .replace(/<br>/g, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/\n{2,}/g, '\n')
    .trim();
}
