import { NextRequest } from 'next/server';
import { AuthorizationError, getTable, requireUserId } from '@/lib/authz/guard';
import { resolveDocumentAccess } from '@/lib/authz/document-access';

/**
 * A room with no Yjs history is seeded from the legacy `Document.content` the
 * first time it is opened. Two devices doing that concurrently insert the same
 * body into the CRDT independently, and merging two inserts yields two copies —
 * the document doubles. So exactly one client may claim the right to seed.
 *
 * The claim is the `yjs_document_states` row itself, guarded by its unique
 * documentId index: first insert wins.
 */
const STALE_CLAIM_MS = 5 * 60 * 1000;

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
  if (access.role === 'viewer') {
    return Response.json({ error: '只读用户不能播种' }, { status: 403 });
  }

  const states = await getTable('YjsDocumentState');
  const existing = await states.first({ documentId });

  if (existing) {
    // A claim that never produced any bytes means the seeder died mid-way; let
    // someone else take over rather than leaving the document blank forever.
    const claimedAt = new Date(existing.updatedAt as string).getTime();
    const age = Number.isNaN(claimedAt) ? Infinity : Date.now() - claimedAt;
    const stale = Number(existing.bytes ?? 0) === 0 && age > STALE_CLAIM_MS;
    if (!stale) return Response.json({ granted: false });

    await states.where({ id: existing.id }).update({ bytes: 0 });
    return Response.json({ granted: true });
  }

  try {
    await states.create({
      id: crypto.randomUUID(),
      documentId,
      state: new Uint8Array(0),
      bytes: 0,
    });
    return Response.json({ granted: true });
  } catch {
    // Lost the race on the unique index — another client owns the seed.
    return Response.json({ granted: false });
  }
}
