import { Node, mergeAttributes } from '@tiptap/react';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { WhiteboardLinkView } from './whiteboard-link-view';

declare module '@tiptap/react' {
  interface Commands<ReturnType> {
    whiteboardLink: {
      setWhiteboardLink: (attributes: {
        whiteboardId: string;
        title: string;
        icon?: string | null;
      }) => ReturnType;
    };
  }
}

export const WhiteboardLink = Node.create({
  name: 'whiteboardLink',
  group: 'inline',
  inline: true,
  atom: true,

  addAttributes() {
    return {
      whiteboardId: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-whiteboard-id'),
        renderHTML: (attributes) => ({ 'data-whiteboard-id': attributes.whiteboardId }),
      },
      title: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-title'),
        renderHTML: (attributes) => ({ 'data-title': attributes.title }),
      },
      icon: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-icon'),
        renderHTML: (attributes) => ({ 'data-icon': attributes.icon }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'span[data-type="whiteboard-link"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(HTMLAttributes, { 'data-type': 'whiteboard-link' }),
      `${HTMLAttributes.icon || '🎨'} ${HTMLAttributes.title || '...'}`,
    ];
  },

  addCommands() {
    return {
      setWhiteboardLink:
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
    return ReactNodeViewRenderer(WhiteboardLinkView);
  },
});
