/**
 * A mirror renders someone else's block as HTML, so anything that could run in the
 * host document's origin is dropped before it reaches the page.
 */
export function sanitizeMirrorHtml(html: string): string {
  const withoutScript = html
    .replace(/<script\b[\s\S]*?<\/script>/gi, '')
    .replace(/<iframe\b[\s\S]*?<\/iframe>/gi, '')
    .replace(/\son[a-z]+\s*=\s*"[^"]*"/gi, '');

  return withoutScript.replace(/\b(href|src)\s*=\s*"([^"]*)"/gi, (match, name: string, value: string) => {
    const url = value.trim().toLowerCase();
    if (url.startsWith('javascript:') || url.startsWith('vbscript:')) return `${name}=""`;
    if (url.startsWith('data:') && !url.startsWith('data:image')) return `${name}=""`;
    return match;
  });
}
