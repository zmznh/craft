'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, Folder } from 'lucide-react';
import { cn } from 'cn';
import { moveFolder } from '@/actions/folder/move';
import { updateFolder } from '@/actions/folder/update';
import { deleteFolder } from '@/actions/folder/delete';
import { createDocument } from '@/actions/document/create';
import { moveDocument } from '@/actions/document/move';
import { useSidebarStore } from '@/lib/store/use-sidebar-store';
import { SIDEBAR_DOC_MIME, sidebarDragState } from '@/lib/dnd/sidebar-drag';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
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
  const [renaming, setRenaming] = useState(false);
  const [draftName, setDraftName] = useState(folder.name);
  const expandTimerRef = useRef<number | null>(null);
  const bumpTree = useSidebarStore((s) => s.bumpTree);
  const router = useRouter();

  function startRename() {
    setDraftName(folder.name);
    setRenaming(true);
  }

  async function commitRename() {
    setRenaming(false);
    const next = draftName.trim();
    if (!next || next === folder.name) return;
    await updateFolder(folder.id, { name: next });
    bumpTree();
  }

  async function createDocumentInFolder() {
    const doc = await createDocument({ folderId: folder.id });
    setExpanded(true);
    bumpTree();
    router.push(`/documents/${doc.id}`);
  }

  async function moveToTrash() {
    await deleteFolder(folder.id);
    bumpTree();
  }

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

  const rowClass = cn(
    'relative flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-[13px] transition-colors hover:bg-sidebar-hover',
    'text-sidebar-fg',
    zone === 'into' && 'bg-primary/10'
  );
  const rowStyle = { paddingLeft: `${level * 16 + 8}px` };

  const rowInner = (
    <>
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
      {renaming ? (
        <input
          autoFocus
          value={draftName}
          onChange={(e) => setDraftName(e.target.value)}
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => {
            e.stopPropagation();
            if (e.key === 'Enter') {
              e.preventDefault();
              void commitRename();
            } else if (e.key === 'Escape') {
              e.preventDefault();
              setRenaming(false);
            }
          }}
          onBlur={() => void commitRename()}
          className="min-w-0 flex-1 rounded border border-input bg-background px-1 text-[13px] outline-none focus:border-ring"
        />
      ) : (
        <span className="truncate">{folder.name}</span>
      )}
    </>
  );

  const rowButton = renaming ? (
    <div className={rowClass} style={rowStyle}>
      {rowInner}
    </div>
  ) : (
    <button
      className={rowClass}
      style={rowStyle}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => hasChildren && setExpanded(!expanded)}
    >
      {rowInner}
    </button>
  );

  return (
    <div>
      {renaming ? (
        rowButton
      ) : (
        <ContextMenu>
          <ContextMenuTrigger render={<div className="w-full" />}>
            {rowButton}
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem onClick={startRename}>重命名</ContextMenuItem>
            <ContextMenuItem onClick={() => void createDocumentInFolder()}>
              新建文档
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem variant="destructive" onClick={() => void moveToTrash()}>
              移入回收站
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      )}

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
