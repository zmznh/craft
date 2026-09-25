import { describe, expect, it } from 'vitest';
import { normalizeTagColor, normalizeTagName } from './normalize';

describe('normalizeTagName', () => {
  it('lowercases and trims', () => {
    expect(normalizeTagName('  Work ')).toBe('work');
  });

  it('drops hashtag and emoji-picker prefixes', () => {
    expect(normalizeTagName('#Urgent')).toBe('urgent');
    expect(normalizeTagName(':idea')).toBe('idea');
  });

  it('collapses inner whitespace', () => {
    expect(normalizeTagName('reading   list')).toBe('reading list');
  });

  it('rejects names that are only punctuation or space', () => {
    expect(normalizeTagName('   ')).toBeNull();
    expect(normalizeTagName('#:')).toBeNull();
  });

  it('caps the length', () => {
    expect(normalizeTagName('a'.repeat(60))).toHaveLength(32);
  });
});

describe('normalizeTagColor', () => {
  it('keeps a well-formed hex colour', () => {
    expect(normalizeTagColor('#E0596B')).toBe('#e0596b');
  });

  it('falls back for anything else', () => {
    expect(normalizeTagColor('red')).toBe('#6366f1');
    expect(normalizeTagColor('#12g456')).toBe('#6366f1');
    expect(normalizeTagColor(null)).toBe('#6366f1');
  });
});
