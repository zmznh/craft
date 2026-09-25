import { Extension } from '@tiptap/react';
import { InputRule, nodeInputRule } from '@tiptap/core';

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

    // Display math: $$\alpha$$. nodeInputRule because replacing a whole textblock
    // with a block node needs the paragraph swapped out, not a range delete.
    if (this.editor.schema.nodes.mathBlock) {
      rules.push(
        nodeInputRule({
          find: /\$\$([\s\S]+?)\$\$$/,
          type: this.editor.schema.nodes.mathBlock,
          getAttributes: (match) => ({ latex: match[1].trim() }),
        })
      );
    }

    // Inline math: $x^2$. The content must be space-free, otherwise prose like
    // "价格 $10 和 $20" converts on the second dollar sign. Spaces are common in
    // real LaTeX, which is what the $$ block rule is for.
    if (this.editor.schema.nodes.inlineMath) {
      rules.push(
        new InputRule({
          find: /(?<!\$)\$([^$\s]+)\$$/,
          handler: ({ chain, range, match }) => {
            chain()
              .deleteRange(range)
              .insertContent({ type: 'inlineMath', attrs: { latex: match[1] } })
              .run();
          },
        })
      );
    }

    // Todo: `[] ` or `[x] ` at the start of a line, Craft's shortcut. Restricted to
    // top-level paragraphs — inside a bullet list the replacement would be content the
    // schema rejects, and `- [ ]` there is the importer's job, not the editor's.
    if (this.editor.schema.nodes.taskList && this.editor.schema.nodes.taskItem) {
      rules.push(
        new InputRule({
          find: /^\[([ xX])\]\s$/,
          handler: ({ state, range, match }) => {
            const $at = state.doc.resolve(range.from);
            if ($at.depth !== 1 || $at.parent.type.name !== 'paragraph') return;

            const { taskList, taskItem, paragraph } = state.schema.nodes;
            const blockStart = $at.before(1);
            const tail = $at.parent.textContent.slice(range.to - blockStart - 1);
            const { tr } = state;

            tr.replaceWith(
              blockStart,
              $at.after(1),
              taskList.create(
                null,
                taskItem.create(
                  { checked: match[1].toLowerCase() === 'x' },
                  paragraph.create(null, tail ? state.schema.text(tail) : null)
                )
              )
            );
          },
        })
      );
    }

    return rules;
  },
});
