'use server';

import { createShareToken } from '@/lib/whiteboard-sharing/token';
import { isSharePermission, type WhiteboardSharePermission } from '@/lib/whiteboard-sharing/access';
import { assertOwned, getTable, requireUserId } from '@/lib/authz/guard';

export interface WhiteboardShareState {
  permission: WhiteboardSharePermission;
  url: string | null;
  shareVersion: number;
}

/**
 * Disconnects already-connected share clients so a revoked link stops working
 * immediately. The sync service is a separate process, so a failure here must
 * be visible to the owner instead of reporting a clean revoke.
 */
async function notifySyncService(boardId: string, shareVersion: number): Promise<boolean> {
  const url = process.env.TLDRAW_SYNC_INTERNAL_URL ?? 'http://localhost:3002';
  const secret = process.env.TLDRAW_INTERNAL_SECRET;
  if (!secret) {
    console.error('[share] TLDRAW_INTERNAL_SECRET is not set');
    return false;
  }

  try {
    const res = await fetch(`${url}/internal/revoke`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-crafty-internal': secret },
      body: JSON.stringify({ boardId, shareVersion }),
    });
    if (!res.ok) console.error('[share] revoke responded', res.status);
    return res.ok;
  } catch (error) {
    console.error('[share] revoke failed', error);
    return false;
  }
}

export async function getWhiteboardShare(whiteboardId: string): Promise<WhiteboardShareState> {
  const userId = await requireUserId();
  const board = await assertOwned<Record<string, unknown>>('Whiteboard', whiteboardId, userId, '白板不存在');

  return {
    permission: board.sharePermission as WhiteboardSharePermission,
    url: board.shareToken ? `${process.env.NEXTAUTH_URL ?? ''}/w/${board.shareToken}` : null,
    shareVersion: board.shareVersion as number,
  };
}

export interface SetShareResult extends WhiteboardShareState {
  /** false when the link is set but live share clients could not be disconnected. */
  disconnected: boolean;
}

export async function setWhiteboardShare(
  whiteboardId: string,
  permission: unknown,
): Promise<SetShareResult> {
  const userId = await requireUserId();
  if (!isSharePermission(permission)) throw new Error('无效的分享权限');
  await assertOwned<Record<string, unknown>>('Whiteboard', whiteboardId, userId, '白板不存在');

  const table = await getTable('Whiteboard');
  const board = await table.first({ id: whiteboardId });
  const shareVersion = ((board?.shareVersion as number) ?? 0) + 1;
  const shareToken = (board?.shareToken as string) ?? (permission === 'off' ? null : createShareToken());

  await table.where({ id: whiteboardId }).update({
    sharePermission: permission,
    shareToken,
    shareVersion,
  });

  // Turning a link off must reach the sync service too — that is exactly the
  // case where live visitors have to be disconnected.
  const disconnected = await notifySyncService(whiteboardId, shareVersion);

  return {
    permission,
    shareVersion,
    url: permission === 'off' || !shareToken ? null : `${process.env.NEXTAUTH_URL ?? ''}/w/${shareToken}`,
    disconnected,
  };
}

/** Public lookup used by /w/[token]; exposes only what a visitor may see. */
export async function resolveWhiteboardShareToken(token: string) {
  const table = await getTable('Whiteboard');
  const board = await table.first({ shareToken: token });
  if (!board || board.isDeleted) return null;

  const permission = board.sharePermission as WhiteboardSharePermission;
  if (permission === 'off') return null;

  return {
    id: board.id as string,
    name: board.name as string,
    icon: (board.icon as string) ?? null,
    permission,
    shareVersion: board.shareVersion as number,
  };
}
