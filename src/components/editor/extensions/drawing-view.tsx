'use client';

import { NodeViewWrapper } from '@tiptap/react';
import type { NodeViewProps } from '@tiptap/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Trash2, PenLine, Loader2 } from 'lucide-react';
import 'tldraw/tldraw.css';

type TldrawEditor = any;

export function DrawingView({ node, updateAttributes, deleteNode }: NodeViewProps) {
  const [TldrawComp, setTldrawComp] = useState<any>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<TldrawEditor>(null);
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSnapshotRef = useRef<string>(
    node.attrs.snapshot ? JSON.stringify(node.attrs.snapshot) : ''
  );
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const hasSnapshot = Boolean(node.attrs.snapshot);

  const startEditing = useCallback(() => {
    setEditing(true);
    setLoading(true);
    void import('tldraw').then(({ Tldraw }) => {
      setTldrawComp(() => Tldraw);
      setLoading(false);
    });
  }, []);

  const handleMount = useCallback((ed: TldrawEditor) => {
    editorRef.current = ed;
    const initial = node.attrs.snapshot;
    if (initial && typeof initial === 'object') {
      void import('tldraw').then(({ loadSnapshot }) => {
        loadSnapshot(ed.store, initial as any);
      });
    }
    ed.store.listen(
      () => {
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        saveTimerRef.current = setTimeout(async () => {
          const { getSnapshot } = await import('tldraw');
          const snapshot = getSnapshot(ed.store) as unknown as Record<
            string,
            unknown
          >;
          const str = JSON.stringify(snapshot);
          if (str !== lastSnapshotRef.current) {
            lastSnapshotRef.current = str;
            updateAttributes({ snapshot });
          }
        }, 1500);
      },
      { scope: 'all' }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  return (
    <NodeViewWrapper as="div" className="my-4">
      <div
        ref={wrapperRef}
        className="group relative h-[400px] w-full overflow-hidden rounded-lg border"
      >
        {TldrawComp ? (
          <TldrawComp onMount={handleMount} />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 bg-muted/30 text-muted-foreground">
            {loading ? (
              <>
                <Loader2 className="size-6 animate-spin" />
                <span className="text-sm">载入画板...</span>
              </>
            ) : (
              <>
                <PenLine className="size-6" />
                <button
                  type="button"
                  onClick={startEditing}
                  className="rounded-md border bg-background px-3 py-1.5 text-sm transition-colors hover:bg-muted"
                >
                  {hasSnapshot ? '编辑绘图' : '开始绘图'}
                </button>
                {hasSnapshot && (
                  <span className="text-xs text-muted-foreground">
                    该块包含绘图内容,点击上方按钮编辑
                  </span>
                )}
              </>
            )}
          </div>
        )}
        {TldrawComp && (
          <div className="absolute right-2 top-2 z-10 flex gap-1">
            <button
              type="button"
              onClick={() => deleteNode()}
              className="flex size-7 items-center justify-center rounded-md bg-background/80 text-muted-foreground opacity-60 shadow-sm backdrop-blur transition-colors hover:bg-background hover:text-destructive"
              title="删除绘图"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        )}
      </div>
    </NodeViewWrapper>
  );
}
