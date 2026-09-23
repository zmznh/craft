import { Node, mergeAttributes } from '@tiptap/react';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { ImageBlockView } from './image-block-view';

declare module '@tiptap/react' {
  interface Commands<ReturnType> {
    imageBlock: {
      setImageBlock: (attributes: {
        src?: string | null;
        alt?: string | null;
        caption?: string | null;
      }) => ReturnType;
    };
  }
}

export const ImageBlock = Node.create({
  name: 'imageBlock',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      src: {
        default: null,
        parseHTML: (element) => {
          const img = element.querySelector('img');
          return img?.getAttribute('src');
        },
      },
      alt: {
        default: null,
        parseHTML: (element) => {
          const img = element.querySelector('img');
          return img?.getAttribute('alt');
        },
      },
      caption: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-caption'),
        renderHTML: (attributes) => {
          if (!attributes.caption) return {};
          return { 'data-caption': attributes.caption };
        },
      },
      width: {
        default: '100%',
        parseHTML: (element) => element.getAttribute('data-width') || '100%',
        renderHTML: (attributes) => ({ 'data-width': attributes.width }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="image-block"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, { 'data-type': 'image-block' }),
      ['img', { src: HTMLAttributes.src, alt: HTMLAttributes.alt }],
    ];
  },

  addCommands() {
    return {
      setImageBlock:
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
    return ReactNodeViewRenderer(ImageBlockView);
  },
});
