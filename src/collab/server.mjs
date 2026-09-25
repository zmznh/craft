// Crafty collaboration server (dev/local).
// Rooms are document ids; tokens are HMAC-signed by the Next.js app.
// Swap this process for a hosted Hocuspocus instance by pointing
// NEXT_PUBLIC_COLLAB_URL at it — the protocol is the same.
import { Server } from '@hocuspocus/server';
import { Database } from '@hocuspocus/extension-database';
import { createHmac, timingSafeEqual } from 'node:crypto';
import 'dotenv/config';
import { requireSecret } from './secrets.mjs';
import { loadState, storeState } from './persist.mjs';

const SECRET_CANDIDATES = ['COLLAB_SECRET', 'AUTH_SECRET', 'NEXTAUTH_SECRET'];
const ROLES = ['owner', 'editor', 'commenter', 'viewer'];

export function verifyToken(token, roomName) {
  const secret = requireSecret(SECRET_CANDIDATES);
  try {
    const [payloadB64, sig] = token.split('.');
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString());
    const expected = createHmac('sha256', secret).update(payloadB64).digest();
    const actual = Buffer.from(sig, 'base64url');
    if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return false;
    if (payload.exp < Date.now()) return false;
    if (payload.docId !== roomName) return false;
    if (!payload.userId) return false;
    if (!ROLES.includes(payload.role)) return false;
    return payload;
  } catch {
    return false;
  }
}

const server = new Server({
  port: Number(process.env.COLLAB_PORT || 3001),
  // Checkpoint the room 1s after the last change, and at least every 5s.
  debounce: 1000,
  maxDebounce: 5000,
  async onAuthenticate({ token, documentName, connectionConfig }) {
    const claims = verifyToken(token, documentName);
    if (!claims) throw new Error('未授权');
    // Hocuspocus drops SyncStep2/Update frames natively for read-only connections.
    connectionConfig.readOnly = claims.readOnly === true || claims.role === 'viewer';
    return claims;
  },
  extensions: [
    new Database({
      fetch: async ({ documentName }) => await loadState(documentName),
      store: async ({ documentName, state }) => await storeState(documentName, state),
    }),
  ],
});

server.listen();

let closing = false;
async function shutdown(signal) {
  if (closing) return;
  closing = true;
  console.log(`[collab] ${signal} — flushing rooms to storage`);
  // destroy() flushes pending store calls before the process exits.
  await server.destroy();
  process.exit(0);
}

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));
