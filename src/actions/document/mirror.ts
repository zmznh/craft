'use server';

import { requireUserId } from '@/lib/authz/guard';
import { requireDocumentAccess } from '@/lib/authz/document-access';
import { findBlockById, nthAnchorableBlock } from '@/lib/search/anchors';
import { findMirrorCycle } from '@/lib/editor/mirror-cycle';
import { sanitizeMirrorHtml } from '@/lib/editor/mirror-html';
import { serializeDocument } from '@/lib/document-codec';

export interface MirrorTarget {
  hostDocumentId: string;
  sourceDocumentId: string;
  sourceBlockId?: string | null;
  sourceBlockIndex?: number | null;
}

export type MirroredBlock =
  | { ok: true; html: string; text: string }
  | { ok: false; reason: 'missing' | 'cycle' | 'nested' };

/**
 * Read-only copy of one block from another document. Both documents have to be
 * readable by the caller, and the chain must not lead back to the host.
 */
export async function getMirroredBlock(target: MirrorTarget): Promise<MirroredBlock> {
  const userId = await requireUserId();
  await requireDocumentAccess(target.hostDocumentId, userId, 'viewer');
  const { document: source } = await requireDocumentAccess(target.sourceDocumentId, userId, 'viewer');

  const block = target.sourceBlockId
    ? findBlockById(source.content, target.sourceBlockId)
    : nthAnchorableBlock(source.content, target.sourceBlockIndex ?? -1);

  if (!block) return { ok: false, reason: 'missing' };
  // A mirror of a mirror would need its own resolution chain.
  if (block.type === 'mirrorBlock') return { ok: false, reason: 'nested' };
  if (findMirrorCycle(block, target.hostDocumentId)) return { ok: false, reason: 'cycle' };

  const document = { type: 'doc', content: [block] };
  return {
    ok: true,
    html: sanitizeMirrorHtml(serializeDocument(document, 'html')),
    text: serializeDocument(document, 'text'),
  };
}
