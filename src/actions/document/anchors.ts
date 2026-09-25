'use server';

import { requireUserId } from '@/lib/authz/guard';
import { getDb } from '@/prisma/db';
import { collectAnchorCandidates } from '@/lib/search/anchors';

export interface BlockAnchorHit {
  documentId: string;
  documentTitle: string;
  blockIndex: number;
  blockId: string | null;
  text: string;
}

/**
 * Block-level link targets. An id is only present once a jump has stamped one
 * into the block, so a fresh hit is addressed by position.
 */
export async function searchBlockAnchors(query: string): Promise<BlockAnchorHit[]> {
  const userId = await requireUserId();
  const term = query.trim().toLowerCase();
  if (!term) return [];

  const db = await getDb();
  const docs = (await db.orm.public.Document
    .where({ userId, isDeleted: false })
    .orderBy((d: any) => d.updatedAt.desc())
    .limit(30)
    .all()) as any[];

  const hits: BlockAnchorHit[] = [];
  for (const doc of docs) {
    for (const candidate of collectAnchorCandidates(doc.content)) {
      if (candidate.text.toLowerCase().includes(term)) {
        hits.push({
          documentId: doc.id,
          documentTitle: doc.title ?? '未命名',
          blockIndex: candidate.index,
          blockId: candidate.blockId,
          text: candidate.text,
        });
        if (hits.length >= 8) return hits;
      }
    }
  }
  return hits;
}
