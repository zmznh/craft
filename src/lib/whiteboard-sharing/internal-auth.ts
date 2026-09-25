import { timingSafeEqual } from 'crypto';
import { requireSecret } from '@/lib/env/secret';

export const INTERNAL_SECRET_HEADER = 'x-crafty-internal';

/**
 * Guards the endpoints only the whiteboard sync service may call. The browser
 * cannot set this header cross-origin, and no session is consulted here.
 */
export function isInternalRequest(request: Request): boolean {
  const provided = request.headers.get(INTERNAL_SECRET_HEADER) ?? '';
  const expected = requireSecret(['TLDRAW_INTERNAL_SECRET']);
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function unauthorized() {
  return Response.json({ error: '未授权' }, { status: 401 });
}
