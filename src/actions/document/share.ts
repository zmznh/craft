'use server';

import { auth } from '@/lib/auth/auth';
import { getDb } from '@/prisma/db';
import { normalizeShareSlug } from '@/lib/share/slug';
import { findShare, isOpenableShare } from '@/lib/share/resolve';

export interface ShareState {
  token: string;
  slug: string | null;
  isPublished: boolean;
  hasPasscode: boolean;
}

function stateOf(s: any): ShareState {
  return { token: s.token, slug: s.slug ?? null, isPublished: s.isPublished, hasPasscode: !!s.passcode };
}

export async function getOrCreateShare(documentId: string): Promise<ShareState> {
  const session = await auth();
  if (!session?.user?.id) throw new Error('未授权');

  const db = await getDb();
  const doc = await db.orm.public.Document.first({ id: documentId });
  if (!doc || (doc as any).userId !== session.user.id) throw new Error('未授权');

  const existing = await db.orm.public.DocumentShare
    .where({ documentId })
    .limit(1)
    .all();

  if (existing.length > 0) return stateOf(existing[0]);

  await db.orm.public.DocumentShare.create({
    id: crypto.randomUUID(),
    documentId,
    token: crypto.randomUUID(),
  });

  const created = await db.orm.public.DocumentShare
    .where({ documentId })
    .limit(1)
    .all();

  return stateOf(created[0]);
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

export async function setShareSlug(documentId: string, rawSlug: string | null): Promise<ShareState & { error?: string }> {
  const session = await auth();
  if (!session?.user?.id) throw new Error('未授权');

  const db = await getDb();
  const doc = await db.orm.public.Document.first({ id: documentId });
  if (!doc || (doc as any).userId !== session.user.id) throw new Error('未授权');

  const trimmed = rawSlug?.trim() ?? '';
  if (!trimmed) {
    await db.orm.public.DocumentShare.where({ documentId }).update({ slug: null });
    return await getOrCreateShare(documentId);
  }

  const normalized = normalizeShareSlug(trimmed);
  if (!normalized.ok) return { ...(await getOrCreateShare(documentId)), error: normalized.error };

  const taken = await db.orm.public.DocumentShare.first({ slug: normalized.slug });
  if (taken && (taken as any).documentId !== documentId) {
    return { ...(await getOrCreateShare(documentId)), error: '该地址已被其它文档使用' };
  }

  await db.orm.public.DocumentShare.where({ documentId }).update({ slug: normalized.slug });
  return await getOrCreateShare(documentId);
}

/** Accepts either the human slug or the share token. */
export async function getSharedDocument(identifier: string) {
  const db = await getDb();
  const share = await findShare(identifier);
  // The gate lives here rather than in the page because this module is
  // `'use server'`: a client can call the action without going through any route.
  if (!isOpenableShare(share)) return null;
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
    plainText: d.plainText,
    isPublished: s.isPublished,
    passcodeProtected: !!s.passcode,
  };
}
