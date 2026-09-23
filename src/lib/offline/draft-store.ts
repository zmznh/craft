// IndexedDB-backed draft store for offline editing.
// Only document drafts live here; nothing sensitive beyond editor content.

const DB_NAME = 'crafty-offline';
const STORE = 'drafts';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'documentId' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export interface DraftPayload {
  documentId: string;
  content: unknown;
  plainText: string;
  wordCount: number;
  contentStr: string;
  savedAt: number;
}

export async function saveDraft(payload: DraftPayload): Promise<void> {
  if (typeof indexedDB === 'undefined') return;
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(payload);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export async function getDraft(documentId: string): Promise<DraftPayload | null> {
  if (typeof indexedDB === 'undefined') return null;
  const db = await openDb();
  const value = await new Promise<DraftPayload | undefined>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const request = tx.objectStore(STORE).get(documentId);
    request.onsuccess = () => resolve(request.result as DraftPayload | undefined);
    request.onerror = () => reject(request.error);
  });
  db.close();
  return value ?? null;
}

export async function deleteDraft(documentId: string): Promise<void> {
  if (typeof indexedDB === 'undefined') return;
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).delete(documentId);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}
