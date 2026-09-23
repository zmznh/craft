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
      <div className="group flex items-center gap-3 rounded-lg border bg-card px-3 py-2.5">
        <FileText className="size-5 shrink-0 text-muted-foreground" />
        <div className="min-w-0 flex-1">
          <div className="truncate text-[13px] font-medium">{name}</div>
          {size != null && (
            <div className="text-xs text-muted-foreground">
              {formatFileSize(size)}
            </div>
          )}
        </div>
        <a
          href={url}
          download={name}
          className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          title="下载"
        >
          <Download className="size-4" />
        </a>
        <button
          type="button"
          onClick={() => deleteNode()}
          className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-all hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
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
