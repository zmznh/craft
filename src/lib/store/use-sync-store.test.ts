import { beforeEach, describe, expect, it } from 'vitest';
import type { SyncPayload } from '@/lib/sync/client';
import {
  sumTableRevisions,
  useMetadataSyncStore,
} from './use-sync-store';

const CURSOR = '2026-10-01T04:00:00.000Z';

function payload(overrides: Partial<SyncPayload> = {}): SyncPayload {
  return { cursor: CURSOR, hasMore: false, changes: {}, full: {}, ...overrides };
}

const doc = { id: 'd1', title: 'A', updatedAt: '2026-10-01 12:00:00.000+08' };

describe('useMetadataSyncStore', () => {
  beforeEach(() => {
    useMetadataSyncStore.getState().reset();
  });

  it('caches rows by id and counts the change', () => {
    const store = useMetadataSyncStore.getState();
    const { changedTables } = store.applyPayload(payload({ changes: { Document: [doc] } }));

    expect(changedTables).toEqual(['Document']);
    expect(useMetadataSyncStore.getState().tables.Document.d1).toEqual(doc);
    expect(useMetadataSyncStore.getState().tableRevisions.Document).toBe(1);
    expect(useMetadataSyncStore.getState().lastSyncedAt).not.toBeNull();
  });

  it('does not move any counter for a replayed payload', () => {
    const store = useMetadataSyncStore.getState();
    store.applyPayload(payload({ changes: { Document: [doc] } }));
    const afterFirst = useMetadataSyncStore.getState().tableRevisions;

    const { changedTables } = store.applyPayload(payload({ changes: { Document: [doc] } }));

    expect(changedTables).toEqual([]);
    // This is the invariant the tag panel leans on: a quiet poll must not look
    // like a change, or it would reload on every tick.
    expect(useMetadataSyncStore.getState().tableRevisions).toEqual(afterFirst);
    expect(sumTableRevisions(afterFirst, ['Tag', 'DocumentTag'])).toBe(0);
  });

  it('counts tables independently', () => {
    const store = useMetadataSyncStore.getState();
    store.applyPayload(payload({ changes: { Document: [doc] } }));
    store.applyPayload(payload({ full: { Tag: [{ id: 't1', name: 'x' }] } }));

    const revisions = useMetadataSyncStore.getState().tableRevisions;
    expect(revisions.Document).toBe(1);
    expect(revisions.Tag).toBe(1);
    expect(sumTableRevisions(revisions, ['Tag', 'DocumentTag'])).toBe(1);
    expect(sumTableRevisions(revisions, ['Folder'])).toBe(0);
  });

  it('keeps the counter monotonic across repeated edits', () => {
    const store = useMetadataSyncStore.getState();
    store.applyPayload(payload({ changes: { Document: [doc] } }));
    store.applyPayload(payload({ changes: { Document: [{ ...doc, title: 'B' }] } }));

    expect(useMetadataSyncStore.getState().tableRevisions.Document).toBe(2);
    expect(useMetadataSyncStore.getState().tables.Document.d1.title).toBe('B');
  });

  it('drops the whole cache on reset', () => {
    const store = useMetadataSyncStore.getState();
    store.applyPayload(payload({ changes: { Document: [doc] } }));
    store.setCursor(CURSOR);
    store.reset();

    const state = useMetadataSyncStore.getState();
    expect(state.tables).toEqual({});
    expect(state.tableRevisions).toEqual({});
    expect(state.cursor).toBeNull();
    expect(state.changedTables).toEqual([]);
  });
});

describe('sumTableRevisions', () => {
  it('sums only the requested tables', () => {
    expect(sumTableRevisions({ Tag: 2, DocumentTag: 3, Document: 9 }, ['Tag', 'DocumentTag'])).toBe(5);
    expect(sumTableRevisions({}, ['Tag'])).toBe(0);
    expect(sumTableRevisions({ Tag: 2 }, [])).toBe(0);
  });
});
