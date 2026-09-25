'use client';

import { NodeViewWrapper } from '@tiptap/react';
import type { NodeViewProps } from '@tiptap/react';
import { List } from 'lucide-react';
import { useEffect, useState } from 'react';

interface TocEntry {
  text: string;
  level: number;
  index: number;
}

function collectHeadings(editor: NodeViewProps['editor']): TocEntry[] {
  const entries: TocEntry[] = [];
  editor.state.doc.descendants((node) => {
    if (node.type.name === 'heading') {
      entries.push({
        text: node.textContent.trim() || '未命名',
        level: (node.attrs.level as number) ?? 1,
        index: entries.length,
      });
    }
  });
  return entries;
}

export function TableOfContentsView({ editor }: NodeViewProps) {
  const [entries, setEntries] = useState<TocEntry[]>(() => collectHeadings(editor));

  useEffect(() => {
    const sync = () => setEntries(collectHeadings(editor));
    editor.on('update', sync);
    editor.on('transaction', sync);
    return () => {
      editor.off('update', sync);
      editor.off('transaction', sync);
    };
  }, [editor]);

  const jump = (index: number) => {
    // The headings are the only elements of their kind inside the editor, so the
    // nth match is the entry the list is showing.
    const target = document.querySelectorAll('.ProseMirror h1, .ProseMirror h2, .ProseMirror h3, .ProseMirror h4')[index];
    target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  if (entries.length === 0) {
    return (
      <NodeViewWrapper as="div">
        <div className="flex items-center gap-2 rounded-lg border border-dashed border-border px-3 py-2 text-[13px] text-muted-foreground">
          <List className="size-4" />
          目录：给标题加上层级后会自动出现在这里
        </div>
      </NodeViewWrapper>
    );
  }

  return (
    <NodeViewWrapper as="div">
      <nav
        aria-label="目录"
        className="my-2 rounded-lg border border-border bg-muted/20 px-3 py-2"
      >
        <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
          目录
        </p>
        <ul className="space-y-0.5">
          {entries.map((entry) => (
            <li key={`${entry.index}-${entry.text}`}>
              <button
                type="button"
                onClick={() => jump(entry.index)}
                className="block w-full truncate rounded px-1 py-0.5 text-left text-[13px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                style={{ paddingLeft: `${(entry.level - 1) * 0.75 + 0.25}rem` }}
              >
                {entry.text}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </NodeViewWrapper>
  );
}
