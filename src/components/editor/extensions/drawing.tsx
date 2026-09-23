import { Node, mergeAttributes } from '@tiptap/react';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { DrawingView } from './drawing-view';

declare module '@tiptap/react' {
  interface Commands<ReturnType> {
    drawing: {
      insertDrawing: (attributes?: {
        snapshot?: Record<string, unknown> | null;
      }) => ReturnType;
    };
  }
}

export const Drawing = Node.create({
  name: 'drawing',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      snapshot: {
        default: null,
        parseHTML: (element) => {
          try {
            const raw = element.getAttribute('data-snapshot');
            return raw ? JSON.parse(raw) : null;
          } catch {
            return null;
          }
        },
        renderHTML: (attributes) => {
          if (!attributes.snapshot) return {};
          return { 'data-snapshot': JSON.stringify(attributes.snapshot) };
        },
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="drawing"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, { 'data-type': 'drawing' }),
    ];
  },

  addCommands() {
    return {
      insertDrawing:
        (attributes) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: { snapshot: attributes?.snapshot ?? null },
          });
        },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(DrawingView);
  },
});
