import { Mark, mergeAttributes } from '@tiptap/react';

declare module '@tiptap/react' {
  interface Commands<ReturnType> {
    inlineMath: {
      setInlineMath: () => ReturnType;
      unsetInlineMath: () => ReturnType;
    };
  }
}

export const InlineMath = Mark.create({
  name: 'inlineMath',

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
    return [{ tag: 'code[data-type="inline-math"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['code', mergeAttributes(HTMLAttributes, { 'data-type': 'inline-math' }), 0];
  },

  addCommands() {
    return {
      setInlineMath:
        () =>
        ({ commands }) => {
          return commands.setMark(this.name);
        },

      unsetInlineMath:
        () =>
        ({ commands }) => {
          return commands.unsetMark(this.name);
        },
    };
  },
});
