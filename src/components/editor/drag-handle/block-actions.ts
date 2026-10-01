import type { EditorState, Transaction } from '@tiptap/pm/state';
import { TextSelection } from '@tiptap/pm/state';

export type BlockActionId = 'insert-above' | 'insert-below' | 'delete';

export interface BlockAction {
  id: BlockActionId;
  label: string;
}

/**
 * Craft's own block menus vary per block type, but every entry we render has to do
 * something — the reminder, card and emoji entries stay out until they have an action.
 */
export function blockMenuItems({ canDelete }: { canDelete: boolean }): BlockAction[] {
  const items: BlockAction[] = [
    { id: 'insert-above', label: '在上方插入区块' },
    { id: 'insert-below', label: '在下方插入区块' },
  ];
  if (canDelete) items.push({ id: 'delete', label: '删除' });
  return items;
}

/** The positions on either side of a top-level block, outside it rather than inside. */
function blockBounds(state: EditorState, index: number) {
  let before = 0;
  for (let child = 0; child < index; child += 1) before += state.doc.child(child).nodeSize;
  return { before, after: before + state.doc.child(index).nodeSize };
}

function insertAdjacent(
  state: EditorState,
  dispatch: (tr: Transaction) => void,
  index: number,
  above: boolean,
) {
  const { before, after } = blockBounds(state, index);
  const paragraph = state.schema.nodes.paragraph;
  const position = above ? before : after;
  const tr = state.tr.insert(position, paragraph.create());
  // The caret belongs inside the new block, one step past the boundary it was inserted at.
  dispatch(tr.setSelection(TextSelection.create(tr.doc, position + 1)).scrollIntoView());
}

export function insertBlockAbove(
  state: EditorState,
  dispatch: (tr: Transaction) => void,
  index: number,
) {
  insertAdjacent(state, dispatch, index, true);
}

export function insertBlockBelow(
  state: EditorState,
  dispatch: (tr: Transaction) => void,
  index: number,
) {
  insertAdjacent(state, dispatch, index, false);
}

export function deleteBlock(state: EditorState, dispatch: (tr: Transaction) => void, index: number) {
  if (state.doc.childCount <= 1) throw new Error('文档至少要保留一个区块');
  const { before, after } = blockBounds(state, index);
  dispatch(state.tr.delete(before, after).scrollIntoView());
}

/** The menu hands us an id; this is the only place that decides what it does. */
export function applyBlockAction(
  state: EditorState,
  dispatch: (tr: Transaction) => void,
  index: number,
  id: BlockActionId,
) {
  switch (id) {
    case 'insert-above':
      insertBlockAbove(state, dispatch, index);
      break;
    case 'insert-below':
      insertBlockBelow(state, dispatch, index);
      break;
    case 'delete':
      deleteBlock(state, dispatch, index);
      break;
  }
}
