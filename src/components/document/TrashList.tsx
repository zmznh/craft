'use client';

import { File, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { restoreDocument } from '@/actions/document/delete';
import { useRouter } from 'next/navigation';

interface TrashListProps {
  documents: Array<{
    id: string;
    title: string;
    icon: string | null;
    deletedAt: string | null;
  }>;
}

export function TrashList({ documents }: TrashListProps) {
  const router = useRouter();

  async function handleRestore(id: string) {
    await restoreDocument(id);
    router.refresh();
  }

  if (documents.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border p-8 text-center">
        <Trash2 className="mx-auto mb-2 size-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">回收站是空的</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {documents.map(doc => {
        const deletedDate = doc.deletedAt
          ? new Date(doc.deletedAt).toLocaleDateString('zh-CN')
          : '';

        return (
          <div
            key={doc.id}
            className="flex items-center gap-3 rounded-lg border border-border p-3"
          >
            {doc.icon ? (
              <span className="text-xl">{doc.icon}</span>
            ) : (
              <File className="size-5 shrink-0 text-muted-foreground" />
            )}
            <div className="flex-1 truncate">
              <p className="truncate font-medium">{doc.title}</p>
              <p className="text-xs text-muted-foreground">
                删除于 {deletedDate}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleRestore(doc.id)}
            >
              恢复
            </Button>
          </div>
        );
      })}
    </div>
  );
}
