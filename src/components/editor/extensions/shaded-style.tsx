import { Extension } from '@tiptap/react';

export type ShadeColor = 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple' | 'gray';

declare module '@tiptap/react' {
  interface Commands<ReturnType> {
    shadedStyle: {
      setShadedStyle: (color: ShadeColor | null) => ReturnType;
      unsetShadedStyle: () => ReturnType;
    };
  }
}

export const ShadedStyle = Extension.create({
  name: 'shadedStyle',

  addGlobalAttributes() {
    return [
      {
        types: ['paragraph', 'heading', 'blockquote', 'codeBlock', 'bulletList', 'orderedList', 'taskList', 'callout', 'toggleBlock'],
        attributes: {
          shadedColor: {
            default: null,
            parseHTML: (element) => element.getAttribute('data-shaded-color'),
            renderHTML: (attributes) => {
              if (!attributes.shadedColor) return {};
              return { 'data-shaded-color': attributes.shadedColor };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setShadedStyle:
        (color) =>
        ({ commands }) => {
          return commands.updateAttributes(this.name, { shadedColor: color });
        },

      unsetShadedStyle:
        () =>
        ({ commands }) => {
          return commands.resetAttributes(this.name, 'shadedColor');
        },
    };
  },
});
