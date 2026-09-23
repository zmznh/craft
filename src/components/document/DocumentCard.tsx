'use client';

import Link from 'next/link';
import { File } from 'lucide-react';

interface DocumentCardProps {
  document: {
    id: string;
    title: string;
    icon: string | null;
    updatedAt: string;
  };
}

export function DocumentCard({ document: doc }: DocumentCardProps) {
  const formattedDate = new Date(doc.updatedAt).toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
  });

  return (
    <Link
      href={`/documents/${doc.id}`}
      className="group flex flex-col gap-2 rounded-lg border border-border p-4 transition-colors hover:bg-muted/50"
    >
      <div className="flex items-start gap-2">
        {doc.icon ? (
          <span className="text-2xl">{doc.icon}</span>
        ) : (
          <File className="size-5 shrink-0 text-muted-foreground" />
        )}
        <h3 className="flex-1 truncate font-medium">{doc.title}</h3>
      </div>
      <p className="text-xs text-muted-foreground">{formattedDate}</p>
    </Link>
  );
}
