import { Mark, mergeAttributes } from '@tiptap/react';

export type GradientColor = 'purple' | 'red' | 'blue' | 'yellow' | 'green' | 'pink';

declare module '@tiptap/react' {
  interface Commands<ReturnType> {
    gradientHighlight: {
      setGradientHighlight: (color: GradientColor) => ReturnType;
      unsetGradientHighlight: () => ReturnType;
    };
  }
}

export const GradientHighlight = Mark.create({
  name: 'gradientHighlight',

  addAttributes() {
    return {
      color: {
        default: 'purple',
        parseHTML: (element) => element.getAttribute('data-gradient') || 'purple',
        renderHTML: (attributes) => ({
          'data-gradient': attributes.color,
        }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'span[data-gradient]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes), 0];
  },

  addCommands() {
    return {
      setGradientHighlight:
        (color) =>
        ({ commands }) => {
          return commands.setMark(this.name, { color });
        },

      unsetGradientHighlight:
        () =>
        ({ commands }) => {
          return commands.unsetMark(this.name);
        },
    };
  },
});
