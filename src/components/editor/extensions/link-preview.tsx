import { Node, mergeAttributes } from '@tiptap/react';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { LinkPreviewView } from './link-preview-view';

declare module '@tiptap/react' {
  interface Commands<ReturnType> {
    linkPreview: {
      setLinkPreview: (attributes: {
        url: string;
        title?: string | null;
        description?: string | null;
        image?: string | null;
        favicon?: string | null;
        siteName?: string | null;
      }) => ReturnType;
    };
  }
}

export const LinkPreview = Node.create({
  name: 'linkPreview',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      url: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-url'),
        renderHTML: (attributes) => ({ 'data-url': attributes.url }),
      },
      title: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-title'),
        renderHTML: (attributes) => {
          if (!attributes.title) return {};
          return { 'data-title': attributes.title };
        },
      },
      description: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-description'),
        renderHTML: (attributes) => {
          if (!attributes.description) return {};
          return { 'data-description': attributes.description };
        },
      },
      image: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-image'),
        renderHTML: (attributes) => {
          if (!attributes.image) return {};
          return { 'data-image': attributes.image };
        },
      },
      favicon: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-favicon'),
        renderHTML: (attributes) => {
          if (!attributes.favicon) return {};
          return { 'data-favicon': attributes.favicon };
        },
      },
      siteName: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-site-name'),
        renderHTML: (attributes) => {
          if (!attributes.siteName) return {};
          return { 'data-site-name': attributes.siteName };
        },
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="link-preview"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, { 'data-type': 'link-preview' }),
    ];
  },

  addCommands() {
    return {
      setLinkPreview:
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
    return ReactNodeViewRenderer(LinkPreviewView);
  },
});
