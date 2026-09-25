'use client';

import { NodeViewWrapper, NodeViewContent } from '@tiptap/react';
import type { NodeViewProps } from '@tiptap/react';
import { Info, AlertTriangle, AlertCircle, CheckCircle, StickyNote } from 'lucide-react';
import { cn } from 'cn';
import type { CalloutType } from './callout';

const calloutConfig: Record<CalloutType, { icon: typeof Info; color: string; bg: string; border: string }> = {
  info: {
    icon: Info,
    color: 'text-[var(--callout-info-border)]',
    bg: 'bg-[var(--callout-info-bg)]',
    border: 'border-l-[var(--callout-info-border)]',
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-[var(--callout-warn-border)]',
    bg: 'bg-[var(--callout-warn-bg)]',
    border: 'border-l-[var(--callout-warn-border)]',
  },
  error: {
    icon: AlertCircle,
    color: 'text-[var(--callout-error-border)]',
    bg: 'bg-[var(--callout-error-bg)]',
    border: 'border-l-[var(--callout-error-border)]',
  },
  success: {
    icon: CheckCircle,
    color: 'text-[var(--callout-success-border)]',
    bg: 'bg-[var(--callout-success-bg)]',
    border: 'border-l-[var(--callout-success-border)]',
  },
  note: {
    icon: StickyNote,
    color: 'text-[var(--callout-note-border)]',
    bg: 'bg-[var(--callout-note-bg)]',
    border: 'border-l-[var(--callout-note-border)]',
  },
};

export function CalloutView({ node, updateAttributes }: NodeViewProps) {
  const type = (node.attrs.type as CalloutType) || 'info';
  const config = calloutConfig[type];
  const Icon = config.icon;

  return (
    <NodeViewWrapper as="div" className="my-3">
      <div
        className={cn(
          'flex gap-3 rounded-lg border-l-4 p-4 transition-shadow duration-150 ease-craft',
          config.bg,
          config.border
        )}
      >
        <button
          type="button"
          onClick={() => {
            const types: CalloutType[] = ['info', 'warning', 'error', 'success', 'note'];
            const currentIndex = types.indexOf(type);
            const nextType = types[(currentIndex + 1) % types.length];
            updateAttributes({ type: nextType });
          }}
          className={cn('mt-0.5 shrink-0 cursor-pointer transition-opacity hover:opacity-70', config.color)}
        >
          <Icon className="size-5" />
        </button>
        <div className="min-w-0 flex-1">
          <NodeViewContent as="div" className="callout-content" />
        </div>
      </div>
    </NodeViewWrapper>
  );
}
