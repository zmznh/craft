'use server';

import { assertOwned, getTable, requireUserId } from '@/lib/authz/guard';

export async function deleteFolder(id: string) {
  const userId = await requireUserId();
  await assertOwned('Folder', id, userId, '文件夹不存在');

  await (await getTable('Folder')).where({ id, userId }).update({
    isDeleted: true,
    deletedAt: new Date().toISOString(),
  } as Record<string, unknown>);
}
