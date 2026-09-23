'use server';

import { auth } from '@/lib/auth/auth';
import { getDb } from '@/prisma/db';

export async function getFolders() {
  const session = await auth();
  if (!session?.user?.id) throw new Error('未授权');

  const db = await getDb();
  const folders: Array<{
    id: string;
    name: string;
    icon: string | null;
    parentId: string | null;
    order: number;
    isDeleted: boolean;
  }> = [];

  const result = await db.orm.public.Folder
    .where({ userId: session.user.id, isDeleted: false })
    .orderBy((m: any) => m.order.asc())
    .all();

  for (const folder of result) {
    folders.push(folder as typeof folders[number]);
  }

  return folders;
}
