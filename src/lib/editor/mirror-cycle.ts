export interface MirrorSource {
  documentId: string;
  blockId: string;
}

const MAX_DEPTH = 8;

/**
 * Mirrors resolve lazily, so a cycle would only surface as a runaway render. The
 * rule is checked up front instead: a mirror may not point back into a document
 * that is already on the chain, nor at itself.
 */
export function findMirrorCycle(
  content: unknown,
  hostDocumentId: string,
  seen: Set<string> = new Set(),
  depth = 0,
): MirrorSource | null {
  if (depth > MAX_DEPTH) return null;

  if (Array.isArray(content)) {
    for (const child of content) {
      const cycle = findMirrorCycle(child, hostDocumentId, seen, depth + 1);
      if (cycle) return cycle;
    }
    return null;
  }

  if (!content || typeof content !== 'object') return null;
  const node = content as { type?: string; attrs?: Record<string, unknown>; content?: unknown };

  if (node.type === 'mirrorBlock') {
    const sourceDocumentId = node.attrs?.sourceDocumentId;
    const sourceBlockId = node.attrs?.sourceBlockId;
    if (typeof sourceDocumentId === 'string' && typeof sourceBlockId === 'string') {
      const target = { documentId: sourceDocumentId, blockId: sourceBlockId };
      if (sourceDocumentId === hostDocumentId || seen.has(sourceDocumentId)) return target;
      return findMirrorCycle(node.content, hostDocumentId, new Set([...seen, sourceDocumentId]), depth + 1);
    }
  }

  return findMirrorCycle(node.content, hostDocumentId, seen, depth + 1);
}
