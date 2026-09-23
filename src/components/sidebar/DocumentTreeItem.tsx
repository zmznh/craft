'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, File } from 'lucide-react';
import { cn } from 'cn';
import { moveDocument } from '@/actions/document/move';
import { useSidebarStore } from '@/lib/store/use-sidebar-store';
import {
  SIDEBAR_DOC_MIME,
  sidebarDragState,
} from '@/lib/dnd/sidebar-drag';
import type { Document } from './DocumentTree';

type DropZone = 'before' | 'after' | 'into' | null;

interface DocumentTreeItemProps {
  document: Document;
  allDocuments: Document[];
  level: number;
}

function isDescendantOf(targetId: string, ancestorId: string, allDocuments: Document[]): boolean {
  const stack = [ancestorId];
  while (stack.length) {
    const current = stack.pop()!;
    if (current === targetId) return true;
    for (const d of allDocuments) {
      if (d.parentId === current) stack.push(d.id);
    }
  }
  return false;
}

export function DocumentTreeItem({ document: doc, allDocuments, level }: DocumentTreeItemProps) {
  const [expanded, setExpanded] = useState(false);
  const [zone, setZone] = useState<DropZone>(null);
  const router = useRouter();
  const bumpTree = useSidebarStore((s) => s.bumpTree);

  const children = allDocuments
    .filter(d => d.parentId === doc.id)
    .sort((a, b) => a.order - b.order);

  const hasChildren = children.length > 0;

  function handleClick() {
    router.push(`/documents/${doc.id}`);
  }

  function handleDragStart(e: React.DragEvent) {
    const payload = { kind: 'sidebar-item' as const, type: 'doc' as const, documentId: doc.id, title: doc.title };
    sidebarDragState.payload = payload;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData(SIDEBAR_DOC_MIME, JSON.stringify(payload));
    e.dataTransfer.setData('text/plain', doc.title);
  }

  function handleDragEnd() {
    sidebarDragState.payload = null;
    setZone(null);
  }

  function handleDragOver(e: React.DragEvent) {
    const payload = sidebarDragState.payload;
    if (!payload || !('type' in payload) || payload.type !== 'doc') return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    const rect = e.currentTarget.getBoundingClientRect();
    const rel = (e.clientY - rect.top) / rect.height;
    const target: DropZone = rel < 0.3 ? 'before' : rel > 0.7 ? 'after' : 'into';

    const forbidden =
      payload.documentId === doc.id ||
      (target === 'into' && isDescendantOf(doc.id, payload.documentId, allDocuments));
    const next = forbidden ? null : target;
    if (zone !== next) setZone(next);
  }

  function handleDragLeave(e: React.DragEvent) {
    const to = e.relatedTarget as Node | null;
    if (to && e.currentTarget.contains(to)) return;
    setZone(null);
  }

  async function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    const payload = sidebarDragState.payload;
    const currentZone = zone;
    setZone(null);
    sidebarDragState.payload = null;
    if (!payload || !('type' in payload) || payload.type !== 'doc') return;
    if (!currentZone || payload.documentId === doc.id) return;

    let data: { parentId?: string | null; folderId?: string | null; order?: number };
    if (currentZone === 'into') {
      if (isDescendantOf(doc.id, payload.documentId, allDocuments)) return;
      const childOrders = allDocuments
        .filter(d => d.parentId === doc.id)
        .map(d => d.order);
      data = {
        parentId: doc.id,
        folderId: doc.folderId,
        order: (childOrders.length ? Math.max(...childOrders) : 0) + 1,
      };
      setExpanded(true);
    } else {
      const siblings = allDocuments
        .filter(
          d =>
            d.parentId === doc.parentId &&
            d.folderId === doc.folderId &&
            d.id !== payload.documentId
        )
        .sort((a, b) => a.order - b.order);
      const idx = siblings.findIndex(d => d.id === doc.id);
      if (idx < 0) return;
      const order =
        currentZone === 'before'
          ? idx > 0
            ? (siblings[idx - 1].order + doc.order) / 2
            : doc.order - 1
          : idx < siblings.length - 1
            ? (doc.order + siblings[idx + 1].order) / 2
            : doc.order + 1;
      data = { parentId: doc.parentId, folderId: doc.folderId, order };
    }

    try {
      await moveDocument(payload.documentId, data);
      bumpTree();
    } catch (err) {
      console.error('移动文档失败', err);
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
        onClick={handleClick}
      >
        {zone === 'before' && (
          <span className="pointer-events-none absolute inset-x-0 top-0 z-10 h-0.5 rounded-full bg-primary" />
        )}
        {zone === 'after' && (
          <span className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-0.5 rounded-full bg-primary" />
        )}
        {hasChildren && (
          <span
            className="flex size-3.5 shrink-0 items-center justify-center"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
          >
            <ChevronRight
              className={cn(
                'size-3.5 transition-transform',
                expanded && 'rotate-90'
              )}
            />
          </span>
        )}
        {!hasChildren && <span className="w-3.5" />}
        {doc.icon ? (
          <span className="text-base">{doc.icon}</span>
        ) : (
          <File className="size-4 shrink-0 text-muted-foreground" />
        )}
        <span className="truncate">{doc.title}</span>
      </button>

      {expanded && hasChildren && (
        <div className="flex flex-col gap-0.5">
          {children.map(child => (
            <DocumentTreeItem
              key={child.id}
              document={child}
              allDocuments={allDocuments}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
