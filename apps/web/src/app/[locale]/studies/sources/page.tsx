"use client";

import { useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";
import type { Route } from "next";
import { Dropdown, DropdownOption } from "@/components/ui/Dropdown";
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
      <section className="mx-auto max-w-6xl rounded-2xl border border-[#d8e8dd] bg-card/90 p-8 shadow-sm">
        <Link href={"/studies" as Route} className="text-sm font-semibold text-[#1f7a4f] hover:text-[#17613f]">
          ← Zurück zu Studien
        </Link>

        <h1 className="mt-4 text-4xl font-bold text-[#10281e]">Quellenregister</h1>
        <p className="mt-3 text-[#4d685a]">
          Alle wissenschaftlichen Quellen, auf die unsere Fachartikel verweisen – nach Herausgeber gruppiert.
        </p>

        <div className="mt-5 rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50 dark:bg-rose-950/30 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-rose-700 dark:text-rose-400">Neuer Bereich</p>
          <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-rose-900">
              Jetzt verfügbar: das Schädlings-Lexikon mit Bildkarten, Kategorien, Risikobewertungen und Gegenmaßnahmen.
            </p>
            <Link
              href={"/studies/pests" as Route}
              className="inline-flex rounded-lg border border-rose-300 bg-card px-3 py-1.5 text-sm font-semibold text-rose-700 dark:text-rose-400 hover:bg-rose-100 dark:bg-rose-950/40"
            >
              Schädlings-Lexikon öffnen
            </Link>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs uppercase tracking-wide text-muted-fg font-semibold">Gesamt</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{sourceRegister.length}</p>
            <p className="text-xs text-muted-fg">Quellen</p>
          </div>
          <div className="rounded-xl border border-blue-200 dark:border-blue-900/40 bg-blue-50 dark:bg-blue-950/30 p-4">
            <p className="text-xs uppercase tracking-wide text-blue-700 dark:text-blue-400 font-semibold">Automatisch synchronisiert</p>
            <p className="mt-1 text-2xl font-bold text-blue-900">{autoCount}</p>
            <p className="text-xs text-blue-700 dark:text-blue-400">synchronisiert</p>
          </div>
          <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50 dark:bg-emerald-950/30 p-4">
            <p className="text-xs uppercase tracking-wide text-emerald-700 dark:text-emerald-400 font-semibold">Redaktionell geprüft</p>
            <p className="mt-1 text-2xl font-bold text-emerald-900">{manualCount}</p>
            <p className="text-xs text-emerald-700 dark:text-emerald-400">geprüfte Einträge</p>
          </div>
          <div className="rounded-xl border border-cyan-200 dark:border-cyan-900/40 bg-cyan-50 dark:bg-cyan-950/30 p-4">
            <p className="text-xs uppercase tracking-wide text-cyan-700 dark:text-cyan-400 font-semibold">Publisher</p>
            <p className="mt-1 text-2xl font-bold text-cyan-900">{publisherCounts.length}</p>
            <p className="text-xs text-cyan-700 dark:text-cyan-400">verteilt</p>
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
            className="rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
          />
          <Dropdown value={sortBy} onChange={(v) => setSortBy(v as "relevance" | "yearDesc" | "yearAsc")}>
            <DropdownOption value="relevance">Sortierung: Relevanz</DropdownOption>
            <DropdownOption value="yearDesc">Sortierung: Jahr (neu nach alt)</DropdownOption>
            <DropdownOption value="yearAsc">Sortierung: Jahr (alt nach neu)</DropdownOption>
          </Dropdown>
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
                    : "border border-border bg-card text-foreground/80 hover:border-emerald-300 hover:text-emerald-700 dark:text-emerald-400"
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
              className="rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold text-foreground/80 hover:border-cyan-300 hover:text-cyan-800 dark:text-cyan-400"
            >
              {publisher} ({count})
            </button>
          ))}
        </div>

        <p className="mt-5 text-sm text-muted-fg">
          <span className="font-semibold text-foreground">{filtered.length}</span> Treffer in <span className="font-semibold text-foreground">{groupedByPublisher.length}</span> Publisher-Gruppen
        </p>

        <div className="mt-4 space-y-6">
          {groupedByPublisher.map(([publisher, sources]) => (
            <section key={publisher} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-bold text-[#123024]">{publisher}</h2>
                <span className="rounded-full bg-background px-2.5 py-1 text-xs font-semibold text-foreground/80">
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
                        <p className="inline-flex rounded-full border border-blue-200 dark:border-blue-900/40 bg-blue-50 dark:bg-blue-950/30 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:text-blue-400">
                          Automatisch synchronisiert
                        </p>
                      )}
                      {(source.sourceType ?? "manual") === "manual" && (
                        <p className="inline-flex rounded-full border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
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
                          className="rounded-full border border-border bg-card px-2 py-0.5 text-[11px] font-semibold text-foreground/80 hover:border-emerald-300 hover:text-emerald-700 dark:text-emerald-400"
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
          <div className="mt-6 rounded-xl border border-dashed border-border bg-background p-6 text-center text-sm text-foreground/80">
            Keine Quellen für den aktuellen Filter gefunden. Versuche einen anderen Suchbegriff oder wechsle den Typfilter.
          </div>
        )}
      </section>
    </main>
  );
}
