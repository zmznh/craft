/* eslint-disable @typescript-eslint/no-explicit-any */
//
// Metadata sync for multi-device use.
//
// Scope boundary (important): this module deliberately does NOT carry document
// bodies or whiteboard scenes. Those are owned by Yjs (Hocuspocus) and
// tldraw-sync respectively — see docs/adr/0001. Shipping `Document.content`
// or `Whiteboard.data` here would put megabytes on a 2-second poll and would
// reintroduce a second source of truth for the body.
//
// Two shapes of table:
//   * incremental — has `updatedAt`, pulled with a `> since` cursor.
//   * full        — no `updatedAt` at all (Tag, DocumentTag, Favorite, Backlink).
//                   These ship whole on every request. They are tiny (ids and a
//                   few short strings) and cannot be diffed without a schema
//                   change; see ADR-0003.

import { getDb } from '@/prisma/db';

export const SYNC_LIMIT_DEFAULT = 500;
export const SYNC_LIMIT_MAX = 2000;

export interface TableSpec {
  columns: readonly string[];
}

/**
 * Tables with `updatedAt` and a direct `userId`.
 * `content` / `plainText` / `data` are intentionally absent.
 */
export const INCREMENTAL_TABLES: Record<string, TableSpec> = {
  Folder: {
    columns: [
      'id', 'userId', 'name', 'icon', 'order', 'parentId',
      'isDeleted', 'deletedAt', 'createdAt', 'updatedAt',
    ],
  },
  Document: {
    columns: [
      'id', 'userId', 'title', 'icon', 'coverImage', 'coverType', 'order',
      'parentId', 'folderId', 'font', 'width', 'pageStyle',
      'isTemplate', 'isDeleted', 'deletedAt',
      'isDailyNote', 'dailyNoteDate',
      'wordCount', 'charCount', 'version', 'createdAt', 'updatedAt',
    ],
  },
  Whiteboard: {
    columns: [
      'id', 'userId', 'name', 'icon', 'order', 'folderId',
      'isDeleted', 'deletedAt', 'sharePermission', 'shareVersion',
      'createdAt', 'updatedAt',
    ],
  },
  Task: {
    columns: [
      'id', 'userId', 'documentId', 'blockId', 'title', 'isCompleted',
      'dueDate', 'remindAt', 'recurrence', 'recurrenceEnd', 'completedAt',
      'status', 'order', 'createdAt', 'updatedAt',
    ],
  },
  Collection: {
    columns: [
      'id', 'userId', 'name', 'icon', 'description', 'order', 'folderId',
      'isDeleted', 'deletedAt', 'createdAt', 'updatedAt',
    ],
  },
};

/**
 * Tables that hang off a parent and carry no `userId`. Still cursor-driven, but
 * scoped with `IN (<parent ids>)` in SQL rather than filtered after the fact —
 * filtering in memory would let another tenant's rows consume the page budget
 * and leave `hasMore` stuck at true forever.
 */
export const SCOPED_INCREMENTAL_TABLES: Record<
  string,
  TableSpec & { parentKey: 'documentId' | 'collectionId' | 'itemId' }
> = {
  // `token` and `passcode` are excluded: the share *state* is syncable, the
  // secret is not.
  DocumentShare: {
    columns: ['id', 'documentId', 'slug', 'isPublished', 'createdAt', 'updatedAt'],
    parentKey: 'documentId',
  },
  CollectionProperty: {
    columns: [
      'id', 'collectionId', 'name', 'type', 'config', 'order',
      'isVisible', 'width', 'createdAt', 'updatedAt',
    ],
    parentKey: 'collectionId',
  },
  CollectionItem: {
    columns: ['id', 'collectionId', 'order', 'documentId', 'createdAt', 'updatedAt'],
    parentKey: 'collectionId',
  },
  CollectionView: {
    columns: [
      'id', 'collectionId', 'name', 'type', 'config',
      'isActive', 'order', 'createdAt', 'updatedAt',
    ],
    parentKey: 'collectionId',
  },
  CollectionValue: {
    columns: ['id', 'itemId', 'propertyId', 'value', 'createdAt', 'updatedAt'],
    parentKey: 'itemId',
  },
};

/** No `updatedAt` column exists on these — nothing to cursor over. */
export const FULL_TABLES: Record<
  string,
  TableSpec & { ownedByUser?: true; viaDocuments?: true }
> = {
  Tag: { columns: ['id', 'userId', 'name', 'color'], ownedByUser: true },
  Favorite: { columns: ['id', 'userId', 'documentId', 'order'], ownedByUser: true },
  DocumentTag: { columns: ['documentId', 'tagId'], viaDocuments: true },
  Backlink: {
    columns: ['sourceDocumentId', 'linkedDocumentId', 'sourceBlockId'],
    viaDocuments: true,
  },
};

/** Columns that must never leave this module. Asserted in changes.test.ts. */
export const FORBIDDEN_COLUMNS = [
  'content', 'plainText', 'data', 'state', 'password',
  'passcode', 'token', 'shareToken',
];

/**
 * Postgres hands back timestamptz as a raw string like
 * "2026-09-29 18:06:49.485+08"; the pg driver does not coerce it to a Date.
 * V8 parses that fine, but the fallback guards against a cursor that silently
 * fails to advance.
 */
export function toEpochMs(value: unknown): number {
  if (value instanceof Date) return value.getTime();
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const direct = Date.parse(value);
    if (!Number.isNaN(direct)) return direct;
    const spaced = Date.parse(value.replace(' ', 'T'));
    if (!Number.isNaN(spaced)) return spaced;
  }
  return Number.NaN;
}

export interface SyncChanges {
  /** Pass back as `since` on the next request. ISO-8601 UTC. */
  cursor: string;
  /** At least one table hit the per-table limit — poll again immediately. */
  hasMore: boolean;
  /** Rows changed after `since`, keyed by model name. */
  changes: Record<string, Record<string, unknown>[]>;
  /** Tables without `updatedAt`, always complete. Keyed by model name. */
  full: Record<string, Record<string, unknown>[]>;
}

type Scope =
  | { kind: 'userId' }
  | { kind: 'in'; key: string; values: Set<string> };

export async function collectChanges(input: {
  userId: string;
  since: Date | null;
  limit?: number;
}): Promise<SyncChanges> {
  const db = await getDb();
  const limit = Math.min(Math.max(input.limit ?? SYNC_LIMIT_DEFAULT, 1), SYNC_LIMIT_MAX);
  const since = input.since ?? new Date(0);

  let maxTs = input.since ? input.since.getTime() : 0;
  let hasMore = false;
  const changes: Record<string, Record<string, unknown>[]> = {};

  /**
   * Pull one table by cursor and advance the high-water mark.
   * `hasMore` is only ever set from rows the caller actually owns, so it can
   * never latch true on someone else's data.
   */
  async function incremental(
    table: string,
    columns: readonly string[],
    scope: Scope,
  ): Promise<Record<string, unknown>[]> {
    if (scope.kind === 'in' && scope.values.size === 0) return [];

    let query = db.orm.public[table];
    query =
      scope.kind === 'userId'
        ? query.where({ userId: input.userId })
        : // Callback form is required: the object form `.where({ id: { in: [] } })`
          // silently matches nothing instead of erroring.
          query.where((d: any) => d[scope.key].in([...scope.values]));

    const rows: Record<string, unknown>[] = await query
      .where((d: any) => d.updatedAt.gt(since))
      .select(...columns)
      .orderBy((d: any) => d.updatedAt.asc())
      .limit(limit)
      .all();

    for (const row of rows) {
      const t = toEpochMs(row.updatedAt);
      if (!Number.isNaN(t) && t > maxTs) maxTs = t;
    }
    if (rows.length >= limit) hasMore = true;
    return rows;
  }

  // --- directly owned, cursor-driven -------------------------------------
  for (const [table, spec] of Object.entries(INCREMENTAL_TABLES)) {
    changes[table] = await incremental(table, spec.columns, { kind: 'userId' });
  }

  // --- parent id sets -----------------------------------------------------
  const idsOf = async (table: string, columns: string[], filter?: (r: any) => boolean) => {
    const rows: Record<string, unknown>[] = await db.orm.public[table].select(...columns).all();
    return new Set((filter ? rows.filter(filter) : rows).map((r) => String(r.id)));
  };

  const documentIds = await idsOf('Document', ['id', 'userId'], (r) => r.userId === input.userId);
  const collectionIds = await idsOf('Collection', ['id', 'userId'], (r) => r.userId === input.userId);
  // Two hops: collection -> item -> value.
  const itemIds = await idsOf('CollectionItem', ['id', 'collectionId'], (r) =>
    collectionIds.has(String(r.collectionId)),
  );

  const parentSets: Record<string, Set<string>> = {
    documentId: documentIds,
    collectionId: collectionIds,
    itemId: itemIds,
  };

  // --- parent-scoped, cursor-driven --------------------------------------
  for (const [table, spec] of Object.entries(SCOPED_INCREMENTAL_TABLES)) {
    changes[table] = await incremental(table, spec.columns, {
      kind: 'in',
      key: spec.parentKey,
      values: parentSets[spec.parentKey],
    });
  }

  // --- no updatedAt: ship whole, still scoped to the caller ---------------
  const full: Record<string, Record<string, unknown>[]> = {};
  for (const [table, spec] of Object.entries(FULL_TABLES)) {
    if (spec.viaDocuments) {
      if (documentIds.size === 0) {
        full[table] = [];
        continue;
      }
      const key = table === 'Backlink' ? 'sourceDocumentId' : 'documentId';
      full[table] = await db.orm.public[table]
        .where((d: any) => d[key].in([...documentIds]))
        .select(...spec.columns)
        .all();
      continue;
    }
    full[table] = await db.orm.public[table]
      .where({ userId: input.userId })
      .select(...spec.columns)
      .all();
  }

  return {
    cursor: new Date(maxTs).toISOString(),
    hasMore,
    changes,
    full,
  };
}
