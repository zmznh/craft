/** Paths the app owns; a published document must not shadow them. */
const RESERVED = new Set([
  'login',
  'register',
  'logout',
  'documents',
  'collections',
  'whiteboards',
  'settings',
  'tasks',
  'calendar',
  'favorites',
  'recent',
  'templates',
  'tags',
  'trash',
  'daily-notes',
  'search',
  'api',
  'p',
  's',
  'w',
]);

const MAX_LENGTH = 64;

export type SlugResult = { ok: true; slug: string } | { ok: false; error: string };

/** A readable default derived from the title, or '' when the title has nothing writable. */
export function slugifyTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Validates the address a user types. Deliberately stricter than `slugifyTitle`:
 * a hand-written slug is kept as entered, so anything that would change the route
 * shape is refused rather than silently rewritten.
 */
export function normalizeShareSlug(raw: string): SlugResult {
  const slug = raw.trim().toLowerCase().replace(/\s+/g, '-');

  if (!slug) return { ok: false, error: '链接地址不能为空' };
  if (slug.length > MAX_LENGTH) return { ok: false, error: `链接地址最长 ${MAX_LENGTH} 个字符` };
  if (!/^[\p{L}\p{N}-]+$/u.test(slug)) return { ok: false, error: '只能包含字母、数字和 -' };
  if (slug.startsWith('-') || slug.endsWith('-')) return { ok: false, error: '不能以 - 开头或结尾' };
  if (RESERVED.has(slug)) return { ok: false, error: '该地址已被系统占用' };

  return { ok: true, slug };
}
