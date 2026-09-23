import { Node, mergeAttributes } from '@tiptap/react';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { ImageGalleryView } from './image-gallery-view';

declare module '@tiptap/react' {
  interface Commands<ReturnType> {
    imageGallery: {
      setImageGallery: (attributes: {
        images?: Array<{ src: string; caption?: string | null }>;
      }) => ReturnType;
    };
  }
}

export const ImageGallery = Node.create({
  name: 'imageGallery',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      images: {
        default: [],
        parseHTML: (element) => {
          try {
            const raw = element.getAttribute('data-images');
            return raw ? JSON.parse(raw) : [];
          } catch {
            return [];
          }
        },
        renderHTML: (attributes) => ({
          'data-images': JSON.stringify(attributes.images ?? []),
        }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="image-gallery"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, { 'data-type': 'image-gallery' }),
    ];
  },

  addCommands() {
    return {
      setImageGallery:
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
    return ReactNodeViewRenderer(ImageGalleryView);
  },
});
