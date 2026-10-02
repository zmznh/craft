#!/usr/bin/env bash
# Package Crafty for the 1 GB Debian target.
#
# Run this on a machine with plenty of RAM — NOT on the target box. `next build`
# on this project peaks at 2-4 GB and will OOM a 964 MiB VM.
#
#   npm ci
#   npm run contract:emit     # generates src/prisma/contract.json
#   npm run build             # emits .next/standalone
#   ./deploy/package.sh
#
# Produces crafty-deploy-<utc-stamp>.tar.gz in the repo root.

set -euo pipefail

cd "$(dirname "$0")/.."

for f in .next/standalone/server.js src/prisma/contract.json src/collab/server.mjs; do
  if [ ! -e "$f" ]; then
    echo "error: missing $f — run 'npm run contract:emit' and 'npm run build' first" >&2
    exit 1
  fi
done

STAMP=$(date -u +%Y%m%d-%H%M%S)
OUT="$(pwd)/crafty-deploy-${STAMP}.tar.gz"
STAGE=$(mktemp -d)
trap 'rm -rf "$STAGE"' EXIT

echo "==> staging Next.js standalone"
mkdir -p "$STAGE/web"
cp -a .next/standalone/. "$STAGE/web/"
cp -a public "$STAGE/web/public"
mkdir -p "$STAGE/web/.next"
cp -a .next/static "$STAGE/web/.next/static"

echo "==> staging collab + tldraw servers"
mkdir -p "$STAGE/collab"
cp -a src/collab/*.mjs "$STAGE/collab/"
rm -f "$STAGE/collab"/*.test.mjs
cp deploy/collab-package.json "$STAGE/collab/package.json"

echo "==> staging prisma contract"
# Both src/prisma/db.ts and src/collab/persist.mjs resolve the contract as
# path.resolve(process.cwd(), 'src/prisma/contract.json'), so it must sit at the
# deployment root, not inside web/.
mkdir -p "$STAGE/src/prisma"
cp -a src/prisma/contract.json "$STAGE/src/prisma/contract.json"

echo "==> staging deploy assets"
mkdir -p "$STAGE/deploy"
cp -a deploy/systemd deploy/postgres deploy/backup "$STAGE/deploy/"
cp -a deploy/Caddyfile deploy/env.template deploy/README.md "$STAGE/deploy/"
chmod +x "$STAGE"/deploy/backup/*.sh

echo "==> packing"
tar -czf "$OUT" -C "$STAGE" web collab src deploy

echo "==> wrote $OUT"
echo "    scp $OUT root@<host>:/opt/"
