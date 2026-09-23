// Crafty collaboration server (dev/local).
// Rooms are document ids; tokens are HMAC-signed by the Next.js app.
// Swap this process for a hosted Hocuspocus instance by pointing
// NEXT_PUBLIC_COLLAB_URL at it — the protocol is the same.
import { Server } from '@hocuspocus/server';
import { createHmac, timingSafeEqual } from 'node:crypto';
import 'dotenv/config';

const secret = process.env.COLLAB_SECRET || process.env.NEXTAUTH_SECRET || 'dev-secret';

export function verifyToken(token, roomName) {
  try {
    const [payloadB64, sig] = token.split('.');
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString());
    const expected = createHmac('sha256', secret).update(payloadB64).digest();
    const actual = Buffer.from(sig, 'base64url');
    if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return false;
    if (payload.exp < Date.now()) return false;
    if (payload.docId !== roomName) return false;
    if (!payload.userId) return false;
    return true;
  } catch {
    return false;
  }
}

const server = new Server({
  port: Number(process.env.COLLAB_PORT || 3001),
  async onAuthenticate({ token, documentName }) {
    console.log('[onAuth]', documentName, 'token-len:', token ? token.length : token);
    if (!verifyToken(token, documentName)) {
      throw new Error('未授权');
    }
  },
  async onConnect({ context }) {
    void context;
  },
});

server.listen();
