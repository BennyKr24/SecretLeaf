'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import { categoryLabels, difficultyLabels } from "@/lib/wiki/constants";
import type { TerpiraArticle, TerpiraSource, TerpiraCategory } from "@/lib/terpira/types";

type RelatedArticle = {
  slug: string;
  title: string;
  summary: string;
  category: TerpiraCategory;
};

type ArticleApiResponse = {
  article: TerpiraArticle;
  sources: TerpiraSource[];
  related: RelatedArticle[];
};

export default function WikiArticlePage() {
  const params = useParams();
  const slug = typeof params.slug === "string" ? params.slug : "";

  const [data, setData] = useState<ArticleApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFoundError, setNotFoundError] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setNotFoundError(false);
    setError(null);
    fetch(`/api/wiki/${slug}`, { cache: "no-store" })
      .then(async (res) => {
        if (res.status === 404) { setNotFoundError(true); return null; }
        if (!res.ok) throw new Error("Fehler beim Laden des Artikels");
        return res.json() as Promise<ArticleApiResponse>;
      })
      .then((json) => { if (json) setData(json); })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Unbekannter Fehler"))
      .finally(() => setLoading(false));
  }, [slug]);

  if (notFoundError) notFound();

  if (loading) {
    return (
      <main className="min-h-screen px-6 py-12">
        <article className="mx-auto max-w-6xl space-y-6">
          <div className="animate-pulse rounded-2xl border border-[#d8e8dd] bg-white/90 p-8 shadow-sm">
            <div className="h-4 bg-[#e2eee6] rounded w-32 mb-4" />
            <div className="h-10 bg-[#e2eee6] rounded w-3/4 mb-3" />
            <div className="h-5 bg-[#e2eee6] rounded w-1/2" />
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 bg-[#e2eee6] rounded-xl" />)}
            </div>
          </div>
        </article>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen px-6 py-12">
        <div className="mx-auto max-w-6xl rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
          <p className="text-lg font-semibold text-red-700">Artikel konnte nicht geladen werden</p>
          <p className="mt-2 text-sm text-red-600">{error}</p>
          <Link href="/wiki" className="mt-4 inline-flex rounded-lg bg-[#1f7a4f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#17613f]">
            Zurueck zum Wiki
          </Link>
        </div>
      </main>
    );
  }

  if (!data) return null;

  const { article, sources: articleSources, related: relatedArticles } = data;

  const simpleExplainers = article.simpleExplainers ?? [
    {
      title: "Einfach erklaert",
      text: article.keyTakeaways[0] ?? "Dieser Artikel ordnet das Thema kompakt und strukturiert ein."
    },
    {
      title: "Warum relevant?",
      text: article.keyTakeaways[1] ?? "Die Inhalte helfen bei konsistenten Entscheidungen in Qualitaet und Risiko."
    }
  ];

  return (
    <main className="min-h-screen px-6 py-12">
      <article className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-2xl border border-[#d8e8dd] bg-white/90 p-8 shadow-sm">
          <Link href="/wiki" className="text-sm font-semibold text-[#1f7a4f] hover:text-[#17613f]">
            ← Zurueck zum Wiki
          </Link>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="inline-flex rounded-full bg-[#edf6f0] px-3 py-1 text-xs font-semibold text-[#1f7a4f]">
              {categoryLabels[article.category]}
            </span>
            <span className="inline-flex rounded-full bg-[#f4faf6] px-3 py-1 text-xs font-semibold text-[#355b49]">
              {difficultyLabels[article.difficulty]}
            </span>
            <span className="inline-flex rounded-full bg-[#f4faf6] px-3 py-1 text-xs font-semibold text-[#355b49]">
              {article.readMinutes} Min
            </span>
          </div>

          <h1 className="mt-3 text-4xl font-bold text-[#10281e]">{article.title}</h1>
          <p className="mt-3 text-[#4d685a]">{article.summary}</p>

          <div className="mt-3 text-xs text-[#6a8376]">Aktualisiert: {article.lastUpdated}</div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {article.quickFacts.map((fact) => (
              <div key={fact.label} className="rounded-xl border border-[#e2eee6] bg-[#f7fbf8] p-3">
                <p className="text-xs uppercase tracking-wide text-[#5f7a6b]">{fact.label}</p>
                <p className="mt-1 text-sm font-semibold text-[#123024]">{fact.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-xl border border-[#d8e8dd] bg-[#f7fbf8] p-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[#1f7a4f]">Kernpunkte</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[#355b49]">
              {article.keyTakeaways.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          {article.warnings && article.warnings.length > 0 && (
            <div className="mt-5 rounded-xl border border-[#ead5a3] bg-[#fff8e7] p-4">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-[#9b7a2c]">Hinweis</h2>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[#6d551f]">
                {article.warnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.55fr_0.95fr]">
          <div className="rounded-2xl border border-[#d8e8dd] bg-white/90 p-8 shadow-sm">
            <h2 className="text-2xl font-semibold text-[#123024]">Inhalt</h2>

            <div className="mt-4 rounded-xl border border-[#e2eee6] bg-[#f7fbf8] p-4">
              <p className="text-sm font-semibold uppercase tracking-wide text-[#1f7a4f]">Inhaltsverzeichnis</p>
              <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-[#355b49]">
                {article.sections.map((section, index) => (
                  <li key={section.heading}>
                    <a href={`#section-${index + 1}`} className="hover:text-[#1f7a4f]">
                      {section.heading}
                    </a>
                  </li>
                ))}
              </ol>
            </div>

            <div className="mt-6 space-y-8">
              {article.sections.map((section, index) => (
                <section id={`section-${index + 1}`} key={section.heading} className="space-y-3 scroll-mt-28">
                  <h3 className="text-xl font-semibold text-[#123024]">{section.heading}</h3>

                  <div className="space-y-3 text-base leading-7 text-[#173126]">
                    {section.content.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>

                  {section.checklist && section.checklist.length > 0 && (
                    <div className="rounded-xl border border-[#e2eee6] bg-[#f7fbf8] p-4">
                      <p className="text-sm font-semibold text-[#1f7a4f]">Checkliste</p>
                      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[#355b49]">
                        {section.checklist.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </section>
              ))}
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-2xl border border-[#d8e8dd] bg-white/90 p-6 shadow-sm lg:sticky lg:top-24">
              <h2 className="text-lg font-semibold text-[#123024]">Einfach erklaert</h2>
              <div className="mt-4 space-y-3">
                {simpleExplainers.map((box) => (
                  <div key={box.title} className="rounded-xl border border-[#e2eee6] bg-[#f7fbf8] p-4">
                    <p className="text-sm font-semibold text-[#1f7a4f]">{box.title}</p>
                    <p className="mt-1 text-sm text-[#355b49]">{box.text}</p>
                  </div>
                ))}
              </div>

              {article.glossary && article.glossary.length > 0 && (
                <div className="mt-5">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-[#1f7a4f]">Glossar</h3>
                  <div className="mt-2 space-y-2">
                    {article.glossary.map((item) => (
                      <div key={item.term} className="rounded-lg border border-[#e2eee6] bg-[#fbfefc] p-3">
                        <p className="text-sm font-semibold text-[#123024]">{item.term}</p>
                        <p className="mt-1 text-sm text-[#4d685a]">{item.definition}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-5 rounded-xl border border-[#e2eee6] bg-[#f7fbf8] p-4">
                <p className="text-sm font-semibold text-[#1f7a4f]">Quellenhinweis</p>
                <p className="mt-1 text-sm text-[#355b49]">
                  Die wichtigsten Referenzen stehen unten im Quellenabschnitt oder gesammelt im
                  <Link href="/wiki/quellen" className="font-semibold text-[#1f7a4f] hover:text-[#17613f]"> Quellenregister</Link>.
                </p>
              </div>
            </div>
          </aside>
        </div>

        {article.faq && article.faq.length > 0 && (
          <div className="rounded-2xl border border-[#d8e8dd] bg-white/90 p-8 shadow-sm">
            <h2 className="text-2xl font-semibold text-[#123024]">FAQ</h2>
            <div className="mt-4 space-y-3">
              {article.faq.map((item) => (
                <details key={item.question} className="rounded-xl border border-[#e2eee6] bg-[#fbfefc] p-4">
                  <summary className="cursor-pointer text-sm font-semibold text-[#123024]">{item.question}</summary>
                  <p className="mt-2 text-sm leading-6 text-[#4d685a]">{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        )}

        {articleSources.length > 0 && (
          <div className="rounded-2xl border border-[#d8e8dd] bg-white/90 p-8 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-2xl font-semibold text-[#123024]">Quellen</h2>
              <Link href="/wiki/quellen" className="text-sm font-semibold text-[#1f7a4f] hover:text-[#17613f]">
                Gesamtregister ansehen
              </Link>
            </div>
            <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-[#355b49]">
              {articleSources.map((source) => (
                <li key={source.id}>
                  <span className="font-semibold text-[#123024]">{source.title}</span>
                  <span> - {source.publisher} ({source.year}) · </span>
                  <a href={source.url} target="_blank" rel="noreferrer" className="font-semibold text-[#1f7a4f] hover:text-[#17613f]">
                    Quelle
                  </a>
                </li>
              ))}
            </ol>
          </div>
        )}

        {relatedArticles.length > 0 && (
          <div className="rounded-2xl border border-[#d8e8dd] bg-white/90 p-8 shadow-sm">
            <h2 className="text-2xl font-semibold text-[#123024]">Verwandte Artikel</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {relatedArticles.map((entry) => (
                <Link
                  key={entry.slug}
                  href={`/wiki/${entry.slug}`}
                  className="rounded-xl border border-[#e2eee6] bg-[#fbfefc] p-4 transition hover:bg-[#f5faf7]"
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#1f7a4f]">
                    {categoryLabels[entry.category]}
                  </p>
                  <p className="mt-1 text-base font-semibold text-[#123024]">{entry.title}</p>
                  <p className="mt-2 text-sm text-[#4d685a]">{entry.summary}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="rounded-2xl border border-[#d8e8dd] bg-white/90 p-6 text-sm text-[#4d685a] shadow-sm">
          Redaktioneller Hinweis: Inhalte dienen der Wissensvermittlung. Regionale Rechtslage,
          medizinische Fragen und regulatorische Anforderungen muessen immer separat geprueft werden.
        </div>
      </article>
    </main>
  );
}
