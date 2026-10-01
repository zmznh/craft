'use server';

import { assertOwned, requireUserId } from '@/lib/authz/guard';
import { getDb } from '@/prisma/db';

export async function deleteDocument(id: string) {
  const userId = await requireUserId();
  await assertOwned('Document', id, userId, '文档不存在或不属于你');

  const db = await getDb();
  await db.orm.public.Document
    .where({ id, userId })
    .update({
      isDeleted: true,
      deletedAt: new Date().toISOString(),
    } as Record<string, unknown>);
}

export async function restoreDocument(id: string) {
  const userId = await requireUserId();
  await assertOwned('Document', id, userId, '文档不存在或不属于你');

  const db = await getDb();
  await db.orm.public.Document
    .where({ id, userId })
    .update({
      isDeleted: false,
      deletedAt: null,
    } as Record<string, unknown>);
}

export async function permanentDeleteDocument(id: string) {
  const userId = await requireUserId();
  await assertOwned('Document', id, userId, '文档不存在或不属于你');

  const db = await getDb();
  await db.orm.public.Document
    .where({ id, userId })
    .delete();
}
