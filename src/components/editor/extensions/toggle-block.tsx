import { Node, mergeAttributes } from '@tiptap/react';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { ToggleBlockView } from './toggle-block-view';

declare module '@tiptap/react' {
  interface Commands<ReturnType> {
    toggleBlock: {
      setToggleBlock: () => ReturnType;
      toggleToggleBlock: () => ReturnType;
      unsetToggleBlock: () => ReturnType;
    };
  }
}

export const ToggleBlock = Node.create({
  name: 'toggleBlock',
  group: 'block',
  content: 'block+',
  defining: true,

  addAttributes() {
    return {
      open: {
        default: false,
        parseHTML: (element) => element.getAttribute('data-open') === 'true',
        renderHTML: (attributes) => ({
          'data-open': attributes.open,
        }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'details[data-type="toggle-block"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['details', mergeAttributes(HTMLAttributes, { 'data-type': 'toggle-block' }), 0];
  },

  addCommands() {
    return {
      setToggleBlock:
        () =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: { open: false },
            content: [{ type: 'paragraph' }],
          });
        },

      toggleToggleBlock:
        () =>
        ({ commands }) => {
          return commands.toggleNode(this.name, 'paragraph');
        },

      unsetToggleBlock:
        () =>
        ({ commands }) => {
          return commands.lift(this.name);
        },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(ToggleBlockView);
  },
});
