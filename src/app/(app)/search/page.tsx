'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { useCommandPaletteStore } from '@/lib/store/use-command-palette-store';

function SearchPageInner() {
  const open = useCommandPaletteStore((s) => s.open);
  const openWith = useCommandPaletteStore((s) => s.openWith);
  const params = useSearchParams();
  const tag = params.get('tag');

  useEffect(() => {
    if (tag) openWith(tag);
    else open();
  }, [tag, open, openWith]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 text-muted-foreground">
      <Search className="size-5" />
      <p className="text-sm">
        {tag ? `搜索标签 “${tag}” 中的文档` : '按 ⌘K 或点击上方按钮开始搜索'}
      </p>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={null}>
      <SearchPageInner />
    </Suspense>
  );
}
