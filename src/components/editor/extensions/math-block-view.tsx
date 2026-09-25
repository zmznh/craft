'use client';

import { NodeViewWrapper } from '@tiptap/react';
import type { NodeViewProps } from '@tiptap/react';
import { useMemo, useState } from 'react';
import { renderMath } from '@/lib/math/render';

export function MathBlockView({ node, updateAttributes }: NodeViewProps) {
  const [editing, setEditing] = useState(false);
  const latex = (node.attrs.latex as string) || '';
  const rendered = useMemo(() => renderMath(latex, true), [latex]);
  const showSource = editing || rendered.empty;

  return (
    <NodeViewWrapper as="div" className="my-4">
      <div
        className="rounded-lg border border-transparent px-4 py-3 transition-colors hover:border-border"
        onClick={() => setEditing(true)}
      >
        {showSource ? (
          <textarea
            value={latex}
            onChange={(e) => updateAttributes({ latex: e.target.value })}
            onBlur={() => setEditing(false)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                e.preventDefault();
                setEditing(false);
              }
            }}
            autoFocus
            placeholder="输入 LaTeX 公式，Esc 退出编辑"
            className="min-h-[60px] w-full resize-none bg-transparent font-mono text-sm focus:outline-none"
          />
        ) : (
          <div
            className="crafty-math cursor-pointer text-center"
            // The source is the author's data; KaTeX owns the presentation.
            dangerouslySetInnerHTML={{ __html: rendered.html }}
          />
        )}
      </div>
    </NodeViewWrapper>
  );
}
