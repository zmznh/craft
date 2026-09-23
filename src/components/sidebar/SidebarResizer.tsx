'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useSidebarStore } from '@/lib/store/use-sidebar-store';

export function SidebarResizer() {
  const { width, setWidth } = useSidebarStore();
  const isResizing = useRef(false);

  const startResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isResizing.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    const startX = e.clientX;
    const startWidth = width;

    function onMouseMove(e: MouseEvent) {
      if (!isResizing.current) return;
      const delta = e.clientX - startX;
      setWidth(startWidth + delta);
    }

    function onMouseUp() {
      isResizing.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    }

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, [width, setWidth]);

  return (
    <div
      className="group relative w-1 cursor-col-resize shrink-0 transition-colors hover:bg-border/80 data-resizing:bg-craft-accent/50"
      onMouseDown={startResize}
    >
      <div className="absolute inset-y-0 -left-0.5 -right-0.5" />
    </div>
  );
}
