import { Node, mergeAttributes } from '@tiptap/react';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { MathBlockView } from './math-block-view';

declare module '@tiptap/react' {
  interface Commands<ReturnType> {
    mathBlock: {
      setMathBlock: (attributes?: { latex?: string }) => ReturnType;
    };
  }
}

export const MathBlock = Node.create({
  name: 'mathBlock',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      latex: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-latex') || '',
        renderHTML: (attributes) => ({ 'data-latex': attributes.latex }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="math-block"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'math-block' }), 0];
  },

  addCommands() {
    return {
      setMathBlock:
        (attributes) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: attributes || {},
          });
        },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(MathBlockView);
  },
});
