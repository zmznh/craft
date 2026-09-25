import { beforeAll, describe, expect, it } from 'vitest';
import {
  createShareToken,
  signWhiteboardClaims,
  verifyWhiteboardClaims,
} from './token';

const BOARD = 'board-1';

beforeAll(() => {
  process.env.COLLAB_SECRET ??= 'a'.repeat(48);
});

const base = {
  boardId: BOARD,
  subject: 'user-1',
  role: 'editor' as const,
  shareVersion: 3,
};

describe('whiteboard connection claims', () => {
  it('round-trips a signed claim set', () => {
    const token = signWhiteboardClaims(base);
    expect(verifyWhiteboardClaims(token, BOARD)).toMatchObject({
      scope: 'whiteboard',
      ...base,
    });
  });

  it('rejects a tampered payload', () => {
    const token = signWhiteboardClaims(base);
    const [payload, signature] = token.split('.');
    const forged = Buffer.from(
      JSON.stringify({ ...base, scope: 'whiteboard', exp: Date.now() + 1e6, role: 'owner' }),
    ).toString('base64url');
    expect(verifyWhiteboardClaims(forged, BOARD)).toBeNull();
    expect(verifyWhiteboardClaims(`${payload}.${signature.slice(0, -2)}aa`, BOARD)).toBeNull();
  });

  it('rejects an expired token', () => {
    const now = 1_800_000_000_000;
    const token = signWhiteboardClaims(base, now, 1000);
    expect(verifyWhiteboardClaims(token, BOARD, now + 2000)).toBeNull();
    expect(verifyWhiteboardClaims(token, BOARD, now + 500)?.role).toBe('editor');
  });

  it('binds the token to its room', () => {
    const token = signWhiteboardClaims(base);
    expect(verifyWhiteboardClaims(token, 'board-2')).toBeNull();
  });

  it('refuses a token signed for another scope', () => {
    // Shape of the document-collaboration token: same secret, different contract.
    const docToken = Buffer.from(
      JSON.stringify({ docId: BOARD, userId: 'user-1', exp: Date.now() + 10_000 }),
    ).toString('base64url');
    expect(verifyWhiteboardClaims(`${docToken}.deadbeef`, BOARD)).toBeNull();
  });

  it('rejects malformed tokens without throwing', () => {
    for (const bad of ['', 'x', 'a.b', 'a.b.c', 'not-json.sig', '.']) {
      expect(verifyWhiteboardClaims(bad, BOARD)).toBeNull();
    }
  });

  it('issues high-entropy share tokens', () => {
    const tokens = new Set(Array.from({ length: 50 }, createShareToken));
    expect(tokens.size).toBe(50);
    for (const token of tokens) expect(token.length).toBeGreaterThanOrEqual(32);
  });
});
