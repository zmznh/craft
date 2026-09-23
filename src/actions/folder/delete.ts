'use server';

import { auth } from '@/lib/auth/auth';
import { getDb } from '@/prisma/db';

export async function deleteFolder(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('未授权');

  const db = await getDb();
  await db.orm.public.Folder.where({ id }).update({
    isDeleted: true,
    deletedAt: new Date().toISOString(),
  } as Record<string, unknown>);
}
