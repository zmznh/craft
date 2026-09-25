'use client';

import { NodeViewWrapper } from '@tiptap/react';
import type { NodeViewProps } from '@tiptap/react';
import { useState } from 'react';

export function MathBlockView({ node, updateAttributes }: NodeViewProps) {
  const [editing, setEditing] = useState(false);
  const latex = (node.attrs.latex as string) || '';

  return (
    <NodeViewWrapper as="div" className="my-4">
      <div className="rounded-lg border border-foreground/10 bg-foreground/4 p-4 transition-colors duration-150 ease-craft hover:bg-foreground/6">
        {editing ? (
          <textarea
            value={latex}
            onChange={(e) => updateAttributes({ latex: e.target.value })}
            onBlur={() => setEditing(false)}
            autoFocus
            placeholder="输入 LaTeX 公式..."
            className="min-h-[60px] w-full resize-none bg-transparent font-mono text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          />
        ) : (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="block w-full rounded-md text-left transition-colors duration-150 ease-craft hover:bg-foreground/4"
          >
            {latex ? (
              <code className="text-ui">{latex}</code>
            ) : (
              <span className="text-ui text-foreground/40">点击添加公式</span>
            )}
          </button>
        )}
      </div>
    </NodeViewWrapper>
  );
}
