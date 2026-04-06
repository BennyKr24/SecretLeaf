/**
 * SecretLeaf – Universelle Such-Engine (v2)
 *
 * Verbesserungen:
 * - Synonym-Expansion (Cannabis-Slang, DE/EN, Fachbegriffe)
 * - Intent-Erkennung (Dünger / Wiki / Frage)
 * - Phrase-Match-Bonus (exakter Satz-Treffer)
 * - Positions-Bonus (Token am Anfang des Titels → mehr Score)
 * - All-Token-Must-Match Vollständigkeits-Bonus
 * - Tiefer indexierte FAQ, Sections und KeyTakeaways
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
  highlight?: string | undefined;
  badge?: string | undefined;
  badgeColor?: string | undefined;
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
  "fuer", "mit", "von", "zu", "bei", "ist", "are", "the", "and",
  "or", "of", "a", "to", "for", "with", "from", "wie", "was", "warum",
  "wann", "wo", "welche", "welcher", "kann", "hat", "haben", "beim",
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

// ─── Synonyme ─────────────────────────────────────────────────────────────────
// Jeder Eintrag expandiert einen Begriff auf eine Menge von Suchwörtern,
// die alle in die Query eingefügt werden.

const SYNONYM_MAP: Record<string, string[]> = {
  // Cannabis-Slang
  gras: ["cannabis", "hanf", "thc"],
  weed: ["cannabis", "hanf", "thc"],
  ganja: ["cannabis", "hanf"],
  shit: ["haschisch", "cannabis"],
  dope: ["cannabis", "haschisch"],
  pot: ["cannabis"],
  mary: ["cannabis"],
  jane: ["cannabis"],
  // Arten
  indica: ["cannabis", "genetik"],
  sativa: ["cannabis", "genetik"],
  hybrid: ["cannabis", "genetik", "hybrid"],
  autoflower: ["genetik", "anbau"],
  auto: ["autoflower", "genetik"],
  regular: ["genetik", "saatgut"],
  feminized: ["genetik", "samen"],
  // Anbau
  licht: ["ppfd", "licht", "led", "hps", "beleuchtung"],
  led: ["licht", "ppfd", "beleuchtung"],
  lampe: ["licht", "ppfd", "beleuchtung", "led"],
  hell: ["licht", "ppfd"],
  temperatur: ["vpd", "klima", "temperatur"],
  hitze: ["temperatur", "vpd", "klima"],
  luft: ["vpd", "klima", "luftfeuchtigkeit"],
  humidity: ["luftfeuchtigkeit", "vpd"],
  co2: ["klima", "co2", "anbau"],
  // Nährstoffe
  naehrstoffe: ["naehrstoffmaengel", "duengen", "naehrstoffe", "mangel"],
  mangel: ["naehrstoffmaengel", "mangel", "fehler"],
  gelb: ["naehrstoffmaengel", "mangel", "stickstoff"],
  braun: ["naehrstoffmaengel", "mangel", "kali"],
  flecken: ["naehrstoffmaengel", "mangel", "pilz"],
  stickstoff: ["stickstoff", "naehrstoffe", "npk"],
  kalium: ["kalium", "naehrstoffe", "kali", "npk"],
  kali: ["kalium", "naehrstoffe", "npk"],
  phosphor: ["phosphor", "naehrstoffe", "npk"],
  ec: ["ec", "leitfaehigkeit", "naehrstoffe", "duengen"],
  ph: ["ph", "wasser", "naehrstoffe"],
  // Duenger
  duengen: ["duengen", "duenger", "npk", "ec"],
  duenger: ["fertilizer", "duengen", "npk"],
  daengen: ["duengen", "duenger"],
  fertilizer: ["duenger", "duengen"],
  npk: ["naehrstoffe", "npk", "duenger"],
  // Ernte / Weiterverarbeitung
  ernte: ["ernte", "harvest", "trocknen", "curing"],
  trocknen: ["trocknen", "curing", "ernte"],
  haerter: ["curing", "trocknen", "ernte"],
  trimmen: ["ernte", "trimmen"],
  // Konsumformen
  rauchen: ["konsumformen", "joint", "rauchen"],
  vapen: ["vaporizer", "konsumformen", "dampfen"],
  dampfen: ["vaporizer", "konsumformen"],
  edibles: ["edibles", "konsumformen", "orale"],
  essen: ["edibles", "konsumformen"],
  // Konzentrate / Hash
  haschisch: ["haschisch", "konzentrate", "extrakt"],
  hash: ["haschisch", "konzentrate"],
  extrakt: ["konzentrate", "extraktion", "haschisch"],
  oel: ["oel", "konzentrate", "extraktion"],
  // Medizin / CBD
  cbd: ["cbd", "medizin", "cannabidiol"],
  thc: ["thc", "wirkung", "psychoaktiv"],
  medizin: ["medizin", "cannabis", "therapie"],
  therapie: ["medizin", "therapie"],
  schmerz: ["medizin", "schmerzen", "therapie"],
  angst: ["medizin", "angst", "cbd"],
  // Qualität / Labor
  labor: ["qualitaet", "laborwerte", "coa", "test"],
  test: ["laborwerte", "qualitaet", "coa"],
  coa: ["laborwerte", "qualitaet", "zertifikat"],
  qualitaet: ["qualitaet", "labor", "coa"],
  // Schädlinge
  schaedlinge: ["schaedlinge", "pilz", "spinnmilben"],
  spinnmilben: ["schaedlinge", "milben"],
  milben: ["schaedlinge", "spinnmilben"],
  pilz: ["schaedlinge", "mykose", "pilz"],
  // Markt / Recht
  recht: ["recht", "gesetz", "legal"],
  legal: ["recht", "gesetz"],
  preis: ["markt", "preis", "kosten"],
  guenstig: ["budget", "preis", "markt"],
  // Substrat / Medium
  erde: ["substrat", "erde", "boden"],
  substrat: ["substrat", "erde", "medium"],
  coco: ["coco", "substrat", "medium"],
  hydro: ["hydroponik", "substrat", "wasser"],
};

function expandQuery(tokens: string[]): string[] {
  const expanded = new Set<string>(tokens);
  for (const token of tokens) {
    const syns = SYNONYM_MAP[token];
    if (syns) {
      for (const s of syns) {
        for (const t of tokenize(s)) {
          expanded.add(t);
        }
      }
    }
  }
  return Array.from(expanded);
}

// ─── Intent-Erkennung ─────────────────────────────────────────────────────────

type SearchIntent = "fertilizer" | "wiki" | "neutral";

const FERTILIZER_SIGNALS = new Set([
  "duenger", "duengen", "fertilizer", "npk", "ec", "naehrstoffe",
  "stickstoff", "phosphor", "kalium", "kali", "bloom", "veg", "boden",
  "coco", "hydro", "substrat", "ph", "leitfaehigkeit",
  "bio", "mineral", "organisch", "calcium", "magnesium",
]);

const WIKI_SIGNALS = new Set([
  "was", "wie", "warum", "wann", "wo", "welche", "erklaer",
  "grundlagen", "guide", "leitfaden", "artikel", "wissen",
  "recht", "gesetz", "medizin", "therapie", "genetik",
  "terpene", "konzentrate", "haschisch", "konsumformen",
]);

function detectIntent(tokens: string[], rawQuery: string): SearchIntent {
  const normQuery = normalize(rawQuery);
  let fertilizerHits = 0;
  let wikiHits = 0;
  for (const t of tokens) {
    if (FERTILIZER_SIGNALS.has(t)) fertilizerHits++;
    if (WIKI_SIGNALS.has(t)) wikiHits++;
  }
  // Fragezeichen-Intent → Wiki
  if (normQuery.includes("?") || /^(wie|was|warum|welche)/i.test(normQuery)) return "wiki";
  if (fertilizerHits > wikiHits) return "fertilizer";
  if (wikiHits > fertilizerHits) return "wiki";
  return "neutral";
}

// ─── Score-Berechnung ─────────────────────────────────────────────────────────

function scoreToken(docToken: string, queryToken: string): number {
  if (docToken === queryToken) return 100;
  if (docToken.startsWith(queryToken)) return 70;
  if (docToken.includes(queryToken)) return 40;
  if (fuzzyMatch(docToken, queryToken)) return 20;
  return 0;
}

function fuzzyMatch(a: string, b: string): boolean {
  if (b.length < 4) return false; // kein Fuzzy bei kurzen Tokens
  if (Math.abs(a.length - b.length) > 3) return false;
  let matches = 0;
  const range = Math.floor(Math.max(a.length, b.length) / 2) - 1;
  for (let i = 0; i < a.length; i++) {
    const start = Math.max(0, i - range);
    const end = Math.min(b.length, i + range + 1);
    if (b.slice(start, end).includes(a[i] ?? "")) matches++;
  }
  const ratio = matches / a.length;
  return ratio >= 0.78;
}

function scoreField(
  fieldTokens: string[],
  queryTokens: string[],
  weight: number,
  positionBonus = false
): number {
  let fieldScore = 0;
  for (let qi = 0; qi < queryTokens.length; qi++) {
    const qt = queryTokens[qi]!;
    let bestMatch = 0;
    let bestPos = fieldTokens.length;
    for (let fi = 0; fi < fieldTokens.length; fi++) {
      const s = scoreToken(fieldTokens[fi]!, qt);
      if (s > bestMatch) {
        bestMatch = s;
        bestPos = fi;
      }
    }
    let tokenScore = bestMatch;
    // Positions-Bonus: je früher im Feld, desto mehr Bonus
    if (positionBonus && tokenScore > 0 && bestPos <= 2) {
      tokenScore *= 1.0 + (0.5 - bestPos * 0.15);
    }
    fieldScore += tokenScore;
  }
  return (fieldScore / queryTokens.length) * weight;
}

function buildHighlight(text: string, queryTokens: string[]): string {
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
  if (snippet.length > 220) {
    const idx = snippet.indexOf("**");
    const start = Math.max(0, idx - 60);
    return (start > 0 ? "…" : "") + snippet.slice(start, start + 220) + "…";
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
  _titleTokens: string[];
  _tagTokens: string[];
  _descTokens: string[];
  _subtitleTokens: string[];
  _normalizedTitle: string;
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
      ...(article.simpleExplainers?.map((e) => `${e.title} ${e.text}`) ?? []),
      ...(article.faq?.map((f) => `${f.question} ${f.answer}`) ?? []),
      ...(article.sections?.flatMap((s) => [s.heading, ...s.content]) ?? []),
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
      url: `/studies/${article.slug}`,
      tags: article.tags,
      badge: difficultyBadges[article.difficulty],
      badgeColor: difficultyColors[article.difficulty],
      _titleTokens: tokenize(article.title),
      _tagTokens: [...article.tags.flatMap(tokenize), ...tokenize(catLabel)],
      _descTokens: tokenize(descParts),
      _subtitleTokens: tokenize(catLabel),
      _normalizedTitle: normalize(article.title),
    });

    // Glossar-Einträge
    if (article.glossary) {
      for (const g of article.glossary) {
        docs.push({
          id: `glossary:${article.slug}:${g.term}`,
          kind: "glossary",
          title: g.term,
          subtitle: `Glossar · ${article.title}`,
          description: g.definition,
          url: `/studies/${article.slug}#glossar`,
          tags: [article.category, "Glossar"],
          badge: "Glossar",
          badgeColor: "text-teal-700 bg-teal-100",
          _titleTokens: tokenize(g.term),
          _tagTokens: tokenize(article.category),
          _descTokens: tokenize(g.definition),
          _subtitleTokens: tokenize(article.title),
          _normalizedTitle: normalize(g.term),
        });
      }
    }
  }

  // 2. Dünger
  const costLabels: Record<string, string> = {
    budget: "Budget", mid: "Mittel", premium: "Premium",
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
    const phasesStr = f.phase.map((p) => phaseLabels[p] ?? p).join(", ");
    const descFull = [
      f.description,
      `NPK ${f.npk.n}-${f.npk.p}-${f.npk.k}`,
      `EC ${f.ec_range.min}–${f.ec_range.max} ${f.ec_range.unit}`,
      phasesStr,
      f.base,
      f.format,
      ...(f.micronutrients ?? []),
      ...f.tags,
    ].join(" ");

    docs.push({
      id: `fertilizer:${f.id}`,
      kind: "fertilizer",
      title: `${f.name}`,
      subtitle: `${f.brand} · ${phasesStr} · ${f.format}`,
      description: f.description,
      url: `/database/fertilizers#${f.id}`,
      tags: f.tags,
      badge: costLabels[f.cost],
      badgeColor: costColors[f.cost],
      _titleTokens: tokenize(f.name),
      _tagTokens: tokenize([...f.tags, f.brand, f.base, f.format, phasesStr].join(" ")),
      _descTokens: tokenize(descFull),
      _subtitleTokens: tokenize(f.brand),
      _normalizedTitle: normalize(f.name),
    });
  }

  // 3. Quellen
  for (const src of sourceRegister) {
    const tags = ["Wissenschaft", "Quelle", ...(src.matchedTopics ?? [])];
    docs.push({
      id: `source:${src.id}`,
      kind: "source",
      title: src.title,
      subtitle: `${src.publisher} · ${src.year}`,
      description: `Peer-reviewed Quelle – ${src.publisher} (${src.year})`,
      url: src.url,
      tags,
      badge: src.year,
      badgeColor: "text-slate-700 bg-slate-100",
      _titleTokens: tokenize(src.title),
      _tagTokens: tokenize([src.publisher, ...(src.matchedTopics ?? [])].join(" ")),
      _descTokens: tokenize(src.title + " " + src.publisher),
      _subtitleTokens: tokenize(src.publisher),
      _normalizedTitle: normalize(src.title),
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
  if (!query || query.length < 1) return emptyResponse(rawQuery);

  const baseTokens = tokenize(query);
  if (baseTokens.length === 0) return emptyResponse(rawQuery);

  // Synonym-Expansion
  const queryTokens = expandQuery(baseTokens);

  // Intent
  const intent = detectIntent(baseTokens, query);

  const normQuery = normalize(query);
  const index = buildSearchIndex();
  const scored: (SearchResult & { _rawScore: number })[] = [];

  for (const doc of index) {
    if (kinds && !kinds.includes(doc.kind)) continue;

    // Intent-Filter: stark priorisieren, aber nicht hart ausschließen
    let intentMultiplier = 1.0;
    if (intent === "fertilizer") {
      intentMultiplier = doc.kind === "fertilizer" ? 1.5 : doc.kind === "wiki" ? 0.7 : 0.4;
    } else if (intent === "wiki") {
      intentMultiplier = doc.kind === "wiki" || doc.kind === "glossary" ? 1.4 : 0.6;
    }

    const titleScore  = scoreField(doc._titleTokens, queryTokens, 12, true);
    const tagScore    = scoreField(doc._tagTokens, queryTokens, 7);
    const subtitleScore = scoreField(doc._subtitleTokens, queryTokens, 4);
    const descScore   = scoreField(doc._descTokens, queryTokens, 2);

    // Bonus: alle base-tokens treffen den Titel
    const fullTitleMatch = baseTokens.every((qt) =>
      doc._titleTokens.some((ft) => ft.startsWith(qt) || ft === qt)
    );

    // Bonus: exakter Phrase-Match im normalisierten Titel
    const phraseBonus = doc._normalizedTitle.includes(normQuery) ? 50 : 0;

    // Vollständigkeits-Bonus: verhältnis der query-tokens die irgendwo matchen
    const coveredTokens = queryTokens.filter((qt) =>
      doc._titleTokens.some((ft) => scoreToken(ft, qt) > 0) ||
      doc._tagTokens.some((ft) => scoreToken(ft, qt) > 0) ||
      doc._descTokens.some((ft) => scoreToken(ft, qt) > 0)
    ).length;
    const coverageBonus = queryTokens.length > 1
      ? (coveredTokens / queryTokens.length) * 15
      : 0;

    const rawScore = (
      titleScore + tagScore + subtitleScore + descScore +
      (fullTitleMatch ? 30 : 0) +
      phraseBonus +
      coverageBonus
    ) * intentMultiplier;

    if (rawScore < minScore) continue;

    scored.push({
      id: doc.id,
      kind: doc.kind,
      title: doc.title,
      subtitle: doc.subtitle,
      description: doc.description,
      url: doc.url,
      score: Math.min(100, Math.round(rawScore)),
      tags: doc.tags,
      highlight: buildHighlight(doc.description, baseTokens),
      badge: doc.badge,
      badgeColor: doc.badgeColor,
      _rawScore: rawScore,
    });
  }

  scored.sort((a, b) => b._rawScore - a._rawScore);
  const results = scored.slice(0, limit).map(({ _rawScore, ...r }) => r);

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
  const expanded = expandQuery(tokenize(prefix));
  const index = buildSearchIndex();
  const seen = new Set<string>();
  const results: string[] = [];

  for (const doc of index) {
    // Titel-Prefix-Match hat Priorität
    if (doc._normalizedTitle.startsWith(norm) && !seen.has(doc.title)) {
      seen.add(doc.title);
      results.push(doc.title);
    }
    if (results.length >= limit) break;
  }

  // Dann Synonyme / Token-Matches
  if (results.length < limit) {
    for (const doc of index) {
      for (const token of [...doc._titleTokens, ...doc._tagTokens]) {
        if (expanded.some((eq) => token.startsWith(eq) && token !== eq) && !seen.has(doc.title)) {
          seen.add(doc.title);
          results.push(doc.title);
          break;
        }
      }
      if (results.length >= limit) break;
    }
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
    hash: "Haschisch",
    hasch: "Haschisch",
    thc: "THC Wirkung",
    cbd: "CBD Medizin",
    dunger: "Dünger",
    duengen: "Dünger EC",
    gras: "Cannabis Grundlagen",
    weed: "Cannabis Grundlagen",
    licht: "PPFD Licht",
    bluete: "Blüte Nährstoffe",
    ernte: "Ernte Trocknen",
    mangel: "Nährstoffmängel",
    pilz: "Schädlinge",
    milben: "Schädlinge",
  };
  const norm = normalize(query);
  const found = corrections[norm];
  if (found) return [found];
  // Synonyme nutzen um Vorschläge zu bauen
  const tokens = tokenize(query);
  const expanded = expandQuery(tokens);
  if (expanded.length > tokens.length) {
    return [`Tipp: Versuche "${expanded.slice(0, 2).join(" ")}"`, "Wiki durchsuchen", "Dünger Katalog"];
  }
  return ["Wiki durchsuchen", "Dünger Katalog", "VPD", "EC Dosierung"];
}
