import { NextRequest } from 'next/server';
import { getTable } from '@/lib/authz/guard';
import { isInternalRequest, unauthorized } from '@/lib/whiteboard-sharing/internal-auth';

/**
 * Read by the sync service on every connection so a revoked or downgraded share
 * link is rejected even if its signed claim has not expired yet.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isInternalRequest(request)) return unauthorized();

  const { id } = await params;
  const board = await (await getTable('Whiteboard')).first({ id });
  if (!board) {
    return Response.json({ exists: false }, { status: 404 });
  }

  return Response.json({
    exists: true,
    isDeleted: Boolean(board.isDeleted),
    permission: board.sharePermission,
    shareVersion: board.shareVersion,
    ownerId: board.userId,
  });
}
