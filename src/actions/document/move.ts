'use server';

import { auth } from '@/lib/auth/auth';
import { requireUserId } from '@/lib/authz/guard';
import { requireDocumentAccess } from '@/lib/authz/document-access';
import { getDb } from '@/prisma/db';

export async function moveDocument(id: string, data: {
  parentId?: string | null;
  folderId?: string | null;
  order?: number;
}) {
  const userId = await requireUserId();
  await requireDocumentAccess(id, userId, 'editor');

  const db = await getDb();
  await db.orm.public.Document
    .where({ id })
    .update(data as Record<string, unknown>);
}
