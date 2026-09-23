'use server';

import { auth } from '@/lib/auth/auth';
import { getDb } from '@/prisma/db';

export async function toggleFavorite(documentId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('未授权');

  const db = await getDb();
  const existing = await db.orm.public.Favorite.first({
    userId: session.user.id,
    documentId,
  });

  if (existing) {
    await db.orm.public.Favorite.where({ id: (existing as { id: string }).id }).delete();
    return false;
  }

  await db.orm.public.Favorite.create({
    id: crypto.randomUUID(),
    userId: session.user.id,
    documentId,
  });
  return true;
}

export async function isDocumentFavorite(documentId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('未授权');

  const db = await getDb();
  const existing = await db.orm.public.Favorite.first({
    userId: session.user.id,
    documentId,
  });
  return !!existing;
}

