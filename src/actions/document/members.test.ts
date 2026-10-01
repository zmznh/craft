import { beforeEach, describe, expect, it, vi } from 'vitest';

/* Three tables filtered the way the ORM filters them: `where({documentId})` only
 * ever returns rows carrying that documentId, so a member of another document
 * cannot ride along on a candidate list. */
const store = vi.hoisted(() => ({
  userId: 'owner-1',
  documents: [] as Record<string, unknown>[],
  members: [] as Record<string, unknown>[],
  users: [] as Record<string, unknown>[],
}));

function matches(row: Record<string, unknown>, filter: Record<string, unknown>): boolean {
  return Object.entries(filter).every(([key, value]) => row[key] === value);
}

function tableOf(rows: () => Record<string, unknown>[]) {
  return {
    first: async (filter: Record<string, unknown> = {}) =>
      rows().find((row) => matches(row, filter)) ?? null,
    where: (filter: Record<string, unknown>) => ({
      all: async () => rows().filter((row) => matches(row, filter)),
    }),
  };
}

vi.mock('@/lib/auth/auth', () => ({
  auth: async () => ({ user: { id: store.userId } }),
}));

vi.mock('@/prisma/db', () => ({
  getDb: async () => ({
    orm: {
      public: {
        Document: tableOf(() => store.documents),
        DocumentMember: tableOf(() => store.members),
        User: tableOf(() => store.users),
      },
    },
  }),
}));

const { listMentionCandidates } = await import('@/actions/document/members');
const { AuthorizationError } = await import('@/lib/authz/guard');

const freshRows = () => {
  store.userId = 'owner-1';
  store.documents = [
    { id: 'doc-1', userId: 'owner-1', isDeleted: false },
    { id: 'doc-2', userId: 'owner-2', isDeleted: false },
  ];
  store.members = [
    { id: 'm-1', documentId: 'doc-1', userId: 'u-editor', role: 'editor' },
    { id: 'm-2', documentId: 'doc-1', userId: 'u-nameless', role: 'viewer' },
    { id: 'm-3', documentId: 'doc-2', userId: 'u-outsider', role: 'editor' },
  ];
  store.users = [
    { id: 'owner-1', name: '文档所有者', email: 'owner@example.com' },
    { id: 'u-editor', name: '李四', email: 'lisi@example.com' },
    { id: 'u-nameless', name: null, email: 'nameless@example.com' },
    { id: 'u-outsider', name: '外人', email: 'outsider@example.com' },
  ];
};

beforeEach(freshRows);

function userIds(of: { userId: string }[]) {
  return of.map((candidate) => candidate.userId);
}

describe('listMentionCandidates', () => {
  it('offers the people invited to the document', async () => {
    const found = await listMentionCandidates('doc-1');
    expect(userIds(found)).toContain('u-editor');
    expect(userIds(found)).toContain('u-nameless');
  });

  it('offers the document owner, who has no member row of their own', async () => {
    expect(userIds(await listMentionCandidates('doc-1'))).toContain('owner-1');
  });

  it('withholds members of a different document', async () => {
    expect(userIds(await listMentionCandidates('doc-1'))).not.toContain('u-outsider');
  });

  it('carries the account name and email a chip needs', async () => {
    const [first] = await listMentionCandidates('doc-1');
    expect(first).toMatchObject({ userId: 'owner-1', name: '文档所有者', email: 'owner@example.com' });
  });

  it('keeps the name null for an account that never set one', async () => {
    const nameless = (await listMentionCandidates('doc-1')).find((c) => c.userId === 'u-nameless');
    expect(nameless).toMatchObject({ name: null, email: 'nameless@example.com' });
  });

  it('refuses a caller who holds no grant on the document', async () => {
    store.userId = 'u-outsider';
    await expect(listMentionCandidates('doc-1')).rejects.toBeInstanceOf(AuthorizationError);
  });

  it('refuses a document that does not exist', async () => {
    await expect(listMentionCandidates('doc-ghost')).rejects.toBeInstanceOf(AuthorizationError);
  });

  it('refuses a signed-in-less caller', async () => {
    store.userId = '';
    await expect(listMentionCandidates('doc-1')).rejects.toBeInstanceOf(AuthorizationError);
  });
});
