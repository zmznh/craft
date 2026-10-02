#!/usr/bin/env bash
# Restore a Crafty backup produced by crafty-backup.sh.
#
#   ./crafty-restore.sh crafty-20261001T040000Z.dump.enc        # from cloud
#   ./crafty-restore.sh /var/backups/crafty/crafty-....dump.enc # local file
#   ./crafty-restore.sh --list                                  # list cloud copies
#
# A backup you have never restored is not a backup. Run this once against a
# scratch database before you trust the schedule.

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
PGHOST="${PGHOST:-127.0.0.1}"
PGPORT="${PGPORT:-5432}"
export PGHOST PGPORT

if [ "${1:-}" = "--list" ]; then
  "$TCB_BIN" storage list "${CLOUD_PREFIX}/" -e "$TCB_ENV_ID"
  exit 0
fi

TARGET="${1:-}"
if [ -z "$TARGET" ]; then
  echo "usage: $0 <cloud-object-name | local-path>" >&2
  echo "       $0 --list" >&2
  exit 3
fi

LOCAL=""
case "$TARGET" in
  /*)
    LOCAL="$TARGET"
    [ -r "$LOCAL" ] || { echo "error: cannot read $LOCAL" >&2; exit 6; }
    ;;
  *)
    LOCAL="$WORK/$TARGET"
    if [ ! -r "$LOCAL" ]; then
      echo "==> fetching ${CLOUD_PREFIX}/${TARGET} from cloudbase"
      mkdir -p "$WORK"
      "$TCB_BIN" storage download "${CLOUD_PREFIX}/${TARGET}" "$LOCAL" -e "$TCB_ENV_ID"
    fi
    # Pull the sha256 sidecar too, otherwise integrity checking is a coin flip
    # on whether a local copy happens to survive rotation.
    if [ ! -r "$LOCAL.sha256" ]; then
      "$TCB_BIN" storage download "${CLOUD_PREFIX}/${TARGET}.sha256" "$LOCAL.sha256" \
        -e "$TCB_ENV_ID" || echo "warn: no remote sha256 sidecar" >&2
    fi
    ;;
esac

BASE=$(basename "$LOCAL" .enc)
PLAIN="$WORK/restored-${BASE}"

echo "==> decrypting"
openssl enc -d -aes-256-cbc -pbkdf2 -in "$LOCAL" -out "$PLAIN" -pass env:BACKUP_PASSPHRASE

# Verify the sha256 that was recorded at dump time, if we still have it.
SUMFILE="$LOCAL.sha256"
if [ ! -r "$SUMFILE" ] && [ -r "$WORK/$BASE.sha256" ]; then
  SUMFILE="$WORK/$BASE.sha256"
fi
if [ -r "$SUMFILE" ]; then
  WANT=$(awk '{print $1}' "$SUMFILE")
  GOT=$(sha256sum "$PLAIN" | awk '{print $1}')
  if [ "$WANT" != "$GOT" ]; then
    echo "error: sha256 mismatch — dump is corrupt or the passphrase is wrong" >&2
    echo "  want $WANT" >&2
    echo "  got  $GOT" >&2
    rm -f "$PLAIN"
    exit 5
  fi
  echo "==> sha256 verified"
else
  echo "warn: no .sha256 sidecar found — skipping integrity check" >&2
fi

OBJ_COUNT=$(pg_restore -l "$PLAIN" | grep -c ';' || true)
echo "==> dump is readable: ${OBJ_COUNT} objects"

cat <<'WARN'
!! DESTRUCTIVE
!! This DROPS and recreates every table in the target database.
!! Current contents will be replaced by the backup.
WARN

if [ "${CRAFTY_RESTORE_YES:-}" != "1" ]; then
  printf 'Type the database name (%s) to proceed: ' "$PGDATABASE"
  read -r CONFIRM
  [ "$CONFIRM" = "$PGDATABASE" ] || { echo "aborted"; rm -f "$PLAIN"; exit 1; }
fi

# The collab server keeps Yjs rooms in memory and flushes them on a debounce.
# Restoring underneath it means the next flush overwrites restored rows with
# pre-restore state — so stop the writers first.
echo "==> stopping services"
systemctl stop crafty-web crafty-collab crafty-tldraw || true

echo "==> restoring into ${PGDATABASE}"
if ! pg_restore -d "$PGDATABASE" --clean --if-exists --no-owner --no-acl "$PLAIN"; then
  echo "warn: pg_restore reported errors — inspect output above" >&2
fi

echo "==> starting services"
systemctl start crafty-collab crafty-tldraw crafty-web

rm -f "$PLAIN"
echo "==> restore complete"
