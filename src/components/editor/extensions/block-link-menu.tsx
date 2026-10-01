'use client';

import { useCallback, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState } from 'react';
import { Copy, FileText, Link2, Pilcrow } from 'lucide-react';
import type { Editor } from '@tiptap/react';
import { searchDocumentsForLink } from '@/actions/document/search';
import type { LinkCandidate } from '@/actions/document/search';
import { searchBlockAnchors, type BlockAnchorHit } from '@/actions/document/anchors';
import { cn } from 'cn';

type Row =
  | { kind: 'doc'; candidate: LinkCandidate }
  | { kind: 'block'; hit: BlockAnchorHit };

/**
 * Keys arrive through the suggestion plugin, not a window listener: ProseMirror's
 * base keymap answers Enter at the editor DOM, which splits the block and unmounts
 * this menu before the event could bubble.
 */
export interface BlockLinkMenuHandle {
  selectRecommendation: () => void;
  moveSelection: (delta: number) => void;
}

interface BlockLinkMenuProps {
  editor: Editor;
  query: string;
  range: { from: number; to: number };
  onClose: () => void;
  ref?: React.Ref<BlockLinkMenuHandle>;
}

export function BlockLinkMenu({ editor, query, range, onClose, ref }: BlockLinkMenuProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [candidates, setCandidates] = useState<LinkCandidate[]>([]);
  const [blocks, setBlocks] = useState<BlockAnchorHit[]>([]);
  // Starts true: before the first query lands the menu has not earned the right to
  // say 无匹配文档, and saying it for one frame is a claim the data has not supported.
  const [loading, setLoading] = useState(true);
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

  useImperativeHandle(
    ref,
    () => ({
      selectRecommendation: () => selectItem(selectedIndex),
      moveSelection: (delta: number) =>
        setSelectedIndex((prev) => {
          if (rows.length === 0) return 0;
          const next = prev + delta;
          if (next < 0) return rows.length - 1;
          if (next >= rows.length) return 0;
          return next;
        }),
    }),
    [selectItem, selectedIndex, rows.length]
  );

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
