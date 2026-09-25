import { describe, expect, it } from 'vitest';
import { normalizeShareSlug, slugifyTitle } from './slug';

describe('slugifyTitle', () => {
  it('turns a title into a readable slug', () => {
    expect(slugifyTitle('我的 计划 2026')).toBe('我的-计划-2026');
    expect(slugifyTitle('Hello, World!')).toBe('hello-world');
    expect(slugifyTitle('  a---b  ')).toBe('a-b');
  });

  it('gives up on titles with nothing writable in them', () => {
    expect(slugifyTitle('***')).toBe('');
    expect(slugifyTitle('')).toBe('');
  });
});

describe('normalizeShareSlug', () => {
  it('accepts a cleaned-up slug', () => {
    expect(normalizeShareSlug('Release Notes')).toEqual({ ok: true, slug: 'release-notes' });
    expect(normalizeShareSlug('  产品-说明 ')).toEqual({ ok: true, slug: '产品-说明' });
  });

  it('rejects empty, reserved and over-long values', () => {
    expect(normalizeShareSlug('   ').ok).toBe(false);
    expect(normalizeShareSlug('login').ok).toBe(false);
    expect(normalizeShareSlug('documents').ok).toBe(false);
    expect(normalizeShareSlug('a'.repeat(65)).ok).toBe(false);
  });

  it('rejects slugs that would break the route', () => {
    expect(normalizeShareSlug('-lead').ok).toBe(false);
    expect(normalizeShareSlug('trail-').ok).toBe(false);
    expect(normalizeShareSlug('a/b').ok).toBe(false);
    expect(normalizeShareSlug('a?b').ok).toBe(false);
  });
});
