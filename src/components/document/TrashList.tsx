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
      <div className="flex min-h-[180px] flex-col items-center justify-center rounded-[15px] bg-foreground/[0.03] px-6 text-center">
        <Trash2 className="mx-auto mb-2 size-8 text-foreground/40" />
        <p className="text-ui font-medium text-foreground/40">回收站是空的</p>
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
            className="flex items-center gap-3 rounded-lg border border-border p-3 transition-colors duration-150 hover:bg-foreground/[0.03]"
          >
            {doc.icon ? (
              <span className="text-xl">{doc.icon}</span>
            ) : (
              <File className="size-5 shrink-0 text-foreground/40" />
            )}
            <div className="flex-1 truncate">
              <p className="truncate text-body font-medium">{doc.title}</p>
              <p className="text-meta text-foreground/55">
                删除于 {deletedDate}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="rounded-md text-ui hover:bg-foreground/4"
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
