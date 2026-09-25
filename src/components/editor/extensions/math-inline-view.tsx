'use client';

import { NodeViewWrapper } from '@tiptap/react';
import type { NodeViewProps } from '@tiptap/react';
import { useMemo, useState } from 'react';
import { renderMath } from '@/lib/math/render';

export function MathInlineView({ node, updateAttributes }: NodeViewProps) {
  const [editing, setEditing] = useState(false);
  const latex = (node.attrs.latex as string) || '';
  const rendered = useMemo(() => renderMath(latex), [latex]);

  if (editing || rendered.empty) {
    return (
      <NodeViewWrapper as="span">
        <input
          value={latex}
          onChange={(e) => updateAttributes({ latex: e.target.value })}
          onBlur={() => setEditing(false)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === 'Escape') {
              e.preventDefault();
              setEditing(false);
            }
          }}
          autoFocus
          placeholder="LaTeX"
          aria-label="行内公式"
          className="inline-block w-40 rounded border border-border bg-muted/40 px-1 font-mono text-[0.9em] outline-none"
        />
      </NodeViewWrapper>
    );
  }

  return (
    <NodeViewWrapper as="span">
      <span
        className="crafty-math crafty-math-inline cursor-pointer"
        title={latex}
        onClick={() => setEditing(true)}
        dangerouslySetInnerHTML={{ __html: rendered.html }}
      />
    </NodeViewWrapper>
  );
}
