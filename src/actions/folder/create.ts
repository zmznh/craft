'use server';

import { auth } from '@/lib/auth/auth';
import { getDb } from '@/prisma/db';

export async function createFolder(input: {
  name?: string;
  parentId?: string | null;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('未授权');

  const db = await getDb();
  const folder = await db.orm.public.Folder.create({
    id: crypto.randomUUID(),
    name: input.name ?? '未命名文件夹',
    userId: session.user.id,
    parentId: input.parentId ?? null,
  });

  return folder;
}
