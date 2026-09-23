import { Mark, mergeAttributes } from '@tiptap/core';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    comment: {
      setComment: (threadId: string) => ReturnType;
      unsetComment: () => ReturnType;
    };
  }
}

export const CommentMark = Mark.create({
  name: 'commentMark',
  keepOnSplit: false,

  addAttributes() {
    return {
      threadId: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-thread-id'),
        renderHTML: (attributes) =>
          attributes.threadId ? { 'data-thread-id': attributes.threadId } : {},
      },
    };
  },

  parseHTML() {
    return [{ tag: 'span[data-comment]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes, { 'data-comment': '' }), 0];
  },

  addCommands() {
    return {
      setComment:
        (threadId: string) =>
        ({ commands }: { commands: any }) =>
          commands.setMark(this.name, { threadId }),
      unsetComment:
        () =>
        ({ commands }: { commands: any }) =>
          commands.unsetMark(this.name),
    };
  },
});
