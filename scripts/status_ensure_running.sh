#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

RUNTIME_DIR="$ROOT_DIR/.runtime"
PID_FILE="$RUNTIME_DIR/status-watch.pid"
LOG_FILE="$RUNTIME_DIR/status-watch.log"

mkdir -p "$RUNTIME_DIR"

is_valid_pid() {
  local pid="$1"
  [[ -n "$pid" ]] || return 1
  [[ "$pid" =~ ^[0-9]+$ ]] || return 1
  kill -0 "$pid" >/dev/null 2>&1 || return 1

  local cmdline
  cmdline="$(ps -p "$pid" -o args= 2>/dev/null || true)"
  [[ "$cmdline" == *"status_probe.mjs"* ]] || return 1
  [[ "$cmdline" == *"--watch"* ]] || return 1

  return 0
}

if [[ -f "$PID_FILE" ]]; then
  existing_pid="$(cat "$PID_FILE" 2>/dev/null || true)"
  if is_valid_pid "$existing_pid"; then
    echo "status-watch already running (pid $existing_pid)"
    exit 0
  fi
fi

found_pid="$(pgrep -f "node scripts/status_probe.mjs --watch" | head -n 1 || true)"
if is_valid_pid "$found_pid"; then
  echo "$found_pid" > "$PID_FILE"
  echo "status-watch already running (pid $found_pid)"
  exit 0
fi

cd "$ROOT_DIR"
nohup node scripts/status_probe.mjs \
  --watch \
  --interval=30000 \
  --api=http://localhost:4000 \
  --web=http://localhost:3000 \
  --output=status-data.json \
  --silent \
  >> "$LOG_FILE" 2>&1 &

new_pid="$!"
echo "$new_pid" > "$PID_FILE"

echo "status-watch started (pid $new_pid)"
