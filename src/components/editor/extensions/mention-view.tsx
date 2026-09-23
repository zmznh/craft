'use client';

import { NodeViewWrapper } from '@tiptap/react';
import type { NodeViewProps } from '@tiptap/react';
import { FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function MentionView({ node }: NodeViewProps) {
  const router = useRouter();
  const documentId = node.attrs.documentId as string;
  const title = node.attrs.title as string;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (documentId) {
      router.push(`/documents/${documentId}`);
    }
  };

  return (
    <NodeViewWrapper as="span" className="inline">
      <button
        type="button"
        onClick={handleClick}
        className="inline-flex items-center gap-1 rounded-md bg-muted px-1.5 py-0.5 text-sm text-foreground transition-colors hover:bg-muted/80"
      >
        <FileText className="size-3.5 text-muted-foreground" />
        <span>{title || '未命名'}</span>
      </button>
    </NodeViewWrapper>
  );
}
