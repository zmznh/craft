import { createHmac, randomBytes, timingSafeEqual } from 'crypto';
import { requireSecret } from '@/lib/env/secret';
import type { WhiteboardRole } from './access';

export const WHITEBOARD_CLAIM_SCOPE = 'whiteboard';
export const TOKEN_TTL_MS = 30 * 60 * 1000;

const ROLES: WhiteboardRole[] = ['owner', 'editor', 'viewer'];

export interface WhiteboardClaims {
  scope: typeof WHITEBOARD_CLAIM_SCOPE;
  boardId: string;
  subject: string;
  role: WhiteboardRole;
  shareVersion: number;
  exp: number;
}

function secret(): string {
  return requireSecret(['COLLAB_SECRET', 'AUTH_SECRET', 'NEXTAUTH_SECRET']);
}

/** Opaque, high-entropy value used in public share URLs. */
export function createShareToken(): string {
  return randomBytes(24).toString('base64url');
}

export function signWhiteboardClaims(
  claims: Omit<WhiteboardClaims, 'scope' | 'exp'>,
  now = Date.now(),
  ttlMs = TOKEN_TTL_MS,
): string {
  const payload: WhiteboardClaims = {
    scope: WHITEBOARD_CLAIM_SCOPE,
    exp: now + ttlMs,
    ...claims,
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = createHmac('sha256', secret()).update(encoded).digest('base64url');
  return `${encoded}.${signature}`;
}

/** Returns the claims only for a token that is intact, in-date and bound to `boardId`. */
export function verifyWhiteboardClaims(token: string, boardId: string, now = Date.now()): WhiteboardClaims | null {
  const [encoded, signature, extra] = String(token ?? '').split('.');
  if (!encoded || !signature || extra) return null;

  let payload: unknown;
  try {
    payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8'));
  } catch {
    return null;
  }
  if (!payload || typeof payload !== 'object') return null;

  const claims = payload as Partial<WhiteboardClaims>;
  if (claims.scope !== WHITEBOARD_CLAIM_SCOPE) return null;
  if (typeof claims.exp !== 'number' || claims.exp <= now) return null;
  if (claims.boardId !== boardId) return null;
  if (typeof claims.subject !== 'string' || !claims.subject) return null;
  if (!ROLES.includes(claims.role as WhiteboardRole)) return null;
  if (typeof claims.shareVersion !== 'number') return null;

  const expected = createHmac('sha256', secret()).update(encoded).digest();
  const actual = Buffer.from(signature, 'base64url');
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;

  return claims as WhiteboardClaims;
}
