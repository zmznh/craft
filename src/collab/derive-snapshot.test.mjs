// @vitest-environment node
import { describe, expect, it } from 'vitest';
import * as Y from 'yjs';
import { prosemirrorJSONToYDoc } from '@tiptap/y-tiptap';
import { getSchema, Node } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import { deriveSnapshot } from './persist.mjs';

// Minimal stand-in for the app's atom nodes: no text child, label in attrs.
const Mention = Node.create({
  name: 'mention',
  group: 'inline',
  inline: true,
  atom: true,
  addAttributes() {
    return { documentId: { default: null }, title: { default: null } };
  },
  parseHTML() {
    return [{ tag: 'span[data-mention]' }];
  },
  renderHTML({ node }) {
    return ['span', { 'data-mention': node.attrs.documentId }, node.attrs.title ?? ''];
  },
});

const schema = getSchema([StarterKit, Mention]);

function roomUpdate(json) {
  const ydoc = prosemirrorJSONToYDoc(schema, json, 'default');
  return Y.encodeStateAsUpdate(ydoc);
}

const body = {
  type: 'doc',
  content: [
    { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: '同步设计' }] },
    { type: 'paragraph', content: [{ type: 'text', text: '正文一段。' }] },
  ],
};

describe('deriveSnapshot', () => {
  it('mirrors a room body back into proseMirror json', () => {
    const snapshot = deriveSnapshot(roomUpdate(body));

    expect(snapshot).not.toBeNull();
    expect(snapshot.content.type).toBe('doc');
    expect(snapshot.content.content).toHaveLength(2);
    expect(snapshot.plainText).toBe('同步设计\n正文一段。');
    expect(snapshot.wordCount).toBeGreaterThan(0);
  });

  it('refuses to mirror an empty room', () => {
    // The guard that matters most: an empty room must never blank out the
    // content of a document that has not been migrated into Yjs yet.
    const empty = new Y.Doc();
    expect(deriveSnapshot(Y.encodeStateAsUpdate(empty))).toBeNull();
  });

  it('refuses to mirror garbage', () => {
    expect(deriveSnapshot(new Uint8Array([1, 2, 3, 4]))).toBeNull();
  });

  it('keeps atom labels searchable', () => {
    const withMention = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'mention',
              attrs: { documentId: 'abc', title: '周会记录' },
            },
          ],
        },
      ],
    };
    // A mention has no text node; without the attrs fallback it would vanish
    // from search entirely.
    expect(deriveSnapshot(roomUpdate(withMention))?.plainText).toBe('周会记录');
  });
});
