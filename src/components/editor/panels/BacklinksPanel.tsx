'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FileText, Link2, X } from 'lucide-react';
import { getBacklinks } from '@/actions/document/backlinks';
import type { BacklinkItem } from '@/actions/document/backlinks';

interface BacklinksPanelProps {
  documentId: string;
  onClose: () => void;
}

export function BacklinksPanel({ documentId, onClose }: BacklinksPanelProps) {
  const [items, setItems] = useState<BacklinkItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await getBacklinks(documentId);
        if (!cancelled) setItems(data);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [documentId]);

  return (
    <aside className="flex w-64 shrink-0 flex-col border-l border-border bg-sidebar">
      <div className="flex h-12 shrink-0 items-center justify-between px-3">
        <span className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
          <Link2 className="size-4" />
          反向链接
        </span>
        <button
          onClick={onClose}
          className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="关闭反向链接"
        >
          <X className="size-4" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-2 pb-3">
        {loading ? (
          <p className="px-2 py-2 text-sm text-muted-foreground">加载中…</p>
        ) : items.length === 0 ? (
          <p className="px-2 py-2 text-sm text-muted-foreground">
            还没有文档链接到此页
          </p>
        ) : (
          <div className="flex flex-col gap-0.5">
            {items.map((item) => (
              <Link
                key={item.sourceDocumentId}
                href={`/documents/${item.sourceDocumentId}`}
                className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-sidebar-hover"
              >
                {item.sourceIcon ? (
                  <span className="text-base leading-none">{item.sourceIcon}</span>
                ) : (
                  <FileText className="size-4 shrink-0 text-muted-foreground" />
                )}
                <span className="truncate">{item.sourceTitle}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
