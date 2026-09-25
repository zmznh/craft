import { auth } from '@/lib/auth/auth';
import { NextResponse } from 'next/server';

// /w/<token> is the whiteboard share link: anonymous visitors are allowed in so
// the Board's collab-token call can decide the role (viewer without a login).
// /api/internal/ is called by the sync services with no session cookie; those
// routes authenticate on the shared secret header instead.
// /api/whiteboards/ is public on purpose: an anonymous share visitor needs a
// connection claim, and the route itself authorizes owner vs share token.
// PWA assets have to resolve before anyone signs in: the manifest and icons are
// fetched by the install prompt, and sw.js/offline.html are the offline shell.
const publicAssets = [
  '/manifest.webmanifest',
  '/sw.js',
  '/offline.html',
  '/icon-',
  '/apple-touch-icon.png',
];

const publicRoutes = [
  '/login',
  '/register',
  '/api/auth',
  '/api/s/',
  '/api/internal/',
  '/api/whiteboards/',
  '/s/',
  '/p/',
  '/w/',
  ...publicAssets,
];

export default auth((req) => {
  const { pathname } = req.nextUrl;

  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  if (!req.auth) {
    const url = new URL('/login', req.url);
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
