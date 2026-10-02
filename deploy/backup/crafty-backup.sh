#!/usr/bin/env bash
# Crafty off-site backup: pg_dump -> verify -> encrypt -> CloudBase storage.
#
# Run by crafty-backup.timer (systemd). Can also be run by hand:
#   /opt/crafty/deploy/backup/crafty-backup.sh
#
# Design notes:
#   * The dump is ALWAYS encrypted locally before it leaves the box. CloudBase
#     storage is not a trusted vault — a database dump contains every note you
#     have ever written, in plain text.
#   * Timestamps are UTC so rotation math never trips over DST.
#   * pg_dump runs inside a single transaction snapshot, so the collab server
#     writing Yjs rooms during the dump does NOT produce a torn backup.

set -euo pipefail

CONFIG="${CRAFTY_BACKUP_CONFIG:-/etc/crafty/backup.env}"
if [ ! -r "$CONFIG" ]; then
  echo "error: cannot read $CONFIG" >&2
  exit 6
fi
set -a
# shellcheck disable=SC1090
. "$CONFIG"
set +a

require() {
  eval "val=\"\${$1:-}\""
  if [ -z "$val" ]; then
    echo "error: $1 is not set in $CONFIG" >&2
    exit 3
  fi
}
require TCB_ENV_ID
require BACKUP_PASSPHRASE
require PGUSER
require PGDATABASE

TCB_BIN="${TCB_BIN:-/opt/tcb/node_modules/.bin/tcb}"
WORK="${BACKUP_DIR:-/var/backups/crafty}"
CLOUD_PREFIX="${CLOUD_PREFIX:-crafty-backups}"
LOCAL_KEEP_DAYS="${LOCAL_KEEP_DAYS:-7}"
PGHOST="${PGHOST:-127.0.0.1}"
PGPORT="${PGPORT:-5432}"
export PGHOST PGPORT

if [ ! -x "$(command -v pg_dump)" ]; then
  echo "error: pg_dump not found — install postgresql-client" >&2
  exit 6
fi
if [ ! -x "$TCB_BIN" ]; then
  echo "error: tcb CLI not found at $TCB_BIN — see README step 11" >&2
  exit 6
fi

STAMP=$(date -u +%Y%m%dT%H%M%SZ)
BASE="crafty-${STAMP}.dump"
mkdir -p "$WORK"

# Free-space guard: a dump that fills the 9 GB disk takes the database down
# with it. Require room for the dump plus a margin.
AVAIL_KB=$(df -Pk "$WORK" | awk 'NR==2 {print $4}')
if [ "$AVAIL_KB" -lt 512000 ]; then
  echo "error: only ${AVAIL_KB} KiB free in $WORK — refusing to dump" >&2
  exit 5
fi

echo "==> dumping ${PGDATABASE}@${PGHOST}:${PGPORT}"
DUMP="$WORK/$BASE"
# --no-owner/--no-acl keep the dump restorable into a freshly created database
# without recreating roles. Single-user self-hosting does not need them.
if ! pg_dump -Fc -Z9 --no-owner --no-acl -f "$DUMP" "$PGDATABASE"; then
  echo "error: pg_dump failed" >&2
  rm -f "$DUMP"
  exit 5
fi

# A dump we cannot read back is worthless. Fail loudly here rather than after
# uploading.
echo "==> verifying dump is readable"
pg_restore -l "$DUMP" >/dev/null

sha256sum "$DUMP" | awk '{print $1}' >"$DUMP.sha256"
SUM=$(cat "$DUMP.sha256")
SIZE=$(stat -c%s "$DUMP")
echo "==> dump: ${SIZE} bytes sha256=${SUM:0:16}..."

echo "==> encrypting (aes-256-cbc, pbkdf2)"
ENC="$DUMP.enc"
openssl enc -aes-256-cbc -pbkdf2 -salt -in "$DUMP" -out "$ENC" -pass env:BACKUP_PASSPHRASE
rm -f "$DUMP"

echo "==> uploading to cloudbase://${CLOUD_PREFIX}/"
# cloudPath must NOT start with '/' — the CLI rejects it.
"$TCB_BIN" storage upload "$ENC" "${CLOUD_PREFIX}/${BASE}.enc" \
  -e "$TCB_ENV_ID" --times 3 --interval 2000
"$TCB_BIN" storage upload "$DUMP.sha256" "${CLOUD_PREFIX}/${BASE}.enc.sha256" \
  -e "$TCB_ENV_ID" --times 3 --interval 2000

# Best-effort size check against the remote object. Parse failures only warn —
# never fail a successful upload over a formatting change in CLI output.
DETAIL=$("$TCB_BIN" storage detail "${CLOUD_PREFIX}/${BASE}.enc" -e "$TCB_ENV_ID" --json 2>/dev/null || true)
REMOTE_SIZE=$(printf '%s' "$DETAIL" | sed -n 's/.*"size"[[:space:]]*:[[:space:]]*\([0-9]\+\).*/\1/p' | head -1)
LOCAL_ENC_SIZE=$(stat -c%s "$ENC")
if [ -n "$REMOTE_SIZE" ] && [ "$REMOTE_SIZE" != "$LOCAL_ENC_SIZE" ]; then
  echo "warn: remote size $REMOTE_SIZE != local $LOCAL_ENC_SIZE" >&2
elif [ -z "$REMOTE_SIZE" ]; then
  echo "warn: could not confirm remote size — verify manually" >&2
fi

echo "==> rotating local copies older than ${LOCAL_KEEP_DAYS}d"
find "$WORK" -type f \( -name 'crafty-*.dump.enc' -o -name 'crafty-*.dump.sha256' \) \
  -mtime "+${LOCAL_KEEP_DAYS}" -delete

echo "==> backup complete: ${BASE}.enc"
