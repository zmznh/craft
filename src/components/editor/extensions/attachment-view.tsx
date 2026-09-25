'use client';

import { NodeViewWrapper } from '@tiptap/react';
import type { NodeViewProps } from '@tiptap/react';
import { FileText, Download } from 'lucide-react';
import { formatFileSize } from '@/lib/upload-client';

export function AttachmentView({ node, deleteNode }: NodeViewProps) {
  const url = node.attrs.url as string;
  const name = (node.attrs.name as string) ?? '附件';
  const size = node.attrs.size as number | null;

  return (
    <NodeViewWrapper as="div" className="my-2">
      <div className="group flex items-center gap-3 rounded-lg border border-foreground/8 bg-card px-3 py-2.5 transition-colors duration-150 ease-craft hover:bg-foreground/4">
        <FileText className="size-5 shrink-0 text-muted-foreground" />
        <div className="min-w-0 flex-1">
          <div className="truncate text-ui font-medium">{name}</div>
          {size != null && (
            <div className="text-meta text-foreground/40">
              {formatFileSize(size)}
            </div>
          )}
        </div>
        <a
          href={url}
          download={name}
          className="flex size-7 shrink-0 items-center justify-center rounded-md text-foreground/55 transition-colors duration-150 ease-craft hover:bg-foreground/6 hover:text-foreground/85"
          title="下载"
        >
          <Download className="size-4" />
        </a>
        <button
          type="button"
          onClick={() => deleteNode()}
          className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-all duration-150 ease-craft hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
          title="删除"
        >
          <svg
            className="size-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
    </NodeViewWrapper>
  );
}
