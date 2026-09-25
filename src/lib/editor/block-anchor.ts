import type { Editor } from '@tiptap/react';
import { ANCHORABLE_TYPES } from '@/lib/search/anchors';

export const BLOCK_HASH_PREFIX = 'b-';
export const BLOCK_INDEX_PREFIX = 'i-';

/** Only ids we mint are UUID-shaped, so a malformed hash is never interpolated into a selector. */
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type BlockAnchor =
  | { kind: 'id'; blockId: string }
  | { kind: 'index'; blockIndex: number };

export function readAnchorHash(hash: string | undefined | null): BlockAnchor | null {
  if (!hash?.startsWith('#')) return null;
  let raw = hash.slice(1);
  try {
    raw = decodeURIComponent(raw);
  } catch {
    return null;
  }
  if (raw.startsWith(BLOCK_HASH_PREFIX)) {
    const id = raw.slice(BLOCK_HASH_PREFIX.length);
    return UUID.test(id) ? { kind: 'id', blockId: id } : null;
  }
  if (raw.startsWith(BLOCK_INDEX_PREFIX)) {
    const digits = raw.slice(BLOCK_INDEX_PREFIX.length);
    return /^\d+$/.test(digits) ? { kind: 'index', blockIndex: Number(digits) } : null;
  }
  return null;
}

export function anchorHref(link: {
  documentId?: string | null;
  blockId?: string | null;
  blockIndex?: number | null;
}): string {
  const base = `/documents/${link.documentId ?? ''}`;
  if (link.blockId) return `${base}#${BLOCK_HASH_PREFIX}${link.blockId}`;
  if (typeof link.blockIndex === 'number') return `${base}#${BLOCK_INDEX_PREFIX}${link.blockIndex}`;
  return base;
}

/**
 * Highlights the block with an overlay we own. Adding a class to the block itself
 * does not work: ProseMirror replaces the element as soon as the id change echoes
 * back through Yjs, and the highlight disappears.
 */
function highlightBlock(editor: Editor, blockId: string): void {
  const find = () => editor.view.dom.querySelector(`[data-block-id="${CSS.escape(blockId)}"]`);
  const block = find();
  if (!block) return;
  block.scrollIntoView({ behavior: 'smooth', block: 'center' });

  const overlay = document.createElement('div');
  overlay.className = 'block-anchor-flash';
  overlay.setAttribute('aria-hidden', 'true');
  document.body.appendChild(overlay);

  const deadline = Date.now() + 1400;
  const track = () => {
    const current = find() ?? block;
    const rect = current.getBoundingClientRect();
    overlay.style.left = `${rect.left}px`;
    overlay.style.top = `${rect.top}px`;
    overlay.style.width = `${rect.width}px`;
    overlay.style.height = `${rect.height}px`;
    if (Date.now() < deadline) requestAnimationFrame(track);
    else overlay.remove();
  };
  requestAnimationFrame(track);
}

export function scrollToBlock(editor: Editor, blockId: string): boolean {
  const target = editor.view.dom.querySelector(`[data-block-id="${CSS.escape(blockId)}"]`);
  if (!target) return false;
  highlightBlock(editor, blockId);
  return true;
}

/**
 * The nth addressable block, in the same depth-first order the search action
 * used to number the candidate the link was built from.
 */
function positionOfBlock(editor: Editor, blockIndex: number): number | null {
  let seen = 0;
  let found: number | null = null;
  editor.state.doc.descendants((node, pos) => {
    if (found !== null) return false;
    if (!ANCHORABLE_TYPES.includes(node.type.name) || !node.textContent.trim()) return true;
    if (seen === blockIndex) {
      found = pos;
      return false;
    }
    seen += 1;
    return true;
  });
  return found;
}

/**
 * Gives the nth block a stable id. Highlighting is left to `jumpToAnchor`, which
 * waits for the attribute to reach the DOM before scrolling.
 */
export function stampBlockIndex(editor: Editor, blockIndex: number): string | null {
  const pos = positionOfBlock(editor, blockIndex);
  if (pos === null) return null;
  const node = editor.state.doc.nodeAt(pos);
  if (!node) return null;

  const existing = typeof node.attrs.blockId === 'string' && node.attrs.blockId ? node.attrs.blockId : null;
  if (existing) return existing;

  const blockId = crypto.randomUUID();
  const applied = editor
    .chain()
    .command(({ tr, state }) => {
      const target = state.doc.nodeAt(pos);
      if (!target) return false;
      tr.setNodeMarkup(pos, undefined, { ...target.attrs, blockId });
      return true;
    })
    .run();

  return applied ? blockId : null;
}

/**
 * Content arrives asynchronously (stored JSON, offline draft, a Yjs sync), so the
 * anchor is hunted for a short while instead of assumed present.
 */
export function jumpToAnchor(editor: Editor, target: BlockAnchor): () => void {
  let cancelled = false;
  let frame = 0;
  let pending = target;
  const deadline = Date.now() + 2500;

  const tick = () => {
    if (cancelled) return;
    if (pending.kind === 'index') {
      const blockId = stampBlockIndex(editor, pending.blockIndex);
      if (blockId) {
        // From now on the address points at the id, not a positional hint.
        history.replaceState(null, '', `#${BLOCK_HASH_PREFIX}${blockId}`);
        pending = { kind: 'id', blockId };
      }
    } else if (scrollToBlock(editor, pending.blockId)) {
      return;
    }
    if (Date.now() < deadline) frame = requestAnimationFrame(tick);
  };

  frame = requestAnimationFrame(tick);
  return () => {
    cancelled = true;
    cancelAnimationFrame(frame);
  };
}
