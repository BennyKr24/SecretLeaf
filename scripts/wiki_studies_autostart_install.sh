#!/usr/bin/env bash
set -euo pipefail

ROOT="${1:-/workspaces/SecretLeaf}"
CRON_EXPR="${CRON_EXPR:-30 3 * * *}"

if [[ ! -d "$ROOT" ]]; then
  echo "Workspace not found: $ROOT" >&2
  exit 1
fi

TMP_CRON="$(mktemp)"
trap 'rm -f "$TMP_CRON"' EXIT

(crontab -l 2>/dev/null || true) | grep -v "wiki:studies:sync" > "$TMP_CRON"
echo "$CRON_EXPR cd $ROOT && npm run wiki:studies:sync >> $ROOT/status-data.json.wiki-sync.log 2>&1" >> "$TMP_CRON"
crontab "$TMP_CRON"

echo "Installed cron job: $CRON_EXPR (npm run wiki:studies:sync)"
