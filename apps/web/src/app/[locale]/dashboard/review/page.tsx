"use client";

import Link from "next/link";
import type { Route } from "next";
import { useCallback, useEffect, useMemo, useState } from "react";
import autoSourcesData from "@/data/terpira/autoSources.json";
import { logoutFromSupabase, restoreSessionFromSupabase } from "@/lib/auth";
import {
  createStudy,
  fetchStudies,
  getStudyQuality,
  type StudyQuality,
  updateStudyReview,
} from "@/lib/studies";
import type { SessionData, StudyRecord } from "@/lib/types";
import type { TerpiraSource } from "@/lib/terpira/types";

type ReviewDecision = "accepted" | "later" | "rejected";
type DecisionFilter = "open" | ReviewDecision | "all";
type StudyFormState = {
  title: string;
  description: string;
  source: string;
  tags: string;
};

const STORAGE_KEY = "secretleaf.study-review.decisions";

type DecisionMap = Record<string, ReviewDecision>;

function loadDecisions(): DecisionMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as DecisionMap) : {};
  } catch {
    return {};
  }
}

function saveDecisions(decisions: DecisionMap) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(decisions));
}

function sortStudies(studies: TerpiraSource[]) {
  const priorityRank = { high: 0, medium: 1, low: 2 } as const;
  return [...studies].sort((a, b) => {
    const prioA = priorityRank[a.editorialPriority ?? "low"];
    const prioB = priorityRank[b.editorialPriority ?? "low"];
    if (prioA !== prioB) return prioA - prioB;
    return (b.relevanceScore ?? 0) - (a.relevanceScore ?? 0);
  });
}

const studies = sortStudies((autoSourcesData.sources ?? []) as TerpiraSource[]);

export default function DashboardStudiesPage() {
  const [session, setSession] = useState<SessionData | null>(null);
  const [decisions, setDecisions] = useState<DecisionMap>({});
  const [filter, setFilter] = useState<DecisionFilter>("open");
  const [dbStudies, setDbStudies] = useState<StudyRecord[]>([]);
  const [isLoadingDbStudies, setIsLoadingDbStudies] = useState(false);
  const [isLoadingMoreDbStudies, setIsLoadingMoreDbStudies] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);
  const [isCreatingStudy, setIsCreatingStudy] = useState(false);
  const [studySearch, setStudySearch] = useState("");
  const [activeDbTag, setActiveDbTag] = useState("all");
  const [qualityFilter, setQualityFilter] = useState<"all" | StudyQuality>("all");
  const [dbPage, setDbPage] = useState(1);
  const [dbTotal, setDbTotal] = useState(0);
  const [hasNextDbPage, setHasNextDbPage] = useState(false);
  const [updatingStudyId, setUpdatingStudyId] = useState<string | null>(null);
  const [studyForm, setStudyForm] = useState<StudyFormState>({
    title: "",
    description: "",
    source: "",
    tags: "",
  });

  useEffect(() => {
    void (async () => {
      const restored = await restoreSessionFromSupabase();
      setSession(restored);
      setDecisions(loadDecisions());
    })();
  }, []);

  const loadDbStudies = useCallback(async (page: number, append: boolean) => {
    if (!session) {
      return;
    }

    if (append) {
      setIsLoadingMoreDbStudies(true);
    } else {
      setIsLoadingDbStudies(true);
    }

    setDbError(null);
    try {
      const response = await fetchStudies(session, {
        page,
        limit: 25,
        q: studySearch,
        ...(activeDbTag === "all" ? {} : { tag: activeDbTag }),
        quality: qualityFilter,
      });

      setDbStudies((current) => (append ? [...current, ...response.studies] : response.studies));
      setDbPage(response.pagination.page);
      setDbTotal(response.total);
      setHasNextDbPage(response.pagination.hasNext);
    } catch (error) {
      setDbError(error instanceof Error ? error.message : "Studien konnten nicht geladen werden.");
    } finally {
      if (append) {
        setIsLoadingMoreDbStudies(false);
      } else {
        setIsLoadingDbStudies(false);
      }
    }
  }, [activeDbTag, qualityFilter, session, studySearch]);

  useEffect(() => {
    if (!session) {
      return;
    }

    const t = setTimeout(() => {
      void loadDbStudies(1, false);
    }, 0);
    return () => clearTimeout(t);
  }, [loadDbStudies, session]);

  const stats = useMemo(() => {
    const accepted = Object.values(decisions).filter((value) => value === "accepted").length;
    const later = Object.values(decisions).filter((value) => value === "later").length;
    const rejected = Object.values(decisions).filter((value) => value === "rejected").length;
    return {
      accepted,
      later,
      rejected,
      open: Math.max(0, studies.length - accepted - later - rejected),
    };
  }, [decisions]);

  const visibleStudies = useMemo(() => {
    return studies.filter((study) => {
      const decision = decisions[study.id];
      if (filter === "all") return true;
      if (filter === "open") return !decision;
      return decision === filter;
    });
  }, [decisions, filter]);

  const visibleDbStudies = useMemo(() => dbStudies, [dbStudies]);

  const availableDbTags = useMemo(() => {
    return Array.from(new Set(dbStudies.flatMap((study) => study.tags))).sort((a, b) => a.localeCompare(b));
  }, [dbStudies]);

  const setDecision = (studyId: string, decision: ReviewDecision) => {
    const next = { ...decisions, [studyId]: decision };
    setDecisions(next);
    saveDecisions(next);
  };

  const onFormValueChange = (field: keyof StudyFormState, value: string) => {
    setStudyForm((current) => ({ ...current, [field]: value }));
  };

  const createNewStudy = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!studyForm.title.trim()) {
      setDbError("Der Titel ist erforderlich.");
      return;
    }

    const tags = studyForm.tags
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);

    setIsCreatingStudy(true);
    setDbError(null);

    try {
      const created = await createStudy(
        {
          title: studyForm.title,
          description: studyForm.description,
          source: studyForm.source,
          tags,
        },
        session
      );

      setDbStudies((current) => [created, ...current]);
      setDbTotal((current) => current + 1);
      setStudyForm({ title: "", description: "", source: "", tags: "" });
    } catch (error) {
      setDbError(error instanceof Error ? error.message : "Studie konnte nicht angelegt werden.");
    } finally {
      setIsCreatingStudy(false);
    }
  };

  const setStudyQuality = async (study: StudyRecord, quality: StudyQuality) => {
    setUpdatingStudyId(study.id);
    setDbError(null);
    try {
      const updated = await updateStudyReview(
        study.id,
        {
          qualityStatus: quality,
          tags: study.tags,
        },
        session
      );
      setDbStudies((current) => current.map((entry) => (entry.id === study.id ? updated : entry)));
    } catch (error) {
      setDbError(error instanceof Error ? error.message : "Qualitätsstatus konnte nicht gespeichert werden.");
    } finally {
      setUpdatingStudyId(null);
    }
  };

  if (!session) {
    return (
      <main className="min-h-screen px-4 py-10 sm:px-6 sm:py-20">
        <section className="mx-auto max-w-4xl rounded-3xl border border-border bg-card p-6 text-center shadow-sm sm:p-8">
          <h1 className="text-3xl font-bold text-foreground">Interne Studien-Review</h1>
          <p className="mt-3 text-muted-fg">Bitte einloggen, um die interne Review-Ansicht zu nutzen.</p>
          <Link href="/auth" className="mt-6 inline-flex rounded-xl bg-emerald-600 dark:bg-emerald-500 px-5 py-2.5 font-medium text-white hover:bg-emerald-700">
            Zu Login / Register
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-400">Intern</p>
            <h1 className="text-xl font-bold text-foreground sm:text-2xl">Studien-Review in 1 Minute</h1>
            <p className="text-sm text-muted-fg">Kurz lesen, Quelle prüfen, dann &quot;Rein&quot;, &quot;Später&quot; oder &quot;Nein&quot; klicken.</p>
          </div>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link href="/dashboard" className="font-medium text-muted-fg hover:text-foreground">Dashboard</Link>
            <Link href={"/studies/sources" as Route} className="font-medium text-muted-fg hover:text-foreground">Quellen</Link>
            <button
              onClick={() => {
                void (async () => {
                  await logoutFromSupabase();
                  setSession(null);
                })();
              }}
              className="font-medium text-muted-fg hover:text-foreground"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <section className="rounded-[28px] border border-border bg-card p-4 shadow-sm sm:p-6">
          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <h2 className="text-xl font-bold text-foreground">Supabase Studien-Datenbank</h2>
              <p className="mt-2 text-sm text-muted-fg">
                Alle Einträge aus der Tabelle <span className="font-semibold">studies</span>. Suche und Tag-Filter sind als Basis für spätere KI-Funktionen vorbereitet.
              </p>

              <div className="mt-4 grid gap-3">
                <input
                  value={studySearch}
                  onChange={(event) => setStudySearch(event.target.value)}
                  placeholder="Studien durchsuchen (Titel, Beschreibung, Quelle, Tags)"
                  className="rounded-xl border border-border px-3 py-2 text-sm text-foreground outline-none focus:border-emerald-600 dark:border-emerald-500"
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <select
                    value={activeDbTag}
                    onChange={(event) => setActiveDbTag(event.target.value)}
                    className="rounded-xl border border-border px-3 py-2 text-sm text-foreground outline-none focus:border-emerald-600 dark:border-emerald-500"
                  >
                    <option value="all">Alle Tags</option>
                    {availableDbTags.map((tag) => (
                      <option key={tag} value={tag}>
                        {tag}
                      </option>
                    ))}
                  </select>
                  <select
                    value={qualityFilter}
                    onChange={(event) => setQualityFilter(event.target.value as "all" | StudyQuality)}
                    className="rounded-xl border border-border px-3 py-2 text-sm text-foreground outline-none focus:border-emerald-600 dark:border-emerald-500"
                  >
                    <option value="all">Qualität: Alle</option>
                    <option value="good">Qualität: Gut</option>
                    <option value="pending">Qualität: Offen</option>
                    <option value="bad">Qualität: Schlecht</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-border bg-background p-4">
                <p className="text-xs text-muted-fg">Einträge</p>
                <p className="mt-1 text-3xl font-bold text-foreground">{dbTotal}</p>
              </div>

              {dbError && <p className="mt-3 rounded-xl bg-rose-100 dark:bg-rose-950/40 px-3 py-2 text-sm text-rose-700 dark:text-rose-400">{dbError}</p>}

              <div className="mt-4 space-y-3">
                {isLoadingDbStudies && <p className="text-sm text-muted-fg">Studien werden geladen...</p>}

                {!isLoadingDbStudies && visibleDbStudies.length === 0 && (
                  <p className="rounded-xl border border-border bg-background px-4 py-3 text-sm text-muted-fg">
                    Keine Studien für den aktuellen Filter.
                  </p>
                )}

                {!isLoadingDbStudies &&
                  visibleDbStudies.map((study) => (
                    <article key={study.id} className="rounded-2xl border border-border bg-background p-4">
                      {(() => {
                        const quality = getStudyQuality(study);
                        const qualityClass =
                          quality === "good"
                            ? "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400"
                            : quality === "bad"
                              ? "bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400"
                              : "bg-border text-foreground/80";
                        const qualityLabel =
                          quality === "good" ? "Gut" : quality === "bad" ? "Schlecht" : "Offen";

                        return (
                          <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${qualityClass}`}>
                              Qualität: {qualityLabel}
                            </span>
                            <div className="grid grid-cols-3 gap-2 sm:flex">
                              <button
                                onClick={() => {
                                  void setStudyQuality(study, "good");
                                }}
                                disabled={updatingStudyId === study.id}
                                className="rounded-lg bg-emerald-600 dark:bg-emerald-500 px-2.5 py-1 text-xs font-semibold text-white disabled:opacity-50"
                              >
                                Gut
                              </button>
                              <button
                                onClick={() => {
                                  void setStudyQuality(study, "pending");
                                }}
                                disabled={updatingStudyId === study.id}
                                className="rounded-lg bg-slate-500 dark:bg-slate-600 px-2.5 py-1 text-xs font-semibold text-white disabled:opacity-50"
                              >
                                Offen
                              </button>
                              <button
                                onClick={() => {
                                  void setStudyQuality(study, "bad");
                                }}
                                disabled={updatingStudyId === study.id}
                                className="rounded-lg bg-rose-600 px-2.5 py-1 text-xs font-semibold text-white disabled:opacity-50"
                              >
                                Schlecht
                              </button>
                            </div>
                          </div>
                        );
                      })()}
                      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                        <h3 className="text-base font-bold text-foreground">{study.title}</h3>
                        {study.createdAt && (
                          <span className="text-xs text-muted-fg">{new Date(study.createdAt).toLocaleDateString("de-DE")}</span>
                        )}
                      </div>
                      {study.description && <p className="mt-2 text-sm text-foreground/80">{study.description}</p>}
                      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-fg">
                        {study.source && <span className="rounded-full border border-border px-3 py-1">Quelle: {study.source}</span>}
                        {study.tags.map((tag) => (
                          <span key={`${study.id}-${tag}`} className="rounded-full border border-border px-3 py-1">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </article>
                  ))}

                {!isLoadingDbStudies && hasNextDbPage && (
                  <div className="pt-2">
                    <button
                      onClick={() => {
                        void loadDbStudies(dbPage + 1, true);
                      }}
                      disabled={isLoadingMoreDbStudies}
                      className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-background disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isLoadingMoreDbStudies ? "Lade weitere Studien..." : "Weitere Studien laden"}
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-background p-4">
              <h3 className="text-lg font-bold text-foreground">Neue Studie anlegen</h3>
              <p className="mt-2 text-sm text-muted-fg">
                Fügt einen neuen Eintrag direkt in die Tabelle <span className="font-semibold">studies</span> ein.
              </p>

              <form className="mt-4 space-y-3" onSubmit={createNewStudy}>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-muted-fg">Titel</label>
                  <input
                    value={studyForm.title}
                    onChange={(event) => onFormValueChange("title", event.target.value)}
                    className="w-full rounded-xl border border-border px-3 py-2 text-sm text-foreground outline-none focus:border-emerald-600 dark:border-emerald-500"
                    placeholder="z. B. Meta-Analyse zu CBD und Angststörungen"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-muted-fg">Beschreibung</label>
                  <textarea
                    value={studyForm.description}
                    onChange={(event) => onFormValueChange("description", event.target.value)}
                    rows={4}
                    className="w-full rounded-xl border border-border px-3 py-2 text-sm text-foreground outline-none focus:border-emerald-600 dark:border-emerald-500"
                    placeholder="Kurzfassung der Studie"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-muted-fg">Quelle</label>
                  <input
                    value={studyForm.source}
                    onChange={(event) => onFormValueChange("source", event.target.value)}
                    className="w-full rounded-xl border border-border px-3 py-2 text-sm text-foreground outline-none focus:border-emerald-600 dark:border-emerald-500"
                    placeholder="PubMed, DOI, Journal oder URL"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-muted-fg">Tags</label>
                  <input
                    value={studyForm.tags}
                    onChange={(event) => onFormValueChange("tags", event.target.value)}
                    className="w-full rounded-xl border border-border px-3 py-2 text-sm text-foreground outline-none focus:border-emerald-600 dark:border-emerald-500"
                    placeholder="z. B. cbd, angst, meta-analyse"
                  />
                  <p className="mt-1 text-xs text-muted-fg">Mehrere Tags mit Komma trennen.</p>
                </div>

                <button
                  type="submit"
                  disabled={isCreatingStudy}
                  className="w-full rounded-xl bg-emerald-600 dark:bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isCreatingStudy ? "Speichern..." : "Studie speichern"}
                </button>
              </form>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-[28px] border border-border bg-card p-4 shadow-sm sm:p-6">
          <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <p className="text-sm text-muted-fg">
                Sync vom {new Date(autoSourcesData.generatedAt).toLocaleString("de-DE")} · {autoSourcesData.stats.kept} Kandidaten nach Filterung · {autoSourcesData.stats.excluded} ausgeschlossen.
              </p>
              <p className="mt-3 text-sm text-muted-fg">
                Jede Karte zeigt bewusst nur 3 Zeilen: Evidenz, Herkunft/Institut und warum die Studie für SecretLeaf relevant sein könnte.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-border bg-background p-4">
                <p className="text-xs text-muted-fg">Offen</p>
                <p className="mt-1 text-3xl font-bold text-foreground">{stats.open}</p>
              </div>
              <div className="rounded-2xl border border-border bg-background p-4">
                <p className="text-xs text-muted-fg">Rein</p>
                <p className="mt-1 text-3xl font-bold text-foreground">{stats.accepted}</p>
              </div>
              <div className="rounded-2xl border border-border bg-background p-4">
                <p className="text-xs text-muted-fg">Später</p>
                <p className="mt-1 text-3xl font-bold text-foreground">{stats.later}</p>
              </div>
              <div className="rounded-2xl border border-border bg-background p-4">
                <p className="text-xs text-muted-fg">Nein</p>
                <p className="mt-1 text-3xl font-bold text-foreground">{stats.rejected}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 flex flex-wrap gap-2 sm:gap-3">
          {[
            ["open", `Offen (${stats.open})`],
            ["accepted", `Rein (${stats.accepted})`],
            ["later", `Später (${stats.later})`],
            ["rejected", `Nein (${stats.rejected})`],
            ["all", `Alle (${studies.length})`],
          ].map(([value, label]) => (
            <button
              key={value}
              onClick={() => setFilter(value as DecisionFilter)}
              className={`rounded-full border px-3 py-2 text-sm font-medium sm:px-4 ${filter === value ? "border-emerald-600 dark:border-emerald-500 bg-emerald-600 dark:bg-emerald-500 text-white" : "border-border bg-card text-foreground/80 hover:bg-background"}`}
            >
              {label}
            </button>
          ))}
        </section>

        <section className="mt-6 space-y-4">
          {visibleStudies.map((study) => {
            const decision = decisions[study.id];
            const summaryLines = study.reviewSummary?.slice(0, 3) ?? [];

            return (
              <article key={study.id} className="rounded-[28px] border border-border bg-card p-4 shadow-sm sm:p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="max-w-4xl min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${study.editorialPriority === "high" ? "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400" : study.editorialPriority === "medium" ? "bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400" : "bg-border text-foreground/80"}`}>
                        {study.editorialPriority === "high" ? "High" : study.editorialPriority === "medium" ? "Medium" : "Low"}
                      </span>
                      <span className="rounded-full bg-border px-2.5 py-1 text-xs font-semibold text-foreground/80">{study.studyType ?? "study"}</span>
                      <span className="rounded-full bg-border px-2.5 py-1 text-xs font-semibold text-foreground/80">{study.year}</span>
                      {decision && (
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${decision === "accepted" ? "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400" : decision === "later" ? "bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400" : "bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400"}`}>
                          {decision === "accepted" ? "Rein" : decision === "later" ? "Später" : "Nein"}
                        </span>
                      )}
                    </div>

                    <h2 className="mt-3 text-lg font-bold leading-tight text-foreground sm:text-xl">{study.title}</h2>

                    <div className="mt-4 space-y-2 text-sm text-foreground/80">
                      {summaryLines.map((line) => (
                        <p key={line} className="rounded-xl bg-background px-4 py-3">{line}</p>
                      ))}
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-fg">
                      <span className="rounded-full border border-border px-3 py-1">Quelle: {study.publisher}</span>
                      <span className="rounded-full border border-border px-3 py-1">Von: {study.originLabel ?? study.publisher}</span>
                      {study.firstAuthor && <span className="rounded-full border border-border px-3 py-1">Autor: {study.firstAuthor}</span>}
                      {(study.matchedTopics ?? []).map((topic) => (
                        <span key={topic} className="rounded-full border border-border px-3 py-1">{topic}</span>
                      ))}
                    </div>

                    {study.affiliationHints && study.affiliationHints.length > 0 && (
                      <p className="mt-3 text-sm text-muted-fg">
                        Institut/Uni: {study.affiliationHints.slice(0, 2).join(" · ")}
                      </p>
                    )}
                  </div>

                  <div className="grid w-full gap-3 sm:grid-cols-2 lg:flex lg:w-full lg:max-w-xs lg:grid-cols-1">
                    <a
                      href={study.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex justify-center rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-background sm:col-span-2 lg:col-span-1"
                    >
                      Quelle öffnen
                    </a>
                    <button onClick={() => setDecision(study.id, "accepted")} className="rounded-xl bg-emerald-600 dark:bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700">
                      Rein
                    </button>
                    <button onClick={() => setDecision(study.id, "later")} className="rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-700">
                      Später
                    </button>
                    <button onClick={() => setDecision(study.id, "rejected")} className="rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-700">
                      Nein
                    </button>
                  </div>
                </div>
              </article>
            );
          })}

          {visibleStudies.length === 0 && (
            <div className="rounded-[28px] border border-border bg-card p-10 text-center shadow-sm">
              <p className="text-muted-fg">Keine Studien in diesem Filter.</p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}