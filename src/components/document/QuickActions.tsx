'use client';

import { FileText, FolderPlus, Database, PenTool } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createDocument } from '@/actions/document/create';
import { createFolder } from '@/actions/folder/create';
import { useRouter } from 'next/navigation';

export function QuickActions() {
  const router = useRouter();

  async function handleNewDoc() {
    const doc = await createDocument({ title: '无标题' });
    if (doc) router.push(`/documents/${doc.id}`);
  }

  async function handleNewFolder() {
    await createFolder({ name: '未命名文件夹' });
    router.refresh();
  }

  return (
    <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
      <Button
        variant="outline"
        className="flex h-20 flex-col items-center justify-center gap-2 border-transparent bg-craft-accent text-white hover:bg-craft-accent-hover hover:text-white"
        onClick={handleNewDoc}
      >
        <FileText className="size-5" />
        <span className="text-ui font-medium">新建文档</span>
      </Button>
      <Button
        variant="outline"
        className="flex h-20 flex-col items-center justify-center gap-2 hover:bg-foreground/4"
        onClick={handleNewFolder}
      >
        <FolderPlus className="size-5" />
        <span className="text-ui">新建文件夹</span>
      </Button>
      <Button
        variant="outline"
        className="flex h-20 flex-col items-center justify-center gap-2"
        disabled
      >
        <Database className="size-5" />
        <span className="text-ui">新建集合</span>
      </Button>
      <Button
        variant="outline"
        className="flex h-20 flex-col items-center justify-center gap-2"
        disabled
      >
        <PenTool className="size-5" />
        <span className="text-ui">新建白板</span>
      </Button>
    </div>
  );
}
