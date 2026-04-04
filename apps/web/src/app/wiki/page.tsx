'use client';

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { categoryLabels, difficultyLabels, orderedCategories } from "@/lib/wiki/constants";
import type { TerpiraArticle } from "@/lib/terpira/types";

type WikiStats = {
  totalArticles: number;
  totalSources: number;
  autoSources: number;
  totalReadMinutes: number;
};

type WikiApiResponse = {
  articles: TerpiraArticle[];
  stats: WikiStats;
};

export default function WikiPage() {
  const [data, setData] = useState<WikiApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadWikiData = () => {
    setError(null);
    setLoading(true);
    fetch("/api/wiki")
      .then((res) => {
        if (!res.ok) throw new Error("Fehler beim Laden der Wiki-Daten");
        return res.json() as Promise<WikiApiResponse>;
      })
      .then(setData)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Unbekannter Fehler"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadWikiData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const articles = data?.articles ?? [];
  const stats = data?.stats;

  const starterArticles = useMemo(() => articles.filter((a) => a.difficulty === "einsteiger"), [articles]);
  const advancedArticles = useMemo(() => articles.filter((a) => a.difficulty === "fortgeschritten"), [articles]);
  const profiArticles = useMemo(() => articles.filter((a) => a.difficulty === "profi"), [articles]);
  const avgSourcesPerArticle = useMemo(
    () =>
      articles.length > 0
        ? (articles.reduce((sum, a) => sum + (a.sourceIds?.length ?? 0), 0) / articles.length).toFixed(1)
        : "0",
    [articles]
  );

  const articlesByCategory = useMemo(() => {
    const map = new Map<string, TerpiraArticle[]>();
    for (const article of articles) {
      const list = map.get(article.category) ?? [];
      list.push(article);
      map.set(article.category, list);
    }
    return map;
  }, [articles]);

  if (loading) {
    return (
      <main className="min-h-screen px-6 py-12 bg-gradient-to-br from-[#f7fbf8] via-white to-[#eef7f1]">
        <div className="mx-auto max-w-6xl">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-[#e2eee6] rounded-full w-64" />
            <div className="h-12 bg-[#e2eee6] rounded-lg w-96" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-28 bg-[#e2eee6] rounded-2xl" />
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen px-6 py-12 bg-gradient-to-br from-[#f7fbf8] via-white to-[#eef7f1]">
        <div className="mx-auto max-w-6xl rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
          <p className="text-lg font-semibold text-red-700">Wiki konnte nicht geladen werden</p>
          <p className="mt-2 text-sm text-red-600">{error}</p>
          <button
            onClick={loadWikiData}
            className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
          >
            Nochmal versuchen
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-6 py-12 bg-gradient-to-br from-[#f7fbf8] via-white to-[#eef7f1]">
      <section className="mx-auto max-w-6xl">
        <div className="flex items-center gap-3">
          <p className="inline-flex rounded-full border border-[#c8ddcf] bg-[#eef7f1] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#1f7a4f]">
            Terpira x SecretLeaf
          </p>
          <p className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-700">
            {stats?.totalSources ?? "–"} Wissenschaftliche Quellen
          </p>
          <p className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
            {stats?.autoSources ?? "–"} Auto-Studien
          </p>
        </div>
        
        <h1 className="mt-4 text-5xl font-bold text-[#10281e]">Cannabis Wiki Hub</h1>
        <p className="mt-3 max-w-3xl text-lg text-[#4d685a]">
          Strukturierte Leitfaeden mit Kernpunkten, Checklisten und wissenschaftlichen Quellen.
          Keine Spekulationen – nur Fakten, Evidenz und best practices. 
        </p>
        <div className="mt-4 flex gap-3">
          <Link href="/wiki" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-700 font-semibold transition">
            📚 Wiki Hub
          </Link>
          <Link href="/fertilizers" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-700 font-semibold transition">
            🌿 50+ Dünger Katalog
          </Link>
        </div>

        {/* === STATISTIK CARDS === */}
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-2xl border border-[#d8e8dd] bg-white/95 p-5 shadow-md hover:shadow-lg transition-shadow">
            <p className="text-xs uppercase tracking-wide text-[#5f7a6b] font-semibold">Artikel</p>
            <p className="mt-2 text-4xl font-bold text-[#123024]">{stats?.totalArticles ?? "–"}</p>
            <p className="mt-1 text-xs text-[#5f7a6b]">verfügbar</p>
          </div>
          
          <div className="rounded-2xl border border-[#d8e8dd] bg-white/95 p-5 shadow-md hover:shadow-lg transition-shadow">
            <p className="text-xs uppercase tracking-wide text-[#5f7a6b] font-semibold">Kategorien</p>
            <p className="mt-2 text-4xl font-bold text-[#123024]">{orderedCategories.length}</p>
            <p className="mt-1 text-xs text-[#5f7a6b]">Wissensgebiete</p>
          </div>
          
          <div className="rounded-2xl border border-cyan-200 bg-cyan-50/80 p-5 shadow-md hover:shadow-lg transition-shadow">
            <p className="text-xs uppercase tracking-wide text-cyan-700 font-semibold">Quellen</p>
            <p className="mt-2 text-4xl font-bold text-cyan-900">{stats?.totalSources ?? "–"}</p>
            <p className="mt-1 text-xs text-cyan-700">peer-reviewed</p>
          </div>
          
          <div className="rounded-2xl border border-[#d8e8dd] bg-white/95 p-5 shadow-md hover:shadow-lg transition-shadow">
            <p className="text-xs uppercase tracking-wide text-[#5f7a6b] font-semibold">Lesezeit total</p>
            <p className="mt-2 text-4xl font-bold text-[#123024]">{stats?.totalReadMinutes ?? "–"}</p>
            <p className="mt-1 text-xs text-[#5f7a6b]">Minuten</p>
          </div>
          
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-5 shadow-md hover:shadow-lg transition-shadow">
            <p className="text-xs uppercase tracking-wide text-emerald-700 font-semibold">Ø Quellen/Artikel</p>
            <p className="mt-2 text-4xl font-bold text-emerald-900">{avgSourcesPerArticle}</p>
            <p className="mt-1 text-xs text-emerald-700">spezialisiert</p>
          </div>
        </div>

        {/* === DIFFICULTY BREAKDOWN === */}
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border-2 border-[#e8f0ea] bg-gradient-to-br from-[#f7fbf8] to-white p-6">
            <div className="inline-block rounded-lg bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
              Anfänger
            </div>
            <p className="mt-3 text-3xl font-bold text-[#123024]">{starterArticles.length}</p>
            <p className="mt-1 text-sm text-[#5f7a6b]">Einstiegsartikel</p>
            <p className="mt-3 text-xs text-[#4d685a]">
              Perfekt zum Start: {starterArticles.map((a) => a.readMinutes).reduce((a, b) => a + b, 0)} Min gesamt
            </p>
          </div>

          <div className="rounded-2xl border-2 border-[#e8f0ea] bg-gradient-to-br from-[#f7fbf8] to-white p-6">
            <div className="inline-block rounded-lg bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-700">
              Fortgeschritten
            </div>
            <p className="mt-3 text-3xl font-bold text-[#123024]">{advancedArticles.length}</p>
            <p className="mt-1 text-sm text-[#5f7a6b]">Fachtiefe-Artikel</p>
            <p className="mt-3 text-xs text-[#4d685a]">
              Vertiefung: {advancedArticles.map((a) => a.readMinutes).reduce((a, b) => a + b, 0)} Min gesamt
            </p>
          </div>

          <div className="rounded-2xl border-2 border-[#e8f0ea] bg-gradient-to-br from-[#f7fbf8] to-white p-6">
            <div className="inline-block rounded-lg bg-purple-100 px-3 py-1 text-sm font-semibold text-purple-700">
              Profi
            </div>
            <p className="mt-3 text-3xl font-bold text-[#123024]">{profiArticles.length}</p>
            <p className="mt-1 text-sm text-[#5f7a6b]">Expertenartikel</p>
            <p className="mt-3 text-xs text-[#4d685a]">
              Mastery: {profiArticles.map((a) => a.readMinutes).reduce((a, b) => a + b, 0)} Min gesamt
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-[#d8e8dd] bg-white/90 p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-[#123024]">🎯 Lernpfade</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
              <h3 className="text-sm font-semibold text-blue-900">Path A: Starter Essentials</h3>
              <p className="mt-2 text-xs text-blue-800">Anbau-Basics, VPD, Konsumformen, COA-Grundlagen, Evidenz.</p>
              <div className="mt-3 space-y-1">
                <p className="text-xs text-blue-700">→ cannabis-anbau-grundlagen</p>
                <p className="text-xs text-blue-700">→ vpd-einfach-erklaert</p>
                <p className="text-xs text-blue-700">→ coa-richtig-lesen</p>
              </div>
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <h3 className="text-sm font-semibold text-amber-900">Path B: Qualitaet & Chemie</h3>
              <p className="mt-2 text-xs text-amber-800">Terpene, Curing, Konzentrate, Sicherheit, Kontaminanten.</p>
              <div className="mt-3 space-y-1">
                <p className="text-xs text-amber-700">→ terpene-und-wirkprofil</p>
                <p className="text-xs text-amber-700">→ wasseraktivitaet-und-curing</p>
                <p className="text-xs text-amber-700">→ pgr-und-kontaminanten</p>
              </div>
            </div>
            <div className="rounded-xl border border-purple-200 bg-purple-50 p-4">
              <h3 className="text-sm font-semibold text-purple-900">Path C: Operations & Recht</h3>
              <p className="mt-2 text-xs text-purple-800">Recht, Markttransparenz, Genetik, Profi-Tools, Systemsteuerung.</p>
              <div className="mt-3 space-y-1">
                <p className="text-xs text-purple-700">→ rechtliche-grundlagen-dach</p>
                <p className="text-xs text-purple-700">→ genetik-und-phaenotyp-selektion</p>
                <p className="text-xs text-purple-700">→ vpd-und-ec-kombi-rechner-guide</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-[#d8e8dd] bg-white/90 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#123024]">📖 So nutzt du das Wiki</h2>
            <ul className="mt-3 space-y-2 text-sm text-[#4d685a]">
              <li className="flex gap-2"><span className="text-[#1f7a4f] font-bold">1.</span> Starte mit den Kernpunkten in jedem Artikel</li>
              <li className="flex gap-2"><span className="text-[#1f7a4f] font-bold">2.</span> Nutze Erklaerboxen fuer schnelle Konzepte</li>
              <li className="flex gap-2"><span className="text-[#1f7a4f] font-bold">3.</span> Vertiefe mit FAQ und Glossar</li>
              <li className="flex gap-2"><span className="text-[#1f7a4f] font-bold">4.</span> Nutze Quellenlinks fuer Originalpapers</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-cyan-200 bg-cyan-50/80 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-cyan-900">🔬 Quellenbasiert & Evidenzgeleitet</h2>
            <p className="mt-3 text-sm text-cyan-800">
              Alle Artikel sind mit peer-reviewed Fachjournalen, WHO-Standards und internationalen Laborrichtlinien verlinkt.
              {stats ? ` ${stats.totalSources} hochwertige Quellen.` : ""}
            </p>
            <Link
              href="/wiki/quellen"
              className="mt-4 inline-flex rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-700 transition-colors"
            >
              Alle Quellen ansehen
            </Link>
          </div>
        </div>

        <div className="mt-10 space-y-8">
          {orderedCategories.map((category) => {
            const entries = articlesByCategory.get(category) ?? [];
            if (entries.length === 0) return null;

            return (
              <section key={category} className="rounded-2xl border border-[#d8e8dd] bg-white/90 p-6 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-2xl font-semibold text-[#123024]">{categoryLabels[category]}</h2>
                  <span className="rounded-full bg-[#edf6f0] px-3 py-1 text-xs font-semibold text-[#1f7a4f]">
                    {entries.length} Artikel
                  </span>
                </div>

                <div className="mt-5 grid gap-5 md:grid-cols-2">
                  {entries.map((article) => (
                    <article key={article.slug} className="rounded-xl border border-[#e2eee6] bg-[#fbfefc] p-5">
                      <div className="flex items-center justify-between gap-3">
                        <span className="rounded-full bg-[#edf6f0] px-2 py-1 text-xs font-semibold text-[#1f7a4f]">
                          {difficultyLabels[article.difficulty]}
                        </span>
                        <div className="flex gap-2 items-center">
                          <span className="text-xs text-[#5f7a6b]">{article.readMinutes} Min</span>
                          {article.sourceIds && article.sourceIds.length > 0 && (
                            <span className="text-xs bg-cyan-100 text-cyan-700 px-2 py-1 rounded font-semibold">
                              {article.sourceIds.length} Quellen
                            </span>
                          )}
                        </div>
                      </div>

                      <h3 className="mt-3 text-xl font-semibold text-[#123024]">{article.title}</h3>
                      <p className="mt-2 text-sm text-[#4d685a]">{article.summary}</p>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {article.tags.slice(0, 4).map((tag) => (
                          <span key={tag} className="rounded-md bg-[#f4faf6] px-2 py-1 text-xs text-[#355b49]">
                            {tag}
                          </span>
                        ))}
                      </div>

                      <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-[#355b49]">
                        {article.keyTakeaways.slice(0, 2).map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>

                      <Link
                        href={`/wiki/${article.slug}`}
                        className="mt-5 inline-flex rounded-lg bg-[#1f7a4f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#17613f]"
                      >
                        Artikel oeffnen
                      </Link>
                    </article>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        <div className="mt-10 rounded-2xl border border-[#d8e8dd] bg-white/90 p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-[#123024]">Hinweis zur Wissensbasis</h2>
          <p className="mt-2 text-sm text-[#4d685a]">
            Die Inhalte dienen Aufklaerung und Prozessverstaendnis. Sie sind kein Ersatz fuer
            medizinische, rechtliche oder regulatorische Beratung.
          </p>
        </div>
      </section>
    </main>
  );
}
