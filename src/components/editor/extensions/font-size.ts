import { Extension } from '@tiptap/react';
import type { Editor } from '@tiptap/react';
import { DEFAULT_FONT_SIZE, isFontSize, stepFontSize } from '@/lib/editor/font-size';

declare module '@tiptap/react' {
  interface Commands<ReturnType> {
    fontSize: {
      setFontSize: (size: number | null) => ReturnType;
      stepFontSize: (delta: 1 | -1) => ReturnType;
    };
  }
}

/** Blocks that carry a size of their own in Craft. */
const SIZED_TYPES = ['paragraph', 'heading', 'blockquote'];

export const FontSize = Extension.create({
  name: 'fontSize',

  addGlobalAttributes() {
    return [
      {
        types: SIZED_TYPES,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element) => {
              const parsed = Number.parseInt(element.style.fontSize ?? '', 10);
              return isFontSize(parsed) ? parsed : null;
            },
            renderHTML: (attributes) =>
              attributes.fontSize ? { style: `font-size: ${attributes.fontSize as number}px` } : {},
          },
        },
      },
    ];
  },

  addCommands() {
    const rewriteBlocks =
      (rewrite: (attrs: Record<string, unknown>) => Record<string, unknown>) =>
      ({ editor }: { editor: Editor }) => {
        const { selection, tr } = editor.state;
        let touched = false;

        editor.state.doc.nodesBetween(selection.from, selection.to, (node, pos) => {
          if (!SIZED_TYPES.includes(node.type.name)) return;
          tr.setNodeMarkup(pos, undefined, rewrite(node.attrs));
          touched = true;
        });

        if (touched) editor.view.dispatch(tr);
        return touched;
      };

    return {
      setFontSize: (size) =>
        rewriteBlocks((attrs) => ({ ...attrs, fontSize: isFontSize(size) ? size : null })),
      stepFontSize: (delta) =>
        rewriteBlocks((attrs) => ({
          ...attrs,
          fontSize: stepFontSize(attrs.fontSize as number | null | undefined, delta),
        })),
    };
  },

  addKeyboardShortcuts() {
    // Hyphens, not plus signs: prosemirror-keymap splits modifier names on `-`, so
    // a key written "Mod+=" parses as one unrecognised name and never fires.
    // Shift+= arrives as "+", which the keyCode fallback maps back to "=".
    return {
      'Mod-=': () => this.editor.commands.stepFontSize(1),
      'Mod--': () => this.editor.commands.stepFontSize(-1),
      'Mod-Shift-=': () => this.editor.commands.stepFontSize(1),
      'Mod-Shift--': () => this.editor.commands.stepFontSize(-1),
    };
  },
});
