'use server';

import { auth } from '@/lib/auth/auth';
import { getDb } from '@/prisma/db';
import { extractBlocks } from '@/lib/search/extract';

export interface SearchResultDoc {
  id: string;
  title: string;
  icon: string | null;
  updatedAt: string;
}

export interface SearchResultBlock {
  documentId: string;
  documentTitle: string;
  text: string;
}

export interface SearchResultRow {
  collectionId: string;
  collectionName: string;
  itemId: string;
  text: string;
}

export interface SearchResult {
  documents: SearchResultDoc[];
  blocks: SearchResultBlock[];
  rows: SearchResultRow[];
  nextOffset: number | null;
}

const PAGE_SIZE = 20;

export interface LinkCandidate {
  id: string;
  title: string;
  icon: string | null;
}

export async function searchDocumentsForLink(query: string): Promise<LinkCandidate[]> {
  const session = await auth();
  if (!session?.user?.id) throw new Error('未授权');

  const q = query.trim();
  const db = await getDb();

  const base = db.orm.public.Document
    .where({ userId: session.user.id, isDeleted: false });

  if (!q) {
    const recent = await base
      .orderBy((d: any) => d.updatedAt.desc())
      .limit(5)
      .all();
    return recent.map((d: any) => ({ id: d.id, title: d.title, icon: d.icon }));
  }

  const pattern = `%${q.replace(/[%_]/g, (m) => `\\${m}`)}%`;
  const matches = await base
    .where((d: any) => d.title.ilike(pattern))
    .orderBy((d: any) => d.updatedAt.desc())
    .limit(8)
    .all();

  return matches.map((d: any) => ({ id: d.id, title: d.title, icon: d.icon }));
}

export async function searchAll(query: string, offset = 0): Promise<SearchResult> {
  const session = await auth();
  if (!session?.user?.id) throw new Error('未授权');

  const q = query.trim();
  if (!q) return { documents: [], blocks: [], rows: [], nextOffset: null };

  const db = await getDb();
  const uid = session.user.id;
  const pattern = `%${q.replace(/[%_]/g, (m) => `\\${m}`)}%`;

  const titleMatches = await db.orm.public.Document
    .where({ userId: uid, isDeleted: false })
    .where((d: any) => d.title.ilike(pattern))
    .orderBy((d: any) => d.updatedAt.desc())
    .limit(PAGE_SIZE)
    .offset(offset)
    .all();

  const contentMatches = await db.orm.public.Document
    .where({ userId: uid, isDeleted: false })
    .where((d: any) => d.plainText.ilike(pattern))
    .orderBy((d: any) => d.updatedAt.desc())
    .limit(PAGE_SIZE)
    .offset(offset)
    .all();

  // Tag hits are document matches too — Craft folds them into the same list.
  const taggedDocs: SearchResultDoc[] = [];
  const tagMatches = await db.orm.public.Tag
    .where({ userId: uid })
    .where((t: any) => t.name.ilike(pattern))
    .limit(5)
    .all();
  for (const tag of tagMatches) {
    const links = await db.orm.public.DocumentTag.where({ tagId: (tag as any).id }).all();
    for (const link of links) {
      // `first()` with a boolean in the filter silently misses, so the flag is
      // checked after loading.
      const doc = await db.orm.public.Document.first({
        id: (link as any).documentId,
        userId: uid,
      });
      if (doc && doc.isDeleted !== true) {
        taggedDocs.push({
          id: (doc as any).id,
          title: (doc as any).title,
          icon: (doc as any).icon,
          updatedAt: (doc as any).updatedAt,
        });
      }
    }
  }

  const seen = new Set<string>();
  const documents: SearchResultDoc[] = [
    ...titleMatches.map((d: any) => ({
      id: d.id,
      title: d.title,
      icon: d.icon,
      updatedAt: d.updatedAt,
    })),
    ...taggedDocs,
  ].filter((doc) => (seen.has(doc.id) ? false : (seen.add(doc.id), true)));

  const matchedIds = new Set(documents.map((d) => d.id));

  const blocks: SearchResultBlock[] = [];
  for (const doc of contentMatches) {
    const d = doc as any;
    const docBlocks = extractBlocks(d.content);
    const lowerQ = q.toLowerCase();
    const hits = docBlocks
      .filter((b) => b.text.toLowerCase().includes(lowerQ))
      .slice(0, 3);
    for (const hit of hits) {
      blocks.push({
        documentId: d.id,
        documentTitle: d.title,
        text: hit.text.length > 120 ? hit.text.slice(0, 120) + '…' : hit.text,
      });
      if (blocks.length >= 12) break;
    }
    if (!matchedIds.has(d.id) && documents.length < 20 && hits.length > 0) {
      documents.push({
        id: d.id,
        title: d.title,
        icon: d.icon,
        updatedAt: d.updatedAt,
      });
      matchedIds.add(d.id);
    }
    if (blocks.length >= 12) break;
  }

  const rows = offset === 0 ? await searchCollectionRows(db, uid, pattern) : [];

  const hasMore = titleMatches.length === PAGE_SIZE || contentMatches.length === PAGE_SIZE;

  return { documents, blocks, rows, nextOffset: hasMore ? offset + PAGE_SIZE : null };
}

/** Collection rows are searched by their stored cell text. */
async function searchCollectionRows(db: any, userId: string, pattern: string): Promise<SearchResultRow[]> {
  const values = await db.orm.public.CollectionValue
    .where({})
    .where((v: any) => v.value.ilike(pattern))
    .limit(8)
    .all();

  const rows: SearchResultRow[] = [];
  const seen = new Set<string>();
  for (const entry of values) {
    const item = await db.orm.public.CollectionItem.first({ id: (entry as any).itemId });
    if (!item) continue;
    const collection = await db.orm.public.Collection.first({ id: (item as any).collectionId });
    if (!collection || (collection as any).userId !== userId || (collection as any).isDeleted) continue;
    if (seen.has((entry as any).itemId)) continue;
    seen.add((entry as any).itemId);
    let text: unknown = (entry as any).value;
    if (typeof text === 'string') {
      try {
        text = JSON.parse(text);
      } catch {
        /* keep the raw string */
      }
    }
    rows.push({
      collectionId: (collection as any).id,
      collectionName: (collection as any).name,
      itemId: (item as any).id,
      text: Array.isArray(text) ? text.join(', ') : String(text ?? ''),
    });
    if (rows.length >= 6) break;
  }
  return rows;
}
