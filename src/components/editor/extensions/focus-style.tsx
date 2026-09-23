import { Extension } from '@tiptap/react';

export type FocusColor = 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple' | 'gray';

declare module '@tiptap/react' {
  interface Commands<ReturnType> {
    focusStyle: {
      setFocusStyle: (color: FocusColor | null) => ReturnType;
      unsetFocusStyle: () => ReturnType;
    };
  }
}

export const FocusStyle = Extension.create({
  name: 'focusStyle',

  addGlobalAttributes() {
    return [
      {
        types: ['paragraph', 'heading', 'blockquote', 'codeBlock', 'bulletList', 'orderedList', 'taskList', 'callout', 'toggleBlock'],
        attributes: {
          focusColor: {
            default: null,
            parseHTML: (element) => element.getAttribute('data-focus-color'),
            renderHTML: (attributes) => {
              if (!attributes.focusColor) return {};
              return { 'data-focus-color': attributes.focusColor };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setFocusStyle:
        (color) =>
        ({ commands }) => {
          return commands.updateAttributes(this.name, { focusColor: color });
        },

      unsetFocusStyle:
        () =>
        ({ commands }) => {
          return commands.resetAttributes(this.name, 'focusColor');
        },
    };
  },
});
