/**
 * SecretLeaf – Universelle Such-Engine
 *
 * Sucht über alle Inhalte: Wiki-Artikel, Dünger-Katalog, Quellen.
 * Scoringmodell: exakter Match > Prefix > Fuzzy > Partial
 * Normalisierung, Stop-Wörter, Umlaute, Tokenisierung – alles integriert.
 */

import { wikiArticles, sourceRegister, categoryLabels } from "@/data/terpira/wiki";
import { fertilizerCatalog } from "@/data/terpira/fertilizers";

// ─── Typen ───────────────────────────────────────────────────────────────────

export type SearchResultKind = "wiki" | "fertilizer" | "source" | "glossary";

export type SearchResult = {
  id: string;
  kind: SearchResultKind;
  title: string;
  subtitle: string;
  description: string;
  url: string;
  score: number;
  tags: string[];
  highlight?: string | undefined;      // hervorgehobener Match-Snippet
  badge?: string | undefined;          // z.B. "Einsteiger" | "Profi" | "Budget"
  badgeColor?: string | undefined;     // Tailwind-Klasse
};

export type SearchResponse = {
  query: string;
  totalResults: number;
  results: SearchResult[];
  facets: {
    byKind: Record<SearchResultKind, number>;
    byTag: Array<{ tag: string; count: number }>;
  };
  duration_ms: number;
  isEmpty: boolean;
  suggestions: string[];
};

// ─── Normalisierung ───────────────────────────────────────────────────────────

const UMLAUT_MAP: Record<string, string> = {
  ä: "ae", ö: "oe", ü: "ue", ß: "ss",
  Ä: "ae", Ö: "oe", Ü: "ue",
};

const STOP_WORDS = new Set([
  "und", "oder", "der", "die", "das", "ein", "eine", "in", "an", "auf",
  "für", "fuer", "mit", "von", "zu", "bei", "ist", "are", "the", "and",
  "or", "of", "in", "a", "an", "to", "for", "with", "from",
]);

export function normalize(str: string): string {
  return str
    .toLowerCase()
    .replace(/[äöüßÄÖÜ]/g, (c) => UMLAUT_MAP[c] ?? c)
    .replace(/[^a-z0-9\s\-\.]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function tokenize(str: string): string[] {
  return normalize(str)
    .split(/[\s\-\.]+/)
    .filter((t) => t.length >= 2 && !STOP_WORDS.has(t));
}

// ─── Score-Berechnung ─────────────────────────────────────────────────────────

function scoreToken(docToken: string, queryToken: string): number {
  if (docToken === queryToken) return 100;
  if (docToken.startsWith(queryToken)) return 70;
  if (docToken.includes(queryToken)) return 40;
  if (fuzzyMatch(docToken, queryToken)) return 20;
  return 0;
}

/** Einfacher Jaro-Winkler-ähnlicher Fuzzy-Check */
function fuzzyMatch(a: string, b: string): boolean {
  if (Math.abs(a.length - b.length) > 3) return false;
  let matches = 0;
  const range = Math.floor(Math.max(a.length, b.length) / 2) - 1;
  for (let i = 0; i < a.length; i++) {
    const start = Math.max(0, i - range);
    const end = Math.min(b.length, i + range + 1);
    if (b.slice(start, end).includes(a[i] ?? '')) matches++;
  }
  const ratio = matches / a.length;
  return ratio >= 0.75;
}

function scoreField(fieldValue: string, queryTokens: string[], weight: number): number {
  const fieldTokens = tokenize(fieldValue);
  let fieldScore = 0;
  for (const qt of queryTokens) {
    let bestMatch = 0;
    for (const ft of fieldTokens) {
      bestMatch = Math.max(bestMatch, scoreToken(ft, qt));
    }
    fieldScore += bestMatch;
  }
  return (fieldScore / queryTokens.length) * weight;
}

function highlight(text: string, queryTokens: string[]): string {
  if (!text) return "";
  const words = text.split(" ");
  const normed = queryTokens.map(normalize);
  const highlighted = words.map((w) => {
    const nw = normalize(w);
    if (normed.some((q) => nw.includes(q) || nw.startsWith(q))) {
      return `**${w}**`;
    }
    return w;
  });
  const snippet = highlighted.join(" ");
  if (snippet.length > 200) {
    const idx = snippet.indexOf("**");
    const start = Math.max(0, idx - 60);
    return (start > 0 ? "…" : "") + snippet.slice(start, start + 200) + "…";
  }
  return snippet;
}

// ─── Index-Aufbau ─────────────────────────────────────────────────────────────

type IndexedDoc = {
  id: string;
  kind: SearchResultKind;
  title: string;
  subtitle: string;
  description: string;
  url: string;
  tags: string[];
  badge?: string | undefined;
  badgeColor?: string | undefined;
  // Pre-tokenized fields for scoring
  _titleTokens: string[];
  _tagTokens: string[];
  _descTokens: string[];
  _subtitleTokens: string[];
};

let _cachedIndex: IndexedDoc[] | null = null;

export function buildSearchIndex(): IndexedDoc[] {
  if (_cachedIndex) return _cachedIndex;

  const docs: IndexedDoc[] = [];

  // 1. Wiki-Artikel
  for (const article of wikiArticles) {
    const catLabel = categoryLabels[article.category] ?? article.category;
    const descParts = [
      article.summary,
      ...(article.keyTakeaways ?? []),
      ...(article.simpleExplainers?.map((e) => e.text) ?? []),
      ...(article.faq?.map((f) => `${f.question} ${f.answer}`) ?? []),
      ...(article.sections?.flatMap((s) => s.content) ?? []),
    ].join(" ");

    const difficultyBadges: Record<string, string> = {
      einsteiger: "Einsteiger",
      fortgeschritten: "Fortgeschritten",
      profi: "Profi",
    };
    const difficultyColors: Record<string, string> = {
      einsteiger: "text-blue-700 bg-blue-100",
      fortgeschritten: "text-amber-700 bg-amber-100",
      profi: "text-purple-700 bg-purple-100",
    };

    docs.push({
      id: `wiki:${article.slug}`,
      kind: "wiki",
      title: article.title,
      subtitle: catLabel,
      description: article.summary,
      url: `/wiki/${article.slug}`,
      tags: article.tags,
      badge: difficultyBadges[article.difficulty],
      badgeColor: difficultyColors[article.difficulty],
      _titleTokens: tokenize(article.title),
      _tagTokens: article.tags.flatMap(tokenize),
      _descTokens: tokenize(descParts),
      _subtitleTokens: tokenize(catLabel),
    });

    // Glossar-Einträge als eigene Ergebnisse
    if (article.glossary) {
      for (const g of article.glossary) {
        docs.push({
          id: `glossary:${article.slug}:${g.term}`,
          kind: "glossary",
          title: g.term,
          subtitle: `Glossar · ${article.title}`,
          description: g.definition,
          url: `/wiki/${article.slug}#glossar`,
          tags: [article.category, "Glossar"],
          badge: "Glossar",
          badgeColor: "text-teal-700 bg-teal-100",
          _titleTokens: tokenize(g.term),
          _tagTokens: tokenize(article.category),
          _descTokens: tokenize(g.definition),
          _subtitleTokens: tokenize(article.title),
        });
      }
    }
  }

  // 2. Dünger
  const costLabels: Record<string, string> = {
    budget: "Budget",
    mid: "Mittel",
    premium: "Premium",
  };
  const costColors: Record<string, string> = {
    budget: "text-green-700 bg-green-100",
    mid: "text-amber-700 bg-amber-100",
    premium: "text-rose-700 bg-rose-100",
  };
  const phaseLabels: Record<string, string> = {
    veg: "Veg", flower: "Blüte", universal: "Universal",
  };

  for (const f of fertilizerCatalog) {
    const phasesStr = f.phase.map((p) => phaseLabels[p]).join(", ");
    const descFull = [
      f.description,
      `NPK ${f.npk.n}-${f.npk.p}-${f.npk.k}`,
      `EC ${f.ec_range.min}–${f.ec_range.max} ${f.ec_range.unit}`,
      ...(f.micronutrients ?? []),
      ...f.tags,
    ].join(" ");

    docs.push({
      id: `fertilizer:${f.id}`,
      kind: "fertilizer",
      title: `${f.name}`,
      subtitle: `${f.brand} · ${phasesStr} · ${f.format}`,
      description: f.description,
      url: `/fertilizers#${f.id}`,
      tags: f.tags,
      badge: costLabels[f.cost],
      badgeColor: costColors[f.cost],
      _titleTokens: tokenize(f.name),
      _tagTokens: tokenize([...f.tags, f.brand, f.base, f.format, phasesStr].join(" ")),
      _descTokens: tokenize(descFull),
      _subtitleTokens: tokenize(f.brand),
    });
  }

  // 3. Quellen (Top-Quellen)
  for (const src of sourceRegister) {
    docs.push({
      id: `source:${src.id}`,
      kind: "source",
      title: src.title,
      subtitle: `${src.publisher} · ${src.year}`,
      description: `Peer-reviewed Quelle – ${src.publisher} (${src.year})`,
      url: src.url,
      tags: ["Wissenschaft", "Quelle"],
      badge: src.year,
      badgeColor: "text-slate-700 bg-slate-100",
      _titleTokens: tokenize(src.title),
      _tagTokens: tokenize(src.publisher),
      _descTokens: tokenize(src.title + " " + src.publisher),
      _subtitleTokens: tokenize(src.publisher),
    });
  }

  _cachedIndex = docs;
  return docs;
}

// ─── Haupt-Suchfunktion ───────────────────────────────────────────────────────

export function search(rawQuery: string, opts?: {
  limit?: number;
  kinds?: SearchResultKind[];
  minScore?: number;
}): SearchResponse {
  const t0 = Date.now();
  const limit = opts?.limit ?? 20;
  const minScore = opts?.minScore ?? 5;
  const kinds = opts?.kinds;

  const query = rawQuery.trim();
  if (!query || query.length < 1) {
    return emptyResponse(rawQuery);
  }

  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) {
    return emptyResponse(rawQuery);
  }

  const index = buildSearchIndex();
  const scored: (SearchResult & { _rawScore: number })[] = [];

  for (const doc of index) {
    if (kinds && !kinds.includes(doc.kind)) continue;

    const titleScore = scoreField(doc.title, queryTokens, 12);
    const tagScore = scoreField(doc.tags.join(" "), queryTokens, 7);
    const subtitleScore = scoreField(doc.subtitle, queryTokens, 4);
    const descScore = scoreField(doc.description, queryTokens, 2);

    // Bonus: alle query-tokens treffen Titel
    const fullTitleMatch = queryTokens.every((qt) =>
      doc._titleTokens.some((ft) => ft.startsWith(qt) || ft === qt)
    );

    const rawScore = titleScore + tagScore + subtitleScore + descScore
      + (fullTitleMatch ? 30 : 0);

    if (rawScore < minScore) continue;

    const highlightText = highlight(doc.description, queryTokens);

    scored.push({
      id: doc.id,
      kind: doc.kind,
      title: doc.title,
      subtitle: doc.subtitle,
      description: doc.description,
      url: doc.url,
      score: Math.min(100, Math.round(rawScore)),
      tags: doc.tags,
      highlight: highlightText,
      badge: doc.badge,
      badgeColor: doc.badgeColor,
      _rawScore: rawScore,
    });
  }

  // Nach Score sortieren
  scored.sort((a, b) => b._rawScore - a._rawScore);
  const results = scored.slice(0, limit).map(({ _rawScore, ...r }) => r);

  // Facets
  const byKind: Record<SearchResultKind, number> = {
    wiki: 0, fertilizer: 0, source: 0, glossary: 0,
  };
  const tagCounts: Record<string, number> = {};
  for (const r of scored) {
    byKind[r.kind]++;
    for (const t of r.tags) {
      tagCounts[t] = (tagCounts[t] ?? 0) + 1;
    }
  }
  const byTag = Object.entries(tagCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 12)
    .map(([tag, count]) => ({ tag, count }));

  // Suggestions aus leeren Bereichen
  const suggestions = buildSuggestions(query, scored.length);

  return {
    query: rawQuery,
    totalResults: scored.length,
    results,
    facets: { byKind, byTag },
    duration_ms: Date.now() - t0,
    isEmpty: scored.length === 0,
    suggestions,
  };
}

// ─── Auto-Complete ────────────────────────────────────────────────────────────

export function autocomplete(prefix: string, limit = 8): string[] {
  if (!prefix || prefix.length < 2) return [];
  const norm = normalize(prefix);
  const index = buildSearchIndex();
  const seen = new Set<string>();
  const results: string[] = [];

  for (const doc of index) {
    for (const token of doc._titleTokens) {
      if (token.startsWith(norm) && !seen.has(token) && token !== norm) {
        seen.add(token);
        results.push(doc.title);
        break;
      }
    }
    if (results.length >= limit) break;
  }
  return results.slice(0, limit);
}

// ─── Trending / Top-Themen ────────────────────────────────────────────────────

export function getTrendingTopics(): Array<{ label: string; query: string; kind: SearchResultKind }> {
  return [
    { label: "PPFD & Licht", query: "PPFD Licht", kind: "wiki" },
    { label: "EC Dosierung", query: "EC Nährstoffe", kind: "wiki" },
    { label: "VPD verstehen", query: "VPD", kind: "wiki" },
    { label: "Blüte Dünger", query: "Blüte", kind: "fertilizer" },
    { label: "Budget Mineral", query: "Budget Mineral", kind: "fertilizer" },
    { label: "Haschisch Typen", query: "Haschisch", kind: "wiki" },
    { label: "CBD Wirkung", query: "CBD Medizin", kind: "wiki" },
    { label: "Terpene Aroma", query: "Terpene", kind: "wiki" },
    { label: "THC Extraktion", query: "Extraktion Konzentrate", kind: "wiki" },
    { label: "Qualitätslabor", query: "Laborwerte COA", kind: "wiki" },
  ];
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function emptyResponse(query: string): SearchResponse {
  return {
    query,
    totalResults: 0,
    results: [],
    facets: { byKind: { wiki: 0, fertilizer: 0, source: 0, glossary: 0 }, byTag: [] },
    duration_ms: 0,
    isEmpty: true,
    suggestions: ["VPD", "EC", "PPFD", "Haschisch", "Blüte", "Budget"],
  };
}

function buildSuggestions(query: string, resultCount: number): string[] {
  if (resultCount > 0) return [];
  const corrections: Record<string, string> = {
    "hash": "Haschisch",
    "hasch": "Haschisch",
    "thc": "THC Wirkung",
    "cbd": "CBD Medizin",
    "dunger": "Dünger",
    "bluete": "Blüte",
    "licht": "PPFD Licht",
    "wasser": "Bewässerung EC",
  };
  const norm = normalize(query);
  const found = corrections[norm];
  if (found) return [found];
  return ["Wiki durchsuchen", "Dünger Katalog", "VPD", "EC Dosierung"];
}
