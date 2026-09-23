'use server';

import { auth } from '@/lib/auth/auth';
import { getDb } from '@/prisma/db';

export interface WhiteboardItem {
  id: string;
  name: string;
  icon: string | null;
  updatedAt: string;
}

export async function getWhiteboards(): Promise<WhiteboardItem[]> {
  const session = await auth();
  if (!session?.user?.id) throw new Error('未授权');

  const db = await getDb();
  const boards = await db.orm.public.Whiteboard
    .where({ userId: session.user.id, isDeleted: false })
    .orderBy((w: any) => w.order.asc())
    .all();

  return boards.map((w: any) => ({
    id: w.id,
    name: w.name,
    icon: w.icon,
    updatedAt: w.updatedAt,
  }));
}

export async function getWhiteboard(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('未授权');

  const db = await getDb();
  const board = await db.orm.public.Whiteboard.first({ id });
  if (!board) return null;
  const w = board as any;
  if (w.userId !== session.user.id || w.isDeleted) return null;
  return w;
}

export async function createWhiteboard(name?: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('未授权');

  const db = await getDb();
  const board = await db.orm.public.Whiteboard.create({
    id: crypto.randomUUID(),
    name: name ?? '未命名白板',
    icon: '🎨',
    userId: session.user.id,
  });
  return board;
}

export async function renameWhiteboard(id: string, name: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('未授权');

  const db = await getDb();
  await db.orm.public.Whiteboard.where({ id }).update({ name });
}

export async function saveWhiteboardData(id: string, data: unknown) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('未授权');

  const db = await getDb();
  const board = await db.orm.public.Whiteboard.first({ id });
  if (!board || (board as any).userId !== session.user.id) throw new Error('未授权');

  await db.orm.public.Whiteboard.where({ id }).update({ data: data as Record<string, unknown> });
}

export async function deleteWhiteboard(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('未授权');

  const db = await getDb();
  await db.orm.public.Whiteboard.where({ id }).update({
    isDeleted: true,
    deletedAt: new Date().toISOString(),
  } as Record<string, unknown>);
}
