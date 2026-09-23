'use server';

import { auth } from '@/lib/auth/auth';
import { getDb } from '@/prisma/db';

export async function getDocument(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('未授权');

  const db = await getDb();
  const document = await db.orm.public.Document.first({ id });
  if (!document || (document as { userId: string }).userId !== session.user.id) {
    return null;
  }
  return document;
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
  const docs: Array<{
    id: string;
    title: string;
    icon: string | null;
    updatedAt: string;
  }> = [];

  const result = await db.orm.public.Document
    .where({ userId: session.user.id, isDeleted: false })
    .orderBy((m: any) => m.updatedAt.desc())
    .limit(limit)
    .all();

  for (const doc of result) {
    docs.push(doc as typeof docs[number]);
  }

  return docs;
}
