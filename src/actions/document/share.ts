'use server';

import { auth } from '@/lib/auth/auth';
import { getDb } from '@/prisma/db';

export async function getOrCreateShare(documentId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('未授权');

  const db = await getDb();
  const doc = await db.orm.public.Document.first({ id: documentId });
  if (!doc || (doc as any).userId !== session.user.id) throw new Error('未授权');

  const existing = await db.orm.public.DocumentShare
    .where({ documentId })
    .limit(1)
    .all();

  if (existing.length > 0) {
    const s = existing[0] as any;
    return { token: s.token, isPublished: s.isPublished, hasPasscode: !!s.passcode };
  }

  await db.orm.public.DocumentShare.create({
    id: crypto.randomUUID(),
    documentId,
    token: crypto.randomUUID(),
  });

  const created = await db.orm.public.DocumentShare
    .where({ documentId })
    .limit(1)
    .all();

  const s = created[0] as any;
  return { token: s.token, isPublished: s.isPublished, hasPasscode: !!s.passcode };
}

export async function setSharePublished(documentId: string, isPublished: boolean) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('未授权');

  const db = await getDb();
  const doc = await db.orm.public.Document.first({ id: documentId });
  if (!doc || (doc as any).userId !== session.user.id) throw new Error('未授权');

  await db.orm.public.DocumentShare.where({ documentId }).update({ isPublished });
  return await getOrCreateShare(documentId);
}

export async function setSharePasscode(documentId: string, passcode: string | null) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('未授权');

  const db = await getDb();
  const doc = await db.orm.public.Document.first({ id: documentId });
  if (!doc || (doc as any).userId !== session.user.id) throw new Error('未授权');

  await db.orm.public.DocumentShare.where({ documentId }).update({
    passcode: passcode && passcode.trim() ? passcode.trim() : null,
  });
  return await getOrCreateShare(documentId);
}

export async function getSharedDocument(token: string) {
  const db = await getDb();
  const share = await db.orm.public.DocumentShare.first({ token });
  if (!share) return null;
  const s = share as any;

  const doc = await db.orm.public.Document.first({ id: s.documentId });
  if (!doc || (doc as any).isDeleted) return null;

  const d = doc as any;
  return {
    id: d.id,
    title: d.title,
    icon: d.icon,
    coverImage: d.coverImage,
    coverType: d.coverType,
    content: d.content,
    pageStyle: d.pageStyle,
    updatedAt: d.updatedAt,
    isPublished: s.isPublished,
    passcodeProtected: !!s.passcode,
  };
}
