'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useSidebarStore } from '@/lib/store/use-sidebar-store';

export function SidebarResizer() {
  const { width, setWidth } = useSidebarStore();
  const isResizing = useRef(false);

  const startResize = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    const target = e.currentTarget;
    target.setPointerCapture(e.pointerId);
    isResizing.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    const startX = e.clientX;
    const startWidth = width;

    function onPointerMove(event: PointerEvent) {
      if (!isResizing.current) return;
      setWidth(startWidth + (event.clientX - startX));
    }

    function onPointerUp() {
      isResizing.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerup', onPointerUp);
    }

    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', onPointerUp);
  }, [width, setWidth]);

  return (
    <div
      className="group relative w-1 shrink-0 cursor-col-resize touch-none transition-colors hover:bg-border/80 data-resizing:bg-craft-accent/50"
      onPointerDown={startResize}
    >
      <div className="absolute inset-y-0 -left-0.5 -right-0.5" />
    </div>
  );
}
