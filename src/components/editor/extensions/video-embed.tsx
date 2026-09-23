import { Node, mergeAttributes } from '@tiptap/react';

declare module '@tiptap/react' {
  interface Commands<ReturnType> {
    videoEmbed: {
      setVideoEmbed: (attributes: { src: string }) => ReturnType;
    };
  }
}

export const VideoEmbed = Node.create({
  name: 'videoEmbed',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      src: {
        default: null,
        parseHTML: (element) => {
          const iframe = element.querySelector('iframe');
          return iframe?.getAttribute('src');
        },
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="video-embed"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, { 'data-type': 'video-embed' }),
      [
        'iframe',
        {
          src: HTMLAttributes.src,
          frameborder: '0',
          allowfullscreen: 'true',
        },
      ],
    ];
  },

  addCommands() {
    return {
      setVideoEmbed:
        (attributes) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: attributes,
          });
        },
    };
  },
});
