'use client';

import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createDocument } from '@/actions/document/create';
import { useRouter } from 'next/navigation';
import { useCommandPaletteStore } from '@/lib/store/use-command-palette-store';

export function SidebarHeader() {
  const router = useRouter();
  const openPalette = useCommandPaletteStore((s) => s.open);

  async function handleNewDoc() {
    const doc = await createDocument({ title: '无标题' });
    if (doc) router.push(`/documents/${doc.id}`);
  }

  return (
    <div className="flex items-center gap-1.5 px-3 py-3">
      <Button
        variant="ghost"
        size="icon-sm"
        className="flex-1 justify-start gap-2 text-muted-foreground"
        onClick={openPalette}
      >
        <Search className="size-4 shrink-0" />
        <span className="text-[13px]">搜索</span>
        <kbd className="ml-auto rounded border border-border px-1 text-[10px] text-muted-foreground">
          ⌘K
        </kbd>
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={handleNewDoc}
        aria-label="新建文档"
      >
        <Plus className="size-4" />
      </Button>
    </div>
  );
}
