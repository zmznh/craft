'use client';

import { NodeViewWrapper } from '@tiptap/react';
import type { NodeViewProps } from '@tiptap/react';
import { useState } from 'react';

export function MathBlockView({ node, updateAttributes }: NodeViewProps) {
  const [editing, setEditing] = useState(false);
  const latex = (node.attrs.latex as string) || '';

  return (
    <NodeViewWrapper as="div" className="my-4">
      <div className="rounded-lg border border-border bg-muted/30 p-4">
        {editing ? (
          <textarea
            value={latex}
            onChange={(e) => updateAttributes({ latex: e.target.value })}
            onBlur={() => setEditing(false)}
            autoFocus
            placeholder="输入 LaTeX 公式..."
            className="min-h-[60px] w-full resize-none bg-transparent font-mono text-sm focus:outline-none"
          />
        ) : (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="block w-full text-left"
          >
            {latex ? (
              <code className="text-sm">{latex}</code>
            ) : (
              <span className="text-sm text-muted-foreground">点击添加公式</span>
            )}
          </button>
        )}
      </div>
    </NodeViewWrapper>
  );
}
