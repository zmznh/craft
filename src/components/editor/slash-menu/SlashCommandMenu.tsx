'use client';

import { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react';
import { filterCommands, type SlashCommand } from './slash-commands';
import type { Editor } from '@tiptap/react';
import { cn } from 'cn';

interface SlashCommandMenuProps {
  editor: Editor;
  query: string;
  range: { from: number; to: number };
  onClose: () => void;
}

export function SlashCommandMenu({ editor, query, range, onClose }: SlashCommandMenuProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const commands = filterCommands(query);
  const activeIndex = Math.min(selectedIndex, Math.max(commands.length - 1, 0));
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useLayoutEffect(() => {
    const selected = itemRefs.current[activeIndex];
    if (selected) {
      selected.scrollIntoView({ block: 'nearest' });
    }
  }, [activeIndex]);

  const selectItem = useCallback(
    (index: number) => {
      const cmd = commands[index];
      if (cmd) {
        cmd.command(editor, range);
        onClose();
      }
    },
    [commands, editor, range, onClose]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!editor.view.hasFocus() && !containerRef.current?.contains(document.activeElement)) return;
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : commands.length - 1));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => (prev < commands.length - 1 ? prev + 1 : 0));
          break;
        case 'Enter':
          e.preventDefault();
          selectItem(activeIndex);
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [commands.length, activeIndex, selectItem, onClose]);

  if (commands.length === 0) {
    return (
      <div
        ref={containerRef}
        role="listbox"
        aria-label="插入命令"
        className="rounded-lg border border-border bg-popover p-3 shadow-md"
      >
        <p className="text-sm text-muted-foreground">无匹配命令</p>
      </div>
    );
  }

  const grouped = commands.reduce<Record<string, SlashCommand[]>>((acc, cmd) => {
    if (!acc[cmd.category]) acc[cmd.category] = [];
    acc[cmd.category].push(cmd);
    return acc;
  }, {});

  let globalIndex = -1;

  return (
    <div
      ref={containerRef}
      role="listbox"
      aria-label="插入命令"
      className="max-h-80 w-72 overflow-y-auto rounded-lg border border-border bg-popover p-1.5 shadow-md"
    >
      {Object.entries(grouped).map(([category, items]) => (
        <div key={category}>
          <div className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {category}
          </div>
          {items.map((cmd) => {
            globalIndex++;
            const idx = globalIndex;
            const Icon = cmd.icon;
            return (
              <button
                key={cmd.name}
                ref={(el) => { itemRefs.current[idx] = el; }}
                type="button"
                role="option"
                aria-selected={idx === activeIndex}
                onClick={() => selectItem(idx)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-md px-2 py-1.5 text-left transition-colors',
                  idx === activeIndex
                    ? 'bg-accent text-accent-foreground'
                    : 'text-foreground hover:bg-muted'
                )}
              >
                <div className="flex size-8 shrink-0 items-center justify-center rounded-md border border-border bg-background">
                  <Icon className="size-4 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium">{cmd.name}</div>
                  <div className="truncate text-xs text-muted-foreground">{cmd.description}</div>
                </div>
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
