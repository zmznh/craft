'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Plus, Search, Type } from 'lucide-react';
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
import type { SearchResultDoc, SearchResultBlock } from '@/actions/document/search';
import { createDocument } from '@/actions/document/create';

export function CommandPalette() {
  const router = useRouter();
  const { isOpen, close, open } = useCommandPaletteStore();
  const [query, setQuery] = useState('');
  const [docs, setDocs] = useState<SearchResultDoc[]>([]);
  const [blocks, setBlocks] = useState<SearchResultBlock[]>([]);
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
    if (timerRef.current) clearTimeout(timerRef.current);
    const q = query.trim();
    timerRef.current = setTimeout(async () => {
      if (!q) {
        setDocs([]);
        setBlocks([]);
        setSearching(false);
        return;
      }
      setSearching(true);
      try {
        const result = await searchAll(q);
        setDocs(result.documents);
        setBlocks(result.blocks);
      } finally {
        setSearching(false);
      }
    }, q ? 200 : 0);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query]);

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
      className="top-[56px] w-full max-w-[480px] translate-y-0 rounded-xl border border-border bg-popover shadow-lg"
    >
      <CommandInput value={query} onValueChange={setQuery} placeholder="搜索文档、内容…" />

      <CommandList>
        {!hasQuery && (
          <CommandGroup heading="操作">
            <CommandItem onSelect={handleNewDocument}>
              <Plus className="size-4" />
              <span>新建文档</span>
            </CommandItem>          </CommandGroup>
        )}

        {hasQuery && searching && docs.length === 0 && blocks.length === 0 && (
          <CommandEmpty>搜索中…</CommandEmpty>
        )}

        {hasQuery && !searching && docs.length === 0 && blocks.length === 0 && (
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
                  <Type className="size-4 shrink-0 text-foreground/40" />
                  <div className="min-w-0 flex flex-col">
                    <span className="truncate text-meta text-foreground/40">{block.documentTitle}</span>
                    <span className="truncate">{block.text}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>

      <div className="flex items-center gap-3 border-t border-border px-3 py-2 text-caption text-foreground/40">
        <span className="inline-flex items-center gap-1">
          <Search className="size-3" /> 搜索文档与块
        </span>
        <span className="ml-auto inline-flex items-center gap-1">
          <kbd className="rounded-md border border-border px-1 text-caption">Esc</kbd> 关闭
        </span>
      </div>
    </CommandDialog>
  );
}
