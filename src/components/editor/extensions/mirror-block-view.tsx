'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { NodeViewWrapper } from '@tiptap/react';
import type { NodeViewProps } from '@tiptap/react';
import { Copy, Pilcrow, RefreshCw } from 'lucide-react';
import { getMirroredBlock, type MirroredBlock } from '@/actions/document/mirror';
import { searchBlockAnchors, type BlockAnchorHit } from '@/actions/document/anchors';

type State =
  | { kind: 'loading' }
  | { kind: 'ready'; html: string }
  | { kind: 'unavailable'; message: string };

const MESSAGES: Record<Extract<MirroredBlock, { ok: false }>['reason'], string> = {
  missing: '源块已被删除或移动',
  cycle: '镜像不能指回本文档',
  nested: '不能镜像另一个镜像',
};

export function MirrorBlockView({ node, editor, selected, updateAttributes }: NodeViewProps) {
  const [state, setState] = useState<State>({ kind: 'loading' });

  const sourceDocumentId = node.attrs.sourceDocumentId as string | null;
  const sourceBlockId = node.attrs.sourceBlockId as string | null;
  const sourceBlockIndex = node.attrs.sourceBlockIndex as number | null;
  const title = (node.attrs.title as string) || '未命名';

  const load = useCallback(async () => {
    const hostDocumentId = editor.storage.mirrorBlock?.hostDocumentId;
    if (!sourceDocumentId || !hostDocumentId) return;
    setState({ kind: 'loading' });
    try {
      const result = await getMirroredBlock({
        hostDocumentId,
        sourceDocumentId,
        sourceBlockId,
        sourceBlockIndex,
      });
      setState(
        result.ok
          ? { kind: 'ready', html: result.html }
          : { kind: 'unavailable', message: MESSAGES[result.reason] }
      );
    } catch {
      setState({ kind: 'unavailable', message: '无法读取源文档' });
    }
  }, [editor, sourceDocumentId, sourceBlockId, sourceBlockIndex]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!sourceDocumentId) {
    return (
      <NodeViewWrapper as="div">
        <MirrorSourcePicker onPick={(attributes) => updateAttributes(attributes)} />
      </NodeViewWrapper>
    );
  }

  return (
    <NodeViewWrapper as="div">
      <div
        data-mirror-block={sourceDocumentId ?? undefined}
        className={[
          'my-1.5 rounded-lg border bg-muted/25 px-3 py-2.5 transition-colors',
          selected ? 'border-primary/60' : 'border-border',
        ].join(' ')}
      >
        <div className="mb-1.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Copy className="size-3 shrink-0" />
          <Link
            href={`/documents/${sourceDocumentId ?? ''}`}
            className="min-w-0 truncate hover:text-foreground hover:underline"
          >
            镜像自 {title}
          </Link>
          <button
            type="button"
            onClick={() => void load()}
            aria-label="刷新镜像"
            className="ml-auto shrink-0 rounded p-0.5 transition-colors hover:bg-muted hover:text-foreground"
          >
            <RefreshCw className="size-3" />
          </button>
        </div>

        {state.kind === 'loading' && <p className="text-[13px] text-muted-foreground">载入中…</p>}
        {state.kind === 'unavailable' && (
          <p className="text-[13px] text-muted-foreground">{state.message}</p>
        )}
        {state.kind === 'ready' && (
          <div className="mirror-block-body" dangerouslySetInnerHTML={{ __html: state.html }} />
        )}
      </div>
    </NodeViewWrapper>
  );
}

interface PickedSource {
  sourceDocumentId: string;
  sourceBlockId: string | null;
  sourceBlockIndex: number;
  title: string;
}

function MirrorSourcePicker({ onPick }: { onPick: (attributes: PickedSource) => void }) {
  const [query, setQuery] = useState('');
  const [hits, setHits] = useState<BlockAnchorHit[]>([]);
  const [loading, setLoading] = useState(false);
  const latestQuery = useRef(query);

  useEffect(() => {
    latestQuery.current = query;
    const term = query.trim();
    if (!term) {
      setHits([]);
      return;
    }
    const timer = setTimeout(() => {
      setLoading(true);
      searchBlockAnchors(term)
        .then((result) => {
          if (latestQuery.current === query) setHits(result);
        })
        .catch(() => setHits([]))
        .finally(() => {
          if (latestQuery.current === query) setLoading(false);
        });
    }, 150);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div
      contentEditable={false}
      className="my-1.5 rounded-lg border border-dashed border-border bg-muted/20 p-2.5"
      data-mirror-picker
    >
      <p className="mb-1.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Copy className="size-3" />
        选择要镜像的块
      </p>
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onKeyDown={(event) => event.stopPropagation()}
        onKeyUp={(event) => event.stopPropagation()}
        placeholder="搜索其他文档里的段落…"
        aria-label="搜索要镜像的块"
        className="w-full rounded-md border border-border bg-background px-2 py-1 text-[13px] outline-none focus:border-primary/60"
      />
      {loading && <p className="mt-1.5 text-[12px] text-muted-foreground">搜索中…</p>}
      {!loading && query.trim() && hits.length === 0 && (
        <p className="mt-1.5 text-[12px] text-muted-foreground">没有匹配的块</p>
      )}
      {hits.length > 0 && (
        <ul className="mt-1.5 space-y-0.5">
          {hits.map((hit) => (
            <li key={`${hit.documentId}-${hit.blockIndex}`}>
              <button
                type="button"
                onClick={() =>
                  onPick({
                    sourceDocumentId: hit.documentId,
                    sourceBlockId: hit.blockId,
                    sourceBlockIndex: hit.blockIndex,
                    title: hit.text,
                  })
                }
                className="flex w-full items-center gap-2 rounded-md px-2 py-1 text-left text-[13px] transition-colors hover:bg-muted"
              >
                <Pilcrow className="size-3.5 shrink-0 text-muted-foreground" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate">{hit.text}</span>
                  <span className="block truncate text-[11px] text-muted-foreground">
                    {hit.documentTitle}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
