#!/usr/bin/env node
/**
 * apps/web/scripts/seed-updates.mjs
 *
 * Backfills the `updates` table from src/data/updates.json (one-time, then
 * the table is the source of truth — see decision §6.2). Idempotent: upserts
 * by `slug`.
 *
 * Usage (from repo root): node apps/web/scripts/seed-updates.mjs
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ENV_PATH = path.resolve(__dirname, "..", ".env.local");
const JSON_PATH = path.resolve(__dirname, "..", "src", "data", "updates.json");

function loadEnv(file) {
  const out = {};
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
    if (!m) continue;
    let v = m[2].trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    out[m[1]] = v;
  }
  return out;
}

const env = loadEnv(ENV_PATH);
const URL = env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !KEY) {
  console.error(`✗ SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY nicht in ${ENV_PATH}`);
  process.exit(1);
}

const supabase = createClient(URL, KEY, { auth: { persistSession: false } });
const data = JSON.parse(readFileSync(JSON_PATH, "utf8"));

const rows = (data.updates ?? []).map((u) => ({
  slug: u.slug,
  version: u.version ?? null,
  date: u.date,
  title: u.title,
  summary: u.summary,
  category: u.category,
  featured: Boolean(u.featured),
  published: true,
  cta: u.cta ?? null,
  sections: u.sections ?? {},
  stats: u.stats ?? null,
}));

const { error } = await supabase.from("updates").upsert(rows, { onConflict: "slug" });
if (error) {
  console.error("✗", error.message);
  process.exit(1);
}
console.log(`✓ ${rows.length} Updates upserted.`);
