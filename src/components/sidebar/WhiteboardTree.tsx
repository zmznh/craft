'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from 'cn';
import { getWhiteboards } from '@/actions/whiteboard/whiteboard';
import type { WhiteboardItem } from '@/actions/whiteboard/whiteboard';
import {
  SIDEBAR_WHITEBOARD_MIME,
  sidebarDragState,
} from '@/lib/dnd/sidebar-drag';

interface WhiteboardTreeItemProps {
  board: WhiteboardItem;
  isActive: boolean;
}

function WhiteboardTreeItem({ board, isActive }: WhiteboardTreeItemProps) {
  function handleDragStart(e: React.DragEvent) {
    const payload = {
      kind: 'sidebar-item' as const,
      type: 'whiteboard' as const,
      whiteboardId: board.id,
      title: board.name,
      icon: board.icon,
    };
    sidebarDragState.payload = payload;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData(SIDEBAR_WHITEBOARD_MIME, JSON.stringify(payload));
    e.dataTransfer.setData('text/plain', board.name);
  }

  function handleDragEnd() {
    sidebarDragState.payload = null;
  }

  return (
    <Link
      href={`/whiteboards/${board.id}`}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={cn(
        'flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors hover:bg-sidebar-hover',
        isActive && 'bg-sidebar-active text-sidebar-fg font-medium'
      )}
    >
      <span className="text-base leading-none">{board.icon ?? '🎨'}</span>
      <span className="truncate">{board.name}</span>
    </Link>
  );
}

export function WhiteboardTree() {
  const [boards, setBoards] = useState<WhiteboardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    async function load() {
      try {
        const data = await getWhiteboards();
        setBoards(data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [pathname]);

  if (loading) {
    return <div className="px-3 py-2 text-sm text-muted-foreground">加载中...</div>;
  }

  if (boards.length === 0) {
    return <div className="px-3 py-2 text-sm text-muted-foreground">暂无白板</div>;
  }

  return (
    <div className="flex flex-col gap-0.5">
      {boards.map((board) => {
        const isActive = pathname === `/whiteboards/${board.id}`;
        return <WhiteboardTreeItem key={board.id} board={board} isActive={isActive} />;
      })}
    </div>
  );
}
