'use client';

import { NodeViewWrapper, NodeViewContent } from '@tiptap/react';
import type { NodeViewProps } from '@tiptap/react';
import { ChevronRight } from 'lucide-react';
import { cn } from 'cn';

export function ToggleBlockView({ node, updateAttributes }: NodeViewProps) {
  const isOpen = node.attrs.open;

  const toggle = () => {
    updateAttributes({ open: !isOpen });
  };

  return (
    <NodeViewWrapper as="div" className="my-1">
      <div className="rounded-md">
        <button
          type="button"
          onClick={toggle}
          className="flex w-full items-center gap-1 rounded-md px-1 py-1 text-left hover:bg-muted/50"
        >
          <ChevronRight
            className={cn(
              'size-4 shrink-0 text-muted-foreground transition-transform duration-200',
              isOpen && 'rotate-90'
            )}
          />
          <div className="min-w-0 flex-1">
            <NodeViewContent as="div" className="toggle-summary" />
          </div>
        </button>
        {isOpen && (
          <div className="ml-5 border-l-2 border-border pl-3">
            <NodeViewContent as="div" />
          </div>
        )}
      </div>
    </NodeViewWrapper>
  );
}
