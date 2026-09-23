'use server';

import { auth } from '@/lib/auth/auth';
import { getDb } from '@/prisma/db';

export async function deleteDocument(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('未授权');

  const db = await getDb();
  await db.orm.public.Document
    .where({ id, userId: session.user.id })
    .update({
      isDeleted: true,
      deletedAt: new Date().toISOString(),
    } as Record<string, unknown>);
}

export async function restoreDocument(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('未授权');

  const db = await getDb();
  await db.orm.public.Document
    .where({ id, userId: session.user.id })
    .update({
      isDeleted: false,
      deletedAt: null,
    } as Record<string, unknown>);
}

export async function permanentDeleteDocument(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('未授权');

  const db = await getDb();
  await db.orm.public.Document
    .where({ id, userId: session.user.id })
    .delete();
}
