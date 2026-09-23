'use server';

import { auth } from '@/lib/auth/auth';
import { getDb } from '@/prisma/db';

export async function moveDocument(id: string, data: {
  parentId?: string | null;
  folderId?: string | null;
  order?: number;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('未授权');

  const db = await getDb();
  await db.orm.public.Document
    .where({ id, userId: session.user.id })
    .update(data as Record<string, unknown>);
}
