// Crafty whiteboard sync service (dev/local) — official tldraw sync protocol.
// Rooms live in memory and are authoritative while connected; a throttled
// checkpoint writes the snapshot back to Next.js, which owns the database.
//
// License note: the tldraw SDK requires the "Made with tldraw" watermark and a
// purchased License Key for production use. See
// docs/superpowers/notes/tldraw-license-gate.md — do not deploy this publicly
// without one, and never strip the watermark or licence checks.
import http from 'node:http';
import { WebSocketServer } from 'ws';
import {
  DEFAULT_INITIAL_SNAPSHOT,
  InMemorySyncStorage,
  TLSocketRoom,
  TLSyncErrorCloseEventReason,
} from '@tldraw/sync-core';
import 'dotenv/config';
import { requireSecret } from './secrets.mjs';
import { verifyClaims } from './tldraw-auth.mjs';

const PORT = Number(process.env.TLDRAW_SYNC_PORT || 3002);
const APP_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';
const CHECKPOINT_DELAY_MS = 1000;
const CHECKPOINT_MAX_WAIT_MS = 5000;

// Fail fast: a silently missing secret would accept forged connection tokens.
const CLAIM_SECRET = requireSecret(['COLLAB_SECRET', 'AUTH_SECRET', 'NEXTAUTH_SECRET']);
const INTERNAL_SECRET = requireSecret(['TLDRAW_INTERNAL_SECRET']);

const rooms = new Map();

async function nextFetch(path, init = {}) {
  const response = await fetch(`${APP_URL}${path}`, {
    ...init,
    headers: { 'x-crafty-internal': INTERNAL_SECRET, 'content-type': 'application/json', ...init.headers },
  });
  if (!response.ok) throw new Error(`${path} → ${response.status}`);
  return response;
}

async function loadSnapshot(boardId) {
  try {
    const res = await nextFetch(`/api/internal/whiteboards/${boardId}/snapshot`);
    const body = await res.json();
    return body.snapshot ?? null;
  } catch (error) {
    console.error('[tldraw-sync] snapshot load failed', boardId, error.message);
    return null;
  }
}

async function saveSnapshot(boardId, snapshot) {
  await nextFetch(`/api/internal/whiteboards/${boardId}/snapshot`, {
    method: 'PUT',
    body: JSON.stringify({ snapshot }),
  });
}

async function loadCollabState(boardId) {
  const res = await nextFetch(`/api/internal/whiteboards/${boardId}/collab-state`);
  return await res.json();
}

/**
 * Rooms are created lazily and seeded from the database before the first client
 * syncs. `pending` guards against two simultaneous first connections.
 */
const pending = new Map();

/**
 * A room is published to `rooms` only once it is fully seeded: a client that
 * connects to a half-loaded room would receive push results for state it has
 * never seen, which makes tldraw's client queue desync and reconnect forever.
 */
function getOrCreateRoom(boardId) {
  if (rooms.has(boardId)) return Promise.resolve(rooms.get(boardId));
  if (pending.has(boardId)) return pending.get(boardId);

  const create = async () => {
    const state = { boardId, dirty: false, timer: null, since: 0, storage: null, room: null };

    const checkpoint = async () => {
      if (!state.dirty) return;
      state.dirty = false;
      try {
        await saveSnapshot(boardId, state.storage.getSnapshot());
      } catch (error) {
        state.dirty = true;
        console.error('[tldraw-sync] checkpoint failed', boardId, error.message);
      }
    };

    const markDirty = () => {
      state.dirty = true;
      const now = Date.now();
      if (!state.since) state.since = now;
      if (state.timer) return;
      const waited = now - state.since;
      const delay = waited >= CHECKPOINT_MAX_WAIT_MS ? 0 : CHECKPOINT_DELAY_MS;
      state.timer = setTimeout(() => {
        state.timer = null;
        state.since = 0;
        void checkpoint();
      }, delay);
    };

    state.checkpoint = checkpoint;
    state.storage = new InMemorySyncStorage({ snapshot: DEFAULT_INITIAL_SNAPSHOT, onChange: markDirty });
    state.room = new TLSocketRoom({
      storage: state.storage,
      clientTimeout: 30_000,
      // Sessions linger briefly after their socket closes (network hiccup
      // grace), so this is the only reliable "room is empty" signal.
      onSessionRemoved: (_room, { numSessionsRemaining }) => {
        if (numSessionsRemaining === 0) void flushAndDrop(boardId);
      },
    });

    // loadSnapshot accepts both the current RoomSnapshot and the legacy
    // TLStoreSnapshot written by the pre-sync `editor.getSnapshot()` path.
    const stored = await loadSnapshot(boardId);
    if (stored) state.room.loadSnapshot(stored);

    rooms.set(boardId, state);
    return state;
  };

  const promise = create().finally(() => pending.delete(boardId));
  pending.set(boardId, promise);
  return promise;
}

async function flushAndDrop(boardId) {
  const state = rooms.get(boardId);
  if (!state) return;
  if (state.timer) clearTimeout(state.timer);
  state.timer = null;
  if (state.dirty) {
    try {
      await saveSnapshot(boardId, state.storage.getSnapshot());
    } catch (error) {
      console.error('[tldraw-sync] final checkpoint failed', boardId, error.message);
    }
  }
  // A reconnect may have landed while the checkpoint was in flight; only evict a
  // room that is still empty and still the published one.
  if (rooms.get(boardId) === state && state.room.getNumActiveSessions() === 0) {
    rooms.delete(boardId);
    if (process.env.TLDRAW_SYNC_DEBUG) console.log('[tldraw-sync] dropped room', boardId.slice(0, 8));
  }
}

function readJson(request) {
  return new Promise((resolve) => {
    let body = '';
    request.on('data', (chunk) => {
      body += chunk;
      if (body.length > 1e6) request.destroy();
    });
    request.on('end', () => {
      try {
        resolve(JSON.parse(body || '{}'));
      } catch {
        resolve({});
      }
    });
  });
}

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url, `http://localhost:${PORT}`);

  if (request.method === 'GET' && url.pathname === '/health') {
    response.writeHead(200, { 'content-type': 'application/json' });
    response.end(JSON.stringify({ ok: true, rooms: rooms.size }));
    return;
  }

  if (request.method === 'POST' && url.pathname === '/internal/revoke') {
    if (request.headers['x-crafty-internal'] !== INTERNAL_SECRET) {
      response.writeHead(401).end();
      return;
    }
    const { boardId } = await readJson(request);
    const state = rooms.get(boardId);
    let closed = 0;
    if (state) {
      for (const session of state.room.getSessions()) {
        if (session.meta?.role === 'owner') continue;
        state.room.closeSession(session.sessionId, TLSyncErrorCloseEventReason.NOT_AUTHENTICATED);
        closed += 1;
      }
    }
    console.log('[tldraw-sync] revoke', boardId.slice(0, 8), 'closed=', closed);
    response.writeHead(200, { 'content-type': 'application/json' });
    response.end(JSON.stringify({ ok: true, closed }));
    return;
  }

  response.writeHead(404).end();
});

const wss = new WebSocketServer({ noServer: true });

server.on('upgrade', async (request, socket, head) => {
  const url = new URL(request.url, `http://localhost:${PORT}`);
  const match = /^\/sync\/([0-9a-f-]+)$/i.exec(url.pathname);
  if (!match) {
    socket.write('HTTP/1.1 404 Not Found\r\n\r\n');
    socket.destroy();
    return;
  }

  const boardId = match[1];
  const claims = verifyClaims(url.searchParams.get('token') ?? '', boardId, CLAIM_SECRET);
  if (!claims) {
    socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
    socket.destroy();
    return;
  }

  let state;
  let isReadonly;
  try {
    // Re-check live state: a revoked link must not connect on an old claim.
    const live = await loadCollabState(boardId);
    if (!live.exists || live.isDeleted) {
      socket.write('HTTP/1.1 410 Gone\r\n\r\n');
      socket.destroy();
      return;
    }
    if (claims.role !== 'owner' && (live.permission === 'off' || live.shareVersion !== claims.shareVersion)) {
      socket.write('HTTP/1.1 403 Forbidden\r\n\r\n');
      socket.destroy();
      return;
    }

    // All awaits must finish before the handshake completes: the client starts
    // sending its `connect` message immediately after, and we would drop it.
    state = await getOrCreateRoom(boardId);
    isReadonly = claims.role === 'viewer';
  } catch (error) {
    console.error('[tldraw-sync] pre-handshake failed', error.message);
    socket.write('HTTP/1.1 502 Bad Gateway\r\n\r\n');
    socket.destroy();
    return;
  }

  wss.handleUpgrade(request, socket, head, (client) => {
    // The `sessionId` in the URL is stable across reloads (tldraw keeps it in
    // storage), and dev StrictMode opens two sockets at once. Keying the room by
    // it would let the first socket's close drop the live session, which makes
    // the client reconnect forever. One id per connection instead.
    const sessionId = crypto.randomUUID();

    state.room.handleSocketConnect({
      sessionId,
      socket: client,
      isReadonly,
      meta: { role: claims.role, subject: claims.subject, shareVersion: claims.shareVersion },
    });
    // handleSocketConnect attaches its own message/close/error listeners, so we
    // must not forward them again — a second delivery makes the room answer every
    // push twice, which puts the client's push queue out of sync for good.
  });
});

server.listen(PORT, () => {
  console.log(`[tldraw-sync] listening on ws://localhost:${PORT}/sync/<boardId>`);
});

async function shutdown(signal) {
  console.log(`[tldraw-sync] ${signal} — checkpointing ${rooms.size} room(s)`);
  await Promise.all([...rooms.keys()].map((boardId) => flushAndDrop(boardId)));
  server.close();
  process.exit(0);
}

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));
