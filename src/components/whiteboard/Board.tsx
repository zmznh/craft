'use client';

import { useCallback, useEffect, useState } from 'react';
import { createShapeId, inlineBase64AssetStore, Tldraw } from 'tldraw';
import 'tldraw/tldraw.css';
import { useSync } from '@tldraw/sync';
import type { WhiteboardRole } from '@/lib/whiteboard-sharing/access';
import { BOARD_FONT_URLS } from './board-fonts';

interface ConnectionGrant {
  token: string;
  role: WhiteboardRole;
  syncUrl: string;
}

interface BoardProps {
  whiteboardId: string;
  /** Public share slug; omitted for the owner's own view. */
  shareToken?: string;
}

function Status({ message, action }: { message: string; action?: { label: string; onClick: () => void } }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-craft-paper">
      <p className="text-sm text-muted-foreground">{message}</p>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="rounded-md border border-border px-3 py-1.5 text-sm transition-colors hover:bg-muted"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

function SyncedBoard({ uri, editable }: { uri: string; editable: boolean }) {
  const store = useSync({ uri, assets: inlineBase64AssetStore });

  if (store.status === 'loading') return <Status message="白板同步中…" />;

  if (store.status === 'error') {
    const detail = store.error instanceof Error ? store.error.message : String(store.error ?? '');
    const fatal = /NOT_AUTHENTICATED|FORBIDDEN|GONE/i.test(detail);
    return (
      <Status
        message={fatal ? '链接已失效或权限已被撤销' : '与同步服务断开连接'}
        action={fatal ? undefined : { label: '重新连接', onClick: () => window.location.reload() }}
      />
    );
  }

  return (
    <div className="h-full w-full">
      {/*
        Licensing: the SDK reads NEXT_PUBLIC_TLDRAW_LICENSE_KEY automatically, so
        no prop is needed. Without a valid key in a production environment the
        canvas renders for ~5s and then blanks out — configure the key before any
        public HTTPS deploy. See docs/superpowers/notes/tldraw-license-gate.md.
        Never pass a prop or CSS that hides the "Made with tldraw" watermark: it
        is a condition of the (free, non-commercial) hobby licence.
      */}
      <Tldraw
        store={store.store}
        assetUrls={{ fonts: BOARD_FONT_URLS }}
        onMount={(editor) => {
          if (!editable) editor.updateInstanceState({ isReadonly: true });
          if (process.env.NODE_ENV === 'development') {
            // Playwright hooks: insert a shape without going through the toolbar.
            (window as unknown as Record<string, unknown>).__craftyBoard = editor;
            // Text lives in child line shapes in tldraw v5, so tests mark shapes via record meta.
            (window as unknown as Record<string, unknown>).__craftyAddNote = (x: number, y: number, marker: string) => {
              editor.createShapes([{ id: createShapeId(), type: 'note', x, y, meta: { marker } }]);
            };
          }
        }}
      />
    </div>
  );
}

/**
 * Whiteboard canvas backed by the official tldraw sync protocol. The signed
 * claim comes from Next.js so the role is decided server-side, never here.
 */
export function Board({ whiteboardId, shareToken }: BoardProps) {
  const [grant, setGrant] = useState<ConnectionGrant | null>(null);
  const [failure, setFailure] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setGrant(null);
    setFailure(null);

    void (async () => {
      try {
        const res = await fetch(`/api/whiteboards/${whiteboardId}/collab-token`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ shareToken: shareToken ?? null }),
        });
        const body = (await res.json().catch(() => ({}))) as Partial<ConnectionGrant> & { error?: string };
        if (cancelled) return;
        if (!res.ok || !body.token) {
          setFailure(body.error ?? '无法连接同步服务');
          return;
        }
        setGrant({ token: body.token, role: body.role as WhiteboardRole, syncUrl: body.syncUrl as string });
      } catch {
        if (!cancelled) setFailure('无法连接同步服务');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [whiteboardId, shareToken, attempt]);

  const retry = useCallback(() => setAttempt((value) => value + 1), []);

  if (failure) return <Status message={failure} action={{ label: '重试', onClick: retry }} />;
  if (!grant) return <Status message="连接中…" />;

  const uri = `${grant.syncUrl}/sync/${whiteboardId}?token=${encodeURIComponent(grant.token)}`;
  return <SyncedBoard uri={uri} editable={grant.role === 'owner' || grant.role === 'editor'} />;
}
