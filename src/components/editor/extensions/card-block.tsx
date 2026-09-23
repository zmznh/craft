import { Node, mergeAttributes } from '@tiptap/react';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { CardBlockView } from './card-block-view';

declare module '@tiptap/react' {
  interface Commands<ReturnType> {
    cardBlock: {
      setCardBlock: (attributes?: { bgColor?: string; emoji?: string | null }) => ReturnType;
    };
  }
}

export const CardBlock = Node.create({
  name: 'cardBlock',
  group: 'block',
  content: 'block+',
  defining: true,

  addAttributes() {
    return {
      bgColor: {
        default: '#ffffff',
        parseHTML: (element) => element.getAttribute('data-bg-color') || '#ffffff',
        renderHTML: (attributes) => ({ 'data-bg-color': attributes.bgColor }),
      },
      emoji: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-emoji'),
        renderHTML: (attributes) => ({ 'data-emoji': attributes.emoji }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="card-block"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'card-block' }), 0];
  },

  addCommands() {
    return {
      setCardBlock:
        (attributes) =>
        ({ commands }) => {
          return commands.wrapIn(this.name, attributes ?? {});
        },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(CardBlockView);
  },
});
