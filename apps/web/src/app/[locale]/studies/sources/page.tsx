"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Route } from "next";
import { Dropdown, DropdownOption } from "@/components/ui/Dropdown";
import { sourceRegister } from "@/data/terpira/wiki";

export default function WikiSourcesPage() {
  const t = useTranslations("sourcesPage");
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
      <section className="mx-auto max-w-6xl rounded-2xl border border-border bg-card/90 p-8 shadow-sm">
        <Link href={"/studies" as Route} className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800">
          {t("back")}
        </Link>

        <h1 className="mt-4 text-4xl font-bold text-foreground">{t("title")}</h1>
        <p className="mt-3 text-muted-fg">{t("subtitle")}</p>

        <div className="mt-5 rounded-xl border border-border bg-card p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-fg">{t("imageLexicaLabel")}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Link
              href={"/studies/pests" as Route}
              className="inline-flex rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-semibold text-foreground hover:bg-card"
            >
              {t("pestsLexicon")}
            </Link>
            <Link
              href={"/studies/deficiencies" as Route}
              className="inline-flex rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-semibold text-foreground hover:bg-card"
            >
              {t("deficienciesLexicon")}
            </Link>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs uppercase tracking-wide text-muted-fg font-semibold">{t("statTotal")}</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{sourceRegister.length}</p>
            <p className="text-xs text-muted-fg">{t("statTotalUnit")}</p>
          </div>
          <div className="rounded-xl border border-blue-200 dark:border-blue-900/40 bg-blue-50 dark:bg-blue-950/30 p-4">
            <p className="text-xs uppercase tracking-wide text-blue-700 dark:text-blue-400 font-semibold">{t("statAuto")}</p>
            <p className="mt-1 text-2xl font-bold text-blue-900 dark:text-blue-300">{autoCount}</p>
            <p className="text-xs text-blue-700 dark:text-blue-400">{t("statAutoUnit")}</p>
          </div>
          <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50 dark:bg-emerald-950/30 p-4">
            <p className="text-xs uppercase tracking-wide text-emerald-700 dark:text-emerald-400 font-semibold">{t("statManual")}</p>
            <p className="mt-1 text-2xl font-bold text-emerald-900 dark:text-emerald-300">{manualCount}</p>
            <p className="text-xs text-emerald-700 dark:text-emerald-400">{t("statManualUnit")}</p>
          </div>
          <div className="rounded-xl border border-cyan-200 dark:border-cyan-900/40 bg-cyan-50 dark:bg-cyan-950/30 p-4">
            <p className="text-xs uppercase tracking-wide text-cyan-700 dark:text-cyan-400 font-semibold">{t("statPublisher")}</p>
            <p className="mt-1 text-2xl font-bold text-cyan-900 dark:text-cyan-300">{publisherCounts.length}</p>
            <p className="text-xs text-cyan-700 dark:text-cyan-400">{t("statPublisherUnit")}</p>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-border bg-background p-4 text-sm text-foreground/80">
          {t("editorialNote")}
        </div>

        <div className="mt-6 grid gap-3 lg:grid-cols-[1fr_auto_auto]">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
          />
          <Dropdown value={sortBy} onChange={(v) => setSortBy(v as "relevance" | "yearDesc" | "yearAsc")}>
            <DropdownOption value="relevance">{t("sortRelevance")}</DropdownOption>
            <DropdownOption value="yearDesc">{t("sortYearDesc")}</DropdownOption>
            <DropdownOption value="yearAsc">{t("sortYearAsc")}</DropdownOption>
          </Dropdown>
          <div className="flex items-center gap-2">
            {([
              ["alle", "filterAll"],
              ["manual", "filterManual"],
              ["auto", "filterAuto"],
            ] as const).map(([value, key]) => (
              <button
                key={value}
                onClick={() => setSourceType(value)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  sourceType === value
                    ? "bg-primary text-white"
                    : "border border-border bg-card text-foreground/80 hover:border-emerald-300 hover:text-emerald-700 dark:text-emerald-400"
                }`}
              >
                {t(key)}
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
          {t.rich("resultSummary", {
            hits: filtered.length,
            groups: groupedByPublisher.length,
            b: (chunks) => <span className="font-semibold text-foreground">{chunks}</span>,
          })}
        </p>

        <div className="mt-4 space-y-6">
          {groupedByPublisher.map(([publisher, sources]) => (
            <section key={publisher} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-bold text-foreground">{publisher}</h2>
                <span className="rounded-full bg-background px-2.5 py-1 text-xs font-semibold text-foreground/80">
                  {t("groupCount", { count: sources.length })}
                </span>
              </div>

              <ol className="mt-3 list-decimal space-y-3 pl-5 text-sm text-foreground/80">
                {sources.map((source) => (
                  <li key={source.id} className="rounded-xl border border-border bg-background p-4">
                    <p className="text-base font-semibold text-foreground">{source.title}</p>
                    <p className="mt-1 text-sm text-muted-fg">
                      {source.publisher} ({source.year})
                    </p>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {source.sourceType === "auto" && (
                        <p className="inline-flex rounded-full border border-blue-200 dark:border-blue-900/40 bg-blue-50 dark:bg-blue-950/30 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:text-blue-400">
                          {t("badgeAuto")}
                        </p>
                      )}
                      {(source.sourceType ?? "manual") === "manual" && (
                        <p className="inline-flex rounded-full border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                          {t("badgeManual")}
                        </p>
                      )}
                    </div>
                    <p className="mt-2 text-xs text-muted-fg">ID: {source.id}</p>
                    {source.doi && (
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <p className="text-xs text-muted-fg">DOI: {source.doi}</p>
                        <button
                          type="button"
                          onClick={() => copyDoi(source.doi as string)}
                          className="rounded-full border border-border bg-card px-2 py-0.5 text-[11px] font-semibold text-foreground/80 hover:border-emerald-300 hover:text-emerald-700 dark:text-emerald-400"
                        >
                          {copiedDoi === source.doi ? t("doiCopied") : t("doiCopy")}
                        </button>
                      </div>
                    )}
                    <a href={source.url} target="_blank" rel="noreferrer" className="mt-2 inline-flex text-sm font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800">
                      {t("toSource")}
                    </a>
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="mt-6 rounded-xl border border-dashed border-border bg-background p-6 text-center text-sm text-foreground/80">
            {t("empty")}
          </div>
        )}
      </section>
    </main>
  );
}
