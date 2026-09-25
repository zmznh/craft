import { describe, expect, it } from 'vitest';
import { buildEmojiIndex, codePointsToChar, searchEmojis, type EmojiEntry } from './data';

describe('codePointsToChar', () => {
  it('decodes a single code point', () => {
    expect(codePointsToChar('1f600')).toBe('😀');
  });

  it('decodes a ZWJ sequence', () => {
    expect(codePointsToChar('1f468-200d-1f469-200d-1f466')).toBe('👨‍👩‍👦');
  });
});

const entry = (name: string, char: string, keywords: string[] = []): EmojiEntry => ({
  name,
  char,
  keywords: [name, ...keywords],
});

const index: EmojiEntry[] = [
  entry('apple', '🍎', ['fruit', 'red']),
  entry('pineapple', '🍍', ['fruit']),
  entry('map', '🗺', ['location']),
  entry('grinning face', '😀', ['smile', 'happy']),
];

describe('buildEmojiIndex', () => {
  it('flattens categories and decodes glyphs', () => {
    const built = buildEmojiIndex({
      emojis: {
        food: [{ n: ['apple', 'fruit'], u: '1f34e' }],
        faces: [{ n: ['grinning face'], u: '1f600' }],
      },
    });
    expect(built).toEqual([
      { char: '🍎', name: 'apple', keywords: ['fruit'] },
      { char: '😀', name: 'grinning face', keywords: ['grinning face'] },
    ]);
  });

  it('drops records without a name and repeated glyphs', () => {
    const built = buildEmojiIndex({
      emojis: {
        a: [{ n: [], u: '1f34e' }, { n: ['apple'], u: '1f34e' }, { n: ['apple again'], u: '1f34e' }],
      },
    });
    expect(built).toHaveLength(1);
    expect(built[0].name).toBe('apple');
  });
});

describe('searchEmojis', () => {
  it('ranks prefix matches before substring matches', () => {
    // "pineapple" and "grinning face" (keyword "happy") both merely contain "app".
    expect(searchEmojis(index, 'app').map((e) => e.name)).toEqual([
      'apple',
      'pineapple',
      'grinning face',
    ]);
  });

  it('matches on keywords too', () => {
    expect(searchEmojis(index, 'smile').map((e) => e.name)).toEqual(['grinning face']);
  });

  it('honours the result limit', () => {
    expect(searchEmojis(index, 'a', 1)).toHaveLength(1);
  });

  it('returns the head of the list for an empty query', () => {
    expect(searchEmojis(index, '  ').map((e) => e.char)).toEqual(['🍎', '🍍', '🗺', '😀']);
  });
});
