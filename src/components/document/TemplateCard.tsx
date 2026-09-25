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
    <div className="group flex flex-col rounded-lg px-1.5 pt-1.5 pb-2 transition-colors duration-300 hover:bg-foreground/[0.03]">
      <div className="flex flex-1 flex-col rounded-lg bg-card px-2.5 pt-[7px] pb-2 shadow-sm">
        <Link href={`/documents/${doc.id}`} className="flex items-start gap-2">
          {doc.icon ? (
            <span className="text-2xl leading-none">{doc.icon}</span>
          ) : (
            <File className="size-5 shrink-0 text-foreground/40" />
          )}
          <h3 className="flex-1 truncate text-card-title font-semibold">{doc.title}</h3>
        </Link>
        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <p className="text-meta text-foreground/55">
            {new Date(doc.updatedAt).toLocaleDateString('zh-CN', {
              month: 'short',
              day: 'numeric',
            })}
          </p>
          <button
            type="button"
            onClick={handleUse}
            disabled={creating}
            className="flex h-7 shrink-0 items-center gap-1 rounded-md border border-border px-2 text-ui transition-colors duration-150 hover:bg-foreground/4 disabled:opacity-50"
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
    </div>
  );
}
