import { createHmac, timingSafeEqual } from 'crypto';

const SECRET =
  process.env['AUTH_SECRET'] ??
  process.env['NEXTAUTH_SECRET'] ??
  'crafty-dev-secret';

export function shareCookieName(token: string) {
  return `crafty_share_${token}`;
}

export function shareCookieValue(token: string, passcode: string) {
  return createHmac('sha256', SECRET).update(`${token}:${passcode}`).digest('hex');
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
