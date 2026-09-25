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
        className="rounded-lg bg-popover p-3 shadow-lg animate-in fade-in-0 zoom-in-95 duration-150"
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
      className="max-h-80 w-72 overflow-y-auto rounded-lg bg-popover p-1.5 shadow-lg animate-in fade-in-0 zoom-in-95 duration-150"
    >
      {Object.entries(grouped).map(([category, items]) => (
        <div key={category}>
          <div className="px-2 py-1.5 text-caption font-semibold uppercase tracking-wider text-foreground/40">
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
                  'flex h-8 w-full items-center gap-3 rounded-md px-2 text-left text-ui transition-colors duration-150 ease-craft',
                  idx === activeIndex
                    ? 'bg-foreground/4 text-foreground/85'
                    : 'text-foreground/85 hover:bg-foreground/4'
                )}
              >
                <div className="flex size-6 shrink-0 items-center justify-center rounded-md border border-foreground/8 bg-background">
                  <Icon className="size-3.5 text-foreground/55" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-ui font-medium leading-tight">{cmd.name}</div>
                  <div className="truncate text-meta text-foreground/40">{cmd.description}</div>
                </div>
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
