'use client';

import { useEffect, ViewTransition } from 'react';
import { Search } from 'lucide-react';
import { useCommandPaletteStore } from '@/lib/store/use-command-palette-store';

export default function SearchPage() {
  const open = useCommandPaletteStore((s) => s.open);

  useEffect(() => {
    open();
  }, [open]);

  return (
    <ViewTransition>
    <div className="flex flex-1 flex-col items-center justify-center gap-2 text-foreground/40">
      <Search className="size-5" />
      <p className="text-ui">按 ⌘K 或点击上方按钮开始搜索</p>
    </div>
    </ViewTransition>
  );
}
