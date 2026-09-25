// Server-side Yjs room persistence for the collaboration server.
// Runs in plain Node (outside Next.js), so it talks to the same Prisma contract
// through the postgres runtime rather than importing the TS client.
import fs from 'node:fs';
import path from 'node:path';
import 'dotenv/config';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

let clientPromise = null;

async function getClient() {
  if (!clientPromise) {
    const contractPath = path.resolve(process.cwd(), 'src/prisma/contract.json');
    const contractJson = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
    const mod = await import('@prisma/orm-postgres/runtime');
    clientPromise = mod.default({ contractJson, url: process.env.DATABASE_URL });
  }
  return clientPromise;
}

export function isRoomName(documentName) {
  return UUID.test(documentName);
}

/** Restore a room, or null when nothing has been stored for it yet. */
export async function loadState(documentName) {
  if (!isRoomName(documentName)) return null;

  const db = await getClient();
  const row = await db.orm.public.YjsDocumentState.first({ documentId: documentName });
  if (!row) return null;

  const state = row.state;
  if (state instanceof Uint8Array) return state;
  if (typeof state === 'string') return new Uint8Array(Buffer.from(state, 'base64'));
  return null;
}

/**
 * Store the full room state. Skips rooms whose document no longer exists so a
 * late flush cannot resurrect a deleted document's history.
 */
export async function storeState(documentName, state) {
  if (!isRoomName(documentName)) return;

  const bytes = Buffer.isBuffer(state) ? state : Buffer.from(state);
  const db = await getClient();

  const document = await db.orm.public.Document.first({ id: documentName });
  if (!document || document.isDeleted) return;

  const existing = await db.orm.public.YjsDocumentState.first({ documentId: documentName });
  if (existing) {
    await db.orm.public.YjsDocumentState.where({ id: existing.id }).update({
      state: bytes,
      bytes: bytes.length,
    });
    return;
  }

  await db.orm.public.YjsDocumentState.create({
    id: crypto.randomUUID(),
    documentId: documentName,
    state: bytes,
    bytes: bytes.length,
  });
}
