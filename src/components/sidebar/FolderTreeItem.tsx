'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronRight, Folder } from 'lucide-react';
import { cn } from 'cn';
import { moveFolder } from '@/actions/folder/move';
import { moveDocument } from '@/actions/document/move';
import { useSidebarStore } from '@/lib/store/use-sidebar-store';
import { SIDEBAR_DOC_MIME, sidebarDragState } from '@/lib/dnd/sidebar-drag';
import type { Folder as FolderType } from './FolderTree';
import type { Document } from './DocumentTree';
import { DocumentTreeItem } from './DocumentTreeItem';

type DropZone = 'before' | 'after' | 'into' | null;

interface FolderTreeItemProps {
  folder: FolderType;
  allFolders: FolderType[];
  allDocuments: Document[];
  level: number;
}

function isDescendantOf(
  targetId: string,
  ancestorId: string,
  allFolders: FolderType[]
): boolean {
  const stack = [ancestorId];
  while (stack.length) {
    const current = stack.pop()!;
    if (current === targetId) return true;
    for (const f of allFolders) {
      if (f.parentId === current) stack.push(f.id);
    }
  }
  return false;
}

export function FolderTreeItem({ folder, allFolders, allDocuments, level }: FolderTreeItemProps) {
  const [expanded, setExpanded] = useState(false);
  const [zone, setZone] = useState<DropZone>(null);
  const expandTimerRef = useRef<number | null>(null);
  const bumpTree = useSidebarStore((s) => s.bumpTree);

  const childFolders = allFolders
    .filter(f => f.parentId === folder.id)
    .sort((a, b) => a.order - b.order);

  const childDocuments = allDocuments
    .filter(d => d.folderId === folder.id && d.parentId === null)
    .sort((a, b) => a.order - b.order);

  const hasChildren = childFolders.length > 0 || childDocuments.length > 0;

  useEffect(() => {
    return () => {
      if (expandTimerRef.current) window.clearTimeout(expandTimerRef.current);
    };
  }, []);

  function handleDragStart(e: React.DragEvent) {
    const payload = { kind: 'sidebar-item' as const, type: 'folder' as const, folderId: folder.id, title: folder.name };
    sidebarDragState.payload = payload;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData(SIDEBAR_DOC_MIME, JSON.stringify(payload));
    e.dataTransfer.setData('text/plain', folder.name);
  }

  function handleDragEnd() {
    sidebarDragState.payload = null;
    setZone(null);
    if (expandTimerRef.current) {
      window.clearTimeout(expandTimerRef.current);
      expandTimerRef.current = null;
    }
  }

  function handleDragOver(e: React.DragEvent) {
    const payload = sidebarDragState.payload;
    if (!payload || !('type' in payload)) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    let target: DropZone;
    if (payload.type === 'folder') {
      const draggedFolderId = payload.folderId;
      const rect = e.currentTarget.getBoundingClientRect();
      const rel = (e.clientY - rect.top) / rect.height;
      const edge = rel < 0.3 ? 'before' : rel > 0.7 ? 'after' : 'into';
      const forbidden =
        draggedFolderId === folder.id ||
        (edge === 'into' && isDescendantOf(folder.id, draggedFolderId, allFolders));
      target = forbidden ? null : edge;
    } else if (payload.type === 'doc') {
      target = 'into';
    } else {
      return;
    }

    if (zone !== target) setZone(target);

    if (target === 'into' && !expanded && expandTimerRef.current === null) {
      expandTimerRef.current = window.setTimeout(() => {
        expandTimerRef.current = null;
        setExpanded(true);
      }, 500);
    } else if (target !== 'into' && expandTimerRef.current !== null) {
      window.clearTimeout(expandTimerRef.current);
      expandTimerRef.current = null;
    }
  }

  function handleDragLeave(e: React.DragEvent) {
    const to = e.relatedTarget as Node | null;
    if (to && e.currentTarget.contains(to)) return;
    setZone(null);
    if (expandTimerRef.current) {
      window.clearTimeout(expandTimerRef.current);
      expandTimerRef.current = null;
    }
  }

  async function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    const payload = sidebarDragState.payload;
    const currentZone = zone;
    setZone(null);
    sidebarDragState.payload = null;
    if (expandTimerRef.current) {
      window.clearTimeout(expandTimerRef.current);
      expandTimerRef.current = null;
    }
    if (!payload || !('type' in payload) || !currentZone) return;

    try {
      if (payload.type === 'folder') {
        const draggedFolderId = payload.folderId;
        if (
          draggedFolderId === folder.id ||
          isDescendantOf(folder.id, draggedFolderId, allFolders)
        ) {
          return;
        }
        let data: { parentId?: string | null; order?: number };
        if (currentZone === 'into') {
          const childOrders = allFolders
            .filter(f => f.parentId === folder.id)
            .map(f => f.order);
          data = {
            parentId: folder.id,
            order: (childOrders.length ? Math.max(...childOrders) : 0) + 1,
          };
          setExpanded(true);
        } else {
          const siblings = allFolders
            .filter(f => f.parentId === folder.parentId && f.id !== draggedFolderId)
            .sort((a, b) => a.order - b.order);
          const idx = siblings.findIndex(f => f.id === folder.id);
          if (idx < 0) return;
          const order =
            currentZone === 'before'
              ? idx > 0
                ? (siblings[idx - 1].order + folder.order) / 2
                : folder.order - 1
              : idx < siblings.length - 1
                ? (folder.order + siblings[idx + 1].order) / 2
                : folder.order + 1;
          data = { parentId: folder.parentId, order };
        }
        await moveFolder(draggedFolderId, data);
      } else if (payload.type === 'doc') {
        const childOrders = allDocuments
          .filter(d => d.folderId === folder.id && d.parentId === null)
          .map(d => d.order);
        await moveDocument(payload.documentId, {
          parentId: null,
          folderId: folder.id,
          order: (childOrders.length ? Math.max(...childOrders) : 0) + 1,
        });
        setExpanded(true);
      }
      bumpTree();
    } catch (err) {
      console.error('移动失败', err);
    }
  }

  return (
    <div>
      <button
        className={cn(
          'relative flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-sidebar-hover',
          'text-sidebar-fg',
          zone === 'into' && 'bg-primary/10'
        )}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => hasChildren && setExpanded(!expanded)}
      >
        {zone === 'before' && (
          <span className="pointer-events-none absolute inset-x-0 top-0 z-10 h-0.5 rounded-full bg-primary" />
        )}
        {zone === 'after' && (
          <span className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-0.5 rounded-full bg-primary" />
        )}
        {hasChildren && (
          <ChevronRight
            className={cn(
              'size-3.5 shrink-0 transition-transform',
              expanded && 'rotate-90'
            )}
          />
        )}
        {!hasChildren && <span className="w-3.5" />}
        <Folder className="size-4 shrink-0 text-muted-foreground" />
        <span className="truncate">{folder.name}</span>
      </button>

      {expanded && hasChildren && (
        <div className="flex flex-col gap-0.5">
          {childDocuments.map(doc => (
            <DocumentTreeItem
              key={doc.id}
              document={doc}
              allDocuments={allDocuments}
              level={level + 1}
            />
          ))}
          {childFolders.map(child => (
            <FolderTreeItem
              key={child.id}
              folder={child}
              allFolders={allFolders}
              allDocuments={allDocuments}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
