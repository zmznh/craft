'use server';

import { auth } from '@/lib/auth/auth';
import { getDb } from '@/prisma/db';
import { requireUserId } from '@/lib/authz/guard';
import { resolveDocumentAccess } from '@/lib/authz/document-access';
import type { ResourceRole } from '@/lib/authz/resource';

export interface AuthorizedDocument {
  [key: string]: unknown;
  id: string;
  title: string;
  icon: string | null;
  coverImage: string | null;
  coverType: string | null;
  width: string | null;
  pageStyle: unknown;
  content: unknown;
  role: ResourceRole;
}

export async function getDocument(id: string): Promise<AuthorizedDocument | null> {
  const userId = await requireUserId();
  const access = await resolveDocumentAccess(id, userId);
  if (!access) return null;
  return { ...access.document, role: access.role } as AuthorizedDocument;
}

export async function getDocuments() {
  const session = await auth();
  if (!session?.user?.id) throw new Error('未授权');

  const db = await getDb();
  const docs: Array<{
    id: string;
    title: string;
    icon: string | null;
    parentId: string | null;
    folderId: string | null;
    isDeleted: boolean;
    isDailyNote: boolean;
    updatedAt: string;
    order: number;
  }> = [];

  const result = await db.orm.public.Document
    .where({ userId: session.user.id, isDeleted: false, isDailyNote: false, isTemplate: false })
    .orderBy((m: any) => m.updatedAt.desc())
    .all();

  for (const doc of result) {
    docs.push(doc as typeof docs[number]);
  }

  return docs;
}

export async function getDeletedDocuments() {
  const session = await auth();
  if (!session?.user?.id) throw new Error('未授权');

  const db = await getDb();
  const docs: Array<{
    id: string;
    title: string;
    icon: string | null;
    deletedAt: string | null;
  }> = [];

  const result = await db.orm.public.Document
    .where({ userId: session.user.id, isDeleted: true })
    .orderBy((m: any) => m.deletedAt.desc())
    .all();

  for (const doc of result) {
    docs.push(doc as typeof docs[number]);
  }

  return docs;
}

export async function getFavoriteDocuments() {
  const session = await auth();
  if (!session?.user?.id) throw new Error('未授权');

  const db = await getDb();
  const docs: Array<{
    id: string;
    title: string;
    icon: string | null;
    updatedAt: string;
  }> = [];

  const favorites = await db.orm.public.Favorite
    .where({ userId: session.user.id })
    .orderBy((m: any) => m.order.asc())
    .all();

  for (const fav of favorites) {
    const doc = await db.orm.public.Document.first({ id: (fav as { documentId: string }).documentId });
    if (doc && !(doc as { isDeleted: boolean }).isDeleted) {
      docs.push(doc as typeof docs[number]);
    }
  }

  return docs;
}

export async function getTemplates() {
  const session = await auth();
  if (!session?.user?.id) throw new Error('未授权');

  const db = await getDb();
  const docs: Array<{
    id: string;
    title: string;
    icon: string | null;
    updatedAt: string;
  }> = [];

  const result = await db.orm.public.Document
    .where({ userId: session.user.id, isTemplate: true, isDeleted: false })
    .orderBy((m: any) => m.updatedAt.desc())
    .all();

  for (const doc of result) {
    docs.push(doc as typeof docs[number]);
  }

  return docs;
}

export async function getRecentDocuments(limit = 20) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('未授权');

  const db = await getDb();
  type RecentDoc = {
    id: string;
    title: string;
    icon: string | null;
    updatedAt: string;
    role: string;
  };

  const docs: RecentDoc[] = [];

  const own = await db.orm.public.Document
    .where({ userId: session.user.id, isDeleted: false })
    .orderBy((m: any) => m.updatedAt.desc())
    .all();

  for (const doc of own) {
    docs.push({ ...(doc as unknown as RecentDoc), role: 'owner' });
  }

  // Documents shared with me by a collaborator grant.
  const grants = await db.orm.public.DocumentMember
    .where({ userId: session.user.id })
    .all();

  for (const grant of grants) {
    const doc = await db.orm.public.Document.first({
      id: (grant as { documentId: string }).documentId,
    });
    if (!doc || (doc as { isDeleted: boolean }).isDeleted) continue;
    if ((doc as { userId: string }).userId === session.user.id) continue;
    docs.push({ ...(doc as unknown as RecentDoc), role: (grant as { role: string }).role });
  }

  docs.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
  return docs.slice(0, limit);
}
