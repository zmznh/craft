import { Extension } from '@tiptap/react';
import Suggestion from '@tiptap/suggestion';
import { PluginKey } from '@tiptap/pm/state';
import { ReactRenderer } from '@tiptap/react';
import { filterCommands, type SlashCommand as Command } from './slash-commands';
import { SlashCommandMenu } from './SlashCommandMenu';
import type { Editor } from '@tiptap/react';
import type { SuggestionProps } from '@tiptap/suggestion';

type Props = SuggestionProps<Command, Command>;

export const SlashCommand = Extension.create({
  name: 'slashCommand',

  addProseMirrorPlugins() {
    return [
      Suggestion<Command, Command>({
        editor: this.editor,
        pluginKey: new PluginKey('slashCommand'),
        char: '/',
        allowSpaces: false,
        allowedPrefixes: null,
        items: ({ query }) => filterCommands(query),
        // The command has to run through the plugin, not a window listener: Enter
        // reaches ProseMirror's split-block first, so a handler that runs later
        // would insert into a document the caret has already left.
        command: ({ editor, range, props }) => props.command(editor, range),
        render: () => {
          let renderer: ReactRenderer<{
            commands: Command[];
            selectedIndex: number;
            editor: Editor;
            range: { from: number; to: number };
          }> | null = null;
          let unmount: (() => void) | null = null;
          let latest: Props | null = null;
          let selectedIndex = 0;

          const cleanup = () => {
            renderer?.destroy();
            unmount?.();
            renderer = null;
            unmount = null;
            latest = null;
          };

          const paint = () => {
            if (!latest) return;
            renderer?.updateProps({
              commands: latest.items,
              selectedIndex,
              editor: latest.editor,
              range: latest.range,
            });
          };

          return {
            onStart: (props) => {
              latest = props as Props;
              selectedIndex = 0;
              renderer = new ReactRenderer(SlashCommandMenu, {
                editor: props.editor,
                props: {
                  commands: (props as Props).items,
                  selectedIndex,
                  editor: props.editor,
                  range: props.range,
                },
              });
              unmount = props.mount ? props.mount(renderer.element) : null;
            },
            onUpdate: (props) => {
              latest = props as Props;
              paint();
            },
            onExit: cleanup,
            onKeyDown: ({ event }) => {
              if (event.key === 'Escape') {
                cleanup();
                return true;
              }
              const items = latest?.items ?? [];
              if (!latest || items.length === 0) return false;

              if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                const delta = event.key === 'ArrowDown' ? 1 : -1;
                selectedIndex = (selectedIndex + delta + items.length) % items.length;
                paint();
                return true;
              }
              if (event.key === 'Enter' || event.key === 'Tab') {
                latest.command(items[selectedIndex]);
                return true;
              }
              return false;
            },
          };
        },
      }),
    ];
  },
});
