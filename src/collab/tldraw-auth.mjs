import { createHmac, timingSafeEqual } from 'node:crypto';

export const WHITEBOARD_CLAIM_SCOPE = 'whiteboard';
export const ROLES = ['owner', 'editor', 'viewer'];

/**
 * Mirrors src/lib/whiteboard-sharing/token.ts. Kept as a separate plain-Node
 * module because the sync service runs outside the Next.js bundle.
 */
export function verifyClaims(token, boardId, secret, now = Date.now()) {
  const [encoded, signature, extra] = String(token ?? '').split('.');
  if (!encoded || !signature || extra || !secret) return null;

  const expected = createHmac('sha256', secret).update(encoded).digest();
  const actual = Buffer.from(signature, 'base64url');
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;

  let claims;
  try {
    claims = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8'));
  } catch {
    return null;
  }

  if (!claims || typeof claims !== 'object') return null;
  if (claims.scope !== WHITEBOARD_CLAIM_SCOPE) return null;
  if (claims.boardId !== boardId) return null;
  if (typeof claims.exp !== 'number' || claims.exp <= now) return null;
  if (typeof claims.subject !== 'string' || !claims.subject) return null;
  if (!ROLES.includes(claims.role)) return null;
  if (typeof claims.shareVersion !== 'number') return null;

  return claims;
}

export function isReadOnlyRole(role) {
  return role === 'viewer';
}
