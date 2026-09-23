'use server';

import { auth } from '@/lib/auth/auth';
import { getDb } from '@/prisma/db';

export async function moveFolder(id: string, data: {
  parentId?: string | null;
  order?: number;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('未授权');

  const db = await getDb();
  await db.orm.public.Folder.where({ id }).update(data as Record<string, unknown>);
}
