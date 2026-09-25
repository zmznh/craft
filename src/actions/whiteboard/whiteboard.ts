'use server';

import { assertOwned, getTable, requireUserId } from '@/lib/authz/guard';

export interface WhiteboardRecord {
  id: string;
  name: string;
  icon: string | null;
  data: unknown;
  order: number;
  folderId: string | null;
  userId: string;
  isDeleted: boolean;
  sharePermission: 'off' | 'view' | 'edit';
  shareToken: string | null;
  shareVersion: number;
  createdAt: string;
  updatedAt: string;
}

export interface WhiteboardItem {
  id: string;
  name: string;
  icon: string | null;
  updatedAt: string;
}

export async function getWhiteboards(): Promise<WhiteboardItem[]> {
  const userId = await requireUserId();

  const boards = await (await getTable('Whiteboard'))
    .where({ userId, isDeleted: false })
    .orderBy((m) => m.order.asc())
    .all();

  return boards.map((w) => ({
    id: w.id as string,
    name: w.name as string,
    icon: (w.icon as string) ?? null,
    updatedAt: w.updatedAt as string,
  }));
}

export async function getWhiteboard(id: string) {
  const userId = await requireUserId();

  const board = await (await getTable('Whiteboard')).first({ id });
  if (!board || board.userId !== userId || board.isDeleted) return null;
  return board as unknown as WhiteboardRecord;
}

export async function createWhiteboard(name?: string) {
  const userId = await requireUserId();

  return (await getTable('Whiteboard')).create({
    id: crypto.randomUUID(),
    name: name ?? '未命名白板',
    icon: '🎨',
    userId,
  });
}

export async function renameWhiteboard(id: string, name: string) {
  const userId = await requireUserId();
  await assertOwned('Whiteboard', id, userId, '白板不存在');

  await (await getTable('Whiteboard')).where({ id, userId }).update({ name });
}

export async function saveWhiteboardData(id: string, data: unknown) {
  const userId = await requireUserId();
  await assertOwned('Whiteboard', id, userId, '白板不存在');

  await (await getTable('Whiteboard')).where({ id, userId })
    .update({ data: data as Record<string, unknown> });
}

export async function deleteWhiteboard(id: string) {
  const userId = await requireUserId();
  await assertOwned('Whiteboard', id, userId, '白板不存在');

  await (await getTable('Whiteboard')).where({ id, userId }).update({
    isDeleted: true,
    deletedAt: new Date().toISOString(),
  } as Record<string, unknown>);
}
