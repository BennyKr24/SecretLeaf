#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

TAG="SECRETLEAF_STATUS_AUTOSTART"
REBOOT_ENTRY="@reboot cd $ROOT_DIR && npm run status:ensure >/dev/null 2>&1 # $TAG"
MINUTE_ENTRY="* * * * * cd $ROOT_DIR && npm run status:ensure >/dev/null 2>&1 # $TAG"

BASHRC_FILE="$HOME/.bashrc"
PROFILE_FILE="$HOME/.profile"
SHELL_BLOCK_START="# >>> $TAG >>>"
SHELL_BLOCK_END="# <<< $TAG <<<"
SHELL_COMMAND="cd $ROOT_DIR && npm run status:ensure >/dev/null 2>&1 || true"

TMP_FILE="$(mktemp)"
trap 'rm -f "$TMP_FILE"' EXIT

install_shell_autostart() {
  for target in "$BASHRC_FILE" "$PROFILE_FILE"; do
    touch "$target"
    awk -v s="$SHELL_BLOCK_START" -v e="$SHELL_BLOCK_END" '
      BEGIN { skip=0 }
      $0==s { skip=1; next }
      $0==e { skip=0; next }
      skip==0 { print }
    ' "$target" > "$TMP_FILE"

    {
      cat "$TMP_FILE"
      echo "$SHELL_BLOCK_START"
      echo "$SHELL_COMMAND"
      echo "$SHELL_BLOCK_END"
    } > "$target"
  done

  echo "status autostart installed via shell startup"
  echo "---"
  echo "$BASHRC_FILE"
  echo "$PROFILE_FILE"
}

if command -v crontab >/dev/null 2>&1; then
  crontab -l 2>/dev/null | grep -v "$TAG" > "$TMP_FILE" || true
  {
    echo "$REBOOT_ENTRY"
    echo "$MINUTE_ENTRY"
  } >> "$TMP_FILE"

  crontab "$TMP_FILE"

  echo "status autostart installed via crontab"
  echo "---"
  crontab -l
else
  install_shell_autostart
fi
