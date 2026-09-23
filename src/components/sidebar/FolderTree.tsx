'use client';

import { useEffect, useState } from 'react';
import { getFolders } from '@/actions/folder/get';
import { getDocuments } from '@/actions/document/get';
import { useSidebarStore } from '@/lib/store/use-sidebar-store';
import { FolderTreeItem } from './FolderTreeItem';
import type { Document } from './DocumentTree';

export interface Folder {
  id: string;
  name: string;
  icon: string | null;
  parentId: string | null;
  order: number;
  isDeleted: boolean;
}

export function FolderTree() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const treeVersion = useSidebarStore((s) => s.treeVersion);

  useEffect(() => {
    async function load() {
      const [folderData, docData] = await Promise.all([
        getFolders(),
        getDocuments()
      ]);
      setFolders(folderData as Folder[]);
      setDocuments(docData as Document[]);
      setLoading(false);
    }
    load();
  }, [treeVersion]);

  if (loading) {
    return <div className="px-3 py-2 text-sm text-muted-foreground">加载中...</div>;
  }

  const rootFolders = folders
    .filter(f => f.parentId === null)
    .sort((a, b) => a.order - b.order);

  if (rootFolders.length === 0) {
    return (
      <div className="px-3 py-2 text-sm text-muted-foreground">
        暂无文件夹
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-0.5">
      {rootFolders.map(folder => (
        <FolderTreeItem
          key={folder.id}
          folder={folder}
          allFolders={folders}
          allDocuments={documents}
          level={0}
        />
      ))}
    </div>
  );
}
