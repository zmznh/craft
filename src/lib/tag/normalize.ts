/** Tag names are per-user unique; this is the single place that decides what counts. */
export const MAX_TAG_LENGTH = 32;

export function normalizeTagName(raw: string): string | null {
  // Trim, collapse inner whitespace, and drop a leading '#' or ':' the author may
  // have typed from a hashtag habit.
  const cleaned = raw
    .replace(/^[#:@\s]+/, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleaned) return null;
  return cleaned.slice(0, MAX_TAG_LENGTH).toLowerCase();
}

export const TAG_COLORS = [
  '#6366f1',
  '#e0596b',
  '#e8863c',
  '#d9a520',
  '#4f9e68',
  '#2f9ba8',
  '#4a7de0',
  '#8a5ce0',
] as const;

export function normalizeTagColor(raw: string | null | undefined): string {
  const value = (raw ?? '').trim();
  return /^#[0-9a-f]{6}$/i.test(value) ? value.toLowerCase() : TAG_COLORS[0];
}
