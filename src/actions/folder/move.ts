'use server';

import { assertOwned, getTable, requireUserId } from '@/lib/authz/guard';
import { findFolderCycle } from '@/lib/authz/folder-tree';

export async function moveFolder(id: string, data: {
  parentId?: string | null;
  order?: number;
}) {
  const userId = await requireUserId();
  await assertOwned('Folder', id, userId, '文件夹不存在');

  const folders = await getTable('Folder');

  if ('parentId' in data) {
    const parentId = data.parentId ?? null;
    if (parentId) await assertOwned('Folder', parentId, userId, '目标文件夹不存在');

    const nodes = await folders.where({ userId }).all();
    const cycle = findFolderCycle(
      nodes.map((node) => ({ id: node.id as string, parentId: (node.parentId as string) ?? null })),
      id,
      parentId,
    );
    if (cycle) throw new Error('不能把文件夹移动到它自己的子文件夹下');
  }

  await folders.where({ id, userId }).update(data as Record<string, unknown>);
}
