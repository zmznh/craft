import { auth } from '@/lib/auth/auth';
import { NextResponse } from 'next/server';

const publicRoutes = ['/login', '/register', '/api/auth', '/api/s/', '/s/', '/p/'];

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
