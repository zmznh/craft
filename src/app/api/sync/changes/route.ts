import { NextRequest } from 'next/server';
import { AuthorizationError, requireUserId } from '@/lib/authz/guard';
import { collectChanges } from '@/lib/sync/changes';

// Session-dependent, per-request — never prerender or cache.
export const dynamic = 'force-dynamic';

/**
 * GET /api/sync/changes?since=<iso-or-epoch>&limit=<n>
 *
 * Incremental pull of sidebar/collection metadata. Document bodies are NOT here
 * on purpose: they are owned by Yjs and streamed over the collab WebSocket.
 */
export async function GET(req: NextRequest) {
  let userId: string;
  try {
    userId = await requireUserId();
  } catch (error) {
    const status = error instanceof AuthorizationError ? 401 : 500;
    return Response.json({ error: '未授权' }, { status });
  }

  const params = req.nextUrl.searchParams;

  const rawSince = params.get('since');
  let since: Date | null = null;
  if (rawSince) {
    // Accept either an epoch-ms number or an ISO-8601 string; the cursor we
    // hand back is ISO, but a number is convenient for debugging.
    const ms = /^\d+$/.test(rawSince) ? Number(rawSince) : Date.parse(rawSince);
    if (Number.isNaN(ms)) {
      return Response.json({ error: 'since 无效' }, { status: 400 });
    }
    since = new Date(ms);
  }

  const rawLimit = params.get('limit');
  let limit: number | undefined;
  if (rawLimit !== null) {
    limit = Number(rawLimit);
    if (!Number.isFinite(limit) || limit <= 0) {
      return Response.json({ error: 'limit 无效' }, { status: 400 });
    }
  }

  try {
    const result = await collectChanges({ userId, since, limit });
    return Response.json(result, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    console.error('[sync] changes failed', userId, error);
    return Response.json({ error: '同步失败' }, { status: 500 });
  }
}
