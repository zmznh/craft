'use client';

import { useEffect, useState } from 'react';
import * as Y from 'yjs';
import { HocuspocusProvider } from '@hocuspocus/provider';
import { IndexeddbPersistence } from 'y-indexeddb';
import type { Awareness } from 'y-protocols/awareness';
import { colorForUserId, initialPresenceState, type PresenceUser } from './presence';

export type CollabState = 'idle' | 'connecting' | 'synced' | 'offline' | 'error';
export type CollabRole = 'owner' | 'editor' | 'commenter' | 'viewer';

export interface CollabSession {
  ydoc: Y.Doc | null;
  state: CollabState;
  role: CollabRole | null;
  readOnly: boolean;
  awareness: Awareness | null;
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
  const [role, setRole] = useState<CollabRole | null>(null);
  const [readOnly, setReadOnly] = useState(false);
  const [awareness, setAwareness] = useState<Awareness | null>(null);

  useEffect(() => {
    if (!enabled || !ydoc) return;
    let cancelled = false;
    let provider: HocuspocusProvider | null = null;
    let persistence: IndexeddbPersistence | null = null;

    void (async () => {
      try {
        const res = await fetch('/api/collab/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ documentId }),
        });
        if (!res.ok) throw new Error('token failed');
        const granted = (await res.json()) as {
          token: string;
          role: CollabRole;
          readOnly: boolean;
          user: PresenceUser;
        };
        if (cancelled) return;
        setRole(granted.role);
        setReadOnly(granted.readOnly);

        persistence = new IndexeddbPersistence(documentId, ydoc);
        provider = new HocuspocusProvider({
          url: COLLAB_URL,
          name: documentId,
          document: ydoc,
          token: granted.token,
        });

        const user: PresenceUser = { ...granted.user, color: colorForUserId(granted.user.id) };
        provider.awareness?.setLocalState(initialPresenceState(user));
        setAwareness(provider.awareness ?? null);

        provider.on('status', ({ status }: { status: string }) => {
          // 'connected' only means the socket opened. Reporting 'synced' here would
          // let the caller seed the stored JSON into a fragment that is about to
          // receive the same content from the server, doubling the document on
          // every mount.
          if (status === 'connected') setState('connecting');
          if (status === 'disconnected') setState('offline');
        });
        provider.on('synced', () => {
          if (!cancelled) setState('synced');
        });
        provider.on('authenticationFailed', () => setState('error'));
      } catch {
        if (!cancelled) setState('offline');
      }
    })();

    return () => {
      cancelled = true;
      provider?.awareness?.setLocalState(null);
      setAwareness(null);
      provider?.destroy();
      void persistence?.destroy();
    };
  }, [documentId, ydoc, enabled]);

  return { ydoc, state, role, readOnly, awareness };
}
