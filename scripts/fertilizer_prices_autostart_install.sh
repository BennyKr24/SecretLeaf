#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

if [[ -z "${SERPAPI_KEY:-}" ]]; then
  echo "SERPAPI_KEY fehlt. Beispiel: SERPAPI_KEY=xxxx bash scripts/fertilizer_prices_autostart_install.sh"
  exit 1
fi

CRON_CMD="cd ${ROOT_DIR} && SERPAPI_KEY=${SERPAPI_KEY} npm run fertilizers:prices:sync >> /tmp/secretleaf-price-sync.log 2>&1"
CRON_LINE="25 */6 * * * ${CRON_CMD}"

( crontab -l 2>/dev/null | grep -v "fertilizers:prices:sync"; echo "${CRON_LINE}" ) | crontab -

echo "Cronjob installiert: alle 6 Stunden Preis-Synchronisierung"
echo "Logdatei: /tmp/secretleaf-price-sync.log"
