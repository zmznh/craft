'use client';

import { Extension } from '@tiptap/react';
import { ReactRenderer } from '@tiptap/react';
import Suggestion from '@tiptap/suggestion';
import type { SuggestionProps } from '@tiptap/suggestion';
import { PluginKey } from '@tiptap/pm/state';
import { loadEmojiIndex, searchEmojis, type EmojiEntry } from '@/lib/emoji/data';

type Props = SuggestionProps<EmojiEntry, EmojiEntry>;

interface EmojiMenuProps {
  entries: EmojiEntry[];
  selected: number;
}

function EmojiMenu({ entries, selected }: EmojiMenuProps) {
  if (entries.length === 0) return null;

  return (
    <div className="max-h-64 w-56 overflow-y-auto rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-lg">
      {entries.map((entry, index) => (
        <div
          key={entry.char + entry.name}
          data-selected={index === selected || undefined}
          className="flex items-center gap-2 rounded px-2 py-1 text-sm data-[selected]:bg-accent data-[selected]:text-accent-foreground"
        >
          <span className="text-base leading-none">{entry.char}</span>
          <span className="truncate text-muted-foreground">{entry.name}</span>
        </div>
      ))}
    </div>
  );
}

/** Populated on first use; the dataset is a lazy chunk, not part of the editor bundle. */
let emojiCache: EmojiEntry[] = [];

export const EmojiSuggestion = Extension.create({
  name: 'emojiSuggestion',

  // The plugin only renders once `items` returns something, so the dataset cannot
  // be fetched from inside onStart. One editor per document, one cached promise
  // across the session.
  onCreate() {
    if (!emojiCache.length) {
      void loadEmojiIndex().then((list) => {
        emojiCache = list;
      });
    }
  },

  addProseMirrorPlugins() {
    return [
      Suggestion<EmojiEntry, EmojiEntry>({
        editor: this.editor,
        pluginKey: new PluginKey('emojiSuggestion'),
        char: ':',
        allowSpaces: false,
        allowedPrefixes: null,
        // Two characters before the menu appears: typing a colon in prose
        // ("注意:") must not open a picker.
        items: ({ query }) => (query.length >= 2 ? searchEmojis(emojiCache, query) : []),
        command: ({ editor, range, props }) => {
          editor.chain().focus().deleteRange(range).insertContent(props.char).run();
        },
        render: () => {
          let renderer: ReactRenderer<EmojiMenuProps> | null = null;
          let unmount: (() => void) | null = null;
          let latest: Props | null = null;
          let entries: EmojiEntry[] = [];
          let selected = 0;

          const paint = () => renderer?.updateProps({ entries, selected });

          const refresh = (props: Props) => {
            latest = props;
            entries = props.items.length ? props.items : searchEmojis(emojiCache, props.query);
            selected = 0;

            if (!renderer) {
              renderer = new ReactRenderer(EmojiMenu, {
                editor: props.editor,
                props: { entries, selected },
              });
              unmount = props.mount ? props.mount(renderer.element) : null;
            } else {
              paint();
            }
          };

          return {
            onStart: (props) => refresh(props as Props),
            onUpdate: (props) => refresh(props as Props),
            onExit: () => {
              renderer?.destroy();
              unmount?.();
              renderer = null;
              unmount = null;
              latest = null;
              entries = [];
            },
            onKeyDown: ({ event }) => {
              if (!latest || entries.length === 0) return false;

              if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                const delta = event.key === 'ArrowDown' ? 1 : -1;
                selected = (selected + delta + entries.length) % entries.length;
                paint();
                return true;
              }
              if (event.key === 'Enter' || event.key === 'Tab') {
                latest.command(entries[selected]);
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
