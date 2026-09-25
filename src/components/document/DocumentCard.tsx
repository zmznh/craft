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
      className="group block rounded-lg px-1.5 pt-1.5 pb-0 transition-colors duration-300 hover:bg-foreground/[0.03]"
    >
      <div className="rounded-lg bg-card px-2.5 pt-[7px] pb-2 shadow-sm">
        <div className="flex items-start gap-2">
          {doc.icon ? (
            <span className="text-2xl leading-none">{doc.icon}</span>
          ) : (
            <File className="size-5 shrink-0 text-foreground/40" />
          )}
          <h3 className="flex-1 truncate text-card-title font-semibold">{doc.title}</h3>
        </div>
        <p className="mt-1 text-meta text-foreground/55">{formattedDate}</p>
      </div>
    </Link>
  );
}
