'use client';

import { useEffect, useState, useRef, useCallback, useLayoutEffect } from 'react';
import { Copy, FileText, Link2, Pilcrow } from 'lucide-react';
import type { Editor } from '@tiptap/react';
import { searchDocumentsForLink } from '@/actions/document/search';
import type { LinkCandidate } from '@/actions/document/search';
import { searchBlockAnchors, type BlockAnchorHit } from '@/actions/document/anchors';
import { cn } from 'cn';

type Row =
  | { kind: 'doc'; candidate: LinkCandidate }
  | { kind: 'block'; hit: BlockAnchorHit };

interface BlockLinkMenuProps {
  editor: Editor;
  query: string;
  range: { from: number; to: number };
  onClose: () => void;
}

export function BlockLinkMenu({ editor, query, range, onClose }: BlockLinkMenuProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [candidates, setCandidates] = useState<LinkCandidate[]>([]);
  const [blocks, setBlocks] = useState<BlockAnchorHit[]>([]);
  const [loading, setLoading] = useState(false);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const latestQuery = useRef(query);

  const rows: Row[] = [
    ...candidates.map((candidate) => ({ kind: 'doc' as const, candidate })),
    ...blocks.map((hit) => ({ kind: 'block' as const, hit })),
  ];

  useEffect(() => {
    latestQuery.current = query;
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const [documents, anchors] = await Promise.all([
          searchDocumentsForLink(query),
          searchBlockAnchors(query),
        ]);
        if (latestQuery.current === query) {
          setCandidates(documents);
          setBlocks(anchors);
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
      const row = rows[index];
      if (!row) return;

      if (row.kind === 'doc') {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .setBlockLink({ documentId: row.candidate.id, title: row.candidate.title })
          .run();
        onClose();
        return;
      }

      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setBlockLink({
          documentId: row.hit.documentId,
          title: row.hit.text,
          // Blocks that were addressed before already carry an id; the rest are
          // reached by position and get an id when someone actually jumps.
          blockId: row.hit.blockId,
          blockIndex: row.hit.blockIndex,
        })
        .run();
      onClose();
    },
    [rows, editor, range, onClose]
  );

  const insertMirror = useCallback(
    (index: number, event: React.MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      const row = rows[index];
      if (!row || row.kind !== 'block') return;
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertMirrorBlock({
          sourceDocumentId: row.hit.documentId,
          title: row.hit.text,
          sourceBlockId: row.hit.blockId,
          sourceBlockIndex: row.hit.blockIndex,
        })
        .run();
      onClose();
    },
    [rows, editor, range, onClose]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : Math.max(rows.length - 1, 0)));
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < rows.length - 1 ? prev + 1 : 0));
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
  }, [rows.length, selectedIndex, selectItem, onClose]);

  return (
    <div className="max-h-64 w-80 overflow-y-auto rounded-lg border border-border bg-popover p-1.5 shadow-md">
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
          key={`doc-${candidate.id}`}
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

      {blocks.length > 0 && (
        <>
          <div className="mt-1 px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            链接到块
          </div>
          {blocks.map((hit, i) => {
            const idx = candidates.length + i;
            return (
              <div key={`block-${hit.documentId}-${hit.blockIndex}`} className="group relative">
                <button
                  ref={(el) => { itemRefs.current[idx] = el; }}
                  type="button"
                  onClick={() => selectItem(idx)}
                  className={cn(
                    'flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 pr-8 text-left transition-colors',
                    idx === selectedIndex
                      ? 'bg-accent text-accent-foreground'
                      : 'text-foreground hover:bg-muted'
                  )}
                >
                  <Pilcrow className="size-4 shrink-0 text-muted-foreground" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm">{hit.text}</span>
                    <span className="block truncate text-[11px] text-muted-foreground">
                      {hit.documentTitle}
                    </span>
                  </span>
                </button>
                <button
                  type="button"
                  title="镜像此块"
                  aria-label={`镜像「${hit.text}」`}
                  onClick={(event) => insertMirror(idx, event)}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-muted hover:text-foreground group-hover:opacity-100 group-focus-within:opacity-100"
                >
                  <Copy className="size-3.5" />
                </button>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}
