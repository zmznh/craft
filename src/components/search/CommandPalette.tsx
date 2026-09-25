'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Database, FileText, Plus, Search, Type } from 'lucide-react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { useCommandPaletteStore } from '@/lib/store/use-command-palette-store';
import { searchAll } from '@/actions/document/search';
import type { SearchResultDoc, SearchResultBlock, SearchResultRow } from '@/actions/document/search';
import { createDocument } from '@/actions/document/create';

export function CommandPalette() {
  const router = useRouter();
  const { isOpen, close, open, seedQuery } = useCommandPaletteStore();
  const [query, setQuery] = useState('');
  const [docs, setDocs] = useState<SearchResultDoc[]>([]);
  const [blocks, setBlocks] = useState<SearchResultBlock[]>([]);
  const [rows, setRows] = useState<SearchResultRow[]>([]);
  const [nextOffset, setNextOffset] = useState<number | null>(null);
  const [searching, setSearching] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        open();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  useEffect(() => {
    if (isOpen && seedQuery) setQuery(seedQuery);
  }, [isOpen, seedQuery]);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    const q = query.trim();
    timerRef.current = setTimeout(async () => {
      if (!q) {
        setDocs([]);
        setBlocks([]);
        setRows([]);
        setNextOffset(null);
        setSearching(false);
        return;
      }
      setSearching(true);
      try {
        const result = await searchAll(q);
        setDocs(result.documents);
        setBlocks(result.blocks);
        setRows(result.rows);
        setNextOffset(result.nextOffset);
      } finally {
        setSearching(false);
      }
    }, q ? 200 : 0);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query]);

  const loadMore = async () => {
    const q = query.trim();
    if (!q || nextOffset === null) return;
    setSearching(true);
    try {
      const result = await searchAll(q, nextOffset);
      setDocs((current) => {
        const seen = new Set(current.map((doc) => doc.id));
        return [...current, ...result.documents.filter((doc) => !seen.has(doc.id))];
      });
      setNextOffset(result.nextOffset);
    } finally {
      setSearching(false);
    }
  };

  const handleOpenDocument = (id: string) => {
    close();
    setQuery('');
    router.push(`/documents/${id}`);
  };

  const handleNewDocument = async () => {
    close();
    setQuery('');
    const doc = await createDocument({ title: '无标题' });
    if (doc) router.push(`/documents/${(doc as { id: string }).id}`);
  };

  const hasQuery = query.trim().length > 0;

  return (
    <CommandDialog
      open={isOpen}
      onOpenChange={(v) => (v ? open() : close())}
      title="搜索"
      description="搜索文档与内容"
      className="max-w-xl max-md:w-[calc(100vw-1.5rem)]"
    >
      <CommandInput value={query} onValueChange={setQuery} placeholder="搜索文档、内容…" />

      <CommandList>
        {!hasQuery && (
          <CommandGroup heading="操作">
            <CommandItem onSelect={handleNewDocument}>
              <Plus className="size-4" />
              <span>新建文档</span>
            </CommandItem>
          </CommandGroup>
        )}

        {hasQuery && searching && docs.length === 0 && blocks.length === 0 && rows.length === 0 && (
          <CommandEmpty>搜索中…</CommandEmpty>
        )}

        {hasQuery && !searching && docs.length === 0 && blocks.length === 0 && rows.length === 0 && (
          <CommandEmpty>未找到与 “{query.trim()}” 相关的结果</CommandEmpty>
        )}

        {docs.length > 0 && (
          <CommandGroup heading="文档">
            {docs.map((doc) => (
              <CommandItem key={`doc-${doc.id}`} value={`doc-${doc.id}-${doc.title}`} onSelect={() => handleOpenDocument(doc.id)}>
                {doc.icon ? (
                  <span className="text-base leading-none">{doc.icon}</span>
                ) : (
                  <FileText className="size-4" />
                )}
                <span className="truncate">{doc.title}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {blocks.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="块内容">
              {blocks.map((block, i) => (
                <CommandItem
                  key={`block-${i}`}
                  value={`block-${i}-${block.text}`}
                  onSelect={() => handleOpenDocument(block.documentId)}
                >
                  <Type className="size-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex flex-col">
                    <span className="truncate text-xs text-muted-foreground">{block.documentTitle}</span>
                    <span className="truncate">{block.text}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
        {rows.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="集合条目">
              {rows.map((row, i) => (
                <CommandItem
                  key={`row-${row.itemId}-${i}`}
                  value={`row-${row.itemId}-${i}`}
                  onSelect={() => {
                    close();
                    setQuery('');
                    router.push(`/collections/${row.collectionId}`);
                  }}
                >
                  <Database className="size-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex flex-col">
                    <span className="truncate text-xs text-muted-foreground">{row.collectionName}</span>
                    <span className="truncate">{row.text || '未命名条目'}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {nextOffset !== null && (
          <CommandItem value="load-more" onSelect={loadMore} className="justify-center text-muted-foreground">
            加载更多
          </CommandItem>
        )}
      </CommandList>

      <div className="flex items-center gap-3 border-t border-border px-3 py-2 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <Search className="size-3" /> 搜索文档与块
        </span>
        <span className="ml-auto inline-flex items-center gap-1">
          <kbd className="rounded border border-border px-1">Esc</kbd> 关闭
        </span>
      </div>
    </CommandDialog>
  );
}
