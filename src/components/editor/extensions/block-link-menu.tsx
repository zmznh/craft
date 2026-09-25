'use client';

import { useEffect, useState, useRef, useCallback, useLayoutEffect } from 'react';
import { FileText, Link2 } from 'lucide-react';
import type { Editor } from '@tiptap/react';
import { searchDocumentsForLink } from '@/actions/document/search';
import type { LinkCandidate } from '@/actions/document/search';
import { cn } from 'cn';

interface BlockLinkMenuProps {
  editor: Editor;
  query: string;
  range: { from: number; to: number };
  onClose: () => void;
}

export function BlockLinkMenu({ editor, query, range, onClose }: BlockLinkMenuProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [candidates, setCandidates] = useState<LinkCandidate[]>([]);
  const [loading, setLoading] = useState(false);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const latestQuery = useRef(query);

  useEffect(() => {
    latestQuery.current = query;
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const result = await searchDocumentsForLink(query);
        if (latestQuery.current === query) {
          setCandidates(result);
          setSelectedIndex(0);
        }
      } finally {
        if (latestQuery.current === query) setLoading(false);
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [query]);

  useLayoutEffect(() => {
    const selected = itemRefs.current[selectedIndex];
    if (selected) {
      selected.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  const selectItem = useCallback(
    (index: number) => {
      const candidate = candidates[index];
      if (candidate) {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .setBlockLink({ documentId: candidate.id, title: candidate.title })
          .run();
        onClose();
      }
    },
    [candidates, editor, range, onClose]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : Math.max(candidates.length - 1, 0)));
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < candidates.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        selectItem(selectedIndex);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [candidates.length, selectedIndex, selectItem, onClose]);

  return (
    <div className="max-h-64 w-72 overflow-y-auto rounded-lg bg-popover p-1.5 shadow-lg animate-in fade-in-0 zoom-in-95 duration-150">
      <div className="px-2 py-1.5 text-caption font-semibold uppercase tracking-wider text-foreground/40">
        链接到文档
      </div>
      {candidates.length === 0 && (
        <div className="px-2 py-3 text-ui text-foreground/40">
          {loading ? '搜索中…' : '无匹配文档'}
        </div>
      )}
      {candidates.map((candidate, idx) => (
        <button
          key={candidate.id}
          ref={(el) => { itemRefs.current[idx] = el; }}
          type="button"
          onClick={() => selectItem(idx)}
          className={cn(
            'flex h-8 w-full items-center gap-2.5 rounded-md px-2 text-left text-ui transition-colors duration-150 ease-craft',
            idx === selectedIndex
              ? 'bg-foreground/4 text-foreground/85'
              : 'text-foreground/85 hover:bg-foreground/4'
          )}
        >
          {candidate.icon ? (
            <span className="text-base leading-none">{candidate.icon}</span>
          ) : (
            <FileText className="size-4 shrink-0 text-foreground/55" />
          )}
          <span className="min-w-0 flex-1 truncate text-ui">{candidate.title}</span>
          <Link2 className="size-3.5 shrink-0 text-muted-foreground" />
        </button>
      ))}
    </div>
  );
}
