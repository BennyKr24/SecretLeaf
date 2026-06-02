#!/usr/bin/env node
// ────────────────────────────────────────────────────────────────────────────
// migrate-wiki-to-knowledge.mjs  (Phase 11)
//
// Migrates the legacy hardcoded wiki corpus
//   apps/web/src/data/terpira/wiki.ts  (wikiArticles, sourceRegister, categoryLabels)
// into idempotent SQL for the normalized Knowledge OS schema
//   supabase/migrations/202606020013_knowledge_os.sql
//
// It is fully automatic (no manual migration), validates referential integrity,
// and emits a matching rollback script.
//
// Usage:
//   node scripts/migrate-wiki-to-knowledge.mjs            # generate seed + rollback
//   node scripts/migrate-wiki-to-knowledge.mjs --dry-run  # report only, no writes
//   node scripts/migrate-wiki-to-knowledge.mjs --validate # validation only
//
// Outputs:
//   supabase/seed/knowledge_seed.sql       (INSERT ... ON CONFLICT DO UPDATE)
//   supabase/seed/knowledge_rollback.sql   (DELETE rows tagged with the batch)
// ────────────────────────────────────────────────────────────────────────────

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import ts from "typescript";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const WIKI_PATH = path.join(ROOT, "apps/web/src/data/terpira/wiki.ts");
const SEED_DIR = path.join(ROOT, "supabase/seed");
const SEED_PATH = path.join(SEED_DIR, "knowledge_seed.sql");
const ROLLBACK_PATH = path.join(SEED_DIR, "knowledge_rollback.sql");

// Marker stored in each row's meta so the batch can be rolled back cleanly.
const BATCH = "wiki_legacy_v1";

const args = new Set(process.argv.slice(2));
const DRY_RUN = args.has("--dry-run");
const VALIDATE_ONLY = args.has("--validate");

// ── 1. Load the legacy module by transpiling it on the fly ────────────────────

function loadWikiModule() {
  const source = readFileSync(WIKI_PATH, "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    },
  });

  const localRequire = createRequire(WIKI_PATH);
  const shimRequire = (id) => {
    // The only runtime dependency of wiki.ts is the autoSources JSON; the
    // type-only import is erased during transpilation.
    if (id.endsWith("autoSources.json")) {
      return localRequire(id);
    }
    if (id.startsWith("@/lib/")) return {}; // types only — never used as values
    return localRequire(id);
  };

  const module = { exports: {} };
  const factory = new Function("require", "module", "exports", outputText);
  factory(shimRequire, module, module.exports);
  return module.exports;
}

// ── 2. Helpers ────────────────────────────────────────────────────────────────

const sql = (value) => {
  if (value === null || value === undefined) return "null";
  if (typeof value === "number") return String(value);
  if (typeof value === "boolean") return value ? "true" : "false";
  return `'${String(value).replace(/'/g, "''")}'`;
};
const json = (value) => `'${JSON.stringify(value).replace(/'/g, "''")}'::jsonb`;
const slugify = (s) =>
  String(s)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const DIFFICULTY_MAP = {
  einsteiger: "foundational",
  fortgeschritten: "intermediate",
  profi: "advanced",
};

// Maps the flat legacy section list onto canonical template block types.
const HEADING_TO_BLOCK = [
  [/definition|grundlage/i, "definition"],
  [/wissenschaft|studie|evidenz/i, "scientific_background"],
  [/physiolog|pflanze/i, "plant_physiology"],
  [/symptom|anzeichen/i, "symptoms"],
  [/ursache/i, "causes"],
  [/diagnos/i, "diagnosis"],
  [/massnahme|behandl|korrektur|beheb/i, "corrective_actions"],
  [/prävent|vorbeug|prevent/i, "preventive_measures"],
  [/umwelt|klima|environment/i, "environmental_factors"],
  [/nährstoff|interaktion|nutrient/i, "nutrient_interactions"],
  [/fehler|mistake/i, "common_mistakes"],
  [/fortgeschritten|advanced|profi/i, "advanced_considerations"],
  [/experte|tipp|tip/i, "expert_tips"],
];

function classifyBlock(heading) {
  for (const [re, type] of HEADING_TO_BLOCK) {
    if (re.test(heading)) return type;
  }
  return "definition";
}

// ── 3. Transform ──────────────────────────────────────────────────────────────

function transform(wiki) {
  const { wikiArticles = [], sourceRegister = [], categoryLabels = {} } = wiki;

  const categories = Object.entries(categoryLabels).map(([slug, name], i) => ({
    slug,
    name,
    position: i,
  }));

  const sources = sourceRegister.map((s) => ({
    external_id: s.id,
    title: s.title,
    publisher: s.publisher ?? null,
    year: s.year ?? null,
    url: s.url ?? null,
    doi: s.doi ?? null,
    source_type: s.sourceType ?? "manual",
    evidence_level: s.evidenceLevel ?? null,
  }));

  const tagSet = new Map();
  const articles = [];
  const articleTags = [];
  const faqs = [];
  const references = [];
  const relations = [];

  for (const a of wikiArticles) {
    const body = (a.sections ?? []).map((section) => ({
      type: classifyBlock(section.heading ?? ""),
      heading: section.heading,
      content: section.content ?? [],
      ...(section.checklist ? { checklist: section.checklist } : {}),
    }));

    articles.push({
      slug: a.slug,
      title: a.title,
      summary: a.summary ?? null,
      body,
      category_slug: a.category ?? null,
      difficulty: DIFFICULTY_MAP[a.difficulty] ?? "intermediate",
      status: "published",
      read_minutes: a.readMinutes ?? null,
      quality_score: a.qualityScore ?? null,
      seo_description: a.summary ?? null,
      language: "de",
      published_at: a.lastUpdated ?? null,
    });

    for (const tag of a.tags ?? []) {
      const tagSlug = slugify(tag);
      if (!tagSet.has(tagSlug)) tagSet.set(tagSlug, tag);
      articleTags.push({ article_slug: a.slug, tag_slug: tagSlug });
    }

    for (const [i, f] of (a.faq ?? []).entries()) {
      faqs.push({ article_slug: a.slug, question: f.question, answer: f.answer, position: i });
    }

    for (const [i, sid] of (a.sourceIds ?? []).entries()) {
      references.push({ article_slug: a.slug, source_external_id: sid, position: i });
    }

    for (const rel of a.relatedSlugs ?? []) {
      relations.push({ from_slug: a.slug, to_slug: rel, relation_type: "related", weight: 1.0 });
    }
  }

  const tags = [...tagSet.entries()].map(([slug, name]) => ({ slug, name }));
  return { categories, sources, tags, articles, articleTags, faqs, references, relations };
}

// ── 4. Validation ─────────────────────────────────────────────────────────────

function validate(data) {
  const errors = [];
  const warnings = [];
  const slugs = new Set(data.articles.map((a) => a.slug));
  const sourceIds = new Set(data.sources.map((s) => s.external_id));
  const catSlugs = new Set(data.categories.map((c) => c.slug));

  const seen = new Set();
  for (const a of data.articles) {
    if (seen.has(a.slug)) errors.push(`Duplicate article slug: ${a.slug}`);
    seen.add(a.slug);
    if (!a.title) errors.push(`Article ${a.slug} missing title`);
    if (a.category_slug && !catSlugs.has(a.category_slug))
      warnings.push(`Article ${a.slug} references unknown category ${a.category_slug}`);
  }
  for (const r of data.relations) {
    if (!slugs.has(r.to_slug))
      warnings.push(`Relation ${r.from_slug} -> ${r.to_slug} targets unknown article`);
  }
  for (const ref of data.references) {
    if (!sourceIds.has(ref.source_external_id))
      warnings.push(`Article ${ref.article_slug} cites unknown source ${ref.source_external_id}`);
  }
  return { errors, warnings };
}

// ── 5. SQL generation ─────────────────────────────────────────────────────────

function buildSeedSql(data) {
  const lines = [];
  lines.push("-- Auto-generated by scripts/migrate-wiki-to-knowledge.mjs");
  lines.push(`-- Batch: ${BATCH}. Idempotent: safe to re-run.`);
  lines.push("begin;");
  lines.push("");

  // Categories
  for (const c of data.categories) {
    lines.push(
      `insert into public.knowledge_categories (slug, name, position) values ` +
        `(${sql(c.slug)}, ${sql(c.name)}, ${c.position}) ` +
        `on conflict (slug) do update set name = excluded.name, position = excluded.position;`,
    );
  }
  lines.push("");

  // Tags
  for (const t of data.tags) {
    lines.push(
      `insert into public.knowledge_tags (slug, name) values (${sql(t.slug)}, ${sql(t.name)}) ` +
        `on conflict (slug) do update set name = excluded.name;`,
    );
  }
  lines.push("");

  // Sources
  for (const s of data.sources) {
    lines.push(
      `insert into public.knowledge_sources (external_id, title, publisher, year, url, doi, source_type, evidence_level, meta) values ` +
        `(${sql(s.external_id)}, ${sql(s.title)}, ${sql(s.publisher)}, ${sql(s.year)}, ${sql(s.url)}, ${sql(s.doi)}, ${sql(s.source_type)}, ${sql(s.evidence_level)}, ${json({ batch: BATCH })}) ` +
        `on conflict (external_id) do update set title = excluded.title, publisher = excluded.publisher, url = excluded.url;`,
    );
  }
  lines.push("");

  // Articles
  for (const a of data.articles) {
    const categoryExpr = a.category_slug
      ? `(select id from public.knowledge_categories where slug = ${sql(a.category_slug)})`
      : "null";
    lines.push(
      `insert into public.knowledge_articles (slug, title, summary, body, category_id, difficulty, status, read_minutes, quality_score, seo_description, language, published_at, meta) values ` +
        `(${sql(a.slug)}, ${sql(a.title)}, ${sql(a.summary)}, ${json(a.body)}, ${categoryExpr}, ${sql(a.difficulty)}::knowledge_difficulty, ${sql(a.status)}::knowledge_status, ${sql(a.read_minutes)}, ${sql(a.quality_score)}, ${sql(a.seo_description)}, ${sql(a.language)}, ${a.published_at ? `${sql(a.published_at)}::timestamptz` : "null"}, ${json({ batch: BATCH })}) ` +
        `on conflict (slug) do update set title = excluded.title, summary = excluded.summary, body = excluded.body, category_id = excluded.category_id, difficulty = excluded.difficulty, read_minutes = excluded.read_minutes, quality_score = excluded.quality_score;`,
    );
  }
  lines.push("");

  // Article tags
  for (const at of data.articleTags) {
    lines.push(
      `insert into public.knowledge_article_tags (article_id, tag_id) ` +
        `select a.id, t.id from public.knowledge_articles a, public.knowledge_tags t ` +
        `where a.slug = ${sql(at.article_slug)} and t.slug = ${sql(at.tag_slug)} ` +
        `on conflict do nothing;`,
    );
  }
  lines.push("");

  // FAQs (replace-per-article to stay idempotent)
  const faqArticles = [...new Set(data.faqs.map((f) => f.article_slug))];
  for (const slug of faqArticles) {
    lines.push(
      `delete from public.knowledge_faqs where article_id = (select id from public.knowledge_articles where slug = ${sql(slug)});`,
    );
  }
  for (const f of data.faqs) {
    lines.push(
      `insert into public.knowledge_faqs (article_id, question, answer, position) ` +
        `select id, ${sql(f.question)}, ${sql(f.answer)}, ${f.position} from public.knowledge_articles where slug = ${sql(f.article_slug)};`,
    );
  }
  lines.push("");

  // References (skip unknown sources gracefully via inner select)
  for (const ref of data.references) {
    lines.push(
      `insert into public.knowledge_references (article_id, source_id, position) ` +
        `select a.id, s.id, ${ref.position} from public.knowledge_articles a, public.knowledge_sources s ` +
        `where a.slug = ${sql(ref.article_slug)} and s.external_id = ${sql(ref.source_external_id)} ` +
        `on conflict (article_id, source_id) do nothing;`,
    );
  }
  lines.push("");

  // Relations (skip dangling targets via inner select)
  for (const r of data.relations) {
    lines.push(
      `insert into public.knowledge_relations (from_article, to_article, relation_type, weight) ` +
        `select f.id, t.id, ${sql(r.relation_type)}::knowledge_relation_type, ${r.weight} ` +
        `from public.knowledge_articles f, public.knowledge_articles t ` +
        `where f.slug = ${sql(r.from_slug)} and t.slug = ${sql(r.to_slug)} and f.id <> t.id ` +
        `on conflict (from_article, to_article, relation_type) do nothing;`,
    );
  }
  lines.push("");
  lines.push("commit;");
  lines.push("");
  return lines.join("\n");
}

function buildRollbackSql() {
  return [
    "-- Auto-generated rollback for scripts/migrate-wiki-to-knowledge.mjs",
    `-- Removes all rows created by batch '${BATCH}'.`,
    "begin;",
    // Children cascade from articles; sources/categories/tags removed by batch marker.
    `delete from public.knowledge_articles where meta->>'batch' = '${BATCH}';`,
    `delete from public.knowledge_sources where meta->>'batch' = '${BATCH}';`,
    "-- Categories and tags are shared taxonomy; remove only if unreferenced.",
    "delete from public.knowledge_tags t where not exists (select 1 from public.knowledge_article_tags at where at.tag_id = t.id);",
    "delete from public.knowledge_categories c where not exists (select 1 from public.knowledge_articles a where a.category_id = c.id);",
    "commit;",
    "",
  ].join("\n");
}

// ── 6. Main ───────────────────────────────────────────────────────────────────

function main() {
  const wiki = loadWikiModule();
  const data = transform(wiki);
  const { errors, warnings } = validate(data);

  console.log("Knowledge migration — summary");
  console.log(`  categories: ${data.categories.length}`);
  console.log(`  tags:       ${data.tags.length}`);
  console.log(`  sources:    ${data.sources.length}`);
  console.log(`  articles:   ${data.articles.length}`);
  console.log(`  faqs:       ${data.faqs.length}`);
  console.log(`  references: ${data.references.length}`);
  console.log(`  relations:  ${data.relations.length}`);
  if (warnings.length) {
    console.log(`\n  ${warnings.length} warning(s):`);
    for (const w of warnings.slice(0, 25)) console.log(`    - ${w}`);
    if (warnings.length > 25) console.log(`    … ${warnings.length - 25} more`);
  }
  if (errors.length) {
    console.error(`\n  ${errors.length} error(s):`);
    for (const e of errors) console.error(`    - ${e}`);
    process.exit(1);
  }

  if (VALIDATE_ONLY) {
    console.log("\nValidation passed.");
    return;
  }

  const seed = buildSeedSql(data);
  const rollback = buildRollbackSql();

  if (DRY_RUN) {
    console.log(`\n[dry-run] would write ${SEED_PATH} (${seed.length} bytes)`);
    console.log(`[dry-run] would write ${ROLLBACK_PATH} (${rollback.length} bytes)`);
    return;
  }

  mkdirSync(SEED_DIR, { recursive: true });
  writeFileSync(SEED_PATH, seed, "utf8");
  writeFileSync(ROLLBACK_PATH, rollback, "utf8");
  console.log(`\nWrote ${path.relative(ROOT, SEED_PATH)}`);
  console.log(`Wrote ${path.relative(ROOT, ROLLBACK_PATH)}`);
}

main();
