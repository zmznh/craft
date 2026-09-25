/**
 * Only leaf text blocks are addressable. A list item is a `listItem > paragraph`,
 * so counting both would give one visible line two anchors.
 */
export const ANCHORABLE_TYPES = ['paragraph', 'heading'];

const ANCHORABLE = new Set(ANCHORABLE_TYPES);

export interface AnchorCandidate {
  /** Position among anchorable blocks, counting depth-first. */
  index: number;
  text: string;
  level: number;
  blockId: string | null;
}

/**
 * Walks a TipTap document and lists the blocks that can carry a link target.
 * Nested blocks count, so a list item inside a card is addressable.
 */
export function collectAnchorCandidates(content: unknown): AnchorCandidate[] {
  const found: AnchorCandidate[] = [];

  const walk = (node: any) => {
    for (const child of node?.content ?? []) {
      if (ANCHORABLE.has(child.type) && (child.textContent ?? collectText(child)).trim()) {
        found.push({
          index: found.length,
          text: collectText(child).trim().slice(0, 120),
          level: (child.attrs?.level as number) ?? 0,
          blockId: (child.attrs?.blockId as string) ?? null,
        });
      }
      walk(child);
    }
  };

  walk(content);
  return found;
}

function collectText(node: any): string {
  if (!node) return '';
  if (node.type === 'text') return node.text ?? '';
  return (node.content ?? []).map(collectText).join('');
}

/** The nth addressable block node, numbered exactly like `collectAnchorCandidates`. */
export function nthAnchorableBlock(content: unknown, index: number): any | null {
  let seen = 0;
  let result: any = null;

  const walk = (node: any) => {
    for (const child of node?.content ?? []) {
      if (result) return;
      if (ANCHORABLE.has(child.type) && collectText(child).trim()) {
        if (seen === index) {
          result = child;
          return;
        }
        seen += 1;
      }
      walk(child);
    }
  };

  walk(content);
  return result;
}

/** The block carrying `blockId`, or null when nothing matches. */
export function findBlockById(content: unknown, blockId: string): any | null {
  let result: any = null;

  const walk = (node: any) => {
    for (const child of node?.content ?? []) {
      if (result) return;
      if (ANCHORABLE.has(child.type) && child.attrs?.blockId === blockId) {
        result = child;
        return;
      }
      walk(child);
    }
  };

  walk(content);
  return result;
}
