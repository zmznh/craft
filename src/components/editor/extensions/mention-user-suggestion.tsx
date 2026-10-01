import { Extension } from '@tiptap/react';
import Suggestion from '@tiptap/suggestion';
import { PluginKey } from '@tiptap/pm/state';
import { ReactRenderer } from '@tiptap/react';
import type { SuggestionProps } from '@tiptap/suggestion';
import { MentionUserMenu } from './mention-user-menu';
import type { MentionMenuHandle } from './mention-user-menu';

interface MentionUserSuggestionOptions {
  documentId: string;
  char: string;
  allowSpaces: boolean;
  allowedPrefixes: string[] | null;
}

let currentRenderer: ReactRenderer | null = null;
let unmountFn: (() => void) | null = null;

function cleanup() {
  currentRenderer?.destroy();
  unmountFn?.();
  currentRenderer = null;
  unmountFn = null;
}

export const MentionUserSuggestion = Extension.create<MentionUserSuggestionOptions>({
  name: 'mentionUserSuggestion',

  addOptions() {
    return {
      documentId: '',
      char: '@',
      allowSpaces: false,
      allowedPrefixes: null,
    };
  },

  addProseMirrorPlugins() {
    const { documentId, char, allowSpaces, allowedPrefixes } = this.options;

    return [
      Suggestion({
        editor: this.editor,
        pluginKey: new PluginKey('mentionUserSuggestion'),
        char,
        allowSpaces,
        allowedPrefixes,
        // The menu runs its own debounced query, the way `[[` does.
        items: () => [],
        render: () => ({
          onStart: (props: SuggestionProps) => {
            const component = new ReactRenderer(MentionUserMenu, {
              props: {
                editor: props.editor,
                query: props.query,
                documentId,
                range: props.range,
                onClose: cleanup,
              },
              editor: props.editor,
            });
            currentRenderer = component;
            if (props.clientRect) unmountFn = props.mount(component.element);
          },
          onUpdate: (props: SuggestionProps) => {
            currentRenderer?.updateProps({
              editor: props.editor,
              query: props.query,
              documentId,
              range: props.range,
              onClose: cleanup,
            });
          },
          onExit() {
            cleanup();
          },
          onKeyDown({ event }: { event: KeyboardEvent }) {
            const menu = currentRenderer?.ref as MentionMenuHandle | null;
            if (event.key === 'Escape') {
              cleanup();
              return true;
            }
            if (!menu) return false;
            if (event.key === 'ArrowDown') {
              menu.moveSelection(1);
              return true;
            }
            if (event.key === 'ArrowUp') {
              menu.moveSelection(-1);
              return true;
            }
            if (event.key === 'Enter') {
              menu.selectRecommendation();
              return true;
            }
            return false;
          },
        }),
      }),
    ];
  },
});
