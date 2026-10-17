#!/bin/sh
set -eu

# Configuration with production defaults
CONTAINER="${CONTAINER_NAME:-qwerty-francais-study-api-1}"
DB_PATH="${STUDY_DB_PATH:-/data/study-plan.sqlite}"
BACKUP_DIR="${BACKUP_DIR:-${HOME:-/home/ubuntu}/backups/daily}"

# Expand leading tilde in BACKUP_DIR if needed
case "$BACKUP_DIR" in
  \~/*) BACKUP_DIR="${HOME:-/home/ubuntu}/${BACKUP_DIR#\~/}" ;;
  \~)   BACKUP_DIR="${HOME:-/home/ubuntu}" ;;
esac

mkdir -p "$BACKUP_DIR"
chmod 700 "$BACKUP_DIR" 2>/dev/null || true
LOG_FILE="${BACKUP_DIR}/backup.log"

# Resolve API image for the throwaway verification container
if [ -z "${API_IMAGE:-}" ]; then
  API_IMAGE=$(docker inspect --format '{{.Config.Image}}' "$CONTAINER" 2>/dev/null || true)
  if [ -z "$API_IMAGE" ]; then
    API_IMAGE=$(docker inspect --format '{{.Image}}' "$CONTAINER" 2>/dev/null || true)
  fi
fi

if [ -z "$API_IMAGE" ]; then
  echo "Error: unable to determine Docker image for container '$CONTAINER'" >&2
  exit 1
fi

TIMESTAMP=$(date +"%Y%m%d-%H%M")
BACKUP_BASENAME="study-${TIMESTAMP}.sqlite"
TARGET_SQLITE="${BACKUP_DIR}/${BACKUP_BASENAME}"
TARGET_GZ="${TARGET_SQLITE}.gz"
CONTAINER_TMP="/tmp/study-backup-$$-${TIMESTAMP}.sqlite"

STATUS="FAILED"
ERROR_MSG="unknown failure"
VERIFY_COUNTS=""
BACKUP_SIZE="0"

cleanup() {
  trap_exit=$?
  trap - EXIT
  # Clean up temp file in container if still present
  if [ -n "${CONTAINER_TMP:-}" ]; then
    docker exec "$CONTAINER" rm -f "$CONTAINER_TMP" 2>/dev/null || true
  fi
  # Clean up partial target on host if failed
  if [ "$STATUS" != "SUCCESS" ] && [ -f "$TARGET_SQLITE" ]; then
    rm -f "$TARGET_SQLITE" 2>/dev/null || true
  fi
  # Log one line per run to backup.log
  if [ "$STATUS" = "SUCCESS" ]; then
    printf '%s [OK] file=%s size=%s %s\n' \
      "$(date -u +"%Y-%m-%dT%H:%M:%SZ")" \
      "${BACKUP_BASENAME}.gz" \
      "$BACKUP_SIZE" \
      "$VERIFY_COUNTS" >> "$LOG_FILE"
  else
    printf '%s [ERROR] backup failed (exit=%d): %s\n' \
      "$(date -u +"%Y-%m-%dT%H:%M:%SZ")" \
      "$trap_exit" \
      "$ERROR_MSG" >> "$LOG_FILE"
  fi
  exit "$trap_exit"
}
trap cleanup EXIT

# Guard against overwriting an existing backup
if [ -e "$TARGET_SQLITE" ] || [ -e "$TARGET_GZ" ]; then
  ERROR_MSG="destination file already exists: $BACKUP_BASENAME"
  echo "Error: $ERROR_MSG" >&2
  exit 1
fi

# 1. VACUUM INTO a temp file inside the container (node -e with node:sqlite),
#    docker cp it to ~/backups/daily/study-YYYYmmdd-HHMM.sqlite,
#    delete the temp file in the container.
ERROR_MSG="VACUUM INTO failed inside container"
docker exec "$CONTAINER" node -e '
const { DatabaseSync } = require("node:sqlite");
const dbPath = process.argv[1];
const tmpPath = process.argv[2];
const db = new DatabaseSync(dbPath, { readOnly: true });
try {
  const escaped = tmpPath.split("\x27").join("\x27\x27");
  db.exec(`VACUUM INTO \x27${escaped}\x27`);
} finally {
  db.close();
}
' "$DB_PATH" "$CONTAINER_TMP"

ERROR_MSG="docker cp from container failed"
docker cp "$CONTAINER:$CONTAINER_TMP" "$TARGET_SQLITE"

ERROR_MSG="failed to remove temp file inside container"
docker exec "$CONTAINER" rm -f "$CONTAINER_TMP"
CONTAINER_TMP=""

# Ensure the copied SQLite file is readable for verification
chmod 644 "$TARGET_SQLITE" 2>/dev/null || true

# 2. Verify the copy: run PRAGMA integrity_check (must be "ok") and count rows of
#    learners/accounts by opening the copied file in a throwaway container from the
#    same image (docker run --rm -v ~/backups/daily:/b:ro <api image> node -e ...),
#    print counts.
ERROR_MSG="integrity_check or row count verification failed"
VERIFY_COUNTS=$(docker run --rm -v "$BACKUP_DIR:/b:ro" "$API_IMAGE" node -e '
const { DatabaseSync } = require("node:sqlite");
const dbFile = "/b/" + process.argv[1];
const db = new DatabaseSync(dbFile, { readOnly: true });
try {
  const check = db.prepare("PRAGMA integrity_check").all();
  if (check.length !== 1 || check[0].integrity_check !== "ok") {
    console.error("Integrity check failed: " + JSON.stringify(check));
    process.exit(1);
  }
  const learners = db.prepare("SELECT count(*) AS c FROM learners").get().c;
  const accounts = db.prepare("SELECT count(*) AS c FROM accounts").get().c;
  console.log(`learners=${learners} accounts=${accounts}`);
} finally {
  db.close();
}
' "$BACKUP_BASENAME")

echo "$VERIFY_COUNTS"

# 3. gzip it; keep the newest 14 daily files (delete older ones in ~/backups/daily only — never touch other files in ~/backups).
chmod 600 "$TARGET_SQLITE" 2>/dev/null || true

ERROR_MSG="gzip compression failed"
gzip -f "$TARGET_SQLITE"

BACKUP_SIZE=$(wc -c < "$TARGET_GZ" | tr -d ' ')

ERROR_MSG="retention prune failed"
# Retention: keep newest 14 daily files; delete older ones in BACKUP_DIR only
for file in $((ls -1t "$BACKUP_DIR"/study-*.sqlite.gz 2>/dev/null || true) | tail -n +15); do
  [ -f "$file" ] || continue
  case "$file" in
    "$BACKUP_DIR"/study-*.sqlite.gz)
      rm -f "$file"
      ;;
  esac
done

STATUS="SUCCESS"
echo "Backup completed successfully: ${BACKUP_BASENAME}.gz (${BACKUP_SIZE} bytes, ${VERIFY_COUNTS})"
