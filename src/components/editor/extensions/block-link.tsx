import { Node, mergeAttributes } from '@tiptap/react';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { BlockLinkView } from './block-link-view';

declare module '@tiptap/react' {
  interface Commands<ReturnType> {
    blockLink: {
      setBlockLink: (attributes: {
        documentId: string;
        title: string;
        blockId?: string | null;
        blockIndex?: number | null;
      }) => ReturnType;
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
      blockId: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-block-target'),
        renderHTML: (attributes) =>
          attributes.blockId ? { 'data-block-target': attributes.blockId } : {},
      },
      blockIndex: {
        default: null,
        parseHTML: (element) => {
          const raw = element.getAttribute('data-block-index');
          return raw === null ? null : Number(raw);
        },
        renderHTML: (attributes) =>
          typeof attributes.blockIndex === 'number'
            ? { 'data-block-index': String(attributes.blockIndex) }
            : {},
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
