export interface FolderNode {
  id: string;
  parentId: string | null;
}

/**
 * Returns the id that would close a loop if `candidateId` were re-parented to
 * `newParentId`, or null when the move is safe. Also breaks on pre-existing
 * loops in stored data instead of spinning.
 */
export function findFolderCycle(
  nodes: FolderNode[],
  candidateId: string,
  newParentId: string | null,
): string | null {
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const seen = new Set<string>();
  let cursor = newParentId;

  while (cursor) {
    if (cursor === candidateId || seen.has(cursor)) return cursor;
    seen.add(cursor);
    cursor = byId.get(cursor)?.parentId ?? null;
  }

  return null;
}
