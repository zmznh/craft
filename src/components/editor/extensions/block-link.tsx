import { Node, mergeAttributes } from '@tiptap/react';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { BlockLinkView } from './block-link-view';

declare module '@tiptap/react' {
  interface Commands<ReturnType> {
    blockLink: {
      setBlockLink: (attributes: { documentId: string; title: string }) => ReturnType;
    };
  }
}

export const BlockLink = Node.create({
  name: 'blockLink',
  group: 'inline',
  inline: true,
  atom: true,

  addAttributes() {
    return {
      documentId: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-document-id'),
        renderHTML: (attributes) => ({ 'data-document-id': attributes.documentId }),
      },
      title: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-title'),
        renderHTML: (attributes) => ({ 'data-title': attributes.title }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'span[data-type="block-link"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(HTMLAttributes, { 'data-type': 'block-link' }),
      `[[${HTMLAttributes.title || '...'}]]`,
    ];
  },

  addCommands() {
    return {
      setBlockLink:
        (attributes) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: attributes,
          });
        },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(BlockLinkView);
  },
});
