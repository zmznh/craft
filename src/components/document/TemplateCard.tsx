'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { File, Play, Loader2 } from 'lucide-react';
import { createDocument } from '@/actions/document/create';

interface TemplateCardProps {
  document: {
    id: string;
    title: string;
    icon: string | null;
    updatedAt: string;
  };
}

export function TemplateCard({ document: doc }: TemplateCardProps) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);

  const handleUse = async () => {
    setCreating(true);
    try {
      const newDoc = await createDocument({ useTemplateId: doc.id });
      router.push(`/documents/${newDoc.id}`);
    } catch {
      setCreating(false);
      alert('使用模板失败');
    }
  };

  return (
    <div className="group flex flex-col gap-2 rounded-lg border border-border p-4 transition-colors hover:bg-muted/50">
      <Link href={`/documents/${doc.id}`} className="flex items-start gap-2">
        {doc.icon ? (
          <span className="text-2xl">{doc.icon}</span>
        ) : (
          <File className="size-5 shrink-0 text-muted-foreground" />
        )}
        <h3 className="flex-1 truncate font-medium">{doc.title}</h3>
      </Link>
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {new Date(doc.updatedAt).toLocaleDateString('zh-CN', {
            month: 'short',
            day: 'numeric',
          })}
        </p>
        <button
          type="button"
          onClick={handleUse}
          disabled={creating}
          className="flex items-center gap-1 rounded-md border px-2 py-1 text-xs transition-colors hover:bg-muted disabled:opacity-50"
        >
          {creating ? (
            <Loader2 className="size-3 animate-spin" />
          ) : (
            <Play className="size-3" />
          )}
          使用此模板
        </button>
      </div>
    </div>
  );
}
