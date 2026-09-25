import { Node, mergeAttributes } from '@tiptap/react';

declare module '@tiptap/react' {
  interface Commands<ReturnType> {
    columns: {
      /** Splits the current block into `count` side-by-side columns. */
      insertColumns: (count?: number) => ReturnType;
    };
  }
}

export const Column = Node.create({
  name: 'column',
  group: 'column',
  // `defining` keeps the column's content from being flattened when a surrounding
  // block is replaced.
  defining: true,
  content: 'block+',

  parseHTML() {
    return [{ tag: 'div[data-type="column"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'column' }), 0];
  },
});

export const Columns = Node.create({
  name: 'columns',
  group: 'block',
  content: 'column+',
  isolating: true,

  parseHTML() {
    return [{ tag: 'div[data-type="columns"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'columns' }), 0];
  },

  addCommands() {
    return {
      insertColumns:
        (count = 2) =>
        ({ commands }) => {
          const width = Math.min(Math.max(count, 2), 4);

          return commands.insertContent({
            type: this.name,
            content: Array.from({ length: width }, () => ({
              type: 'column',
              content: [{ type: 'paragraph' }],
            })),
          });
        },
    };
  },
});
