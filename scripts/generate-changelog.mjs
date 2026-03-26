#!/usr/bin/env node
/**
 * scripts/generate-changelog.mjs
 *
 * Liest git-Log und aktualisiert apps/web/src/data/changelog.json automatisch.
 * - Neue Commits werden als neue Releases am Anfang eingefügt
 * - Commits mit bereits bekanntem Hash werden übersprungen (Deduplizierung)
 * - Manuelle Einträge (hash: "manual") bleiben immer erhalten
 *
 * Verwendung:
 *   node scripts/generate-changelog.mjs
 *   node scripts/generate-changelog.mjs --dry-run   (gibt JSON aus, schreibt nichts)
 */

import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const CHANGELOG_PATH = path.join(ROOT, 'apps', 'web', 'src', 'data', 'changelog.json');

const isDryRun = process.argv.includes('--dry-run');

// ────────────────────────────────────────────────────────────────────────────
// Hilfs-Funktionen
// ────────────────────────────────────────────────────────────────────────────

/** Conventional-Commit-Prefix → Typ */
function detectType(subject) {
  const lower = subject.toLowerCase();
  if (lower.startsWith('feat') || lower.startsWith('feature') || lower.includes(' feat:')) return 'feature';
  if (lower.startsWith('fix') || lower.includes(' fix:')) return 'fix';
  if (lower.startsWith('perf')) return 'performance';
  if (lower.startsWith('refactor')) return 'refactor';
  if (lower.startsWith('docs')) return 'docs';
  if (lower.startsWith('chore') || lower.startsWith('build') || lower.startsWith('ci')) return 'chore';
  if (lower.startsWith('security') || lower.startsWith('sec')) return 'security';
  if (lower.match(/^v\d+\.\d+/) || lower.includes('release') || lower.includes('version')) return 'release';
  return 'update';
}

/** Bereinigt den Commit-Betreff um Prefixes und Sonderzeichen */
function cleanSubject(subject) {
  // Entfernt Prefixe wie "feat:", "fix(scope):", etc.
  return subject
    .replace(/^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert|security)(\([^)]*\))?:\s*/i, '')
    .trim();
}

/** Parsed einen git-body aus mehreren gefilterten Zeilen zu einer Change-Liste */
function parseBodyToChanges(rawBody, subjectLine) {
  const cleaned = cleanSubject(subjectLine);
  const lines = rawBody
    .split('\n')
    .map((l) => l.replace(/^[-*•]\s*/, '').trim())
    .filter((l) => l.length > 0 && !l.startsWith('Co-authored') && !l.startsWith('Signed-off'));

  if (lines.length > 0) {
    return [cleaned, ...lines].slice(0, 8); // max 8 Punkte
  }
  return [cleaned];
}

/** Formatiert ein ISO-Datum als YYYY-MM-DD */
function isoDate(rawDate) {
  return new Date(rawDate).toISOString().split('T')[0];
}

// ────────────────────────────────────────────────────────────────────────────
// Git-Log einlesen
// ────────────────────────────────────────────────────────────────────────────

const SEP = '---COMMIT_SEP---';
const FIELD_SEP = '|||';

let rawLog = '';
try {
  rawLog = execSync(
    `git log --format="${SEP}%H${FIELD_SEP}%ai${FIELD_SEP}%s${FIELD_SEP}%b${FIELD_SEP}END"`,
    { cwd: ROOT, encoding: 'utf8' }
  );
} catch {
  console.error('Fehler beim Lesen des git-Logs. Ist dies ein git-Repository?');
  process.exit(1);
}

const commits = rawLog
  .split(SEP)
  .filter((block) => block.includes(FIELD_SEP))
  .map((block) => {
    const endIdx = block.indexOf(`${FIELD_SEP}END`);
    const content = endIdx !== -1 ? block.slice(0, endIdx) : block;
    const parts = content.split(FIELD_SEP);
    const hash = (parts[0] ?? '').trim();
    const date = (parts[1] ?? '').trim();
    const subject = (parts[2] ?? '').trim();
    const body = (parts[3] ?? '').trim();
    return { hash, date, subject, body };
  })
  .filter((c) => c.hash.length === 40); // nur vollständige Hashes

// ────────────────────────────────────────────────────────────────────────────
// Bestehendes Changelog laden
// ────────────────────────────────────────────────────────────────────────────

let existing = { generatedAt: '', releases: [] };
if (existsSync(CHANGELOG_PATH)) {
  try {
    existing = JSON.parse(readFileSync(CHANGELOG_PATH, 'utf8'));
  } catch {
    console.warn('Warnung: changelog.json konnte nicht geparst werden – wird neu erstellt.');
  }
}

const knownHashes = new Set(existing.releases.map((r) => r.hash));

// ────────────────────────────────────────────────────────────────────────────
// Neue Commits als Releases hinzufügen
// ────────────────────────────────────────────────────────────────────────────

const newReleases = commits
  .filter((c) => !knownHashes.has(c.hash))
  .map((c) => ({
    hash: c.hash,
    version: null,          // Versionsnummer kann manuell ergänzt werden
    date: isoDate(c.date),
    title: cleanSubject(c.subject),
    type: detectType(c.subject),
    changes: parseBodyToChanges(c.body, c.subject),
  }));

if (newReleases.length === 0) {
  console.log('Keine neuen Commits gefunden – changelog.json ist aktuell.');
  if (!isDryRun) {
    // Aktualisiere zumindest generatedAt
    existing.generatedAt = new Date().toISOString();
    writeFileSync(CHANGELOG_PATH, JSON.stringify(existing, null, 2) + '\n', 'utf8');
  }
  process.exit(0);
}

// Manuell gepflegte Einträge (hash === 'manual') bleiben immer oben
const manualReleases = existing.releases.filter((r) => r.hash === 'manual');
const gitReleases = existing.releases.filter((r) => r.hash !== 'manual');

const merged = {
  _note: existing._note ?? '',
  generatedAt: new Date().toISOString(),
  releases: [
    ...manualReleases,
    ...newReleases,    // neue Commits oben (nach manuellen)
    ...gitReleases,   // bestehende git-Einträge dahinter
  ],
};

if (isDryRun) {
  console.log(JSON.stringify(merged, null, 2));
  console.log(`\n→ Dry-Run: ${newReleases.length} neuer Eintrag/-träge (nicht gespeichert).`);
} else {
  writeFileSync(CHANGELOG_PATH, JSON.stringify(merged, null, 2) + '\n', 'utf8');
  console.log(`✓ changelog.json aktualisiert: ${newReleases.length} neuer Eintrag/-träge hinzugefügt.`);
  newReleases.forEach((r) => console.log(`  + [${r.date}] ${r.title}`));
}
