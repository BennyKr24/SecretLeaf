#!/usr/bin/env node

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const TARGET = path.join(ROOT, "apps", "web", "src", "data", "terpira", "autoSources.json");

function fail(message) {
  console.error(`[auto-sources:validate] ${message}`);
  process.exit(1);
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

try {
  const raw = readFileSync(TARGET, "utf8");
  const data = JSON.parse(raw);

  if (!isNonEmptyString(data.generatedAt)) fail("generatedAt is missing or invalid.");
  if (!data.stats || typeof data.stats !== "object") fail("stats object is missing.");
  if (!Array.isArray(data.sources)) fail("sources must be an array.");

  const ids = new Set();
  const dois = new Set();

  for (let i = 0; i < data.sources.length; i += 1) {
    const src = data.sources[i];
    const prefix = `sources[${i}]`;

    if (!isNonEmptyString(src.id)) fail(`${prefix}.id is missing.`);
    if (!isNonEmptyString(src.title)) fail(`${prefix}.title is missing.`);
    if (!isNonEmptyString(src.publisher)) fail(`${prefix}.publisher is missing.`);
    if (!isNonEmptyString(src.year)) fail(`${prefix}.year is missing.`);
    if (!isNonEmptyString(src.url)) fail(`${prefix}.url is missing.`);

    if (ids.has(src.id)) fail(`duplicate source id found: ${src.id}`);
    ids.add(src.id);

    if (isNonEmptyString(src.doi)) {
      const doi = src.doi.toLowerCase();
      if (dois.has(doi)) fail(`duplicate DOI found: ${src.doi}`);
      dois.add(doi);
    }
  }

  console.log(`[auto-sources:validate] OK (${data.sources.length} sources).`);
} catch (error) {
  fail(error instanceof Error ? error.message : String(error));
}