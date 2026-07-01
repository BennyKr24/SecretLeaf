"use client";

import { useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";
import type { Route } from "next";
import { sourceRegister } from "@/data/terpira/wiki";

export default function WikiSourcesPage() {
  const [query, setQuery] = useState("");
  const [sourceType, setSourceType] = useState<"alle" | "auto" | "manual">("alle");
  const [sortBy, setSortBy] = useState<"relevance" | "yearDesc" | "yearAsc">("relevance");
  const [copiedDoi, setCopiedDoi] = useState<string | null>(null);
  const autoCount = sourceRegister.filter((s) => s.sourceType === "auto").length;
  const manualCount = sourceRegister.length - autoCount;

  const publisherCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const src of sourceRegister) {
      map.set(src.publisher, (map.get(src.publisher) ?? 0) + 1);
    }
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sourceRegister.filter((src) => {
      if (sourceType !== "alle" && (src.sourceType ?? "manual") !== sourceType) {
        return false;
      }
      if (!q) return true;
      const hay = `${src.title} ${src.publisher} ${src.year} ${src.id} ${src.doi ?? ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [query, sourceType]);

  const groupedByPublisher = useMemo(() => {
    const groups = new Map<string, typeof filtered>();
    for (const src of filtered) {
      const key = src.publisher;
      const prev = groups.get(key) ?? [];
      prev.push(src);
      groups.set(key, prev);
    }
    const sortedGroups = Array.from(groups.entries()).sort((a, b) => b[1].length - a[1].length);

    if (sortBy === "yearDesc") {
      return sortedGroups.map(([publisher, sources]) => [
        publisher,
        [...sources].sort((a, b) => Number(b.year) - Number(a.year)),
      ] as const);
    }

    if (sortBy === "yearAsc") {
      return sortedGroups.map(([publisher, sources]) => [
        publisher,
        [...sources].sort((a, b) => Number(a.year) - Number(b.year)),
      ] as const);
    }

    return sortedGroups;
  }, [filtered, sortBy]);

  const copyDoi = async (doi: string) => {
    try {
      await navigator.clipboard.writeText(doi);
      setCopiedDoi(doi);
      window.setTimeout(() => setCopiedDoi((current) => (current === doi ? null : current)), 1800);
    } catch {
      setCopiedDoi(null);
    }
  };

  return (
    <main className="min-h-screen px-6 py-12">
      <section className="mx-auto max-w-6xl rounded-2xl border border-[#d8e8dd] bg-white/90 p-8 shadow-sm">
        <Link href={"/studies" as Route} className="text-sm font-semibold text-[#1f7a4f] hover:text-[#17613f]">
          ← Zurück zu Studien
        </Link>

        <h1 className="mt-4 text-4xl font-bold text-[#10281e]">Quellenregister</h1>
        <p className="mt-3 text-[#4d685a]">
          Alle wissenschaftlichen Quellen, auf die unsere Fachartikel verweisen – nach Herausgeber gruppiert.
        </p>

        <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-rose-700">Neuer Bereich</p>
          <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-rose-900">
              Jetzt verfügbar: das Schädlings-Lexikon mit Bildkarten, Kategorien, Risikobewertungen und Gegenmaßnahmen.
            </p>
            <Link
              href={"/studies/pests" as Route}
              className="inline-flex rounded-lg border border-rose-300 bg-white px-3 py-1.5 text-sm font-semibold text-rose-700 hover:bg-rose-100"
            >
              Schädlings-Lexikon öffnen
            </Link>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">Gesamt</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{sourceRegister.length}</p>
            <p className="text-xs text-slate-400">Quellen</p>
          </div>
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
            <p className="text-xs uppercase tracking-wide text-blue-700 font-semibold">Automatisch synchronisiert</p>
            <p className="mt-1 text-2xl font-bold text-blue-900">{autoCount}</p>
            <p className="text-xs text-blue-700">synchronisiert</p>
          </div>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-xs uppercase tracking-wide text-emerald-700 font-semibold">Redaktionell geprüft</p>
            <p className="mt-1 text-2xl font-bold text-emerald-900">{manualCount}</p>
            <p className="text-xs text-emerald-700">geprüfte Einträge</p>
          </div>
          <div className="rounded-xl border border-cyan-200 bg-cyan-50 p-4">
            <p className="text-xs uppercase tracking-wide text-cyan-700 font-semibold">Publisher</p>
            <p className="mt-1 text-2xl font-bold text-cyan-900">{publisherCounts.length}</p>
            <p className="text-xs text-cyan-700">verteilt</p>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-[#e2eee6] bg-[#f7fbf8] p-4 text-sm text-[#355b49]">
          Redaktioneller Hinweis: Dieses Register dient als strukturierte Orientierung für die evidenzbasierte
          Vertiefung. Vor operativen oder regulatorischen Entscheidungen sollten stets die aktuellen Originaldokumente geprüft werden.
        </div>

        <div className="mt-6 grid gap-3 lg:grid-cols-[1fr_auto_auto]">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Titel, Publisher, ID oder DOI durchsuchen..."
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "relevance" | "yearDesc" | "yearAsc")}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
          >
            <option value="relevance">Sortierung: Relevanz</option>
            <option value="yearDesc">Sortierung: Jahr (neu nach alt)</option>
            <option value="yearAsc">Sortierung: Jahr (alt nach neu)</option>
          </select>
          <div className="flex items-center gap-2">
            {([
              ["alle", "Alle"],
              ["manual", "Manuell"],
              ["auto", "Auto"],
            ] as const).map(([value, label]) => (
              <button
                key={value}
                onClick={() => setSourceType(value)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  sourceType === value
                    ? "bg-[#1f7a4f] text-white"
                    : "border border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:text-emerald-700"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {publisherCounts.slice(0, 10).map(([publisher, count]) => (
            <button
              key={publisher}
              onClick={() => setQuery(publisher)}
              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600 hover:border-cyan-300 hover:text-cyan-800"
            >
              {publisher} ({count})
            </button>
          ))}
        </div>

        <p className="mt-5 text-sm text-slate-500">
          <span className="font-semibold text-slate-900">{filtered.length}</span> Treffer in <span className="font-semibold text-slate-900">{groupedByPublisher.length}</span> Publisher-Gruppen
        </p>

        <div className="mt-4 space-y-6">
          {groupedByPublisher.map(([publisher, sources]) => (
            <section key={publisher} className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-bold text-[#123024]">{publisher}</h2>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                  {sources.length} Quellen
                </span>
              </div>

              <ol className="mt-3 list-decimal space-y-3 pl-5 text-sm text-[#355b49]">
                {sources.map((source) => (
                  <li key={source.id} className="rounded-xl border border-[#e2eee6] bg-[#fbfefc] p-4">
                    <p className="text-base font-semibold text-[#123024]">{source.title}</p>
                    <p className="mt-1 text-sm text-[#4d685a]">
                      {source.publisher} ({source.year})
                    </p>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {source.sourceType === "auto" && (
                        <p className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
                          Automatisch synchronisiert
                        </p>
                      )}
                      {(source.sourceType ?? "manual") === "manual" && (
                        <p className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                          Redaktionell geprüft
                        </p>
                      )}
                    </div>
                    <p className="mt-2 text-xs text-[#6a8376]">ID: {source.id}</p>
                    {source.doi && (
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <p className="text-xs text-[#6a8376]">DOI: {source.doi}</p>
                        <button
                          type="button"
                          onClick={() => copyDoi(source.doi as string)}
                          className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-600 hover:border-emerald-300 hover:text-emerald-700"
                        >
                          {copiedDoi === source.doi ? "Kopiert" : "DOI kopieren"}
                        </button>
                      </div>
                    )}
                    <a href={source.url} target="_blank" rel="noreferrer" className="mt-2 inline-flex text-sm font-semibold text-[#1f7a4f] hover:text-[#17613f]">
                      Zur Quelle
                    </a>
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-600">
            Keine Quellen für den aktuellen Filter gefunden. Versuche einen anderen Suchbegriff oder wechsle den Typfilter.
          </div>
        )}
      </section>
    </main>
  );
}
