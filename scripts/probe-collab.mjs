/* eslint-disable */
// Probe: two Hocuspocus providers on one room must sync a Y.Doc update.
import * as Y from 'yjs';
import { createHmac } from 'node:crypto';
import { HocuspocusProvider } from '@hocuspocus/provider';
import 'dotenv/config';

const secret = process.env.NEXTAUTH_SECRET || 'dev-secret';
const docId = 'probe-' + Math.random().toString(36).slice(2, 8);

function makeToken(roomName) {
  const payload = Buffer.from(
    JSON.stringify({ docId: roomName, userId: 'u1', exp: Date.now() + 60000 })
  ).toString('base64url');
  const sig = createHmac('sha256', secret).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

const ydocA = new Y.Doc();
const ydocB = new Y.Doc();

const pa = new HocuspocusProvider({ url: 'ws://localhost:3001', name: docId, document: ydocA, token: makeToken(docId) });
const pb = new HocuspocusProvider({ url: 'ws://localhost:3001', name: docId, document: ydocB, token: makeToken(docId) });

let syncedB = 0;
pb.on('synced', () => { syncedB += 1; });

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

await wait(1500);
ydocA.getArray('probe').insert(0, ['hello-collab']);
await wait(1500);

console.log('A:', JSON.stringify(ydocA.getArray('probe').toArray()));
console.log('B:', JSON.stringify(ydocB.getArray('probe').toArray()));
console.log('sync events B:', syncedB, 'server state B connected:', pa.isSynced, pb.isSynced);
pa.destroy(); pb.destroy();
