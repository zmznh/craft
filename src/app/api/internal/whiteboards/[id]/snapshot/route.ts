import { NextRequest } from 'next/server';
import { getTable } from '@/lib/authz/guard';
import { isInternalRequest, unauthorized } from '@/lib/whiteboard-sharing/internal-auth';

const MAX_SNAPSHOT_BYTES = 20 * 1024 * 1024;

/**
 * Snapshot checkpoint store for the sync service. The room is authoritative
 * while it is live; this row is what a restarted server rehydrates from.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isInternalRequest(request)) return unauthorized();

  const { id } = await params;
  const board = await (await getTable('Whiteboard')).first({ id });
  if (!board || board.isDeleted) {
    return Response.json({ error: '白板不存在' }, { status: 404 });
  }

  return Response.json({ snapshot: board.data ?? null });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isInternalRequest(request)) return unauthorized();

  if (Number(request.headers.get('content-length') ?? 0) > MAX_SNAPSHOT_BYTES) {
    return Response.json({ error: '快照过大' }, { status: 413 });
  }

  const { id } = await params;
  const body = (await request.json().catch(() => null)) as { snapshot?: unknown } | null;
  if (!body || body.snapshot === undefined) {
    return Response.json({ error: '缺少 snapshot' }, { status: 400 });
  }

  const board = await (await getTable('Whiteboard')).first({ id });
  if (!board || board.isDeleted) {
    return Response.json({ error: '白板不存在' }, { status: 404 });
  }

  await (await getTable('Whiteboard')).where({ id }).update({
    data: body.snapshot as Record<string, unknown>,
  });

  return Response.json({ ok: true });
}
