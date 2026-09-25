import { createHmac, timingSafeEqual } from 'crypto';
import { requireSecret } from '@/lib/env/secret';

function secret() {
  return requireSecret(['AUTH_SECRET', 'NEXTAUTH_SECRET', 'COLLAB_SECRET']);
}

export function shareCookieName(token: string) {
  return `crafty_share_${token}`;
}

export function shareCookieValue(token: string, passcode: string) {
  return createHmac('sha256', secret()).update(`${token}:${passcode}`).digest('hex');
}

export function verifyShareCookie(
  token: string,
  passcode: string | null,
  cookieValue: string | undefined
): boolean {
  if (!passcode) return true;
  if (!cookieValue) return false;
  const expected = Buffer.from(shareCookieValue(token, passcode));
  const actual = Buffer.from(cookieValue);
  if (expected.length !== actual.length) return false;
  return timingSafeEqual(expected, actual);
}
