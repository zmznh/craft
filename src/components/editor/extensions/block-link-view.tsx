'use client';

import { NodeViewWrapper } from '@tiptap/react';
import type { NodeViewProps } from '@tiptap/react';
import { Link2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function BlockLinkView({ node }: NodeViewProps) {
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
        className="inline-flex items-center gap-1 rounded-md border border-foreground/8 bg-foreground/4 px-1.5 py-0.5 text-ui text-foreground/85 transition-colors duration-150 ease-craft hover:bg-foreground/8"
      >
        <Link2 className="size-3.5 text-foreground/40" />
        <span>{title || '未命名'}</span>
      </button>
    </NodeViewWrapper>
  );
}
