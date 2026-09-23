import { Extension } from '@tiptap/react';
import Suggestion from '@tiptap/suggestion';
import { ReactRenderer } from '@tiptap/react';
import { filterCommands } from './slash-commands';
import { SlashCommandMenu } from './SlashCommandMenu';
import type { Editor } from '@tiptap/react';
import type { SuggestionProps } from '@tiptap/suggestion';
import type { ReactRenderer as ReactRendererType } from '@tiptap/react';

interface SlashCommandOptions {
  suggestion: {
    char: string;
    items: (props: { query: string; editor: Editor }) => any[];
    render: () => any;
  };
}

let currentRenderer: ReactRendererType | null = null;
let unmountFn: (() => void) | null = null;

export const SlashCommand = Extension.create<SlashCommandOptions>({
  name: 'slashCommand',

  addOptions() {
    return {
      suggestion: {
        char: '/',
        items: ({ query }: { query: string; editor: Editor }) => {
          return filterCommands(query);
        },
        render: () => {
          return {
            onStart: (props: SuggestionProps) => {
              const component = new ReactRenderer(SlashCommandMenu, {
                props: {
                  ...props,
                  onClose: () => {
                    component.destroy();
                    unmountFn?.();
                    currentRenderer = null;
                    unmountFn = null;
                  },
                },
                editor: props.editor,
              });

              currentRenderer = component;

              if (props.clientRect) {
                unmountFn = props.mount(component.element);
              }
            },

            onUpdate(props: SuggestionProps) {
              if (!currentRenderer) return;

              currentRenderer.updateProps({
                ...props,
                onClose: () => {
                  currentRenderer?.destroy();
                  unmountFn?.();
                  currentRenderer = null;
                  unmountFn = null;
                },
              });
            },

            onExit() {
              currentRenderer?.destroy();
              unmountFn?.();
              currentRenderer = null;
              unmountFn = null;
            },

            onKeyDown(props: { event: KeyboardEvent }) {
              if (props.event.key === 'Escape') {
                currentRenderer?.destroy();
                unmountFn?.();
                currentRenderer = null;
                unmountFn = null;
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
        ...this.options.suggestion,
      }),
    ];
  },
});
