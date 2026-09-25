'use server';

import { assertOwned, requireUserId } from '@/lib/authz/guard';
import { requireDocumentAccess } from '@/lib/authz/document-access';
import { getDb } from '@/prisma/db';
import { normalizeTagColor, normalizeTagName } from '@/lib/tag/normalize';

export interface TagRecord {
  id: string;
  name: string;
  color: string;
  documentCount?: number;
}

export async function getTags(): Promise<TagRecord[]> {
  const userId = await requireUserId();
  const db = await getDb();
  const tags = (await db.orm.public.Tag.where({ userId }).all()) as (TagRecord & {
    documents?: unknown[];
  })[];

  return tags.map(({ documents, ...tag }) => ({ ...tag }));
}

export async function getDocumentTags(documentId: string): Promise<TagRecord[]> {
  const userId = await requireUserId();
  await requireDocumentAccess(documentId, userId, 'viewer');

  const db = await getDb();
  const links = (await db.orm.public.DocumentTag.where({ documentId }).all()) as {
    tagId: string;
  }[];
  if (links.length === 0) return [];

  const tags = (await db.orm.public.Tag.where({ userId }).all()) as TagRecord[];
  const wanted = new Set(links.map((link) => link.tagId));
  return tags.filter((tag) => wanted.has(tag.id));
}

/** Finds the user's tag by normalised name, creating it on first use. */
async function findOrCreateTag(userId: string, name: string, color?: string) {
  const normalized = normalizeTagName(name);
  if (!normalized) return null;

  const db = await getDb();
  const existing = (await db.orm.public.Tag.where({ userId }).all()) as TagRecord[];
  const found = existing.find((tag) => tag.name === normalized);
  if (found) return found;

  const created = (await db.orm.public.Tag.create({
    id: crypto.randomUUID(),
    userId,
    name: normalized,
    color: normalizeTagColor(color),
  })) as TagRecord;

  return created;
}

export async function attachTag(documentId: string, name: string, color?: string) {
  const userId = await requireUserId();
  await requireDocumentAccess(documentId, userId, 'editor');

  const tag = await findOrCreateTag(userId, name, color);
  if (!tag) return null;

  const db = await getDb();
  const existing = await db.orm.public.DocumentTag.first({ documentId, tagId: tag.id });
  if (!existing) {
    await db.orm.public.DocumentTag.create({ documentId, tagId: tag.id });
  }
  return tag;
}

export async function detachTag(documentId: string, tagId: string) {
  const userId = await requireUserId();
  await requireDocumentAccess(documentId, userId, 'editor');
  await assertOwned('Tag', tagId, userId, '标签不存在');

  const db = await getDb();
  const link = await db.orm.public.DocumentTag.first({ documentId, tagId });
  if (link) await db.orm.public.DocumentTag.where({ documentId, tagId }).delete();
  return true;
}

export async function renameTag(tagId: string, name: string, color?: string) {
  const userId = await requireUserId();
  await assertOwned('Tag', tagId, userId, '标签不存在');

  const normalized = normalizeTagName(name);
  if (!normalized) return null;

  const db = await getDb();
  const clash = (await db.orm.public.Tag.where({ userId }).all()) as TagRecord[];
  if (clash.some((tag) => tag.id !== tagId && tag.name === normalized)) {
    throw new Error('同名标签已存在');
  }

  return (await db.orm.public.Tag.where({ id: tagId }).update({
    name: normalized,
    ...(color ? { color: normalizeTagColor(color) } : {}),
  })) as TagRecord;
}

export async function deleteTag(tagId: string) {
  const userId = await requireUserId();
  await assertOwned('Tag', tagId, userId, '标签不存在');

  const db = await getDb();
  await db.orm.public.Tag.where({ id: tagId }).delete();
  return true;
}

export async function getDocumentsByTag(tagId: string) {
  const userId = await requireUserId();
  await assertOwned('Tag', tagId, userId, '标签不存在');

  const db = await getDb();
  const links = (await db.orm.public.DocumentTag.where({ tagId }).all()) as {
    documentId: string;
  }[];
  if (links.length === 0) return [];

  const documents = (await db.orm.public.Document.where({ userId }).all()) as Record<
    string,
    unknown
  >[];
  const wanted = new Set(links.map((link) => link.documentId));
  return documents
    .filter((doc) => wanted.has(doc.id as string) && doc.isDeleted !== true)
    .map((doc) => ({ id: doc.id, title: doc.title, icon: doc.icon })) as {
    id: string;
    title: string;
    icon: string | null;
  }[];
}
