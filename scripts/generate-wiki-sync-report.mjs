#!/usr/bin/env node

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SOURCES_PATH = path.join(ROOT, "apps", "web", "src", "data", "terpira", "autoSources.json");
const REPORT_PATH = path.join(ROOT, ".github", "wiki-sync-report.md");

function escapePipe(input) {
  return String(input ?? "").replace(/\|/g, "\\|");
}

function takeTopByScore(sources, amount) {
  return [...sources]
    .sort((a, b) => (b.relevanceScore ?? 0) - (a.relevanceScore ?? 0))
    .slice(0, amount);
}

function takeFlaggedSources(sources, amount) {
  return sources
    .filter((entry) => Array.isArray(entry.flags) && entry.flags.some((flag) => ["protocol", "case-report", "pilot", "observational", "hemp-low-fit", "no-topic-match", "low-evidence-format"].includes(flag)))
    .sort((a, b) => (b.relevanceScore ?? 0) - (a.relevanceScore ?? 0))
    .slice(0, amount);
}

const payload = JSON.parse(readFileSync(SOURCES_PATH, "utf8"));
const sources = Array.isArray(payload.sources) ? payload.sources : [];
const stats = payload.stats ?? {};
const top = takeTopByScore(sources, 12);
const flagged = takeFlaggedSources(sources, 12);

const lines = [
  "## Wiki Study Sync Report",
  "",
  `Generated at: ${payload.generatedAt ?? "unknown"}`,
  "",
  "### Pipeline Summary",
  `- Fetched: ${stats.fetched ?? 0}`,
  `- Deduped candidates: ${stats.deduped ?? 0}`,
  `- Kept in dataset: ${stats.kept ?? sources.length}`,
  `- Excluded by hard/soft filters: ${stats.excluded ?? 0}`,
  `- Lookback days: ${stats.lookbackDays ?? "n/a"}`,
  "",
  "### Top Auto-Sources (by relevance)",
  "| Score | Priority | Type | Topics | Publisher | Title | DOI |",
  "|---:|---|---|---|---|---|---|"
];

for (const entry of top) {
  lines.push(
    `| ${entry.relevanceScore ?? 0} | ${escapePipe(entry.editorialPriority ?? "-")} | ${escapePipe(entry.studyType ?? "-")} | ${escapePipe((entry.matchedTopics ?? []).join(", ") || "-")} | ${escapePipe(entry.publisher)} | ${escapePipe(entry.title)} | ${escapePipe(entry.doi ?? "-")} |`
  );
}

if (flagged.length > 0) {
  lines.push(
    "",
    "### Fragliche / Review-pflichtige Treffer",
    "| Score | Type | Flags | Title | DOI |",
    "|---:|---|---|---|---|"
  );

  for (const entry of flagged) {
    lines.push(
      `| ${entry.relevanceScore ?? 0} | ${escapePipe(entry.studyType ?? "-")} | ${escapePipe((entry.flags ?? []).join(", ") || "-")} | ${escapePipe(entry.title)} | ${escapePipe(entry.doi ?? "-")} |`
    );
  }
}

if (Array.isArray(payload.exclusionsPreview) && payload.exclusionsPreview.length > 0) {
  lines.push(
    "",
    "### Ausgeschlossen (Vorschau)",
    "| Reason | Title |",
    "|---|---|"
  );

  for (const entry of payload.exclusionsPreview.slice(0, 12)) {
    lines.push(`| ${escapePipe(entry.reason ?? "-")} | ${escapePipe(entry.title ?? "-")} |`);
  }
}

lines.push("", "### Review Checklist", "- [ ] Spot-check journal quality and relevance", "- [ ] Verify at least 5 DOI links manually", "- [ ] Assign selected sources to article sourceIds", "- [ ] Merge only after editorial review");

mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
writeFileSync(REPORT_PATH, `${lines.join("\n")}\n`, "utf8");

console.log(`[wiki-sync-report] Wrote ${REPORT_PATH}`);