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
    <div className="max-h-64 w-72 overflow-y-auto rounded-lg border border-border bg-popover p-1.5 shadow-md">
      <div className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        链接到文档
      </div>
      {candidates.length === 0 && (
        <div className="px-2 py-3 text-sm text-muted-foreground">
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
            'flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left transition-colors',
            idx === selectedIndex
              ? 'bg-accent text-accent-foreground'
              : 'text-foreground hover:bg-muted'
          )}
        >
          {candidate.icon ? (
            <span className="text-base leading-none">{candidate.icon}</span>
          ) : (
            <FileText className="size-4 shrink-0 text-muted-foreground" />
          )}
          <span className="min-w-0 flex-1 truncate text-sm">{candidate.title}</span>
          <Link2 className="size-3.5 shrink-0 text-muted-foreground" />
        </button>
      ))}
    </div>
  );
}
