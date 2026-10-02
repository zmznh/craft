// Server-side Yjs room persistence for the collaboration server.
// Runs in plain Node (outside Next.js), so it talks to the same Prisma contract
// through the postgres runtime rather than importing the TS client.
//
// SOURCE OF TRUTH: for any document opened in collaborative mode the Yjs room is
// authoritative. `Document.content` is a read-only mirror derived here, on the
// server, from the room state — search, export, sharing and block mirrors read
// it, but nothing may write it from a client while collab is on. Two writers is
// what used to lose content: every open tab debounced a full overwrite of the
// same row, so the last (often the stalest) tab won.
import fs from 'node:fs';
import path from 'node:path';
import 'dotenv/config';
import * as Y from 'yjs';
import { yDocToProsemirrorJSON } from '@tiptap/y-tiptap';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Must match `Collaboration.configure({ field })` in the editor.
const YJS_FIELD = 'default';

// Matches the throttle the client used to apply when it wrote content itself.
const VERSION_INTERVAL_MS = 10 * 60 * 1000;

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

function nodeText(node) {
  if (!node) return '';
  if (node.type === 'text') return node.text ?? '';
  if (Array.isArray(node.content)) return node.content.map(nodeText).join('');
  // Atom nodes keep their label in an attribute, so a mention or a whiteboard
  // link stays findable by the text it shows on screen.
  return node.attrs?.title ?? node.attrs?.name ?? '';
}

/**
 * Render the room state back into the ProseMirror mirror stored on `Document`.
 *
 * Returns null when the room has no body yet, which is the important guard: a
 * freshly created room must not blank out the content of a document that has
 * not been migrated into Yjs yet, and a room whose clients all left without
 * typing must not wipe the last known good mirror.
 */
export function deriveSnapshot(state) {
  let ydoc;
  try {
    ydoc = new Y.Doc();
    Y.applyUpdate(ydoc, state instanceof Uint8Array ? state : new Uint8Array(state));
  } catch {
    return null;
  }

  if (ydoc.getXmlFragment(YJS_FIELD).length === 0) return null;

  let content;
  try {
    content = yDocToProsemirrorJSON(ydoc, YJS_FIELD);
  } catch {
    return null;
  }
  if (!content || content.type !== 'doc') return null;

  const blocks = Array.isArray(content.content) ? content.content : [];
  const lines = blocks
    .map((node) => nodeText(node).replace(/\s+/g, ' ').trim())
    .filter(Boolean);
  const joined = blocks.map(nodeText).join('');

  return {
    content,
    plainText: lines.join('\n'),
    // Approximate by design: the mirror never drives billing or quotas, and the
    // editor's own character count is not reproducible without a live schema.
    wordCount: joined.length,
  };
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
  } else {
    await db.orm.public.YjsDocumentState.create({
      id: crypto.randomUUID(),
      documentId: documentName,
      state: bytes,
      bytes: bytes.length,
    });
  }

  await mirrorDocumentContent(db, documentName, document, state);
}

/**
 * Mirror the authoritative room state into the row that search, export, sharing
 * and block mirrors read. Called after the room state is stored so a failure
 * here can never cost us the authoritative copy.
 *
 * Also keeps the version history alive: it used to be written by the client as a
 * side effect of saving content, and clients no longer save content.
 */
async function mirrorDocumentContent(db, documentName, document, state) {
  try {
    const snapshot = deriveSnapshot(state);
    if (!snapshot) return;

    await db.orm.public.Document.where({ id: documentName }).update({
      content: snapshot.content,
      plainText: snapshot.plainText,
      wordCount: snapshot.wordCount,
    });

    await appendVersion(db, documentName, document, snapshot);
  } catch (error) {
    console.error('[collab] mirror failed', documentName, error?.message);
  }
}

async function appendVersion(db, documentName, document, snapshot) {
  const versions = await db.orm.public.DocumentVersion
    .where({ documentId: documentName })
    .orderBy((v) => v.version.desc())
    .limit(1)
    .all();
  const last = versions[0];

  if (last) {
    const createdAt = new Date(last.createdAt).getTime();
    if (!Number.isNaN(createdAt) && Date.now() - createdAt < VERSION_INTERVAL_MS) return;
  }

  await db.orm.public.DocumentVersion.create({
    id: crypto.randomUUID(),
    documentId: documentName,
    version: last ? Number(last.version) + 1 : 1,
    title: document?.title ?? '无标题',
    content: snapshot.content,
    plainText: snapshot.plainText,
    wordCount: snapshot.wordCount,
  });
}
