'use client';

import { NodeViewWrapper } from '@tiptap/react';
import type { NodeViewProps } from '@tiptap/react';
import { Palette } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function WhiteboardLinkView({ node }: NodeViewProps) {
  const router = useRouter();
  const whiteboardId = node.attrs.whiteboardId as string;
  const title = node.attrs.title as string;
  const icon = node.attrs.icon as string | null;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (whiteboardId) {
      router.push(`/whiteboards/${whiteboardId}`);
    }
  };

  return (
    <NodeViewWrapper as="span" className="inline">
      <button
        type="button"
        onClick={handleClick}
        className="inline-flex items-center gap-1 rounded-md border border-foreground/8 bg-foreground/4 px-1.5 py-0.5 text-ui text-foreground/85 transition-colors duration-150 ease-craft hover:bg-foreground/8"
      >
        <span className="text-sm leading-none">{icon || '🎨'}</span>
        <span>{title || '未命名'}</span>
        <Palette className="size-3.5 text-foreground/40" />
      </button>
    </NodeViewWrapper>
  );
}
