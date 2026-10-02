import { create } from 'zustand';
import {
  mergePayload,
  type SyncPayload,
  type SyncRow,
  type SyncStateName,
  type SyncStatusSnapshot,
} from '@/lib/sync/client';

/**
 * Local mirror of the server's metadata (ADR-0003).
 *
 * The trees themselves still read through the existing server actions — that
 * keeps the server's own filtering (isDeleted / isDailyNote / isTemplate /
 * permissions) as the single definition of "what the sidebar shows". What this
 * store adds is the *sync state*: the cursor, the id-keyed row cache, and a
 * revision counter the UI can subscribe to in order to know that the far side
 * changed something.
 *
 * `tables` is the idempotent cache: rows land under their primary key, so a
 * replayed millisecond (cursor truncation) overwrites the same slot with the
 * same content and no counter moves.
 */
interface MetadataSyncStore {
  /** Server cursor, hydrated from localStorage on boot. */
  cursor: string | null;
  /** table -> rowKey -> row. */
  tables: Record<string, Record<string, SyncRow>>;
  /**
   * Per-table change counters. Per-table, not one global counter: a global one
   * would drop back to "unchanged" on the next quiet poll and re-trigger every
   * subscriber for nothing.
   */
  tableRevisions: Record<string, number>;
  /** Tables touched by the most recently applied payload. */
  changedTables: string[];
  status: SyncStateName;
  lastError: string | null;
  lastSyncedAt: number | null;
  applyPayload: (payload: SyncPayload) => { changedTables: string[] };
  setCursor: (cursor: string | null) => void;
  setStatus: (status: SyncStatusSnapshot) => void;
  reset: () => void;
}

const initialState = {
  cursor: null as string | null,
  tables: {} as Record<string, Record<string, SyncRow>>,
  tableRevisions: {} as Record<string, number>,
  changedTables: [] as string[],
  status: 'idle' as SyncStateName,
  lastError: null as string | null,
  lastSyncedAt: null as number | null,
};

export const useMetadataSyncStore = create<MetadataSyncStore>((set, get) => ({
  ...initialState,

  applyPayload: (payload) => {
    const outcome = mergePayload(get().tables, payload);
    set((state) => {
      const tableRevisions = { ...state.tableRevisions };
      for (const table of outcome.changedTables) {
        tableRevisions[table] = (tableRevisions[table] ?? 0) + 1;
      }
      return {
        tables: outcome.tables,
        tableRevisions,
        changedTables: outcome.changedTables,
        lastSyncedAt: Date.now(),
        status: 'idle',
        lastError: null,
      };
    });
    return { changedTables: outcome.changedTables };
  },

  setCursor: (cursor) => set({ cursor }),

  setStatus: (status) =>
    set({ status: status.state, lastError: status.error ?? null }),

  reset: () => set({ ...initialState }),
}));

/**
 * Sum of the change counters for `tables`. Pure, so the hook below stays a
 * one-liner and the arithmetic is testable without a React renderer.
 */
export function sumTableRevisions(
  tableRevisions: Record<string, number>,
  tables: readonly string[],
): number {
  return tables.reduce((total, table) => total + (tableRevisions[table] ?? 0), 0);
}

/**
 * Change counter scoped to a set of tables. It only moves when one of those
 * tables actually changed, so a panel that reads through server actions (the
 * tag panel, for instance) can depend on it to reload without reloading on
 * every unrelated poll.
 */
export function useMetadataRevision(tables: readonly string[]): number {
  return useMetadataSyncStore((state) => sumTableRevisions(state.tableRevisions, tables));
}
