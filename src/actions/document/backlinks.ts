'use server';

import { auth } from '@/lib/auth/auth';
import { getDb } from '@/prisma/db';

export interface OutgoingLink {
  documentId: string;
}

export interface BacklinkItem {
  sourceDocumentId: string;
  sourceTitle: string;
  sourceIcon: string | null;
  createdAt: string;
}

export async function syncBacklinks(sourceDocumentId: string, linkedDocumentIds: string[]) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('未授权');

  const db = await getDb();
  const source = await db.orm.public.Document.first({ id: sourceDocumentId });
  if (!source || (source as any).userId !== session.user.id) throw new Error('未授权');

  const existing = await db.orm.public.Backlink
    .where({ sourceDocumentId })
    .all();

  const existingIds = new Set(existing.map((b: any) => b.linkedDocumentId));
  const targetIds = new Set(linkedDocumentIds.filter((id) => id !== sourceDocumentId));

  const toCreate = [...targetIds].filter((id) => !existingIds.has(id));
  const toDelete = existing.filter((b: any) => !targetIds.has(b.linkedDocumentId));

  for (const id of toCreate) {
    await db.orm.public.Backlink.create({
      id: crypto.randomUUID(),
      sourceDocumentId,
      linkedDocumentId: id,
    });
  }

  for (const b of toDelete) {
    await db.orm.public.Backlink.where({ id: (b as any).id }).delete();
  }
}

export async function getBacklinks(documentId: string): Promise<BacklinkItem[]> {
  const session = await auth();
  if (!session?.user?.id) throw new Error('未授权');

  const db = await getDb();
  const rows = await db.orm.public.Backlink
    .where({ linkedDocumentId: documentId })
    .orderBy((b: any) => b.createdAt.desc())
    .all();

  const items: BacklinkItem[] = [];
  for (const row of rows) {
    const r = row as any;
    const source = await db.orm.public.Document.first({ id: r.sourceDocumentId });
    if (!source || (source as any).isDeleted) continue;
    items.push({
      sourceDocumentId: r.sourceDocumentId,
      sourceTitle: (source as any).title,
      sourceIcon: (source as any).icon,
      createdAt: r.createdAt,
    });
  }
  return items;
}
