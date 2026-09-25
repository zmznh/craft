// @vitest-environment node
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import 'dotenv/config';
import * as Y from 'yjs';
import { isRoomName, loadState, storeState } from './persist.mjs';

const hasDb = Boolean(process.env.DATABASE_URL);

describe.skipIf(!hasDb)('collab room persistence', () => {
  let documentId;

  beforeAll(async () => {
    const fs = await import('node:fs');
    const path = await import('node:path');
    const mod = await import('@prisma/orm-postgres/runtime');
    const contractJson = JSON.parse(
      fs.readFileSync(path.resolve('src/prisma/contract.json'), 'utf8'),
    );
    const db = await mod.default({ contractJson, url: process.env.DATABASE_URL });
    const user = await db.orm.public.User.first({ email: 'craft-test@example.com' });
    const doc = await db.orm.public.Document.create({
      id: crypto.randomUUID(),
      title: 'persistence probe',
      userId: user.id,
    });
    documentId = doc.id;
  });

  afterAll(async () => {
    const fs = await import('node:fs');
    const path = await import('node:path');
    const mod = await import('@prisma/orm-postgres/runtime');
    const contractJson = JSON.parse(
      fs.readFileSync(path.resolve('src/prisma/contract.json'), 'utf8'),
    );
    const db = await mod.default({ contractJson, url: process.env.DATABASE_URL });
    await db.orm.public.Document.where({ id: documentId }).delete();
  });

  it('accepts only uuid room names', () => {
    expect(isRoomName(documentId)).toBe(true);
    expect(isRoomName('../../etc/passwd')).toBe(false);
    expect(isRoomName('anyone-else-s-room')).toBe(false);
  });

  it('round-trips a ydoc update through storage', async () => {
    expect(await loadState(documentId)).toBeNull();

    const ydoc = new Y.Doc();
    ydoc.getText('probe').insert(0, '服务端持久化内容');
    await storeState(documentId, Y.encodeStateAsUpdate(ydoc));

    const restored = await loadState(documentId);
    expect(restored).toBeInstanceOf(Uint8Array);

    const reopened = new Y.Doc();
    Y.applyUpdate(reopened, restored);
    expect(reopened.getText('probe').toString()).toBe('服务端持久化内容');
  });

  it('ignores stores for unknown rooms', async () => {
    const missing = crypto.randomUUID();
    await storeState(missing, new Uint8Array([1, 2, 3]));
    expect(await loadState(missing)).toBeNull();
  });
});
