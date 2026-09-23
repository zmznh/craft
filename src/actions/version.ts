'use server';

import { auth } from '@/lib/auth/auth';
import { getDb } from '@/prisma/db';

export interface VersionItem {
  id: string;
  version: number;
  title: string;
  plainText: string;
  wordCount: number;
  createdAt: string;
}

export async function createVersion(documentId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('未授权');

  const db = await getDb();
  const doc = await db.orm.public.Document.first({ id: documentId });
  if (!doc || (doc as any).userId !== session.user.id) throw new Error('未授权');
  const d = doc as any;

  const latest = await db.orm.public.DocumentVersion
    .where({ documentId })
    .orderBy((v: any) => v.version.desc())
    .limit(1)
    .all();
  const nextVersion = latest.length ? (latest[0] as any).version + 1 : 1;

  return db.orm.public.DocumentVersion.create({
    id: crypto.randomUUID(),
    documentId,
    version: nextVersion,
    title: d.title,
    content: d.content,
    plainText: d.plainText,
    wordCount: d.wordCount,
  });
}

export async function getVersions(documentId: string): Promise<VersionItem[]> {
  const session = await auth();
  if (!session?.user?.id) throw new Error('未授权');

  const db = await getDb();
  const doc = await db.orm.public.Document.first({ id: documentId });
  if (!doc || (doc as any).userId !== session.user.id) throw new Error('未授权');

  const versions = await db.orm.public.DocumentVersion
    .where({ documentId })
    .orderBy((v: any) => v.version.desc())
    .all();

  return versions.map((v: any) => ({
    id: v.id,
    version: v.version,
    title: v.title,
    plainText: v.plainText,
    wordCount: v.wordCount,
    createdAt: v.createdAt,
  }));
}

export async function getVersionContent(versionId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('未授权');

  const db = await getDb();
  const version = await db.orm.public.DocumentVersion.first({ id: versionId });
  if (!version) throw new Error('版本不存在');

  const doc = await db.orm.public.Document.first({
    id: (version as any).documentId,
  });
  if (!doc || (doc as any).userId !== session.user.id) throw new Error('未授权');

  return version as any;
}

export async function restoreVersion(versionId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('未授权');

  const db = await getDb();
  const version = await db.orm.public.DocumentVersion.first({ id: versionId });
  if (!version) throw new Error('版本不存在');
  const v = version as any;

  const doc = await db.orm.public.Document.first({ id: v.documentId });
  if (!doc || (doc as any).userId !== session.user.id) throw new Error('未授权');
  const d = doc as any;

  // Save the current content as a version first so restore is never destructive
  const latest = await db.orm.public.DocumentVersion
    .where({ documentId: v.documentId })
    .orderBy((ver: any) => ver.version.desc())
    .limit(1)
    .all();
  await db.orm.public.DocumentVersion.create({
    id: crypto.randomUUID(),
    documentId: v.documentId,
    version: latest.length ? (latest[0] as any).version + 1 : 1,
    title: d.title,
    content: d.content,
    plainText: d.plainText,
    wordCount: d.wordCount,
  });

  await db.orm.public.Document.where({ id: v.documentId }).update({
    content: v.content,
    plainText: v.plainText,
    wordCount: v.wordCount,
    title: v.title,
  } as Record<string, unknown>);

  return { documentId: v.documentId, content: v.content };
}
