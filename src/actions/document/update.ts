'use server';

import { auth } from '@/lib/auth/auth';
import { getDb } from '@/prisma/db';

export async function updateDocument(id: string, data: {
  title?: string;
  content?: unknown;
  plainText?: string;
  icon?: string | null;
  coverImage?: string | null;
  coverType?: string | null;
  wordCount?: number;
  charCount?: number;
  font?: string | null;
  width?: string | null;
  pageStyle?: unknown;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('未授权');

  const db = await getDb();
  const doc = await db.orm.public.Document.where({ id, userId: session.user.id }).update(data as Record<string, unknown>);

  // Auto version snapshot: at most one per 10 minutes per document
  try {
    const latest = await db.orm.public.DocumentVersion
      .where({ documentId: id })
      .orderBy((v: any) => v.version.desc())
      .limit(1)
      .all();
    const last = latest[0] as any;
    const stale = !last || Date.now() - new Date(last.createdAt).getTime() >= 10 * 60 * 1000;
    if (stale && data.content !== undefined) {
      const current = await db.orm.public.Document.first({ id });
      const c = current as any;
      if (c && c.userId === session.user.id) {
        await db.orm.public.DocumentVersion.create({
          id: crypto.randomUUID(),
          documentId: id,
          version: last ? last.version + 1 : 1,
          title: c.title,
          content: c.content,
          plainText: c.plainText,
          wordCount: c.wordCount,
        });
      }
    }
  } catch {
    // version snapshot must never block saving
  }

  return doc;
}
