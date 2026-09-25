export interface EmojiEntry {
  /** The glyph itself, decoded from the dataset's hex code points. */
  char: string;
  /** `:name:` slug — the first keyword in the dataset. */
  name: string;
  keywords: string[];
}

export interface RawEmojiRecord {
  n: string[];
  u: string;
}

export interface RawEmojiFile {
  emojis: Record<string, RawEmojiRecord[]>;
}

let indexPromise: Promise<EmojiEntry[]> | null = null;

export function codePointsToChar(unified: string): string {
  return String.fromCodePoint(...unified.split('-').map((hex) => Number.parseInt(hex, 16)));
}

/** Flattens the picker's per-category file into one searchable list. */
export function buildEmojiIndex(file: RawEmojiFile): EmojiEntry[] {
  const entries: EmojiEntry[] = [];
  const seen = new Set<string>();

  for (const records of Object.values(file.emojis)) {
    for (const record of records) {
      const [name, ...rest] = record.n ?? [];
      if (!name || !record.u) continue;
      const char = codePointsToChar(record.u);
      if (seen.has(char)) continue;
      seen.add(char);
      entries.push({ char, name, keywords: rest.length ? rest : [name] });
    }
  }

  return entries;
}

/**
 * Prefix hits first, then substring hits, so `:app` offers apple before map.
 */
export function searchEmojis(index: EmojiEntry[], query: string, limit = 8): EmojiEntry[] {
  const term = query.trim().toLowerCase();
  if (!term) return index.slice(0, limit);

  const prefix: EmojiEntry[] = [];
  const contains: EmojiEntry[] = [];

  for (const entry of index) {
    if (entry.name.startsWith(term) || entry.keywords.some((k) => k.startsWith(term))) {
      prefix.push(entry);
    } else if (entry.name.includes(term) || entry.keywords.some((k) => k.includes(term))) {
      contains.push(entry);
    }
    if (prefix.length >= limit) break;
  }

  return [...prefix, ...contains].slice(0, limit);
}

/** Loaded once, on first `:` — the dataset is a 230 KB lazy chunk. */
export function loadEmojiIndex(): Promise<EmojiEntry[]> {
  if (!indexPromise) {
    indexPromise = import('emoji-picker-react/dist/data/emojis-en.json')
      .then((mod) => buildEmojiIndex((mod.default ?? mod) as unknown as RawEmojiFile))
      .catch(() => {
        indexPromise = null;
        return [];
      });
  }
  return indexPromise;
}
