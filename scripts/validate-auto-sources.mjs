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

function isFiniteNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
}

try {
  const raw = readFileSync(TARGET, "utf8");
  const data = JSON.parse(raw);

  if (!isNonEmptyString(data.generatedAt)) fail("generatedAt is missing or invalid.");
  if (!data.stats || typeof data.stats !== "object") fail("stats object is missing.");
  if (!Array.isArray(data.sources)) fail("sources must be an array.");

  if (data.exclusionsPreview != null && !Array.isArray(data.exclusionsPreview)) {
    fail("exclusionsPreview must be an array when present.");
  }

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

    if (src.relevanceScore != null && (!isFiniteNumber(src.relevanceScore) || src.relevanceScore < 0 || src.relevanceScore > 100)) {
      fail(`${prefix}.relevanceScore must be between 0 and 100.`);
    }

    if (src.evidenceLevel != null && (!isFiniteNumber(src.evidenceLevel) || src.evidenceLevel < 0 || src.evidenceLevel > 100)) {
      fail(`${prefix}.evidenceLevel must be between 0 and 100.`);
    }

    if (src.publisherQuality != null && (!isFiniteNumber(src.publisherQuality) || src.publisherQuality < 0 || src.publisherQuality > 100)) {
      fail(`${prefix}.publisherQuality must be between 0 and 100.`);
    }

    if (src.topicFit != null && (!isFiniteNumber(src.topicFit) || src.topicFit < 0 || src.topicFit > 100)) {
      fail(`${prefix}.topicFit must be between 0 and 100.`);
    }

    if (src.editorialPriority != null && !["high", "medium", "low"].includes(src.editorialPriority)) {
      fail(`${prefix}.editorialPriority is invalid.`);
    }

    if (src.matchedTopics != null && !Array.isArray(src.matchedTopics)) {
      fail(`${prefix}.matchedTopics must be an array when present.`);
    }

    if (src.flags != null && !Array.isArray(src.flags)) {
      fail(`${prefix}.flags must be an array when present.`);
    }
  }

  console.log(`[auto-sources:validate] OK (${data.sources.length} sources).`);
} catch (error) {
  fail(error instanceof Error ? error.message : String(error));
}