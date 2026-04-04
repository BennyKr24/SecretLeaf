/**
 * Seed script: imports all wiki articles and sources from the static
 * `apps/web/src/data/terpira/wiki.ts` file and upserts them into the
 * database via Prisma (WikiArticle, WikiSource, WikiArticleSource models).
 *
 * Prerequisites:
 *   1. Copy apps/api/.env.example → apps/api/.env and set DATABASE_URL.
 *   2. Run `npm run prisma:generate --workspace @secretleaf/api` once to
 *      generate the Prisma client.
 *   3. Run `npm run prisma:migrate --workspace @secretleaf/api` or
 *      `npm run prisma:push --workspace @secretleaf/api` to apply the schema.
 *
 * Usage (from repository root):
 *   npm run db:seed:wiki
 *
 *   Or directly from apps/api/:
 *   cd apps/api && tsx --tsconfig ../../scripts/tsconfig.seed.json ../../scripts/seed-wiki.ts
 */

import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";

// ---------------------------------------------------------------------------
// Bootstrap: load DATABASE_URL from apps/api/.env when not already set
// ---------------------------------------------------------------------------
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
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
    if (key && !(key in process.env)) {
      process.env[key] = val;
    }
  }
} catch {
  // .env is optional – DATABASE_URL may already be set in the environment
}

// ---------------------------------------------------------------------------
// Lazy import of wiki data (after env is set so Prisma client can initialise)
// ---------------------------------------------------------------------------
const { wikiArticles, sourceRegister, getArticleSources } = await import(
  "../apps/web/src/data/terpira/wiki.js"
);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Convert a wiki.ts `lastUpdated` date string ("YYYY-MM-DD") to a Date. */
function parseDate(dateStr: string | undefined): Date | undefined {
  if (!dateStr) return undefined;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? undefined : d;
}

/** Serialise rich article content (sections, faq, etc.) to a JSON string. */
function buildContentJson(article: (typeof wikiArticles)[number]): string {
  return JSON.stringify({
    difficulty: article.difficulty,
    readMinutes: article.readMinutes,
    tags: article.tags,
    keyTakeaways: article.keyTakeaways,
    quickFacts: article.quickFacts,
    sections: article.sections,
    warnings: article.warnings ?? [],
    simpleExplainers: article.simpleExplainers ?? [],
    faq: article.faq ?? [],
    glossary: article.glossary ?? [],
    relatedSlugs: article.relatedSlugs,
  });
}

// ---------------------------------------------------------------------------
// Main seed function
// ---------------------------------------------------------------------------
async function main() {
  const prisma = new PrismaClient();

  try {
    console.log("🌱 Starting wiki seed…\n");

    // ── 1. Upsert WikiSource records ────────────────────────────────────────
    console.log(`📚 Upserting ${sourceRegister.length} wiki sources…`);
    let sourceCount = 0;

    for (const src of sourceRegister) {
      await prisma.wikiSource.upsert({
        where: { id: src.id },
        create: {
          id: src.id,
          title: src.title,
          publisher: src.publisher ?? null,
          doi: src.doi ?? null,
          pmid: null, // TerpiraSource has no pmid field; reserved for future imports
          url: src.url ?? null,
          year: src.year ? parseInt(String(src.year), 10) : null,
        },
        update: {
          title: src.title,
          publisher: src.publisher ?? null,
          doi: src.doi ?? null,
          url: src.url ?? null,
          year: src.year ? parseInt(String(src.year), 10) : null,
        },
      });
      sourceCount++;
    }

    console.log(`   ✓ ${sourceCount} sources seeded.\n`);

    // ── 2. Upsert WikiArticle records ───────────────────────────────────────
    console.log(`📝 Upserting ${wikiArticles.length} wiki articles…`);
    let articleCount = 0;

    for (const article of wikiArticles) {
      const publishedAt = parseDate(article.lastUpdated);

      await prisma.wikiArticle.upsert({
        where: { slug: article.slug },
        create: {
          slug: article.slug,
          title: article.title,
          category: article.category,
          summary: article.summary,
          content: buildContentJson(article),
          publishedAt: publishedAt ?? null,
        },
        update: {
          title: article.title,
          category: article.category,
          summary: article.summary,
          content: buildContentJson(article),
          publishedAt: publishedAt ?? null,
        },
      });
      articleCount++;
    }

    console.log(`   ✓ ${articleCount} articles seeded.\n`);

    // ── 3. Upsert WikiArticleSource relations ───────────────────────────────
    console.log("🔗 Upserting article ↔ source relations…");
    let relationCount = 0;
    let skippedCount = 0;

    for (const article of wikiArticles) {
      // Reuse the existing getArticleSources helper which respects per-article
      // sourceIds and falls back to category defaults when unset.
      const articleSources = getArticleSources(article);

      // Fetch the DB record to get the cuid id
      const dbArticle = await prisma.wikiArticle.findUnique({
        where: { slug: article.slug },
        select: { id: true },
      });

      if (!dbArticle) {
        console.warn(`   ⚠ Article "${article.slug}" not found in DB – skipping relations.`);
        skippedCount++;
        continue;
      }

      for (const src of articleSources) {
        // WikiSource.id == src.id (set explicitly in step 1)
        const sourceExists = await prisma.wikiSource.findUnique({
          where: { id: src.id },
          select: { id: true },
        });

        if (!sourceExists) {
          console.warn(`   ⚠ Source "${src.id}" not found in DB – skipping relation.`);
          skippedCount++;
          continue;
        }

        await prisma.wikiArticleSource.upsert({
          where: {
            articleId_sourceId: {
              articleId: dbArticle.id,
              sourceId: src.id,
            },
          },
          create: { articleId: dbArticle.id, sourceId: src.id },
          update: {},
        });
        relationCount++;
      }
    }

    console.log(`   ✓ ${relationCount} relations seeded${skippedCount > 0 ? `, ${skippedCount} skipped` : ""}.\n`);

    // ── Summary ─────────────────────────────────────────────────────────────
    console.log("✅ Wiki seed complete!");
    console.log(`   Sources : ${sourceCount}`);
    console.log(`   Articles: ${articleCount}`);
    console.log(`   Relations: ${relationCount}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
