'use client';

import { NodeViewContent, NodeViewWrapper } from '@tiptap/react';
import type { NodeViewProps } from '@tiptap/react';
import { Check, Copy } from 'lucide-react';
import { useState } from 'react';

/** The grammars `createLowlight(common)` actually registers, plus the fallback. */
export const CODE_LANGUAGES = [
  'plaintext',
  'javascript',
  'typescript',
  'jsx',
  'tsx',
  'python',
  'bash',
  'shell',
  'json',
  'yaml',
  'html',
  'css',
  'sql',
  'go',
  'rust',
  'java',
  'kotlin',
  'php',
  'ruby',
  'markdown',
  'diff',
  'dockerfile',
] as const;

export function CodeBlockView({ node, updateAttributes }: NodeViewProps) {
  const [copied, setCopied] = useState(false);
  const language = (node.attrs.language as string) || 'plaintext';

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(node.textContent ?? '');
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard permission denied; the selection is still there for a manual copy.
    }
  };

  return (
    <NodeViewWrapper as="div" className="crafty-code-block my-3 overflow-hidden rounded-lg border border-border">
      <div className="flex items-center gap-2 border-b border-border bg-muted/40 px-3 py-1.5">
        <select
          value={language}
          aria-label="代码语言"
          onChange={(e) => updateAttributes({ language: e.target.value })}
          className="rounded bg-transparent text-xs text-muted-foreground outline-none hover:text-foreground"
        >
          {CODE_LANGUAGES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={copy}
          aria-label="复制代码"
          className="ml-auto inline-flex items-center gap-1 rounded px-1.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          {copied ? '已复制' : '复制'}
        </button>
      </div>
      <pre className="overflow-x-auto p-3 text-sm">
        <NodeViewContent<'code'> as="code" />
      </pre>    </NodeViewWrapper>
  );
}
