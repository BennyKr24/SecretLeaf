// ────────────────────────────────────────────────────────────────────────────
// GET /api/glossary?term=EC&term=EC-Wert&locale=de
//
// One definition from the wiki glossaries (single source of truth — the
// cockpit explains EC, pH … with the same text the articles use). Exact,
// case-insensitive term match; beginner articles (tutorials first) win so the
// wording fits first-time growers. Served from here so the client never loads the full
// wiki or the 2 MB EN translation memory just to explain a label.
// ────────────────────────────────────────────────────────────────────────────

import type { NextRequest } from 'next/server';
import { wikiArticles } from '@/data/terpira/wiki';
import { localizeArticle } from '@/lib/i18n/localizeContent';

const DIFFICULTY_RANK: Record<string, number> = { einsteiger: 0, fortgeschritten: 1, profi: 2 };

export async function GET(req: NextRequest) {
  const terms = req.nextUrl.searchParams.getAll('term').map((t) => t.trim().toLowerCase()).filter(Boolean).slice(0, 5);
  const locale = req.nextUrl.searchParams.get('locale') === 'en' ? 'en' : 'de';
  if (terms.length === 0) return Response.json({ error: "Missing 'term'" }, { status: 400 });

  // Earlier terms in the list are preferred (e.g. "pH-Wert" before "pH").
  let best: { rank: number; term: string; definition: string; slug: string } | null = null;
  for (const article of wikiArticles) {
    for (const item of article.glossary ?? []) {
      const termIndex = terms.indexOf(item.term.trim().toLowerCase());
      if (termIndex === -1) continue;
      const rank = termIndex * 10 + (DIFFICULTY_RANK[article.difficulty] ?? 3) * 2 + (article.category === 'tutorials' ? 0 : 1);
      if (!best || rank < best.rank) best = { rank, term: item.term, definition: item.definition, slug: article.slug };
    }
  }
  if (!best) return Response.json({ error: 'Not found' }, { status: 404 });

  const { term, definition } = localizeArticle({ term: best.term, definition: best.definition }, locale);
  return Response.json(
    { term, definition, slug: best.slug },
    { headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=86400' } },
  );
}
