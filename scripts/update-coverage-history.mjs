#!/usr/bin/env node

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const dataModulePath = path.join(ROOT, 'apps', 'web', 'src', 'data', 'terpira', 'fertilizers.ts');
const historyPath = path.join(ROOT, 'apps', 'web', 'src', 'data', 'fertilizerCoverageHistory.json');

function dateKey(iso) {
  return new Date(iso).toISOString().slice(0, 10);
}

async function main() {
  const dataModule = await import(pathToFileURL(dataModulePath).href);
  const stats = dataModule.fertilizerCoverageStats;

  if (!stats) {
    throw new Error('fertilizerCoverageStats konnte nicht geladen werden.');
  }

  const now = new Date().toISOString();
  const today = dateKey(now);

  let payload = { snapshots: [] };
  if (existsSync(historyPath)) {
    try {
      payload = JSON.parse(readFileSync(historyPath, 'utf8'));
    } catch {
      payload = { snapshots: [] };
    }
  }

  const snapshots = Array.isArray(payload.snapshots) ? payload.snapshots : [];
  const nextEntry = {
    date: now,
    coverage: stats.coveragePercent,
    coveredProducts: stats.coveredProducts,
    marketEstimate: stats.trackedMarketEstimate,
    note: 'Automatischer Tages-Snapshot'
  };

  const existingIdx = snapshots.findIndex((s) => dateKey(s.date) === today);
  if (existingIdx >= 0) {
    snapshots[existingIdx] = { ...snapshots[existingIdx], ...nextEntry };
  } else {
    snapshots.push(nextEntry);
  }

  snapshots.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const trimmed = snapshots.slice(-120);

  writeFileSync(historyPath, JSON.stringify({ snapshots: trimmed }, null, 2) + '\n', 'utf8');
  console.log(`coverage history updated: ${trimmed.length} snapshots`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
