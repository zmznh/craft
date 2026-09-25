import { Node, mergeAttributes } from '@tiptap/react';
import { nodeInputRule } from '@tiptap/core';

export type DividerStyle = 'thin' | 'medium' | 'thick' | 'dashed';

/** Craft's four typed sigils. Each is matched whole-line so they cannot eat each other. */
export const DIVIDER_SIGILS: Record<string, DividerStyle> = {
  '..-': 'thin',
  '.--': 'medium',
  '---': 'thick',
  '=-': 'dashed',
  // Typography rewrites `--` into an en dash before input rules run, so a typed
  // `---` usually reaches us as `–-`. Both spellings mean "thick".
  '–-': 'thick',
  '—-': 'thick',
};

export const DIVIDER_PATTERN = /^(\.\.-|\.--|---|–-|—-|=-)$/;

declare module '@tiptap/react' {
  interface Commands<ReturnType> {
    divider: {
      setDivider: (style?: DividerStyle) => ReturnType;
    };
  }
}

export const Divider = Node.create({
  name: 'divider',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      style: {
        default: 'thin',
        parseHTML: (element) => element.getAttribute('data-style') || 'thin',
        renderHTML: (attributes) => ({ 'data-style': attributes.style }),
      },
    };
  },

  parseHTML() {
    // The bare `hr` branch keeps documents written before StarterKit's horizontal
    // rule was switched off loadable.
    return [{ tag: 'hr[data-type="divider"]' }, { tag: 'hr' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['hr', mergeAttributes(HTMLAttributes, { 'data-type': 'divider' })];
  },

  addInputRules() {
    return [
      nodeInputRule({
        find: DIVIDER_PATTERN,
        type: this.type,
        getAttributes: (match) => ({ style: DIVIDER_SIGILS[match[1]] }),
      }),
    ];
  },

  addCommands() {
    return {
      setDivider:
        (style = 'thin') =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: { style },
          });
        },
    };
  },
});
