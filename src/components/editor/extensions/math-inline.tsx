import { Node, mergeAttributes } from '@tiptap/react';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { MathInlineView } from './math-inline-view';

declare module '@tiptap/react' {
  interface Commands<ReturnType> {
    inlineMath: {
      setInlineMath: (attributes?: { latex?: string }) => ReturnType;
      /** Wraps the current selection's text as a formula, Craft's ⌘E behaviour. */
      convertSelectionToMath: () => ReturnType;
    };
  }
}

export const InlineMath = Node.create({
  name: 'inlineMath',
  group: 'inline',
  inline: true,
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
    return [{ tag: 'span[data-type="inline-math"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes, { 'data-type': 'inline-math' }), 0];
  },

  addCommands() {
    return {
      setInlineMath:
        (attributes) =>
        ({ commands }) =>
          commands.insertContent({
            type: this.name,
            attrs: attributes || {},
          }),

      convertSelectionToMath:
        () =>
        ({ editor }) => {
          const { from, to, empty } = editor.state.selection;
          if (empty) return false;
          const latex = editor.state.doc.textBetween(from, to, ' ');
          if (!latex.trim()) return false;
          return editor
            .chain()
            .focus()
            .insertContentAt({ from, to }, { type: this.name, attrs: { latex: latex.trim() } })
            .run();
        },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(MathInlineView);
  },
});
