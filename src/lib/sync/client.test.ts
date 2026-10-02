import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  SYNC_CURSOR_KEY_PREFIX,
  SyncHttpError,
  SyncPayloadError,
  SyncUnauthorizedError,
  createMetadataSync,
  cursorStorageKey,
  fetchSyncChanges,
  mergePayload,
  parseSyncPayload,
  readStoredCursor,
  rowKey,
  writeStoredCursor,
  type SyncPayload,
  type SyncRow,
} from './client';

const CURSOR = '2026-10-01T04:00:00.000Z';

function payload(overrides: Partial<SyncPayload> = {}): SyncPayload {
  return { cursor: CURSOR, hasMore: false, changes: {}, full: {}, ...overrides };
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function fakeStorage() {
  const map = new Map<string, string>();
  return {
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => void map.set(key, value),
    map,
  };
}

describe('rowKey', () => {
  it('uses id for ordinary tables', () => {
    expect(rowKey('Document', { id: 'doc-1' })).toBe('doc-1');
  });

  it('composes the parent columns for tables without an id', () => {
    expect(rowKey('DocumentTag', { documentId: 'doc-1', tagId: 'tag-1' })).toBe('doc-1\u0000tag-1');
    // Backlink's unique key is (sourceDocumentId, linkedDocumentId) — the
    // nullable sourceBlockId is data, not identity.
    expect(
      rowKey('Backlink', {
        sourceDocumentId: 'a',
        linkedDocumentId: 'b',
        sourceBlockId: 'c',
      }),
    ).toBe('a\u0000b');
  });

  it('separates rows that would collide if concatenated naively', () => {
    const left = rowKey('DocumentTag', { documentId: 'a', tagId: 'bc' });
    const right = rowKey('DocumentTag', { documentId: 'ab', tagId: 'c' });
    expect(left).not.toBe(right);
  });

  it('keeps a row whose key column is present but null', () => {
    // Nullable columns must not silently drop the row from the local cache —
    // and null has to stay distinguishable from the empty string.
    expect(rowKey('Document', { id: null })).toBe('\u0001');
    expect(rowKey('Document', { id: '' })).toBe('');
    expect(rowKey('Document', { id: null })).not.toBe(rowKey('Document', { id: '' }));
  });

  it('returns null only when the payload is missing a key column entirely', () => {
    expect(rowKey('Document', { title: 'no id' })).toBeNull();
    expect(rowKey('DocumentTag', { documentId: 'doc-1' })).toBeNull();
    expect(rowKey('Backlink', { sourceDocumentId: 'a' })).toBeNull();
  });
});

describe('parseSyncPayload', () => {
  it('accepts the documented shape', () => {
    const parsed = parseSyncPayload({
      cursor: CURSOR,
      hasMore: true,
      changes: { Document: [{ id: 'd1' }] },
      full: { Tag: [{ id: 't1' }] },
    });
    expect(parsed?.hasMore).toBe(true);
    expect(parsed?.changes.Document).toHaveLength(1);
  });

  it('rejects junk instead of half-applying it', () => {
    expect(parseSyncPayload(null)).toBeNull();
    expect(parseSyncPayload('nope')).toBeNull();
    expect(parseSyncPayload([])).toBeNull();
    expect(parseSyncPayload({ cursor: 'not-a-date', changes: {}, full: {} })).toBeNull();
    expect(parseSyncPayload({ cursor: CURSOR, changes: [], full: {} })).toBeNull();
    expect(parseSyncPayload({ cursor: CURSOR, changes: {}, full: { Tag: ['x'] } })).toBeNull();
    expect(parseSyncPayload({ cursor: CURSOR, changes: { Document: [null] }, full: {} })).toBeNull();
  });

  it('treats a missing table map as empty and hasMore as false unless true', () => {
    const parsed = parseSyncPayload({ cursor: CURSOR });
    expect(parsed).toEqual({ cursor: CURSOR, hasMore: false, changes: {}, full: {} });
  });
});

describe('mergePayload', () => {
  const doc = (over: SyncRow = {}): SyncRow => ({
    id: 'd1',
    title: 'A',
    updatedAt: '2026-10-01 12:00:00.000+08',
    ...over,
  });

  it('applies new rows by id', () => {
    const outcome = mergePayload({}, payload({ changes: { Document: [doc()] } }));
    expect(outcome.tables.Document.d1).toEqual(doc());
    expect(outcome.changedTables).toEqual(['Document']);
    expect(outcome.applied).toBe(1);
  });

  it('is idempotent: a replayed row changes nothing', () => {
    const first = mergePayload({}, payload({ changes: { Document: [doc()] } }));
    const second = mergePayload(first.tables, payload({ changes: { Document: [doc()] } }));
    expect(second.changedTables).toEqual([]);
    expect(second.applied).toBe(0);
    expect(second.tables.Document.d1).toEqual(doc());
  });

  it('overwrites the same id when the far side edited it', () => {
    const first = mergePayload({}, payload({ changes: { Document: [doc()] } }));
    const second = mergePayload(
      first.tables,
      payload({ changes: { Document: [doc({ title: 'B' })] } }),
    );
    expect(second.tables.Document.d1.title).toBe('B');
    expect(second.changedTables).toEqual(['Document']);
  });

  it('replaces full tables wholesale so deletions land', () => {
    const first = mergePayload(
      {},
      payload({ full: { Tag: [{ id: 't1', name: 'a' }, { id: 't2', name: 'b' }] } }),
    );
    expect(Object.keys(first.tables.Tag)).toEqual(['t1', 't2']);

    const second = mergePayload(first.tables, payload({ full: { Tag: [{ id: 't1', name: 'a' }] } }));
    expect(Object.keys(second.tables.Tag)).toEqual(['t1']);
    expect(second.changedTables).toEqual(['Tag']);

    const third = mergePayload(second.tables, payload({ full: { Tag: [{ id: 't1', name: 'a' }] } }));
    expect(third.changedTables).toEqual([]);
  });

  it('keys composite tables and skips rows with no usable key', () => {
    const outcome = mergePayload(
      {},
      payload({
        full: {
          DocumentTag: [{ documentId: 'd1', tagId: 't1' }, { documentId: 'd1' }],
        },
      }),
    );
    expect(Object.keys(outcome.tables.DocumentTag)).toEqual(['d1\u0000t1']);
    expect(outcome.skipped).toBe(1);
  });

  it('never mutates the map it was handed', () => {
    const before: Record<string, Record<string, SyncRow>> = {};
    mergePayload(before, payload({ changes: { Document: [doc()] } }));
    expect(before).toEqual({});
  });
});

describe('fetchSyncChanges', () => {
  it('sends since and limit, and parses the response', async () => {
    const fetchImpl = vi.fn(async () => jsonResponse(payload())) as unknown as typeof fetch;
    const result = await fetchSyncChanges({
      since: CURSOR,
      limit: 500,
      fetchImpl,
      endpoint: '/api/sync/changes',
    });
    expect(result.cursor).toBe(CURSOR);
    const url = String((fetchImpl as unknown as ReturnType<typeof vi.fn>).mock.calls[0][0]);
    expect(url).toBe(`/api/sync/changes?since=${encodeURIComponent(CURSOR)}&limit=500`);
  });

  it('omits since on a cold pull', async () => {
    const fetchImpl = vi.fn(async () => jsonResponse(payload())) as unknown as typeof fetch;
    await fetchSyncChanges({ since: null, fetchImpl, endpoint: '/api/sync/changes' });
    expect(String((fetchImpl as unknown as ReturnType<typeof vi.fn>).mock.calls[0][0])).toBe(
      '/api/sync/changes',
    );
  });

  it('maps 401 to SyncUnauthorizedError and other statuses to SyncHttpError', async () => {
    const unauthorized = vi.fn(async () => jsonResponse({ error: '未授权' }, 401)) as unknown as typeof fetch;
    await expect(fetchSyncChanges({ since: null, fetchImpl: unauthorized })).rejects.toBeInstanceOf(
      SyncUnauthorizedError,
    );

    const broken = vi.fn(async () => jsonResponse({ error: '同步失败' }, 500)) as unknown as typeof fetch;
    await expect(fetchSyncChanges({ since: null, fetchImpl: broken })).rejects.toBeInstanceOf(
      SyncHttpError,
    );
  });

  it('rejects a 200 that is not JSON or not the contract', async () => {
    const notJson = vi.fn(async () => new Response('<html>', { status: 200 })) as unknown as typeof fetch;
    await expect(fetchSyncChanges({ since: null, fetchImpl: notJson })).rejects.toBeInstanceOf(
      SyncPayloadError,
    );

    const wrongShape = vi.fn(async () => jsonResponse({ cursor: 'nope' })) as unknown as typeof fetch;
    await expect(fetchSyncChanges({ since: null, fetchImpl: wrongShape })).rejects.toBeInstanceOf(
      SyncPayloadError,
    );
  });

  it('propagates a network failure so the loop can back off', async () => {
    const offline = vi.fn(async () => {
      throw new TypeError('fetch failed');
    }) as unknown as typeof fetch;
    await expect(fetchSyncChanges({ since: null, fetchImpl: offline })).rejects.toBeInstanceOf(
      TypeError,
    );
  });
});

describe('createMetadataSync', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function harness(responses: Array<() => Promise<Response>>) {
    let cursor: string | null = null;
    const applied: SyncPayload[] = [];
    const statuses: string[] = [];
    const fetchImpl = vi.fn(async () => {
      const next = responses.shift();
      if (!next) throw new Error('unexpected extra request');
      return next();
    }) as unknown as typeof fetch;

    const sync = createMetadataSync({
      getCursor: () => cursor,
      setCursor: (next) => {
        cursor = next;
      },
      onPayload: (p) => {
        applied.push(p);
      },
      onStatus: (s) => statuses.push(s.state),
      fetchImpl,
      intervalMs: 2500,
      retryMaxMs: 10_000,
    });

    return {
      sync,
      applied,
      statuses,
      fetchImpl,
      calls: () => (fetchImpl as unknown as ReturnType<typeof vi.fn>).mock.calls.length,
      urlAt: (index: number) =>
        String((fetchImpl as unknown as ReturnType<typeof vi.fn>).mock.calls[index][0]),
      cursor: () => cursor,
    };
  }

  it('pulls immediately on start', async () => {
    const h = harness([async () => jsonResponse(payload())]);
    h.sync.start();
    await vi.advanceTimersByTimeAsync(0);
    expect(h.calls()).toBe(1);
    expect(h.urlAt(0)).not.toContain('since=');
    expect(h.cursor()).toBe(CURSOR);
    h.sync.stop();
  });

  it('follows hasMore within the same tick, carrying the new cursor', async () => {
    const first = '2026-10-01T04:00:00.000Z';
    const second = '2026-10-01T04:00:05.000Z';
    const h = harness([
      async () => jsonResponse(payload({ cursor: first, hasMore: true })),
      async () => jsonResponse(payload({ cursor: second, hasMore: false })),
    ]);

    h.sync.start();
    await vi.advanceTimersByTimeAsync(0);

    // No timer wait between the two pages.
    expect(h.calls()).toBe(2);
    expect(h.urlAt(1)).toContain(`since=${encodeURIComponent(first)}`);
    expect(h.cursor()).toBe(second);
    h.sync.stop();
  });

  it('polls again on the interval after a clean tick', async () => {
    const h = harness([
      async () => jsonResponse(payload()),
      async () => jsonResponse(payload()),
    ]);
    h.sync.start();
    await vi.advanceTimersByTimeAsync(0);
    expect(h.calls()).toBe(1);

    await vi.advanceTimersByTimeAsync(2499);
    expect(h.calls()).toBe(1);
    await vi.advanceTimersByTimeAsync(1);
    expect(h.calls()).toBe(2);
    h.sync.stop();
  });

  it('backs off on failure, keeps the cursor, and recovers', async () => {
    const h = harness([
      async () => {
        throw new TypeError('fetch failed');
      },
      async () => jsonResponse(payload()),
    ]);

    h.sync.start();
    await vi.advanceTimersByTimeAsync(0);
    expect(h.calls()).toBe(1);
    expect(h.statuses).toContain('error');
    expect(h.cursor()).toBeNull(); // never advanced past rows we did not apply

    // The first retry waits 5s (2.5s * 2^1), not the base interval.
    await vi.advanceTimersByTimeAsync(2500);
    expect(h.calls()).toBe(1);
    await vi.advanceTimersByTimeAsync(2500);
    expect(h.calls()).toBe(2);
    expect(h.cursor()).toBe(CURSOR);

    // A clean tick resets the cadence.
    await vi.advanceTimersByTimeAsync(2500);
    expect(h.calls()).toBe(3);
    h.sync.stop();
  });

  it('does not advance the cursor when applying the payload throws', async () => {
    let cursor: string | null = null;
    const fetchImpl = vi.fn(async () => jsonResponse(payload())) as unknown as typeof fetch;
    const sync = createMetadataSync({
      getCursor: () => cursor,
      setCursor: (next) => {
        cursor = next;
      },
      onPayload: () => {
        throw new Error('store blew up');
      },
      fetchImpl,
      intervalMs: 2500,
    });

    sync.start();
    await vi.advanceTimersByTimeAsync(0);
    expect(cursor).toBeNull();
    sync.stop();
  });

  it('stops polling after a 401 instead of hammering the route', async () => {
    const h = harness([async () => jsonResponse({ error: '未授权' }, 401)]);
    h.sync.start();
    await vi.advanceTimersByTimeAsync(0);
    expect(h.calls()).toBe(1);
    expect(h.statuses).toContain('unauthorized');

    await vi.advanceTimersByTimeAsync(120_000);
    expect(h.calls()).toBe(1);
    h.sync.stop();
  });

  it('syncNow pulls without waiting for the timer, and folds extra calls into one re-run', async () => {
    const h = harness([
      async () => jsonResponse(payload()),
      async () => jsonResponse(payload()),
      async () => jsonResponse(payload()),
    ]);
    h.sync.start();
    await vi.advanceTimersByTimeAsync(0);
    expect(h.calls()).toBe(1);

    // First wake-up starts a pull straight away; the second arrives while that
    // pull is in flight, so it is collapsed into a single pending re-run rather
    // than a third parallel request.
    h.sync.syncNow();
    h.sync.syncNow();
    await vi.advanceTimersByTimeAsync(0);
    expect(h.calls()).toBe(3);
    h.sync.stop();
  });

  it('caps the page loop when the server keeps claiming hasMore', async () => {
    let cursor: string | null = null;
    const fetchImpl = vi.fn(async () =>
      jsonResponse(payload({ hasMore: true })),
    ) as unknown as typeof fetch;
    const sync = createMetadataSync({
      getCursor: () => cursor,
      setCursor: (next) => {
        cursor = next;
      },
      onPayload: () => {},
      fetchImpl,
      intervalMs: 2500,
      maxPagesPerTick: 3,
    });

    sync.start();
    await vi.advanceTimersByTimeAsync(0);
    expect((fetchImpl as unknown as ReturnType<typeof vi.fn>).mock.calls.length).toBe(3);
    sync.stop();
  });

  it('stop() halts the loop', async () => {
    const h = harness([async () => jsonResponse(payload())]);
    h.sync.start();
    await vi.advanceTimersByTimeAsync(0);
    h.sync.stop();
    await vi.advanceTimersByTimeAsync(60_000);
    expect(h.calls()).toBe(1);
  });
});

describe('cursor persistence', () => {
  it('round-trips a cursor per user', () => {
    const storage = fakeStorage();
    expect(readStoredCursor('u1', storage)).toBeNull();
    writeStoredCursor('u1', CURSOR, storage);
    expect(readStoredCursor('u1', storage)).toBe(CURSOR);
    // Another account must not inherit the first one's cursor.
    expect(readStoredCursor('u2', storage)).toBeNull();
    expect(storage.map.get(cursorStorageKey('u1'))).toBe(CURSOR);
    expect(cursorStorageKey('u1').startsWith(SYNC_CURSOR_KEY_PREFIX)).toBe(true);
  });

  it('ignores a corrupted stored value and refuses to store junk', () => {
    const storage = fakeStorage();
    storage.map.set(cursorStorageKey(null), 'not-a-date');
    expect(readStoredCursor(null, storage)).toBeNull();

    writeStoredCursor(null, 'still-not-a-date', storage);
    expect(storage.map.has(cursorStorageKey(null))).toBe(true); // pre-existing value untouched
    expect(storage.map.get(cursorStorageKey(null))).toBe('not-a-date');
  });

  it('degrades to no cursor when storage is unavailable', () => {
    const throwing = {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('blocked');
      },
    };
    expect(readStoredCursor('u1', throwing)).toBeNull();
    expect(() => writeStoredCursor('u1', CURSOR, throwing)).not.toThrow();
    expect(readStoredCursor('u1', null)).toBeNull();
  });
});
