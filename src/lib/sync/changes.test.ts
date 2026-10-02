import { config } from 'dotenv';

// The live-database cases below need DATABASE_URL. Next.js loads .env for us at
// runtime, but vitest does not — without this the driver never connects.
config();

import { describe, expect, it } from 'vitest';
import {
  FORBIDDEN_COLUMNS,
  INCREMENTAL_TABLES,
  SCOPED_INCREMENTAL_TABLES,
  FULL_TABLES,
  collectChanges,
  toEpochMs,
} from './changes';
import { getDb } from '@/prisma/db';

const ALL_SPECS = {
  ...INCREMENTAL_TABLES,
  ...SCOPED_INCREMENTAL_TABLES,
  ...FULL_TABLES,
};

describe('toEpochMs', () => {
  it('parses the raw timestamptz string postgres hands back', () => {
    // The pg driver returns this verbatim; it is NOT a Date.
    expect(toEpochMs('2026-09-29 18:06:49.485+08')).toBe(Date.parse('2026-09-29 18:06:49.485+08'));
  });

  it('accepts Date and epoch-milliseconds', () => {
    const d = new Date('2026-01-01T00:00:00.000Z');
    expect(toEpochMs(d)).toBe(d.getTime());
    expect(toEpochMs(1700000000000)).toBe(1700000000000);
  });

  it('returns NaN for junk instead of silently yielding 0', () => {
    expect(Number.isNaN(toEpochMs('not-a-date'))).toBe(true);
    expect(Number.isNaN(toEpochMs(null))).toBe(true);
    expect(Number.isNaN(toEpochMs(undefined))).toBe(true);
  });
});

describe('column whitelists', () => {
  it('never ships body payloads or secrets', () => {
    for (const [table, spec] of Object.entries(ALL_SPECS)) {
      for (const forbidden of FORBIDDEN_COLUMNS) {
        expect(
          spec.columns,
          `${table} must not expose ${forbidden}`,
        ).not.toContain(forbidden);
      }
    }
  });

  it('keeps Document.content and .plainText out — Yjs owns the body', () => {
    expect(INCREMENTAL_TABLES.Document.columns).not.toContain('content');
    expect(INCREMENTAL_TABLES.Document.columns).not.toContain('plainText');
  });

  it('keeps Whiteboard.data out — tldraw-sync owns the scene', () => {
    expect(INCREMENTAL_TABLES.Whiteboard.columns).not.toContain('data');
  });

  it('every incremental table selects updatedAt (it is the cursor)', () => {
    for (const [table, spec] of Object.entries({
      ...INCREMENTAL_TABLES,
      ...SCOPED_INCREMENTAL_TABLES,
    })) {
      expect(spec.columns, table).toContain('updatedAt');
    }
  });

  it('every parent-scoped table selects its parent key', () => {
    for (const [table, spec] of Object.entries(SCOPED_INCREMENTAL_TABLES)) {
      expect(spec.columns, table).toContain(spec.parentKey);
    }
  });
});

describe('collectChanges (live database)', () => {
  // These hit the real database: ~15 queries plus the first-connection cost.
  // Under a full-suite run that can exceed vitest's 5s default and fail for
  // reasons that have nothing to do with the code, so the budget is explicit.
  it('never leaks body payloads and stays inside one tenant', async () => {
    const db = await getDb();
    const users = await db.orm.public.User.select('id').limit(1).all();
    if (users.length === 0) return; // empty dev database — nothing to assert

    const userId = String(users[0].id);
    const first = await collectChanges({ userId, since: null });

    // No forbidden column may appear anywhere in the payload.
    for (const rows of [...Object.values(first.changes), ...Object.values(first.full)]) {
      for (const row of rows) {
        for (const key of Object.keys(row)) {
          expect(FORBIDDEN_COLUMNS, `leaked column: ${key}`).not.toContain(key);
        }
      }
    }

    // Tenant isolation on every table that carries userId directly.
    for (const table of ['Document', 'Folder', 'Whiteboard', 'Task', 'Collection']) {
      for (const row of first.changes[table] ?? []) {
        expect(row.userId, `${table} row belongs to another user`).toBe(userId);
      }
    }
    for (const row of first.full.Tag ?? []) expect(row.userId).toBe(userId);
    for (const row of first.full.Favorite ?? []) expect(row.userId).toBe(userId);

    // Parent-scoped rows must belong to something the caller owns.
    const docIds = new Set((first.changes.Document ?? []).map((r) => String(r.id)));
    for (const row of first.full.Backlink ?? []) {
      expect(docIds.has(String(row.sourceDocumentId))).toBe(true);
    }
    for (const row of first.full.DocumentTag ?? []) {
      expect(docIds.has(String(row.documentId))).toBe(true);
    }

    expect(Number.isNaN(Date.parse(first.cursor))).toBe(false);
  }, 20_000);

  it('a second pull at the cursor is a no-op replay, not new data', async () => {
    const db = await getDb();
    const users = await db.orm.public.User.select('id').limit(1).all();
    if (users.length === 0) return;

    const userId = String(users[0].id);
    const first = await collectChanges({ userId, since: null });
    const second = await collectChanges({ userId, since: new Date(first.cursor) });

    // The cursor is millisecond-truncated while postgres stores microseconds, so
    // rows sharing that final millisecond are replayed. That is fine — clients
    // apply by id — but it must never surface rows we did not already send.
    for (const table of Object.keys(second.changes)) {
      const seen = new Set((first.changes[table] ?? []).map((r) => String(r.id)));
      for (const row of second.changes[table]) {
        expect(seen.has(String(row.id)), `${table} replayed an unseen row`).toBe(true);
      }
    }

    expect(second.hasMore).toBe(false);
  }, 20_000);
});
