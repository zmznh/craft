import { Extension } from '@tiptap/react';
import { InputRule } from '@tiptap/core';

export const MarkdownShortcuts = Extension.create({
  name: 'markdownShortcuts',

  addInputRules() {
    const rules: InputRule[] = [];

    // Strikethrough: ~~text~~
    if (this.editor.schema.marks.strikethrough) {
      rules.push(
        new InputRule({
          find: /~~(.+?)~~$/,
          handler: ({ state, range, match }) => {
            const { tr } = state;
            const text = match[1];

            tr.replaceWith(
              range.from,
              range.to,
              state.schema.text(text, [
                state.schema.marks.strikethrough.create(),
              ])
            );
          },
        })
      );
    }

    // Highlight: ==text==
    if (this.editor.schema.marks.highlight) {
      rules.push(
        new InputRule({
          find: /==(.+?)==$/,
          handler: ({ state, range, match }) => {
            const { tr } = state;
            const text = match[1];

            tr.replaceWith(
              range.from,
              range.to,
              state.schema.text(text, [
                state.schema.marks.highlight.create(),
              ])
            );
          },
        })
      );
    }

    // Link: [text](url)
    if (this.editor.schema.marks.link) {
      rules.push(
        new InputRule({
          find: /\[(.+?)\]\((.+?)\)$/,
          handler: ({ state, range, match }) => {
            const { tr } = state;
            const text = match[1];
            const url = match[2];

            tr.replaceWith(
              range.from,
              range.to,
              state.schema.text(text, [
                state.schema.marks.link.create({ href: url }),
              ])
            );
          },
        })
      );
    }

    return rules;
  },
});
