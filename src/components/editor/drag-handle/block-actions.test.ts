import { describe, expect, it } from 'vitest';
import { Schema } from '@tiptap/pm/model';
import { EditorState } from '@tiptap/pm/state';
import type { Transaction } from '@tiptap/pm/state';
import {
  applyBlockAction,
  blockMenuItems,
  deleteBlock,
  insertBlockAbove,
  insertBlockBelow,
} from './block-actions';

// A two-node schema is enough: every top-level block is a paragraph whose text
// identifies it. Shape (node type + text) is asserted rather than text alone, so a
// transaction that merges two blocks cannot pass by producing the same characters.
const schema = new Schema({
  nodes: {
    doc: { content: 'block+' },
    paragraph: { content: 'text*', group: 'block' },
    text: {},
  },
  marks: {},
});

function stateWith(labels: string[]) {
  const doc = schema.nodes.doc.create(
    null,
    labels.map((label) => schema.nodes.paragraph.create(null, label ? schema.text(label) : null)),
  );
  return EditorState.create({ schema, doc });
}

function shapeOf(state: EditorState) {
  const shape: [string, string][] = [];
  state.doc.forEach((node) => shape.push([node.type.name, node.textContent]));
  return shape;
}

function run(state: EditorState, action: (dispatch: (tr: Transaction) => void) => void) {
  return shapeOf(runState(state, action));
}

function runState(state: EditorState, action: (dispatch: (tr: Transaction) => void) => void) {
  const box: { next: EditorState | undefined } = { next: undefined };
  action((tr) => {
    box.next = state.apply(tr);
  });
  if (!box.next) throw new Error('the action dispatched nothing');
  return box.next;
}

const blocks = (...labels: (string | null)[]) =>
  labels.map((label) => ['paragraph', label ?? ''] as [string, string]);

describe('the caret after inserting', () => {
  it('lands inside the new block when inserting below', () => {
    const state = stateWith(['甲', '乙']);
    const next = runState(state, (d) => insertBlockBelow(state, d, 0));
    expect(next.selection.$from.parent.textContent).toBe('');
    expect(next.selection.$from.depth).toBe(1);
  });

  it('lands inside the new block when inserting above', () => {
    const state = stateWith(['甲', '乙']);
    const next = runState(state, (d) => insertBlockAbove(state, d, 1));
    expect(next.selection.$from.parent.textContent).toBe('');
    expect(next.selection.$from.depth).toBe(1);
  });
});

describe('blockMenuItems', () => {
  // Craft's block menus vary per block type (V43), but every entry we render has to do
  // something — 提醒我／转换为卡片／添加表情 stay out until they have a local action.
  it('offers the three Craft block actions, delete last', () => {
    expect(blockMenuItems({ canDelete: true }).map((item) => item.id)).toEqual([
      'insert-above',
      'insert-below',
      'delete',
    ]);
  });

  it('labels every entry with the wording Craft shows', () => {
    expect(blockMenuItems({ canDelete: true }).map((item) => item.label)).toEqual([
      '在上方插入区块',
      '在下方插入区块',
      '删除',
    ]);
  });

  it('withholds 删除 from the only block in the document', () => {
    // deleteBlock refuses to empty the document, so an entry that can only fail
    // would surface as an uncaught error instead of doing nothing visible.
    expect(blockMenuItems({ canDelete: false }).map((item) => item.id)).toEqual([
      'insert-above',
      'insert-below',
    ]);
  });

  it('never lists the same entry twice', () => {
    for (const canDelete of [true, false]) {
      const ids = blockMenuItems({ canDelete }).map((item) => item.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });
});

describe('insertBlockBelow', () => {
  it('adds an empty block directly after the addressed one', () => {
    const state = stateWith(['甲', '乙', '丙']);
    expect(run(state, (d) => insertBlockBelow(state, d, 1))).toEqual(blocks('甲', '乙', null, '丙'));
  });

  it('accepts the last block', () => {
    const state = stateWith(['甲', '乙']);
    expect(run(state, (d) => insertBlockBelow(state, d, 1))).toEqual(blocks('甲', '乙', null));
  });
});

describe('insertBlockAbove', () => {
  it('adds an empty block directly before the addressed one', () => {
    const state = stateWith(['甲', '乙']);
    expect(run(state, (d) => insertBlockAbove(state, d, 1))).toEqual(blocks('甲', null, '乙'));
  });

  it('can address the first block', () => {
    const state = stateWith(['甲']);
    expect(run(state, (d) => insertBlockAbove(state, d, 0))).toEqual(blocks(null, '甲'));
  });
});

describe('deleteBlock', () => {
  it('removes only the addressed block', () => {
    const state = stateWith(['甲', '乙', '丙']);
    expect(run(state, (d) => deleteBlock(state, d, 1))).toEqual(blocks('甲', '丙'));
  });

  it('does not merge its neighbours', () => {
    const state = stateWith(['甲', '乙', '丙']);
    const shape = run(state, (d) => deleteBlock(state, d, 1));
    expect(shape).toHaveLength(2);
    expect(shape[0][1]).toBe('甲');
    expect(shape[1][1]).toBe('丙');
  });

  it('refuses to empty the document', () => {
    const state = stateWith(['甲']);
    expect(() => run(state, (d) => deleteBlock(state, d, 0))).toThrow();
  });
});

describe('applyBlockAction', () => {
  it('runs the entry the menu labelled 在上方插入区块', () => {
    const state = stateWith(['甲', '乙']);
    expect(run(state, (d) => applyBlockAction(state, d, 1, 'insert-above'))).toEqual(blocks('甲', null, '乙'));
  });

  it('runs the entry the menu labelled 在下方插入区块', () => {
    const state = stateWith(['甲', '乙']);
    expect(run(state, (d) => applyBlockAction(state, d, 0, 'insert-below'))).toEqual(blocks('甲', null, '乙'));
  });

  it('runs the entry the menu labelled 删除', () => {
    const state = stateWith(['甲', '乙']);
    expect(run(state, (d) => applyBlockAction(state, d, 0, 'delete'))).toEqual(blocks('乙'));
  });

  it('dispatches nothing for an id the menu does not offer', () => {
    const state = stateWith(['甲']);
    expect(() => run(state, (d) => applyBlockAction(state, d, 0, 'remind-me' as never))).toThrow(
      'the action dispatched nothing',
    );
  });

  it('covers every id the menu offers', () => {
    const state = stateWith(['甲', '乙']);
    for (const item of blockMenuItems({ canDelete: true })) {
      expect(() => run(state, (d) => applyBlockAction(state, d, 0, item.id))).not.toThrow();
    }
  });
});
