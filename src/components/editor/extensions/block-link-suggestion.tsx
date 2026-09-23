/* eslint-disable @typescript-eslint/no-explicit-any */
import { Extension } from '@tiptap/react';
import Suggestion from '@tiptap/suggestion';
import { PluginKey } from '@tiptap/pm/state';
import { ReactRenderer } from '@tiptap/react';
import type { Editor } from '@tiptap/react';
import { BlockLinkMenu } from './block-link-menu';
import type { SuggestionProps } from '@tiptap/suggestion';

interface BlockLinkSuggestionOptions {
  suggestion: {
    char: string;
    allowSpaces: boolean;
    items: (props: { query: string; editor: Editor }) => any[];
    render: () => any;
  };
}

let currentRenderer: ReactRenderer | null = null;
let unmountFn: (() => void) | null = null;

function cleanup() {
  currentRenderer?.destroy();
  unmountFn?.();
  currentRenderer = null;
  unmountFn = null;
}

export const BlockLinkSuggestion = Extension.create<BlockLinkSuggestionOptions>({
  name: 'blockLinkSuggestion',

  addOptions() {
    return {
      suggestion: {
        char: '[[',
        allowSpaces: true,
        allowedPrefixes: null,
        items: ({ query }: { query: string }) => [],
        render: () => {
          return {
            onStart: (props: SuggestionProps) => {
              const component = new ReactRenderer(BlockLinkMenu, {
                props: {
                  editor: props.editor,
                  query: props.query,
                  range: props.range,
                  onClose: cleanup,
                },
                editor: props.editor,
              });

              currentRenderer = component;
              if (props.clientRect) {
                unmountFn = props.mount(component.element);
              }
            },
            onUpdate: (props: SuggestionProps) => {
              if (!currentRenderer) return;
              currentRenderer.updateProps({
                editor: props.editor,
                query: props.query,
                range: props.range,
                onClose: cleanup,
              });
            },
            onExit() {
              cleanup();
            },
            onKeyDown(props: { event: KeyboardEvent }) {
              if (props.event.key === 'Escape') {
                cleanup();
                return true;
              }
              return false;
            },
          };
        },
      },
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        pluginKey: new PluginKey('blockLinkSuggestion'),
        ...this.options.suggestion,
      }),
    ];
  },
});
