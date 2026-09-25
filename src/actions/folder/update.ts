'use server';

import { assertOwned, getTable, requireUserId } from '@/lib/authz/guard';

export async function updateFolder(id: string, data: { name?: string; icon?: string | null }) {
  const userId = await requireUserId();
  await assertOwned('Folder', id, userId, '文件夹不存在');

  await (await getTable('Folder')).where({ id, userId }).update(data as Record<string, unknown>);
}
