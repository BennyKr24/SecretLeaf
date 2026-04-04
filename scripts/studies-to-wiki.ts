/**
 * studies-to-wiki.ts
 *
 * Auto-generates WikiArticle + WikiSource records from scientific studies.
 *
 * Input (tried in order):
 *   1. data/autoStudies.json  – output of `npm run studies:fetch`
 *   2. Study table in the Prisma database (fallback when JSON is missing)
 *
 * For every qualifying study the script:
 *   - Upserts a WikiSource (keyed by DOI – no duplicates)
 *   - Upserts a WikiArticle (keyed by slug derived from DOI – no duplicates)
 *   - Upserts a WikiArticleSource relation linking the two
 *
 * Qualifying criteria:
 *   - `qualityScore`   >= MIN_QUALITY_SCORE   (default 4.0)
 *   - `relevanceScore` >= MIN_RELEVANCE_SCORE (default 20)
 *   - summary length   >= MIN_SUMMARY_LENGTH  (default 80 chars)
 *
 * Usage (from repository root):
 *   npm run db:gen:wiki:studies
 *
 *   Or directly from apps/api/:
 *   cd apps/api && tsx --tsconfig ../../scripts/tsconfig.seed.json ../../scripts/studies-to-wiki.ts
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";

// ── Bootstrap: load DATABASE_URL from apps/api/.env ─────────────────────────

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "../apps/api/.env");

try {
  const lines = readFileSync(envPath, "utf-8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed
      .slice(eqIdx + 1)
      .trim()
      .replace(/^["']|["']$/g, "");
    if (key && !(key in process.env)) {
      process.env[key] = val;
    }
  }
} catch {
  // .env is optional – DATABASE_URL may already be set in the environment
}

// ── Configuration ─────────────────────────────────────────────────────────────

const MIN_QUALITY_SCORE = Number(process.env.WIKI_MIN_QUALITY ?? "4.0");
const MIN_RELEVANCE_SCORE = Number(process.env.WIKI_MIN_RELEVANCE ?? "20");
const MIN_SUMMARY_LENGTH = Number(process.env.WIKI_MIN_SUMMARY ?? "80");

/** Maps study category (from pipeline) → wiki category (from schema). */
const CATEGORY_MAP: Record<string, string> = {
  medical: "medizin",
  chemistry: "chemie",
  regulation: "recht",
  cultivation: "anbau",
};

// ── Types ─────────────────────────────────────────────────────────────────────

type StudyRecord = {
  title: string;
  doi: string;
  summary: string;
  category: string;
  qualityScore: number;
  relevanceScore: number;
  year: number;
  journal: string;
  source: string;
  authors: string[];
  citationCount: number;
};

type AutoStudiesJson = {
  generatedAt: string;
  studies: StudyRecord[];
};

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Converts a DOI like "10.1234/journal.abc.2024" into a URL-safe slug
 * suitable for WikiArticle.slug. Prefixed with "auto-" so auto-generated
 * articles are distinguishable from manually curated ones.
 */
function doiToSlug(doi: string): string {
  return (
    "auto-" +
    doi
      .toLowerCase()
      .replace(/^https?:\/\/doi\.org\//i, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80)
  );
}

/**
 * Builds a concise article title for use as the wiki article headline.
 * Truncates overly long study titles.
 */
function buildArticleTitle(study: StudyRecord): string {
  const t = study.title.trim();
  return t.length > 120 ? t.slice(0, 117) + "…" : t;
}

/**
 * Builds a short summary paragraph suitable for WikiArticle.summary.
 * Incorporates journal, year, and quality tier context.
 */
function buildArticleSummary(study: StudyRecord): string {
  const authors =
    study.authors.length > 0
      ? `${study.authors.slice(0, 2).join(" & ")}${study.authors.length > 2 ? " et al." : ""}`
      : "Unknown authors";
  const tier =
    study.qualityScore >= 7
      ? "Hochwertige Studie"
      : study.qualityScore >= 5
        ? "Peer-reviewed Studie"
        : "Wissenschaftliche Publikation";
  return `${tier} (${study.journal}, ${study.year}). ${authors}. ${study.summary.slice(0, 300)}${study.summary.length > 300 ? "…" : ""}`;
}

/**
 * Serialises the study data as the structured JSON stored in WikiArticle.content.
 * Mirrors the format used by seed-wiki.ts for manually curated articles.
 */
function buildContentJson(study: StudyRecord): string {
  const authorsText =
    study.authors.length > 0 ? study.authors.join(", ") : "Unbekannte Autoren";

  return JSON.stringify({
    keyTakeaways: [
      `Kategorie: ${study.category}`,
      `Qualitätsscore: ${study.qualityScore.toFixed(1)} / 10`,
      `Relevanzscore: ${study.relevanceScore.toFixed(0)} / 100`,
      `Erschienen in: ${study.journal} (${study.year})`,
      `Zitierungen: ${study.citationCount}`,
    ],
    quickFacts: [
      { label: "Journal", value: study.journal },
      { label: "Jahr", value: String(study.year) },
      { label: "Quelle", value: study.source },
      { label: "Zitierungen", value: String(study.citationCount) },
      { label: "Qualität", value: `${study.qualityScore.toFixed(1)} / 10` },
    ],
    sections: [
      {
        heading: "Zusammenfassung",
        content: [study.summary],
      },
      {
        heading: "Autoren und Quelle",
        content: [
          `Autoren: ${authorsText}`,
          `Zeitschrift: ${study.journal}`,
          `Erscheinungsjahr: ${study.year}`,
          `DOI: ${study.doi}`,
        ],
      },
    ],
    warnings: [],
    faq: [],
    glossary: [],
    tags: [study.category, study.journal.split(" ")[0].toLowerCase(), String(study.year)],
    relatedSlugs: [],
    sourceType: "auto",
    originalDoi: study.doi,
  });
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const prisma = new PrismaClient();

  try {
    // ── 1. Load studies ──────────────────────────────────────────────────────
    let studies: StudyRecord[] = [];

    const jsonPath = resolve(__dirname, "../data/autoStudies.json");
    if (existsSync(jsonPath)) {
      console.log(`📂 Reading studies from ${jsonPath}…`);
      const raw = JSON.parse(readFileSync(jsonPath, "utf-8")) as AutoStudiesJson;
      studies = raw.studies ?? [];
      console.log(`   Found ${studies.length} studies in JSON.`);
    } else {
      console.log("📂 autoStudies.json not found – falling back to DB Study table…");
      const dbStudies = await prisma.study.findMany({
        orderBy: { qualityScore: "desc" },
      });
      studies = dbStudies.map((s) => ({
        title: s.title,
        doi: s.doi,
        summary: s.abstract,
        category: s.category,
        qualityScore: s.qualityScore,
        relevanceScore: s.relevanceScore,
        year: s.year,
        journal: s.journal,
        source: s.source,
        authors: JSON.parse(s.authors) as string[],
        citationCount: s.citationCount,
      }));
      console.log(`   Found ${studies.length} studies in DB.`);
    }

    // ── 2. Filter qualifying studies ─────────────────────────────────────────
    const qualifying = studies.filter(
      (s) =>
        s.doi &&
        s.qualityScore >= MIN_QUALITY_SCORE &&
        s.relevanceScore >= MIN_RELEVANCE_SCORE &&
        s.summary.length >= MIN_SUMMARY_LENGTH
    );

    console.log(
      `\n🔍 Qualifying studies: ${qualifying.length} / ${studies.length} ` +
        `(quality ≥ ${MIN_QUALITY_SCORE}, relevance ≥ ${MIN_RELEVANCE_SCORE}, summary ≥ ${MIN_SUMMARY_LENGTH} chars)\n`
    );

    if (qualifying.length === 0) {
      console.log("ℹ No qualifying studies found. Nothing to do.");
      return;
    }

    // ── 3. Upsert WikiSource records ──────────────────────────────────────────
    console.log(`🔬 Upserting ${qualifying.length} WikiSource records…`);
    let sourceCount = 0;

    for (const study of qualifying) {
      const doiNorm = study.doi.replace(/^https?:\/\/doi\.org\//i, "");

      await prisma.wikiSource.upsert({
        where: { doi: doiNorm },
        create: {
          title: study.title,
          publisher: study.journal,
          doi: doiNorm,
          url: `https://doi.org/${doiNorm}`,
          year: study.year,
        },
        update: {
          title: study.title,
          publisher: study.journal,
          url: `https://doi.org/${doiNorm}`,
          year: study.year,
        },
      });
      sourceCount++;
    }

    console.log(`   ✓ ${sourceCount} sources upserted.\n`);

    // ── 4. Upsert WikiArticle records ─────────────────────────────────────────
    console.log(`📝 Upserting ${qualifying.length} WikiArticle records…`);
    let articleCount = 0;

    for (const study of qualifying) {
      const slug = doiToSlug(study.doi);
      const wikiCategory = CATEGORY_MAP[study.category] ?? study.category;
      const title = buildArticleTitle(study);
      const summary = buildArticleSummary(study);
      const content = buildContentJson(study);

      await prisma.wikiArticle.upsert({
        where: { slug },
        create: {
          slug,
          title,
          category: wikiCategory,
          summary,
          content,
          publishedAt: new Date(study.year, 0, 1),
        },
        update: {
          title,
          category: wikiCategory,
          summary,
          content,
        },
      });
      articleCount++;
    }

    console.log(`   ✓ ${articleCount} articles upserted.\n`);

    // ── 5. Upsert WikiArticleSource relations ─────────────────────────────────
    console.log("🔗 Upserting article ↔ source relations…");
    let relationCount = 0;
    let missingCount = 0;

    for (const study of qualifying) {
      const slug = doiToSlug(study.doi);
      const doiNorm = study.doi.replace(/^https?:\/\/doi\.org\//i, "");

      const [dbArticle, dbSource] = await Promise.all([
        prisma.wikiArticle.findUnique({ where: { slug }, select: { id: true } }),
        prisma.wikiSource.findUnique({ where: { doi: doiNorm }, select: { id: true } }),
      ]);

      if (!dbArticle || !dbSource) {
        console.warn(
          `   ⚠ Missing DB records for DOI "${study.doi}" – skipping relation.`
        );
        missingCount++;
        continue;
      }

      await prisma.wikiArticleSource.upsert({
        where: {
          articleId_sourceId: {
            articleId: dbArticle.id,
            sourceId: dbSource.id,
          },
        },
        create: { articleId: dbArticle.id, sourceId: dbSource.id },
        update: {},
      });
      relationCount++;
    }

    console.log(
      `   ✓ ${relationCount} relations upserted${missingCount > 0 ? `, ${missingCount} skipped` : ""}.\n`
    );

    // ── Summary ───────────────────────────────────────────────────────────────
    console.log("✅ studies-to-wiki complete!");
    console.log(`   Input studies  : ${studies.length}`);
    console.log(`   Qualifying     : ${qualifying.length}`);
    console.log(`   Sources created: ${sourceCount}`);
    console.log(`   Articles created: ${articleCount}`);
    console.log(`   Relations       : ${relationCount}`);
    console.log("\nTip: run `npm run db:seed:wiki` to also seed manually curated articles.");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error("❌ studies-to-wiki failed:", err);
  process.exit(1);
});
