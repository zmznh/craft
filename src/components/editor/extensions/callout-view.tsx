'use client';

import { NodeViewWrapper, NodeViewContent } from '@tiptap/react';
import type { NodeViewProps } from '@tiptap/react';
import { Info, AlertTriangle, AlertCircle, CheckCircle, StickyNote } from 'lucide-react';
import { cn } from 'cn';
import type { CalloutType } from './callout';

const calloutConfig: Record<CalloutType, { icon: typeof Info; color: string; bg: string; border: string }> = {
  info: {
    icon: Info,
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    border: 'border-l-blue-500',
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    border: 'border-l-amber-500',
  },
  error: {
    icon: AlertCircle,
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-950/30',
    border: 'border-l-red-500',
  },
  success: {
    icon: CheckCircle,
    color: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-50 dark:bg-green-950/30',
    border: 'border-l-green-500',
  },
  note: {
    icon: StickyNote,
    color: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-50 dark:bg-purple-950/30',
    border: 'border-l-purple-500',
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
          'flex gap-3 rounded-lg border-l-4 p-4',
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
