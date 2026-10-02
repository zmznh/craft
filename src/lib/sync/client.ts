/**
 * Client half of the metadata sync (ADR-0003).
 *
 * Server side lives in `./changes.ts` + `GET /api/sync/changes`. This module is
 * deliberately framework-free — no React, no zustand — so the polling loop can
 * be unit-tested with an injected `fetch` and fake timers.
 *
 * Contract reminders that shape the code below:
 *   * `changes` is cursor-driven (`updatedAt > since`), `full` ships whole on
 *     every request because those tables have no `updatedAt` column.
 *   * The cursor is millisecond-truncated while Postgres stores microseconds,
 *     so the last millisecond of every page is replayed once. Applying by id is
 *     idempotent, which is why a replayed row must not count as "changed".
 *   * The body (`Document.content`) and the whiteboard scene (`Whiteboard.data`)
 *     are not in the payload at all — Yjs and tldraw-sync own them.
 */

export type SyncRow = Record<string, unknown>;

export interface SyncPayload {
  /** Pass back as `since` on the next request. ISO-8601 UTC. */
  cursor: string;
  /** At least one table hit the per-table limit — poll again immediately. */
  hasMore: boolean;
  changes: Record<string, SyncRow[]>;
  full: Record<string, SyncRow[]>;
}

/** Default poll cadence. ADR-0003 targets 2–3s, not realtime. */
export const SYNC_POLL_INTERVAL_MS = 2500;
/** Backoff ceiling after repeated failures. */
export const SYNC_RETRY_MAX_MS = 30_000;
/** Stop pulling inside one tick after this many pages, whatever the server says. */
export const SYNC_MAX_PAGES_PER_TICK = 20;

export const SYNC_ENDPOINT = '/api/sync/changes';

/**
 * Tables whose rows have no single `id` column in the payload. Keys follow the
 * schema's real uniqueness (`src/prisma/contract.prisma`):
 *   * `DocumentTag` — `@@id([documentId, tagId])`
 *   * `Backlink`    — `@@unique([sourceDocumentId, linkedDocumentId])`
 *     (`sourceBlockId` is nullable and deliberately *not* part of the key)
 */
export const COMPOSITE_ROW_KEYS: Record<string, readonly string[]> = {
  DocumentTag: ['documentId', 'tagId'],
  Backlink: ['sourceDocumentId', 'linkedDocumentId'],
};

/** Separator that cannot appear in an id, so keys cannot collide by concatenation. */
const KEY_SEPARATOR = '\u0000';
/** Stands in for a nullable key column, so `null` and `''` stay distinct. */
const NULL_KEY_PART = '\u0001';

/**
 * Primary key of a row within its table, or `null` when the payload does not
 * even carry the key columns (malformed — skipped rather than guessed at). A
 * column that is present but null still yields a key: the row exists.
 */
export function rowKey(table: string, row: SyncRow): string | null {
  const fields = COMPOSITE_ROW_KEYS[table] ?? ['id'];
  const parts: string[] = [];
  for (const field of fields) {
    const value = row[field];
    if (value === undefined) return null;
    parts.push(value === null ? NULL_KEY_PART : String(value));
  }
  return parts.join(KEY_SEPARATOR);
}

export interface MergeOutcome {
  /** New table map. The input map is never mutated. */
  tables: Record<string, Record<string, SyncRow>>;
  /** Tables whose stored rows actually differ from what we already had. */
  changedTables: string[];
  /** Incremental rows written (replays excluded). */
  applied: number;
  /** Rows dropped because they had no usable key. */
  skipped: number;
}

/**
 * Folds a payload into the local table cache, idempotently.
 *
 * `changes` tables are merged row by row — a replayed row (same key, same
 * content) is ignored so it cannot wake up the UI every poll. `full` tables are
 * *replaced*, because the server sends them complete and that is the only way a
 * deletion can land: those tables have neither `updatedAt` nor a soft-delete
 * column.
 */
export function mergePayload(
  current: Record<string, Record<string, SyncRow>>,
  payload: SyncPayload,
): MergeOutcome {
  const tables: Record<string, Record<string, SyncRow>> = { ...current };
  const changed = new Set<string>();
  let applied = 0;
  let skipped = 0;

  for (const [table, rows] of Object.entries(payload.changes)) {
    const bucket = { ...(tables[table] ?? {}) };
    for (const row of rows) {
      const key = rowKey(table, row);
      if (key === null) {
        skipped += 1;
        continue;
      }
      const previous = bucket[key];
      if (previous && sameRow(previous, row)) continue;
      bucket[key] = row;
      changed.add(table);
      applied += 1;
    }
    tables[table] = bucket;
  }

  for (const [table, rows] of Object.entries(payload.full)) {
    const bucket: Record<string, SyncRow> = {};
    for (const row of rows) {
      const key = rowKey(table, row);
      if (key === null) {
        skipped += 1;
        continue;
      }
      bucket[key] = row;
    }
    if (!sameBucket(tables[table] ?? {}, bucket)) changed.add(table);
    tables[table] = bucket;
  }

  return { tables, changedTables: [...changed], applied, skipped };
}

function sameRow(a: SyncRow, b: SyncRow): boolean {
  const keys = Object.keys(a);
  if (keys.length !== Object.keys(b).length) return false;
  for (const key of keys) {
    if (!(key in b)) return false;
    if (!sameValue(a[key], b[key])) return false;
  }
  return true;
}

function sameValue(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a === null || b === null || a === undefined || b === undefined) return false;
  if (typeof a === 'object' || typeof b === 'object') {
    try {
      return JSON.stringify(a) === JSON.stringify(b);
    } catch {
      return false;
    }
  }
  return false;
}

function sameBucket(
  a: Record<string, SyncRow>,
  b: Record<string, SyncRow>,
): boolean {
  const aKeys = Object.keys(a);
  if (aKeys.length !== Object.keys(b).length) return false;
  for (const key of aKeys) {
    const other = b[key];
    if (!other || !sameRow(a[key], other)) return false;
  }
  return true;
}

export class SyncHttpError extends Error {
  readonly status: number;
  constructor(status: number, message?: string) {
    super(message ?? `同步接口返回 ${status}`);
    this.name = 'SyncHttpError';
    this.status = status;
  }
}

/** Session is gone — retrying would just hammer a 401. */
export class SyncUnauthorizedError extends SyncHttpError {
  constructor() {
    super(401, '未授权');
    this.name = 'SyncUnauthorizedError';
  }
}

/** Response was 200 but not the shape the route promises. */
export class SyncPayloadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SyncPayloadError';
  }
}

function parseTableMap(value: unknown): Record<string, SyncRow[]> | null {
  if (value === undefined || value === null) return {};
  if (typeof value !== 'object' || Array.isArray(value)) return null;
  const out: Record<string, SyncRow[]> = {};
  for (const [table, rows] of Object.entries(value as Record<string, unknown>)) {
    if (!Array.isArray(rows)) return null;
    for (const row of rows) {
      if (!row || typeof row !== 'object' || Array.isArray(row)) return null;
    }
    out[table] = rows as SyncRow[];
  }
  return out;
}

/** Validates the wire shape. Returns `null` instead of throwing so callers decide. */
export function parseSyncPayload(value: unknown): SyncPayload | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const raw = value as Record<string, unknown>;
  if (typeof raw.cursor !== 'string' || Number.isNaN(Date.parse(raw.cursor))) return null;
  const changes = parseTableMap(raw.changes);
  const full = parseTableMap(raw.full);
  if (!changes || !full) return null;
  return {
    cursor: raw.cursor,
    hasMore: raw.hasMore === true,
    changes,
    full,
  };
}

export interface FetchSyncOptions {
  since: string | null;
  limit?: number;
  signal?: AbortSignal;
  fetchImpl?: typeof fetch;
  endpoint?: string;
}

/**
 * One pull. Throws `SyncUnauthorizedError` / `SyncHttpError` /
 * `SyncPayloadError`; the polling loop is the only place that catches them.
 */
export async function fetchSyncChanges(options: FetchSyncOptions): Promise<SyncPayload> {
  const fetchImpl = options.fetchImpl ?? globalThis.fetch;
  if (typeof fetchImpl !== 'function') throw new SyncHttpError(0, 'fetch 不可用');

  const endpoint = options.endpoint ?? SYNC_ENDPOINT;
  const params = new URLSearchParams();
  if (options.since) params.set('since', options.since);
  if (options.limit) params.set('limit', String(options.limit));
  const query = params.toString();

  const response = await fetchImpl(query ? `${endpoint}?${query}` : endpoint, {
    method: 'GET',
    headers: { accept: 'application/json' },
    credentials: 'same-origin',
    cache: 'no-store',
    signal: options.signal,
  });

  if (response.status === 401 || response.status === 403) throw new SyncUnauthorizedError();
  if (!response.ok) throw new SyncHttpError(response.status);

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new SyncPayloadError('响应不是 JSON');
  }

  const payload = parseSyncPayload(body);
  if (!payload) throw new SyncPayloadError('响应形状不符合契约');
  return payload;
}

export type SyncStateName = 'idle' | 'syncing' | 'error' | 'unauthorized';

export interface SyncStatusSnapshot {
  state: SyncStateName;
  error?: string;
  /** Consecutive failures; 0 right after a clean tick. */
  failures: number;
}

export interface MetadataSyncOptions {
  getCursor: () => string | null;
  setCursor: (cursor: string) => void;
  onPayload: (payload: SyncPayload) => void;
  onStatus?: (status: SyncStatusSnapshot) => void;
  fetchImpl?: typeof fetch;
  endpoint?: string;
  intervalMs?: number;
  retryMaxMs?: number;
  limit?: number;
  maxPagesPerTick?: number;
}

export interface MetadataSync {
  start: () => void;
  stop: () => void;
  /** Pull now instead of waiting for the timer (focus / online / visibility). */
  syncNow: () => void;
  isRunning: () => boolean;
}

/**
 * The polling loop.
 *
 * Guarantees that matter to the UI:
 *   * `hasMore` is honoured immediately — the next page is fetched in the same
 *     tick, not on the next interval.
 *   * The cursor only advances after the payload has been applied, so a throw
 *     in the store cannot silently skip rows.
 *   * Every failure is swallowed: a 500 or a dropped connection backs off
 *     (2.5s → 5s → 10s … capped at 30s) and recovers on its own. A 401 stops
 *     the loop until the provider remounts.
 */
export function createMetadataSync(options: MetadataSyncOptions): MetadataSync {
  const intervalMs = options.intervalMs ?? SYNC_POLL_INTERVAL_MS;
  const retryMaxMs = options.retryMaxMs ?? SYNC_RETRY_MAX_MS;
  const maxPages = options.maxPagesPerTick ?? SYNC_MAX_PAGES_PER_TICK;

  let timer: ReturnType<typeof setTimeout> | null = null;
  let running = false;
  let pending = false;
  let failures = 0;
  let stopped = true;
  let halted = false;

  function emit(status: SyncStatusSnapshot): void {
    try {
      options.onStatus?.(status);
    } catch {
      // A broken status listener must not take the loop down.
    }
  }

  function nextDelay(): number {
    if (failures === 0) return intervalMs;
    return Math.min(intervalMs * 2 ** Math.min(failures, 6), retryMaxMs);
  }

  function clearTimer(): void {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
  }

  function schedule(): void {
    if (stopped || halted) return;
    clearTimer();
    timer = setTimeout(() => {
      timer = null;
      void tick();
    }, nextDelay());
  }

  async function tick(): Promise<void> {
    if (stopped || halted) return;
    if (running) {
      pending = true;
      return;
    }
    running = true;
    emit({ state: 'syncing', failures });

    try {
      let pages = 0;
      let hasMore = true;
      while (hasMore) {
        const payload = await fetchSyncChanges({
          since: options.getCursor(),
          limit: options.limit,
          fetchImpl: options.fetchImpl,
          endpoint: options.endpoint,
        });
        // Apply first, advance the cursor second: if the store throws, the
        // rows stay ahead of the cursor and get retried instead of lost.
        options.onPayload(payload);
        options.setCursor(payload.cursor);
        hasMore = payload.hasMore;
        pages += 1;
        if (pages >= maxPages) break;
      }
      failures = 0;
      emit({ state: 'idle', failures });
    } catch (error) {
      if (error instanceof SyncUnauthorizedError) {
        halted = true;
        emit({ state: 'unauthorized', failures });
      } else {
        failures += 1;
        emit({ state: 'error', error: describeError(error), failures });
      }
    } finally {
      running = false;
      schedule();
      if (pending) {
        pending = false;
        if (!stopped && !halted) void tick();
      }
    }
  }

  return {
    start() {
      stopped = false;
      halted = false;
      failures = 0;
      void tick();
    },
    stop() {
      stopped = true;
      pending = false;
      clearTimer();
    },
    syncNow() {
      if (stopped || halted) return;
      if (running) {
        pending = true;
        return;
      }
      clearTimer();
      void tick();
    },
    isRunning() {
      return running;
    },
  };
}

function describeError(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

// --- cursor persistence ----------------------------------------------------
//
// localStorage is enough here: single user, and the worst case for a lost
// cursor is one full pull, which is what a cold start does anyway.

export const SYNC_CURSOR_KEY_PREFIX = 'crafty:sync-cursor:v1';

type StorageLike = Pick<Storage, 'getItem' | 'setItem'>;

export function cursorStorageKey(userId: string | null): string {
  return `${SYNC_CURSOR_KEY_PREFIX}:${userId ?? 'anonymous'}`;
}

function resolveStorage(explicit?: StorageLike | null): StorageLike | null {
  if (explicit !== undefined) return explicit;
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage ?? null;
  } catch {
    // Storage can throw outright in a locked-down browser profile.
    return null;
  }
}

/** Returns a usable ISO cursor, or `null` for "no cursor" (=> full pull). */
export function readStoredCursor(
  userId: string | null,
  storage?: StorageLike | null,
): string | null {
  const store = resolveStorage(storage);
  if (!store) return null;
  try {
    const raw = store.getItem(cursorStorageKey(userId));
    if (!raw || Number.isNaN(Date.parse(raw))) return null;
    return raw;
  } catch {
    return null;
  }
}

export function writeStoredCursor(
  userId: string | null,
  cursor: string,
  storage?: StorageLike | null,
): void {
  const store = resolveStorage(storage);
  if (!store || Number.isNaN(Date.parse(cursor))) return;
  try {
    store.setItem(cursorStorageKey(userId), cursor);
  } catch {
    // Quota or private mode: the in-memory cursor still keeps this session going.
  }
}
