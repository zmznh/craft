import { describe, expect, it, vi } from 'vitest';

/* The action module pulls in the auth setup, which reads signing secrets at import time,
 * and the ORM, which would open a real database. Neither is what this test is about. */
const state = vi.hoisted(() => ({
  share: null as Record<string, unknown> | null,
  document: null as Record<string, unknown> | null,
  refuseDocumentRead: false,
}));

vi.mock('@/lib/auth/auth', () => ({ auth: async () => ({}) }));
vi.mock('@/prisma/db', () => ({
  getDb: async () => ({
    orm: {
      public: {
        DocumentShare: { first: async () => state.share },
        Document: {
          first: async () => {
            if (state.refuseDocumentRead) throw new Error('document read after a closed share');
            return state.document;
          },
        },
      },
    },
  }),
}));

const { getSharedDocument } = await import('@/actions/document/share');

describe('getSharedDocument', () => {
  it('returns the document when the share row is published', async () => {
    state.share = { documentId: 'doc-1', isPublished: true, passcode: null };
    state.document = { id: 'doc-1', title: 'Shared page', content: '{}', isDeleted: false };
    const result = await getSharedDocument('my-page');
    expect(result).toMatchObject({ id: 'doc-1', title: 'Shared page', isPublished: true });
  });

  it('returns nothing when the share row was never published', async () => {
    state.share = { documentId: 'doc-1', isPublished: false, passcode: null };
    state.document = { id: 'doc-1', title: 'Shared page', content: '{}', isDeleted: false };
    expect(await getSharedDocument('my-page')).toBeNull();
  });

  it('returns nothing when no share row matches', async () => {
    state.share = null;
    state.document = { id: 'doc-1', title: 'Shared page', content: '{}', isDeleted: false };
    expect(await getSharedDocument('unknown-slug')).toBeNull();
  });

  it('stops before reading the document when the share is closed', async () => {
    state.share = { documentId: 'doc-1', isPublished: false, passcode: null };
    state.refuseDocumentRead = true;
    expect(await getSharedDocument('my-page')).toBeNull();
    state.refuseDocumentRead = false;
  });
});
