'use server';

import { requireUserId } from '@/lib/authz/guard';
import { requireDocumentAccess } from '@/lib/authz/document-access';
import { getDb } from '@/prisma/db';

export async function toggleFavorite(documentId: string) {
  const userId = await requireUserId();
  await requireDocumentAccess(documentId, userId, 'viewer');

  const db = await getDb();
  const existing = await db.orm.public.Favorite.first({
    userId: userId,
    documentId,
  });

  if (existing) {
    await db.orm.public.Favorite.where({ id: (existing as { id: string }).id }).delete();
    return false;
  }

  await db.orm.public.Favorite.create({
    id: crypto.randomUUID(),
    userId: userId,
    documentId,
  });
  return true;
}

export async function isDocumentFavorite(documentId: string) {
  const userId = await requireUserId();
  await requireDocumentAccess(documentId, userId, 'viewer');

  const db = await getDb();
  const existing = await db.orm.public.Favorite.first({
    userId: userId,
    documentId,
  });
  return !!existing;
}

