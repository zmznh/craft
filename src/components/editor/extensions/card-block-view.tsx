'use client';

import { NodeViewWrapper, NodeViewContent } from '@tiptap/react';
import type { NodeViewProps } from '@tiptap/react';

export function CardBlockView({ node }: NodeViewProps) {
  const bgColor = node.attrs.bgColor as string;
  const emoji = node.attrs.emoji as string | null;

  return (
    <NodeViewWrapper className="my-2">
      <div
        className="rounded-lg border border-foreground/8 p-4 shadow-sm transition-shadow duration-150 ease-craft hover:shadow-md"
        style={{ backgroundColor: bgColor || '#FFFFFF' }}
      >
        {emoji && <div className="mb-1 text-xl leading-none">{emoji}</div>}
        <NodeViewContent className="card-block-content" />
      </div>
    </NodeViewWrapper>
  );
}
