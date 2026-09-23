import { NextRequest } from 'next/server';
import { createHmac } from 'node:crypto';
import { auth } from '@/lib/auth/auth';
import { getDb } from '@/prisma/db';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: '未授权' }, { status: 401 });
  }

  let body: { documentId?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: '无效请求' }, { status: 400 });
  }
  const documentId = body.documentId;
  if (!documentId) {
    return Response.json({ error: '缺少 documentId' }, { status: 400 });
  }

  const db = await getDb();
  const document = await db.orm.public.Document.first({ id: documentId });
  if (!document || (document as { userId: string }).userId !== session.user.id) {
    return Response.json({ error: '文档不存在' }, { status: 404 });
  }

  const secret = process.env.NEXTAUTH_SECRET || 'dev-secret';
  const expires = Date.now() + 30 * 60 * 1000;
  const payload = Buffer.from(
    JSON.stringify({ docId: documentId, userId: session.user.id, exp: expires }),
  ).toString('base64url');
  const signature = createHmac('sha256', secret).update(payload).digest('base64url');

  return Response.json({ token: `${payload}.${signature}` });
}
