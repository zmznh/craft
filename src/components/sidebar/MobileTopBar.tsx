'use client';

import { PanelLeft } from 'lucide-react';
import { useSidebarStore } from '@/lib/store/use-sidebar-store';

export function MobileTopBar() {
  const toggle = useSidebarStore((s) => s.toggle);

  return (
    <div className="flex h-12 shrink-0 items-center border-b border-border px-2 md:hidden">
      <button
        type="button"
        onClick={toggle}
        aria-label="打开侧栏"
        title="侧栏"
        className="flex size-8 items-center justify-center rounded-lg text-foreground/85 transition-colors duration-150 ease-craft hover:bg-foreground/4"
      >
        <PanelLeft className="size-4" />
      </button>
    </div>
  );
}
