'use client';

import { useEffect, useState } from 'react';
import * as Y from 'yjs';
import { HocuspocusProvider } from '@hocuspocus/provider';
import { IndexeddbPersistence } from 'y-indexeddb';

export type CollabState = 'idle' | 'connecting' | 'synced' | 'offline' | 'error';

export interface CollabSession {
  ydoc: Y.Doc | null;
  state: CollabState;
}

const COLLAB_URL = process.env.NEXT_PUBLIC_COLLAB_URL || 'ws://localhost:3001';

/**
 * 连接 Yjs 协作房间;未启用时返回 { ydoc: null, state: 'idle' }。
 * 首次同步后若文档为空且携带 initialContent,调用方负责灌入(见 Editor)。
 */
export function useCollabSession(
  documentId: string,
  ydoc: Y.Doc | null,
  enabled: boolean,
): CollabSession {
  const [state, setState] = useState<CollabState>(enabled && ydoc ? 'connecting' : 'idle');

  useEffect(() => {
    if (!enabled || !ydoc) return;
    let cancelled = false;
    let provider: HocuspocusProvider | null = null;

    void (async () => {
      try {
        const res = await fetch('/api/collab/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ documentId }),
        });
        if (!res.ok) throw new Error('token failed');
        const { token } = (await res.json()) as { token: string };
        if (cancelled) return;

        new IndexeddbPersistence(documentId, ydoc);
        provider = new HocuspocusProvider({
          url: COLLAB_URL,
          name: documentId,
          document: ydoc,
          token,
        });

        provider.on('status', ({ status }: { status: string }) => {
          if (status === 'connected') setState('synced');
          if (status === 'disconnected') setState('offline');
        });
        provider.on('authenticationFailed', () => setState('error'));
      } catch {
        if (!cancelled) setState('offline');
      }
    })();

    return () => {
      cancelled = true;
      provider?.destroy();
    };
  }, [documentId, ydoc, enabled]);

  return { ydoc, state };
}