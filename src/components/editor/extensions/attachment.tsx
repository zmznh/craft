import { Node, mergeAttributes } from '@tiptap/react';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { AttachmentView } from './attachment-view';

declare module '@tiptap/react' {
  interface Commands<ReturnType> {
    attachment: {
      setAttachment: (attributes: {
        url: string;
        name: string;
        size?: number;
      }) => ReturnType;
    };
  }
}

export const Attachment = Node.create({
  name: 'attachment',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      url: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-url'),
        renderHTML: (attributes) => ({ 'data-url': attributes.url }),
      },
      name: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-name'),
        renderHTML: (attributes) => ({ 'data-name': attributes.name }),
      },
      size: {
        default: null,
        parseHTML: (element) => {
          const raw = element.getAttribute('data-size');
          return raw ? Number(raw) : null;
        },
        renderHTML: (attributes) => {
          if (attributes.size == null) return {};
          return { 'data-size': String(attributes.size) };
        },
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="attachment"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, { 'data-type': 'attachment' }),
    ];
  },

  addCommands() {
    return {
      setAttachment:
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
    return ReactNodeViewRenderer(AttachmentView);
  },
});
