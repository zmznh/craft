'use client';

import { Suspense, lazy, useEffect, useState } from 'react';
import { NodeViewWrapper } from '@tiptap/react';
import type { NodeViewProps } from '@tiptap/react';
import { ExternalLink, Loader2, Palette } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';

const WhiteboardSyncCanvas = lazy(() => import('./whiteboard-sync-canvas'));

interface Grant {
  token: string;
  role: string;
  syncUrl: string;
}

/**
 * The signed claim comes from Next.js, so who may reach the board is decided
 * server-side; a refusal here just degrades the embed to a link.
 */
function useBoardUri(whiteboardId: string | null) {
  const [uri, setUri] = useState<string | null>(null);
  const [state, setState] = useState<'idle' | 'connecting' | 'ready' | 'denied'>('idle');

  useEffect(() => {
    if (!whiteboardId) return;
    let cancelled = false;
    setState('connecting');
    void fetch(`/api/whiteboards/${whiteboardId}/collab-token`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ shareToken: null }),
    })
      .then(async (res) => {
        if (cancelled) return;
        if (!res.ok) {
          setState('denied');
          return;
        }
        const body = (await res.json()) as Grant;
        setUri(`${body.syncUrl}/sync/${whiteboardId}?token=${encodeURIComponent(body.token)}`);
        setState('ready');
      })
      .catch(() => {
        if (!cancelled) setState('denied');
      });
    return () => {
      cancelled = true;
    };
  }, [whiteboardId]);

  return { uri, state };
}

function Canvas({ uri }: { uri: string }) {
  return (
    <Suspense
      fallback={
        <div className="flex h-full items-center justify-center bg-muted/30">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <WhiteboardSyncCanvas uri={uri} />
    </Suspense>
  );
}

export function WhiteboardEmbedView({ node }: NodeViewProps) {
  const router = useRouter();
  const whiteboardId = node.attrs.whiteboardId as string;
  const title = (node.attrs.title as string) || '未命名白板';
  const icon = (node.attrs.icon as string) || '🎨';
  const [zoomed, setZoomed] = useState(false);
  const { uri, state } = useBoardUri(whiteboardId);

  const openBoard = () => router.push(`/whiteboards/${whiteboardId}`);

  if (state === 'idle' || state === 'connecting') {
    return (
      <NodeViewWrapper as="div" className="my-3">
        <div className="flex h-24 items-center justify-center rounded-lg border border-border bg-muted/30">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </div>
      </NodeViewWrapper>
    );
  }

  // A board the reader cannot reach (deleted, or owned by someone else) keeps its
  // stored title so the document does not lose the reference.
  if (state === 'denied' || !uri) {
    return (
      <NodeViewWrapper as="div" className="my-3">
        <button
          type="button"
          data-whiteboard-embed=""
          onClick={openBoard}
          className="flex w-full items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted"
        >
          <Palette className="size-4 shrink-0" />
          <span className="truncate">{title}</span>
          <span className="ml-auto shrink-0 text-xs">无法预览</span>
        </button>
      </NodeViewWrapper>
    );
  }

  return (
    <NodeViewWrapper as="div" className="my-3">
      <div data-whiteboard-embed="" className="overflow-hidden rounded-lg border border-border">
        <div className="flex items-center gap-2 border-b border-border bg-muted/40 px-3 py-2">
          <span className="text-sm leading-none">{icon}</span>
          <span className="min-w-0 flex-1 truncate text-sm font-medium">{title}</span>
          <span className="shrink-0 text-[11px] text-muted-foreground">只读预览</span>
          <button
            type="button"
            aria-label="打开白板"
            onClick={openBoard}
            className="shrink-0 rounded p-1 text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
          >
            <ExternalLink className="size-3.5" />
          </button>
        </div>
        <div className="relative h-64 w-full">
          <Canvas uri={uri} />
          {/* tldraw swallows pointer events, so zooming needs an overlay we own. */}
          <button
            type="button"
            aria-label="放大白板预览"
            onClick={() => setZoomed(true)}
            className="absolute inset-0 cursor-zoom-in"
          />
        </div>
      </div>

      <Dialog open={zoomed} onOpenChange={setZoomed}>
        <DialogContent className="flex h-[86vh] max-w-[96vw] flex-col gap-0 p-0 sm:max-w-[96vw]">
          <DialogTitle className="sr-only">{title}</DialogTitle>
          <DialogDescription className="sr-only">{title} 的只读预览</DialogDescription>
          <div className="flex h-11 shrink-0 items-center gap-2 border-b border-border px-3">
            <span className="text-sm leading-none">{icon}</span>
            <span className="min-w-0 flex-1 truncate text-sm font-medium">{title}</span>
            <button
              type="button"
              onClick={openBoard}
              className="flex items-center gap-1 rounded-md border border-input px-2 py-1 text-xs transition-colors hover:bg-muted"
            >
              <ExternalLink className="size-3" />
              编辑
            </button>
          </div>
          <div className="relative min-h-0 flex-1">
            <Canvas uri={uri} />
          </div>
        </DialogContent>
      </Dialog>
    </NodeViewWrapper>
  );
}
