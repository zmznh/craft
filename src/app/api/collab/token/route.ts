import { NextRequest } from 'next/server';
import { createHmac } from 'node:crypto';
import { AuthorizationError, getTable, requireUserId } from '@/lib/authz/guard';
import { resolveDocumentAccess } from '@/lib/authz/document-access';
import { requireSecret } from '@/lib/env/secret';
import type { ResourceRole } from '@/lib/authz/resource';

export const TOKEN_TTL_MS = 30 * 60 * 1000;

export interface CollabClaims {
  docId: string;
  userId: string;
  role: ResourceRole;
  readOnly: boolean;
  exp: number;
}

export function signCollabToken(claims: CollabClaims): string {
  const secret = requireSecret(['COLLAB_SECRET', 'AUTH_SECRET', 'NEXTAUTH_SECRET']);
  const payload = Buffer.from(JSON.stringify(claims)).toString('base64url');
  const signature = createHmac('sha256', secret).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

export async function POST(req: NextRequest) {
  let userId: string;
  try {
    userId = await requireUserId();
  } catch (error) {
    const status = error instanceof AuthorizationError ? 401 : 500;
    return Response.json({ error: '未授权' }, { status });
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

  const access = await resolveDocumentAccess(documentId, userId);
  if (!access) {
    return Response.json({ error: '文档不存在' }, { status: 404 });
  }

  const readOnly = access.role === 'viewer' || access.role === 'commenter';
  const token = signCollabToken({
    docId: documentId,
    userId,
    role: access.role,
    readOnly,
    exp: Date.now() + TOKEN_TTL_MS,
  });

  const account = await (await getTable('User')).first({ id: userId });

  return Response.json({
    token,
    role: access.role,
    readOnly,
    user: {
      id: userId,
      name: (account?.name as string) || (account?.email as string) || '协作者',
    },
  });
}
