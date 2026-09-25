import { Node, mergeAttributes } from '@tiptap/react';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { WhiteboardEmbedView } from './whiteboard-embed-view';

declare module '@tiptap/react' {
  interface Commands<ReturnType> {
    whiteboardEmbed: {
      setWhiteboardEmbed: (attributes: {
        whiteboardId: string;
        title?: string | null;
        icon?: string | null;
      }) => ReturnType;
    };
  }
}

export const WhiteboardEmbed = Node.create({
  name: 'whiteboardEmbed',
  group: 'block',
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
        renderHTML: (attributes) =>
          attributes.icon ? { 'data-icon': attributes.icon } : {},
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="whiteboard-embed"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, { 'data-type': 'whiteboard-embed' }),
      `${HTMLAttributes.icon || '🎨'} ${HTMLAttributes.title || '白板'}`,
    ];
  },

  addCommands() {
    return {
      setWhiteboardEmbed:
        (attributes) =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs: attributes }),
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(WhiteboardEmbedView);
  },
});
