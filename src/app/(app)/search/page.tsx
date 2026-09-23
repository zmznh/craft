'use client';

import { useEffect } from 'react';
import { Search } from 'lucide-react';
import { useCommandPaletteStore } from '@/lib/store/use-command-palette-store';

export default function SearchPage() {
  const open = useCommandPaletteStore((s) => s.open);

  useEffect(() => {
    open();
  }, [open]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 text-muted-foreground">
      <Search className="size-5" />
      <p className="text-sm">按 ⌘K 或点击上方按钮开始搜索</p>
    </div>
  );
}
