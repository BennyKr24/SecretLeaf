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

    void loadDbStudies(1, false);
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
      <main className="min-h-screen px-6 py-20">
        <section className="mx-auto max-w-4xl rounded-3xl border border-[#d8e8dd] bg-white p-8 text-center shadow-sm">
          <h1 className="text-3xl font-bold text-[#10281e]">Interne Studien-Review</h1>
          <p className="mt-3 text-[#4d685a]">Bitte einloggen, um die interne Review-Ansicht zu nutzen.</p>
          <Link href="/auth" className="mt-6 inline-flex rounded-xl bg-[#1f7a4f] px-5 py-2.5 font-medium text-white hover:bg-[#17613f]">
            Zu Login / Register
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f6faf7]">
      <header className="border-b border-[#d8e8dd] bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1f7a4f]">Intern</p>
            <h1 className="text-2xl font-bold text-[#10281e]">Studien-Review in 1 Minute</h1>
            <p className="text-sm text-[#4d685a]">Kurz lesen, Quelle prüfen, dann "Rein", "Später" oder "Nein" klicken.</p>
          </div>
          <div className="flex gap-3 text-sm">
            <Link href="/dashboard" className="font-medium text-[#4d685a] hover:text-[#173126]">Dashboard</Link>
            <Link href={"/studies/sources" as Route} className="font-medium text-[#4d685a] hover:text-[#173126]">Quellen</Link>
            <button
              onClick={() => {
                void (async () => {
                  await logoutFromSupabase();
                  setSession(null);
                })();
              }}
              className="font-medium text-[#4d685a] hover:text-[#173126]"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <section className="rounded-[28px] border border-[#d8e8dd] bg-white p-6 shadow-sm">
          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <h2 className="text-xl font-bold text-[#10281e]">Supabase Studien-Datenbank</h2>
              <p className="mt-2 text-sm text-[#4d685a]">
                Alle Einträge aus der Tabelle <span className="font-semibold">studies</span>. Suche und Tag-Filter sind als Basis für spätere KI-Funktionen vorbereitet.
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
                <input
                  value={studySearch}
                  onChange={(event) => setStudySearch(event.target.value)}
                  placeholder="Studien durchsuchen (Titel, Beschreibung, Quelle, Tags)"
                  className="rounded-xl border border-[#c8ddcf] px-3 py-2 text-sm text-[#173126] outline-none focus:border-[#1f7a4f]"
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <select
                    value={activeDbTag}
                    onChange={(event) => setActiveDbTag(event.target.value)}
                    className="rounded-xl border border-[#c8ddcf] px-3 py-2 text-sm text-[#173126] outline-none focus:border-[#1f7a4f]"
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
                    className="rounded-xl border border-[#c8ddcf] px-3 py-2 text-sm text-[#173126] outline-none focus:border-[#1f7a4f]"
                  >
                    <option value="all">Qualität: Alle</option>
                    <option value="good">Qualität: Gut</option>
                    <option value="pending">Qualität: Offen</option>
                    <option value="bad">Qualität: Schlecht</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-[#dfece3] bg-[#fbfefc] p-4">
                <p className="text-xs text-[#6b8577]">Einträge</p>
                <p className="mt-1 text-3xl font-bold text-[#123024]">{dbTotal}</p>
              </div>

              {dbError && <p className="mt-3 rounded-xl bg-[#fff1f1] px-3 py-2 text-sm text-[#a54b4b]">{dbError}</p>}

              <div className="mt-4 space-y-3">
                {isLoadingDbStudies && <p className="text-sm text-[#4d685a]">Studien werden geladen...</p>}

                {!isLoadingDbStudies && visibleDbStudies.length === 0 && (
                  <p className="rounded-xl border border-[#d8e8dd] bg-[#f6faf7] px-4 py-3 text-sm text-[#4d685a]">
                    Keine Studien für den aktuellen Filter.
                  </p>
                )}

                {!isLoadingDbStudies &&
                  visibleDbStudies.map((study) => (
                    <article key={study.id} className="rounded-2xl border border-[#d8e8dd] bg-[#fbfefc] p-4">
                      {(() => {
                        const quality = getStudyQuality(study);
                        const qualityClass =
                          quality === "good"
                            ? "bg-[#e5f4ea] text-[#1f7a4f]"
                            : quality === "bad"
                              ? "bg-[#fff1f1] text-[#a54b4b]"
                              : "bg-[#eef3f0] text-[#567264]";
                        const qualityLabel =
                          quality === "good" ? "Gut" : quality === "bad" ? "Schlecht" : "Offen";

                        return (
                          <div className="mb-3 flex items-center justify-between gap-3">
                            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${qualityClass}`}>
                              Qualität: {qualityLabel}
                            </span>
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  void setStudyQuality(study, "good");
                                }}
                                disabled={updatingStudyId === study.id}
                                className="rounded-lg bg-[#1f7a4f] px-2.5 py-1 text-xs font-semibold text-white disabled:opacity-50"
                              >
                                Gut
                              </button>
                              <button
                                onClick={() => {
                                  void setStudyQuality(study, "pending");
                                }}
                                disabled={updatingStudyId === study.id}
                                className="rounded-lg bg-[#6b8577] px-2.5 py-1 text-xs font-semibold text-white disabled:opacity-50"
                              >
                                Offen
                              </button>
                              <button
                                onClick={() => {
                                  void setStudyQuality(study, "bad");
                                }}
                                disabled={updatingStudyId === study.id}
                                className="rounded-lg bg-[#b44d4d] px-2.5 py-1 text-xs font-semibold text-white disabled:opacity-50"
                              >
                                Schlecht
                              </button>
                            </div>
                          </div>
                        );
                      })()}
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 className="text-base font-bold text-[#10281e]">{study.title}</h3>
                        {study.createdAt && (
                          <span className="text-xs text-[#6b8577]">{new Date(study.createdAt).toLocaleDateString("de-DE")}</span>
                        )}
                      </div>
                      {study.description && <p className="mt-2 text-sm text-[#355b49]">{study.description}</p>}
                      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[#4d685a]">
                        {study.source && <span className="rounded-full border border-[#d8e8dd] px-3 py-1">Quelle: {study.source}</span>}
                        {study.tags.map((tag) => (
                          <span key={`${study.id}-${tag}`} className="rounded-full border border-[#d8e8dd] px-3 py-1">
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
                      className="w-full rounded-xl border border-[#c8ddcf] bg-white px-4 py-2.5 text-sm font-semibold text-[#1f7a4f] hover:bg-[#eef7f1] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isLoadingMoreDbStudies ? "Lade weitere Studien..." : "Weitere Studien laden"}
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-[#dfece3] bg-[#fbfefc] p-4">
              <h3 className="text-lg font-bold text-[#10281e]">Neue Studie anlegen</h3>
              <p className="mt-2 text-sm text-[#4d685a]">
                Fügt einen neuen Eintrag direkt in die Tabelle <span className="font-semibold">studies</span> ein.
              </p>

              <form className="mt-4 space-y-3" onSubmit={createNewStudy}>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-[#4d685a]">Titel</label>
                  <input
                    value={studyForm.title}
                    onChange={(event) => onFormValueChange("title", event.target.value)}
                    className="w-full rounded-xl border border-[#c8ddcf] px-3 py-2 text-sm text-[#173126] outline-none focus:border-[#1f7a4f]"
                    placeholder="z. B. Meta-Analyse zu CBD und Angststörungen"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-[#4d685a]">Beschreibung</label>
                  <textarea
                    value={studyForm.description}
                    onChange={(event) => onFormValueChange("description", event.target.value)}
                    rows={4}
                    className="w-full rounded-xl border border-[#c8ddcf] px-3 py-2 text-sm text-[#173126] outline-none focus:border-[#1f7a4f]"
                    placeholder="Kurzfassung der Studie"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-[#4d685a]">Quelle</label>
                  <input
                    value={studyForm.source}
                    onChange={(event) => onFormValueChange("source", event.target.value)}
                    className="w-full rounded-xl border border-[#c8ddcf] px-3 py-2 text-sm text-[#173126] outline-none focus:border-[#1f7a4f]"
                    placeholder="PubMed, DOI, Journal oder URL"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-[#4d685a]">Tags</label>
                  <input
                    value={studyForm.tags}
                    onChange={(event) => onFormValueChange("tags", event.target.value)}
                    className="w-full rounded-xl border border-[#c8ddcf] px-3 py-2 text-sm text-[#173126] outline-none focus:border-[#1f7a4f]"
                    placeholder="z. B. cbd, angst, meta-analyse"
                  />
                  <p className="mt-1 text-xs text-[#6b8577]">Mehrere Tags mit Komma trennen.</p>
                </div>

                <button
                  type="submit"
                  disabled={isCreatingStudy}
                  className="w-full rounded-xl bg-[#1f7a4f] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#17613f] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isCreatingStudy ? "Speichern..." : "Studie speichern"}
                </button>
              </form>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-[28px] border border-[#d8e8dd] bg-white p-6 shadow-sm">
          <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <p className="text-sm text-[#4d685a]">
                Sync vom {new Date(autoSourcesData.generatedAt).toLocaleString("de-DE")} · {autoSourcesData.stats.kept} Kandidaten nach Filterung · {autoSourcesData.stats.excluded} ausgeschlossen.
              </p>
              <p className="mt-3 text-sm text-[#4d685a]">
                Jede Karte zeigt bewusst nur 3 Zeilen: Evidenz, Herkunft/Institut und warum die Studie für SecretLeaf relevant sein könnte.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-[#dfece3] bg-[#fbfefc] p-4">
                <p className="text-xs text-[#6b8577]">Offen</p>
                <p className="mt-1 text-3xl font-bold text-[#123024]">{stats.open}</p>
              </div>
              <div className="rounded-2xl border border-[#dfece3] bg-[#fbfefc] p-4">
                <p className="text-xs text-[#6b8577]">Rein</p>
                <p className="mt-1 text-3xl font-bold text-[#123024]">{stats.accepted}</p>
              </div>
              <div className="rounded-2xl border border-[#dfece3] bg-[#fbfefc] p-4">
                <p className="text-xs text-[#6b8577]">Später</p>
                <p className="mt-1 text-3xl font-bold text-[#123024]">{stats.later}</p>
              </div>
              <div className="rounded-2xl border border-[#dfece3] bg-[#fbfefc] p-4">
                <p className="text-xs text-[#6b8577]">Nein</p>
                <p className="mt-1 text-3xl font-bold text-[#123024]">{stats.rejected}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 flex flex-wrap gap-3">
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
              className={`rounded-full border px-4 py-2 text-sm font-medium ${filter === value ? "border-[#1f7a4f] bg-[#1f7a4f] text-white" : "border-[#d8e8dd] bg-white text-[#355b49] hover:bg-[#eef7f1]"}`}
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
              <article key={study.id} className="rounded-[28px] border border-[#d8e8dd] bg-white p-6 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="max-w-4xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${study.editorialPriority === "high" ? "bg-[#e5f4ea] text-[#1f7a4f]" : study.editorialPriority === "medium" ? "bg-[#fff5df] text-[#9b6a13]" : "bg-[#eef3f0] text-[#567264]"}`}>
                        {study.editorialPriority === "high" ? "High" : study.editorialPriority === "medium" ? "Medium" : "Low"}
                      </span>
                      <span className="rounded-full bg-[#eef3f0] px-2.5 py-1 text-xs font-semibold text-[#567264]">{study.studyType ?? "study"}</span>
                      <span className="rounded-full bg-[#eef3f0] px-2.5 py-1 text-xs font-semibold text-[#567264]">{study.year}</span>
                      {decision && (
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${decision === "accepted" ? "bg-[#e5f4ea] text-[#1f7a4f]" : decision === "later" ? "bg-[#fff5df] text-[#9b6a13]" : "bg-[#fff1f1] text-[#a54b4b]"}`}>
                          {decision === "accepted" ? "Rein" : decision === "later" ? "Später" : "Nein"}
                        </span>
                      )}
                    </div>

                    <h2 className="mt-3 text-xl font-bold leading-tight text-[#10281e]">{study.title}</h2>

                    <div className="mt-4 space-y-2 text-sm text-[#355b49]">
                      {summaryLines.map((line) => (
                        <p key={line} className="rounded-xl bg-[#f6faf7] px-4 py-3">{line}</p>
                      ))}
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2 text-xs text-[#4d685a]">
                      <span className="rounded-full border border-[#d8e8dd] px-3 py-1">Quelle: {study.publisher}</span>
                      <span className="rounded-full border border-[#d8e8dd] px-3 py-1">Von: {study.originLabel ?? study.publisher}</span>
                      {study.firstAuthor && <span className="rounded-full border border-[#d8e8dd] px-3 py-1">Autor: {study.firstAuthor}</span>}
                      {(study.matchedTopics ?? []).map((topic) => (
                        <span key={topic} className="rounded-full border border-[#d8e8dd] px-3 py-1">{topic}</span>
                      ))}
                    </div>

                    {study.affiliationHints && study.affiliationHints.length > 0 && (
                      <p className="mt-3 text-sm text-[#4d685a]">
                        Institut/Uni: {study.affiliationHints.slice(0, 2).join(" · ")}
                      </p>
                    )}
                  </div>

                  <div className="flex w-full max-w-xs flex-col gap-3">
                    <a
                      href={study.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex justify-center rounded-xl border border-[#c8ddcf] bg-white px-4 py-2.5 text-sm font-semibold text-[#1f7a4f] hover:bg-[#eef7f1]"
                    >
                      Quelle öffnen
                    </a>
                    <button onClick={() => setDecision(study.id, "accepted")} className="rounded-xl bg-[#1f7a4f] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#17613f]">
                      Rein
                    </button>
                    <button onClick={() => setDecision(study.id, "later")} className="rounded-xl bg-[#c89a3f] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#b4872f]">
                      Später
                    </button>
                    <button onClick={() => setDecision(study.id, "rejected")} className="rounded-xl bg-[#b44d4d] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#983f3f]">
                      Nein
                    </button>
                  </div>
                </div>
              </article>
            );
          })}

          {visibleStudies.length === 0 && (
            <div className="rounded-[28px] border border-[#d8e8dd] bg-white p-10 text-center shadow-sm">
              <p className="text-[#4d685a]">Keine Studien in diesem Filter.</p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}