import { NextRequest } from 'next/server';
import { getDb } from '@/prisma/db';
import { shareCookieName, shareCookieValue } from '@/lib/share-passcode';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  let body: { passcode?: string; path?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: '无效请求' }, { status: 400 });
  }

  const passcode = typeof body.passcode === 'string' ? body.passcode : '';
  const path = body.path === `/s/${token}` || body.path === `/p/${token}` ? body.path : `/s/${token}`;

  const db = await getDb();
  const share = await db.orm.public.DocumentShare.first({ token });
  if (!share) {
    return Response.json({ error: '链接无效' }, { status: 404 });
  }
  const s = share as any;
  if (!s.passcode) {
    return Response.json({ ok: true });
  }

  if (passcode !== s.passcode) {
    return Response.json({ error: '口令错误' }, { status: 401 });
  }

  const value = shareCookieValue(token, s.passcode);
  const res = Response.json({ ok: true });
  res.headers.append(
    'Set-Cookie',
    `${shareCookieName(token)}=${value}; HttpOnly; Path=${path}; Max-Age=604800; SameSite=Lax`
  );
  return res;
}
