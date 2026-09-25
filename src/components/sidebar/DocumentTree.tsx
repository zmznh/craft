'use client';

import { useEffect, useState } from 'react';
import { getDocuments } from '@/actions/document/get';
import { useSidebarStore } from '@/lib/store/use-sidebar-store';
import { DocumentTreeItem } from './DocumentTreeItem';

export interface Document {
  id: string;
  title: string;
  icon: string | null;
  parentId: string | null;
  folderId: string | null;
  isDeleted: boolean;
  isDailyNote: boolean;
  updatedAt: string;
  order: number;
}

interface DocumentTreeProps {
  folderId?: string | null;
}

export function DocumentTree({ folderId = null }: DocumentTreeProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const treeVersion = useSidebarStore((s) => s.treeVersion);

  useEffect(() => {
    async function load() {
      const data = await getDocuments();
      setDocuments(data as Document[]);
      setLoading(false);
    }
    load();
  }, [treeVersion]);

  if (loading) {
    return <div className="px-1.5 py-2 text-ui text-foreground/40">加载中...</div>;
  }

  const rootDocuments = documents
    .filter(d => d.folderId === folderId && d.parentId === null)
    .sort((a, b) => a.order - b.order);

  if (rootDocuments.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-0.5">
      {rootDocuments.map(doc => (
        <DocumentTreeItem
          key={doc.id}
          document={doc}
          allDocuments={documents}
          level={0}
        />
      ))}
    </div>
  );
}
