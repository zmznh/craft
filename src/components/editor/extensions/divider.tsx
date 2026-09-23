import { Node, mergeAttributes } from '@tiptap/react';

export type DividerStyle = 'thin' | 'medium' | 'thick' | 'dashed';

declare module '@tiptap/react' {
  interface Commands<ReturnType> {
    divider: {
      setDivider: (style?: DividerStyle) => ReturnType;
    };
  }
}

export const Divider = Node.create({
  name: 'divider',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      style: {
        default: 'thin',
        parseHTML: (element) => element.getAttribute('data-style') || 'thin',
        renderHTML: (attributes) => ({ 'data-style': attributes.style }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'hr[data-type="divider"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['hr', mergeAttributes(HTMLAttributes, { 'data-type': 'divider' })];
  },

  addCommands() {
    return {
      setDivider:
        (style = 'thin') =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: { style },
          });
        },
    };
  },
});
