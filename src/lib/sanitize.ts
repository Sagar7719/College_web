/**
 * HTML Sanitization Utility for CMS Rich Text & User Inputs
 * Strips script tags, dangerous embed/object elements, javascript: pseudoprotocols,
 * and inline DOM event attributes (onload, onerror, onclick, etc.) while preserving
 * semantic HTML structure for CMS pages and rich text blocks.
 */

export function sanitizeHtml(rawHtml: string | undefined | null): string {
  if (!rawHtml || typeof rawHtml !== 'string') {
    return '';
  }

  let clean = rawHtml;

  // 1. Strip script and style blocks completely
  clean = clean.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  clean = clean.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

  // 2. Strip dangerous tags: iframe, embed, object, applet, meta, link, base, form
  clean = clean.replace(/<\/?(iframe|embed|object|applet|meta|link|base|form)\b[^>]*>/gi, '');

  // 3. Strip all inline DOM event handlers (e.g. onload, onerror, onclick, onmouseover, onfocus, etc.)
  clean = clean.replace(/\s+on[a-z]+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi, '');

  // 4. Strip javascript: and vbscript: pseudoprotocols in href, src, or formaction
  clean = clean.replace(/(href|src|action)\s*=\s*(?:'javascript:[^']*'|"javascript:[^"]*"|javascript:[^\s>]+)/gi, '$1="#"');
  clean = clean.replace(/(href|src|action)\s*=\s*(?:'vbscript:[^']*'|"vbscript:[^"]*"|vbscript:[^\s>]+)/gi, '$1="#"');
  clean = clean.replace(/(href|src|action)\s*=\s*(?:'data:text\/html[^']*'|"data:text\/html[^"]*"|data:text\/html[^\s>]+)/gi, '$1="#"');

  return clean;
}
