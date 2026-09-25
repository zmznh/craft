import { NextRequest } from 'next/server';
import { randomUUID } from 'crypto';
import { auth } from '@/lib/auth/auth';
import { getTable } from '@/lib/authz/guard';
import { canOpenWhiteboardShare, resolveShareRole, type WhiteboardSharePermission } from '@/lib/whiteboard-sharing/access';
import { signWhiteboardClaims } from '@/lib/whiteboard-sharing/token';

/**
 * Exchanges a board id (+ share token for visitors) for a short-lived, signed
 * connection claim. The role is decided here, never taken from the client.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await auth();
  const userId = session?.user?.id ?? null;

  const body = (await request.json().catch(() => ({}))) as { shareToken?: unknown };
  const shareToken = typeof body.shareToken === 'string' ? body.shareToken : null;

  const board = await (await getTable('Whiteboard')).first({ id });
  if (!board || board.isDeleted) {
    return Response.json({ error: '白板不存在' }, { status: 404 });
  }

  const permission = board.sharePermission as WhiteboardSharePermission;
  const isOwner = Boolean(userId) && board.userId === userId;

  if (!isOwner) {
    if (!shareToken || board.shareToken !== shareToken) {
      return Response.json({ error: '分享链接无效' }, { status: 403 });
    }
  }

  const role = resolveShareRole({ permission, isOwner: Boolean(isOwner), userId });
  if (!role || !canOpenWhiteboardShare(permission, role)) {
    return Response.json({ error: '没有访问权限' }, { status: 403 });
  }

  const token = signWhiteboardClaims({
    boardId: id,
    subject: userId ?? `anon:${randomUUID()}`,
    role,
    shareVersion: board.shareVersion as number,
  });

  return Response.json({
    token,
    role,
    shareVersion: board.shareVersion,
    syncUrl: process.env.NEXT_PUBLIC_TLDRAW_SYNC_URL ?? 'ws://localhost:3002',
  });
}
