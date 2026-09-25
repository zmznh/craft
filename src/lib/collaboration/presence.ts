import type { MappablePosition } from '@tiptap/core';
import type { Awareness } from 'y-protocols/awareness';

export interface PresenceUser {
  id: string;
  name: string;
  color: string;
}

export interface PresenceCursor {
  anchor: unknown;
  head: unknown;
}

export interface PresenceState {
  user?: PresenceUser;
  cursor?: PresenceCursor | null;
}

/**
 * Stable palette so the same collaborator keeps one colour across sessions.
 * Mirrors the eight accent dots used by the format panel.
 */
const CURSOR_COLORS = [
  '#e0596b',
  '#e8863c',
  '#d9a520',
  '#4f9e68',
  '#2f9ba8',
  '#4a7de0',
  '#8a5ce0',
  '#c94fa2',
];

export function colorForUserId(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i += 1) {
    hash = (hash * 31 + userId.charCodeAt(i)) >>> 0;
  }
  return CURSOR_COLORS[hash % CURSOR_COLORS.length];
}

export function initialPresenceState(user: PresenceUser): PresenceState {
  return { user, cursor: null };
}

/** Peers = every awareness state except ours, minus users who left without cleanup. */
export function selectPeers(
  states: Map<number, PresenceState>,
  selfId: number,
): { clientId: number; user: PresenceUser; cursor: PresenceCursor | null }[] {
  const peers: { clientId: number; user: PresenceUser; cursor: PresenceCursor | null }[] = [];

  states.forEach((state, clientId) => {
    if (clientId === selfId || !state?.user) return;
    peers.push({ clientId, user: state.user, cursor: state.cursor ?? null });
  });

  return peers;
}

/**
 * Writes our caret into awareness, but only when it actually moved.
 * `setLocalStateField` always emits a change event and rebroadcasts to every
 * peer, so an unconditional write turns each editor transaction into presence
 * traffic — and on a single-client page into a render loop.
 */
export function setLocalCursor(
  awareness: Awareness,
  positions: { anchor: MappablePosition; head: MappablePosition } | null,
) {
  const next = positions
    ? { anchor: positions.anchor.toJSON(), head: positions.head.toJSON() }
    : null;
  const current = (awareness.getLocalState() as PresenceState | undefined)?.cursor ?? null;
  if (JSON.stringify(current ?? null) === JSON.stringify(next ?? null)) return;
  awareness.setLocalStateField('cursor', next);
}
