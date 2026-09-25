'use server';

import { assertOwned, requireUserId } from '@/lib/authz/guard';
import { getDb } from '@/prisma/db';

export async function createFolder(input: {
  name?: string;
  parentId?: string | null;
}) {
  const userId = await requireUserId();
  if (input.parentId) await assertOwned('Folder', input.parentId, userId, '父文件夹不存在');

  const db = await getDb();
  const folder = await db.orm.public.Folder.create({
    id: crypto.randomUUID(),
    name: input.name ?? '未命名文件夹',
    userId,
    parentId: input.parentId ?? null,
  });

  return folder;
}
