#!/usr/bin/env node
// ────────────────────────────────────────────────────────────────────────────
// Commit-time content translation pipeline (Track A of docs/I18N_TRANSLATION_PLAN.md)
//
// Extracts translatable German strings from the static content modules, keeps a
// per-file translation memory keyed by a hash of the source string, and (in
// --translate mode) fills the gaps via the Anthropic API using the project
// glossary + style guide as a cached system prompt.
//
//   node scripts/translate-content.mjs --stats            # counts, never fails
//   node scripts/translate-content.mjs --check            # CI: exit 1 if gaps
//   node scripts/translate-content.mjs --prune            # drop stale TM entries
//   node scripts/translate-content.mjs --translate [--only=wiki] [--pilot=15] [--dry-run]
//
// The TM files (apps/web/src/data/i18n/en.*.json) are committed. Nothing here
// runs at build time; --check is meant for CI lint.
// ────────────────────────────────────────────────────────────────────────────

import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { pathToFileURL } from "node:url";
import * as esbuild from "esbuild";

const ROOT = process.cwd();
const WEB_SRC = path.join(ROOT, "apps/web/src");
const TM_DIR = path.join(WEB_SRC, "data/i18n");
const GLOSSARY_PATH = path.join(ROOT, "docs/i18n/glossary.json");
const STYLEGUIDE_PATH = path.join(ROOT, "docs/i18n/styleguide.md");

// ── args ────────────────────────────────────────────────────────────────────
const argv = process.argv.slice(2);
const has = (f) => argv.includes(f);
const opt = (f, d = null) => {
  const hit = argv.find((a) => a === f || a.startsWith(`${f}=`));
  if (!hit) return d;
  return hit.includes("=") ? hit.split("=").slice(1).join("=") : true;
};
const MODE = has("--translate")
  ? "translate"
  : has("--prune")
    ? "prune"
    : has("--sync")
      ? "sync"
      : has("--stats")
        ? "stats"
        : has("--glossary-lint")
          ? "glossary-lint"
          : "check";
const WRITES = MODE === "translate" || MODE === "prune" || MODE === "sync";
const ONLY = opt("--only", null);
const PILOT = Number(opt("--pilot", "0")) || 0;
const DRY_RUN = has("--dry-run");
const BATCH = Number(opt("--batch", "20")) || 20;
const MODEL = process.env.I18N_MODEL || "claude-sonnet-5";

// ── string collection ───────────────────────────────────────────────────────
// Skip strings with no real word in them: pure numbers, ranges, unit tokens
// ("5.8–6.2", "< 0.2 mm", "MgSO4 1–2 g/L"). Anything with a 3+ letter run is
// prose and gets translated. Unit abbreviations (mm, g, L, kPa) never do.
const hasWord = (s) => /\p{L}{3,}/u.test(s);
const isText = (v) => typeof v === "string" && v.trim().length > 1 && hasWord(v);
const walkStrings = (node, prefix, out) => {
  if (Array.isArray(node)) {
    node.forEach((v, i) => walkStrings(v, `${prefix}/${i}`, out));
  } else if (node && typeof node === "object") {
    for (const [k, v] of Object.entries(node)) walkStrings(v, `${prefix}/${k}`, out);
  } else if (isText(node)) {
    out.push({ path: prefix, de: node });
  }
};

/**
 * Pull only the prose fields off one record. `fields` is a list of key paths;
 * "*" means "every element of this array". Anything not listed (slug, id,
 * numbers, component refs, source ids …) is never sent for translation.
 */
const pickFields = (record, fields, prefix, out) => {
  for (const field of fields) {
    const parts = field.split(".");
    const dig = (obj, ps, p) => {
      if (obj == null) return;
      if (ps.length === 0) {
        walkStrings(obj, p, out);
        return;
      }
      const [head, ...rest] = ps;
      if (head === "*") {
        if (Array.isArray(obj)) obj.forEach((v, i) => dig(v, rest, `${p}/${i}`));
      } else {
        dig(obj[head], rest, `${p}/${head}`);
      }
    };
    dig(record, parts, prefix);
  }
};

const ARTICLE_FIELDS = [
  "title",
  "summary",
  "keyTakeaways",
  "quickFacts.*.label",
  "quickFacts.*.value",
  "sections.*.heading",
  "sections.*.content",
  "sections.*.checklist",
  "warnings",
  "simpleExplainers.*.title",
  "simpleExplainers.*.text",
  "faq.*.question",
  "faq.*.answer",
  "glossary.*.term",
  "glossary.*.definition",
  "growValue",
];

const RESULT_FIELDS = [
  "title",
  "reasoning",
  "cause",
  "explanation",
  "steps",
  "logNote",
  "toolLinks.*.label",
];

const NODE_FIELDS = ["question", "hint", "options.*.label"];

// ── sources ─────────────────────────────────────────────────────────────────
const SOURCES = [
  {
    id: "wiki",
    entry: path.join(WEB_SRC, "data/terpira/wiki.ts"),
    collect(mod) {
      const out = [];
      for (const a of mod.wikiArticles ?? []) {
        pickFields(a, ARTICLE_FIELDS, `wiki/${a.slug}`, out);
      }
      return out;
    },
  },
  {
    id: "diagnostics",
    entry: path.join(WEB_SRC, "data/terpira/diagnostics.ts"),
    collect(mod) {
      const out = [];
      for (const a of mod.diagnosticArticles ?? []) {
        pickFields(a, ARTICLE_FIELDS, `diagnostics/${a.slug}`, out);
      }
      return out;
    },
  },
  {
    id: "diagnose-tree",
    entry: path.join(WEB_SRC, "lib/diagnose/tree.ts"),
    collect(mod) {
      const out = [];
      for (const [id, r] of Object.entries(mod.diagnoseResults ?? {})) {
        pickFields(r, RESULT_FIELDS, `result/${id}`, out);
      }
      for (const [id, n] of Object.entries(mod.diagnoseNodes ?? {})) {
        pickFields(n, NODE_FIELDS, `node/${id}`, out);
      }
      for (const c of mod.diagnoseCategories ?? []) {
        pickFields(c, ["label"], `category/${c.id}`, out);
      }
      return out;
    },
  },
];

// ── esbuild transpile + import ──────────────────────────────────────────────
async function loadModule(entry) {
  // Emit inside the repo (under node_modules/.cache, already git-ignored) so
  // Node's module resolution finds node_modules for the externals below.
  const cacheDir = path.join(ROOT, "node_modules/.cache/sl-i18n");
  fs.mkdirSync(cacheDir, { recursive: true });
  const tmp = path.join(cacheDir, `m-${crypto.randomBytes(6).toString("hex")}.mjs`);
  await esbuild.build({
    entryPoints: [entry],
    bundle: true,
    format: "esm",
    platform: "node",
    target: "node20",
    outfile: tmp,
    alias: { "@": WEB_SRC },
    external: ["lucide-react", "react", "react-dom", "next", "next-intl"],
    logLevel: "silent",
  });
  try {
    return await import(pathToFileURL(tmp).href);
  } finally {
    fs.rmSync(tmp, { force: true });
  }
}

// ── translation memory ─────────────────────────────────────────────────────
const hash = (s) => crypto.createHash("sha256").update(s, "utf8").digest("hex").slice(0, 12);
const tmPath = (id) => path.join(TM_DIR, `en.${id}.json`);

function readTM(id) {
  try {
    return JSON.parse(fs.readFileSync(tmPath(id), "utf8"));
  } catch {
    return {};
  }
}
async function writeTM(id, tm) {
  const ordered = Object.fromEntries(
    Object.entries(tm).sort(([, a], [, b]) => (a.de || "").localeCompare(b.de || "")),
  );
  await fsp.mkdir(TM_DIR, { recursive: true });
  await fsp.writeFile(tmPath(id), JSON.stringify(ordered, null, 2) + "\n", "utf8");
}

/** Dedupe collected strings by source text, remembering every path. */
function index(strings) {
  const map = new Map();
  for (const { path: p, de } of strings) {
    const h = hash(de);
    if (!map.has(h)) map.set(h, { de, paths: [] });
    map.get(h).paths.push(p);
  }
  return map;
}

// ── Anthropic ──────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = () => [
  {
    type: "text",
    text:
      "You translate SecretLeaf's cannabis-cultivation content from German to English. " +
      "Follow the style guide and glossary below exactly. Output ONLY a JSON array " +
      'of {"id": <number>, "en": <string>} — no prose, no code fence.\n\n' +
      `=== STYLE GUIDE ===\n${fs.readFileSync(STYLEGUIDE_PATH, "utf8")}\n\n` +
      `=== GLOSSARY (JSON) ===\n${fs.readFileSync(GLOSSARY_PATH, "utf8")}`,
    cache_control: { type: "ephemeral" },
  },
];

async function callModel(items, client) {
  const user =
    "Translate each `de` string. Keep markup, placeholders and trailing punctuation.\n\n" +
    JSON.stringify(items.map((it, i) => ({ id: i, de: it.de })), null, 2);
  const res = await client.messages.create({
    model: MODEL,
    max_tokens: 16384,
    system: SYSTEM_PROMPT(),
    messages: [{ role: "user", content: user }],
  });
  const block = res.content.find((b) => b.type === "text");
  if (!block) throw new Error("no text block in Anthropic response");
  // Trim to the outermost JSON array so stray prose / fences can't break parse.
  let s = block.text.trim().replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  const a = s.indexOf("[");
  const b = s.lastIndexOf("]");
  if (a !== -1 && b > a) s = s.slice(a, b + 1);
  const parsed = JSON.parse(s);
  const byId = new Map(parsed.map((p) => [p.id, p.en]));
  return items.map((it, i) => ({ ...it, en: byId.get(i) }));
}

/**
 * Translate a chunk, tolerating a bad/truncated model response: on any failure
 * the chunk is split and each half retried, down to single items. A single
 * item that still can't be parsed is left untranslated (logged) instead of
 * killing the whole run.
 */
async function translateBatch(items, client) {
  try {
    return await callModel(items, client);
  } catch (err) {
    if (items.length === 1) {
      console.warn(`  ! skipped 1 string (${err.message}): ${items[0].de.slice(0, 60)}…`);
      return [{ ...items[0], en: undefined }];
    }
    const mid = Math.ceil(items.length / 2);
    console.warn(`  ! batch parse failed (${err.message}) — splitting ${items.length} → ${mid}+${items.length - mid}`);
    const left = await translateBatch(items.slice(0, mid), client);
    const right = await translateBatch(items.slice(mid), client);
    return [...left, ...right];
  }
}

// ── glossary lint ──────────────────────────────────────────────────────────
// Heuristic, advisory: flags translated EN strings whose German source used a
// glossary term but whose EN output lacks the canonical rendering. Exit 0 by
// default (warnings only); --strict makes findings fail (CI). --terms also
// runs the noisier `terms` map on top of the near-zero-FP `doNotTranslate`.
const reEscape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
function hasTerm(haystack, term) {
  // \b works for ASCII acronyms (EC, VPD); for words with letters we also
  // accept a compound boundary (German has no space in "Blütephase").
  const b = new RegExp(`(^|[^\\p{L}])${reEscape(term)}([^\\p{L}]|$)`, "iu");
  return b.test(haystack) || haystack.toLowerCase().includes(term.toLowerCase());
}
function glossaryLint() {
  const g = JSON.parse(fs.readFileSync(GLOSSARY_PATH, "utf8"));
  const dnt = g.doNotTranslate || [];
  const terms = has("--terms") ? Object.entries(g.terms || {}) : [];
  const strict = has("--strict");
  const canon = (s) => s.replace(/₂/g, "2").replace(/ /g, " ");
  let findings = 0;

  for (const id of SOURCES.map((s) => s.id)) {
    const tm = readTM(id);
    for (const entry of Object.values(tm)) {
      if (!entry || typeof entry.en !== "string" || !entry.en.trim()) continue;
      const de = canon(entry.de);
      const en = canon(entry.en);
      for (const term of dnt) {
        // \b-anchored so "EC" doesn't match inside "Technik"/"recht".
        const re = new RegExp(`(^|[^\\p{L}\\p{N}])${reEscape(term)}([^\\p{L}\\p{N}]|$)`, "u");
        if (re.test(de) && !re.test(en)) {
          console.warn(`[${id}] do-not-translate "${term}" missing from EN`);
          console.warn(`   de: ${entry.de}`);
          console.warn(`   en: ${entry.en}\n`);
          findings++;
        }
      }
      for (const [deT, enT] of terms) {
        if (hasTerm(de, deT) && !hasTerm(en, enT)) {
          console.warn(`[${id}] "${deT}" → expected "${enT}"`);
          console.warn(`   de: ${entry.de}`);
          console.warn(`   en: ${entry.en}\n`);
          findings++;
        }
      }
    }
  }
  console.log(
    findings
      ? `${findings} possible glossary deviation(s). Heuristic — expect some false positives; review and fix the real ones in the TM.`
      : "✓ no glossary deviations",
  );
  process.exit(strict && findings ? 1 : 0);
}

// ── run ────────────────────────────────────────────────────────────────────
async function main() {
  if (MODE === "glossary-lint") return glossaryLint();

  const targets = SOURCES.filter((s) => !ONLY || s.id === ONLY);
  if (ONLY && targets.length === 0) {
    console.error(`unknown --only=${ONLY}. known: ${SOURCES.map((s) => s.id).join(", ")}`);
    process.exit(2);
  }

  let client = null;
  if (MODE === "translate" && !DRY_RUN) {
    const { default: Anthropic } = await import("@anthropic-ai/sdk");
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error("ANTHROPIC_API_KEY is not set — cannot run --translate.");
      process.exit(2);
    }
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }

  const rows = [];

  for (const src of targets) {
    const mod = await loadModule(src.entry);
    const strings = src.collect(mod);
    const idx = index(strings);
    const tm = readTM(src.id);

    const chars = [...idx.values()].reduce((n, v) => n + v.de.length, 0);
    let translated = 0;
    const missing = [];
    // Build the synced view (fresh de/paths, preserved en) without touching disk.
    const synced = {};
    for (const [h, entry] of idx) {
      const cur = tm[h];
      const en = cur && typeof cur.en === "string" && cur.en.trim() ? cur.en : null;
      if (en) translated++;
      else missing.push({ h, de: entry.de, paths: entry.paths });
      synced[h] = { de: entry.de, en, paths: entry.paths };
    }
    const row = { id: src.id, strings: idx.size, chars, translated, missing: missing.length };
    rows.push(row);

    if (MODE === "prune") {
      const stale = Object.keys(tm).filter((h) => !idx.has(h));
      console.log(
        stale.length
          ? `[${src.id}] pruning ${stale.length} stale entr${stale.length === 1 ? "y" : "ies"}`
          : `[${src.id}] nothing stale`,
      );
      if (!DRY_RUN) await writeTM(src.id, synced);
      continue;
    }

    if (MODE === "sync") {
      if (!DRY_RUN) await writeTM(src.id, synced);
      console.log(`[${src.id}] synced — ${idx.size} strings, ${missing.length} awaiting translation`);
      continue;
    }

    // from here `tm` is the working copy the translate step mutates
    for (const [h, v] of Object.entries(synced)) tm[h] = v;

    if (MODE === "translate" && missing.length) {
      let queue = missing;
      if (PILOT > 0) queue = queue.slice(0, PILOT);
      console.log(`[${src.id}] translating ${queue.length}/${missing.length} missing string(s) via ${MODEL}…`);
      for (let i = 0; i < queue.length; i += BATCH) {
        const chunk = queue.slice(i, i + BATCH);
        if (DRY_RUN) {
          console.log(`  would send batch ${i / BATCH + 1} (${chunk.length} strings)`);
          continue;
        }
        const done = await translateBatch(chunk, client);
        for (const d of done) {
          if (d.en && d.en.trim()) tm[d.h] = { de: d.de, en: d.en, paths: d.paths };
        }
        await writeTM(src.id, tm);
        console.log(`  batch ${Math.floor(i / BATCH) + 1}: +${done.filter((d) => d.en).length} translated`);
      }
      if (!DRY_RUN) await writeTM(src.id, tm);
      // reflect what the batches actually filled
      row.translated = Object.values(tm).filter((v) => v.en && v.en.trim()).length;
      row.missing = row.strings - row.translated;
    }
  }

  const totalMissing = rows.reduce((n, r) => n + r.missing, 0);

  // report
  const pad = (s, n) => String(s).padEnd(n);
  const padL = (s, n) => String(s).padStart(n);
  console.log(
    `\n${pad("source", 16)} ${padL("strings", 8)} ${padL("chars", 9)} ${padL("translated", 11)} ${padL("missing", 8)}`,
  );
  for (const r of rows) {
    console.log(
      `${pad(r.id, 16)} ${padL(r.strings, 8)} ${padL(r.chars, 9)} ${padL(r.translated, 11)} ${padL(r.missing, 8)}`,
    );
  }
  const tot = rows.reduce(
    (a, r) => ({
      strings: a.strings + r.strings,
      chars: a.chars + r.chars,
      translated: a.translated + r.translated,
      missing: a.missing + r.missing,
    }),
    { strings: 0, chars: 0, translated: 0, missing: 0 },
  );
  console.log(
    `${pad("TOTAL", 16)} ${padL(tot.strings, 8)} ${padL(tot.chars, 9)} ${padL(tot.translated, 11)} ${padL(tot.missing, 8)}\n`,
  );

  if (MODE === "check" && totalMissing > 0) {
    console.error(
      `✗ ${totalMissing} untranslated string(s). Run: npm run i18n:translate` +
        (ONLY ? ` -- --only=${ONLY}` : ""),
    );
    process.exit(1);
  }
  console.log("✓ done");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
