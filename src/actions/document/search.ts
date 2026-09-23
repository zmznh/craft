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

export interface SearchResult {
  documents: SearchResultDoc[];
  blocks: SearchResultBlock[];
}

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

export async function searchAll(query: string): Promise<SearchResult> {
  const session = await auth();
  if (!session?.user?.id) throw new Error('未授权');

  const q = query.trim();
  if (!q) return { documents: [], blocks: [] };

  const db = await getDb();
  const uid = session.user.id;
  const pattern = `%${q.replace(/[%_]/g, (m) => `\\${m}`)}%`;

  const titleMatches = await db.orm.public.Document
    .where({ userId: uid, isDeleted: false })
    .where((d: any) => d.title.ilike(pattern))
    .orderBy((d: any) => d.updatedAt.desc())
    .limit(8)
    .all();

  const contentMatches = await db.orm.public.Document
    .where({ userId: uid, isDeleted: false })
    .where((d: any) => d.plainText.ilike(pattern))
    .orderBy((d: any) => d.updatedAt.desc())
    .limit(10)
    .all();

  const documents: SearchResultDoc[] = titleMatches.map((d: any) => ({
    id: d.id,
    title: d.title,
    icon: d.icon,
    updatedAt: d.updatedAt,
  }));

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

  return { documents, blocks };
}
