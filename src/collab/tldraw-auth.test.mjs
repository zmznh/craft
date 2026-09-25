import { defineConfig } from 'vitest/config';
import { createHmac } from 'node:crypto';
import { afterEach, describe, expect, it } from 'vitest';
import { isReadOnlyRole, verifyClaims } from './tldraw-auth.mjs';

const SECRET = 'test-secret-value-0123456789-abcdefghij';
const BOARD = 'board-1';

function sign(claims, secret = SECRET) {
  const encoded = Buffer.from(JSON.stringify(claims)).toString('base64url');
  const signature = createHmac('sha256', secret).update(encoded).digest('base64url');
  return `${encoded}.${signature}`;
}

const valid = () => ({
  scope: 'whiteboard',
  boardId: BOARD,
  subject: 'user-1',
  role: 'editor',
  shareVersion: 4,
  exp: Date.now() + 60_000,
});

afterEach(() => {
  delete process.env.COLLAB_SECRET;
});

describe('whiteboard claim verification', () => {
  it('accepts a well-formed signed claim', () => {
    expect(verifyClaims(sign(valid()), BOARD, SECRET)).toMatchObject({ role: 'editor', shareVersion: 4 });
  });

  it('rejects a claim signed with another secret', () => {
    expect(verifyClaims(sign(valid(), 'another-secret-0123456789-abcdefghij-kll'), BOARD, SECRET)).toBeNull();
  });

  it('rejects a payload edited after signing', () => {
    const token = sign(valid());
    const forged = { ...valid(), role: 'owner' };
    expect(verifyClaims(`${Buffer.from(JSON.stringify(forged)).toString('base64url')}.${token.split('.')[1]}`, BOARD, SECRET)).toBeNull();
  });

  it('rejects expired claims and a missing secret', () => {
    const expired = sign({ ...valid(), exp: Date.now() - 1 });
    expect(verifyClaims(expired, BOARD, SECRET)).toBeNull();
    expect(verifyClaims(sign(valid()), BOARD, '')).toBeNull();
  });

  it('rejects room mismatch, foreign scope and malformed tokens', () => {
    expect(verifyClaims(sign(valid()), 'board-2', SECRET)).toBeNull();
    expect(verifyClaims(sign({ ...valid(), scope: 'document' }), BOARD, SECRET)).toBeNull();
    expect(verifyClaims('nope', BOARD, SECRET)).toBeNull();
    expect(verifyClaims('a.b.c', BOARD, SECRET)).toBeNull();
  });

  it('refuses unknown roles and non-numeric share versions', () => {
    expect(verifyClaims(sign({ ...valid(), role: 'admin' }), BOARD, SECRET)).toBeNull();
    expect(verifyClaims(sign({ ...valid(), shareVersion: '4' }), BOARD, SECRET)).toBeNull();
  });

  it('treats only viewers as read-only', () => {
    expect(isReadOnlyRole('viewer')).toBe(true);
    expect(isReadOnlyRole('editor')).toBe(false);
    expect(isReadOnlyRole('owner')).toBe(false);
  });
});
