import { Node, mergeAttributes } from '@tiptap/react';
import '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { MirrorBlockView } from './mirror-block-view';

interface MirrorBlockOptions {
  hostDocumentId: string;
}

declare module '@tiptap/core' {
  interface Storage {
    mirrorBlock: { hostDocumentId: string };
  }
}

declare module '@tiptap/react' {
  interface Commands<ReturnType> {
    mirrorBlock: {
      insertMirrorBlock: (attributes: {
        sourceDocumentId: string | null;
        title: string | null;
        sourceBlockId?: string | null;
        sourceBlockIndex?: number | null;
      }) => ReturnType;
    };
  }
}

export const MirrorBlock = Node.create<MirrorBlockOptions>({
  name: 'mirrorBlock',
  group: 'block',
  atom: true,

  addOptions() {
    return { hostDocumentId: '' };
  },

  addStorage() {
    return { hostDocumentId: this.options.hostDocumentId };
  },

  addAttributes() {
    return {
      sourceDocumentId: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-source-document-id'),
        renderHTML: (attributes) => ({ 'data-source-document-id': attributes.sourceDocumentId }),
      },
      sourceBlockId: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-source-block-id'),
        renderHTML: (attributes) =>
          attributes.sourceBlockId ? { 'data-source-block-id': attributes.sourceBlockId } : {},
      },
      sourceBlockIndex: {
        default: null,
        parseHTML: (element) => {
          const raw = element.getAttribute('data-source-block-index');
          return raw === null ? null : Number(raw);
        },
        renderHTML: (attributes) =>
          typeof attributes.sourceBlockIndex === 'number'
            ? { 'data-source-block-index': String(attributes.sourceBlockIndex) }
            : {},
      },
      title: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-title'),
        renderHTML: (attributes) => ({ 'data-title': attributes.title }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="mirror-block"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, { 'data-type': 'mirror-block' }),
      HTMLAttributes.title || '镜像块',
    ];
  },

  addCommands() {
    return {
      insertMirrorBlock:
        (attributes) =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs: attributes }),
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(MirrorBlockView);
  },
});
