import { describe, expect, it } from 'vitest';
import { isOpenableShare } from './resolve';

/**
 * Official rule: a share link resolves only while the document is published, so
 * the publication flag belongs to the lookup gate itself, not to the page that
 * renders it. `src/actions/document/share.ts` is a `'use server'` module, which
 * means the client can call `getSharedDocument` directly and page-level checks
 * would not stop it.
 */
describe('isOpenableShare', () => {
  it('opens a published share', () => {
    expect(isOpenableShare({ token: 't', isPublished: true })).toBe(true);
  });

  it('refuses a share that was never published', () => {
    expect(isOpenableShare({ token: 't', isPublished: false })).toBe(false);
  });

  it('refuses a missing share', () => {
    expect(isOpenableShare(null)).toBe(false);
  });
});
