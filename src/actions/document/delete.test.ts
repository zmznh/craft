import { beforeEach, describe, expect, it, vi } from 'vitest';

/* A small table that filters the way the ORM does: a mutation restricted to
 * `{ id, userId }` simply matches zero rows when the caller is not the owner. */
const store = vi.hoisted(() => ({
  userId: 'user-1',
  rows: [] as Record<string, unknown>[],
}));

function matches(row: Record<string, unknown>, filter: Record<string, unknown>): boolean {
  return Object.entries(filter).every(([key, value]) => row[key] === value);
}

vi.mock('@/lib/auth/auth', () => ({
  auth: async () => ({ user: { id: store.userId } }),
}));

vi.mock('@/prisma/db', () => ({
  getDb: async () => ({
    orm: {
      public: {
        Document: {
          first: async (filter: Record<string, unknown> = {}) =>
            store.rows.find((row) => matches(row, filter)) ?? null,
          where: (filter: Record<string, unknown>) => ({
            update: async (data: Record<string, unknown>) => {
              const hit = store.rows.filter((row) => matches(row, filter));
              hit.forEach((row) => Object.assign(row, data));
              return hit;
            },
            delete: async () => {
              const kept = store.rows.filter((row) => !matches(row, filter));
              const removed = store.rows.length - kept.length;
              store.rows = kept;
              return { removed };
            },
          }),
        },
      },
    },
  }),
}));

const { deleteDocument, permanentDeleteDocument, restoreDocument } = await import('@/actions/document/delete');
const { AuthorizationError } = await import('@/lib/authz/guard');

const freshRows = () => [
  { id: 'mine', userId: 'user-1', title: 'Mine', isDeleted: false, deletedAt: null },
  { id: 'theirs', userId: 'user-2', title: 'Theirs', isDeleted: false, deletedAt: null },
];

beforeEach(() => {
  store.userId = 'user-1';
  store.rows = freshRows();
});

describe('deleteDocument', () => {
  it('moves your own document to the trash', async () => {
    await deleteDocument('mine');
    expect(store.rows[0].isDeleted).toBe(true);
  });

  it('refuses a document that belongs to someone else and leaves it untouched', async () => {
    await expect(deleteDocument('theirs')).rejects.toBeInstanceOf(AuthorizationError);
    expect(store.rows[1].isDeleted).toBe(false);
  });

  it('refuses a document that does not exist', async () => {
    await expect(deleteDocument('ghost')).rejects.toBeInstanceOf(AuthorizationError);
  });
});

describe('restoreDocument', () => {
  it('refuses to restore someone else’s document', async () => {
    store.rows[1].isDeleted = true;
    await expect(restoreDocument('theirs')).rejects.toBeInstanceOf(AuthorizationError);
    expect(store.rows[1].isDeleted).toBe(true);
  });

  it('restores your own document', async () => {
    store.rows[0].isDeleted = true;
    await restoreDocument('mine');
    expect(store.rows[0].isDeleted).toBe(false);
  });
});

describe('permanentDeleteDocument', () => {
  it('refuses to delete someone else’s document and keeps the row', async () => {
    await expect(permanentDeleteDocument('theirs')).rejects.toBeInstanceOf(AuthorizationError);
    expect(store.rows).toHaveLength(2);
  });

  it('deletes your own document', async () => {
    await permanentDeleteDocument('mine');
    expect(store.rows.map((row) => row.id)).toEqual(['theirs']);
  });
});
