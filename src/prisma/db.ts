/* eslint-disable @typescript-eslint/no-explicit-any */

let _dbPromise: Promise<any> | null = null;

function initDb() {
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- require keeps runtime imports lazy so Turbopack's Edge static check (via middleware/auth chain) never sees fs/path
  const fs = require('fs');
  // eslint-disable-next-line @typescript-eslint/no-require-imports -- see above
  const path = require('path');
  // globalThis indirection keeps Turbopack's Edge-runtime static check happy:
  // middleware pulls this file in via the auth chain but never calls getDb()
  const proc = (globalThis as { process?: NodeJS.Process }).process;
  return import('@prisma/orm-postgres/runtime').then((mod: any) => {
    const postgres = mod.default;
    const contractPath = path.join(proc!.cwd(), 'src/prisma/contract.json');
    const contractJson = JSON.parse(fs.readFileSync(contractPath, 'utf-8'));
    return postgres({ contractJson, url: proc!.env['DATABASE_URL']! });
  });
}

export function getDb() {
  if (!_dbPromise) {
    _dbPromise = initDb();
  }
  return _dbPromise;
}
