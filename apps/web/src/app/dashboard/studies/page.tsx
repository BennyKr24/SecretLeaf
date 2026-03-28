"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import autoSourcesData from "@/data/terpira/autoSources.json";
import { clearSession, getSession } from "@/lib/auth";
import type { SessionData } from "@/lib/types";
import type { TerpiraSource } from "@/lib/terpira/types";

type ReviewDecision = "accepted" | "later" | "rejected";
type DecisionFilter = "open" | ReviewDecision | "all";

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

  useEffect(() => {
    setSession(getSession());
    setDecisions(loadDecisions());
  }, []);

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

  const setDecision = (studyId: string, decision: ReviewDecision) => {
    const next = { ...decisions, [studyId]: decision };
    setDecisions(next);
    saveDecisions(next);
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
            <p className="text-sm text-[#4d685a]">Kurz lesen, Quelle pruefen, dann `Rein`, `Spaeter` oder `Nein` klicken.</p>
          </div>
          <div className="flex gap-3 text-sm">
            <Link href="/dashboard" className="font-medium text-[#4d685a] hover:text-[#173126]">Dashboard</Link>
            <Link href="/wiki/quellen" className="font-medium text-[#4d685a] hover:text-[#173126]">Quellen</Link>
            <button
              onClick={() => {
                clearSession();
                setSession(null);
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
          <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <p className="text-sm text-[#4d685a]">
                Sync vom {new Date(autoSourcesData.generatedAt).toLocaleString("de-DE")} · {autoSourcesData.stats.kept} Kandidaten nach Filterung · {autoSourcesData.stats.excluded} ausgeschlossen.
              </p>
              <p className="mt-3 text-sm text-[#4d685a]">
                Jede Karte zeigt bewusst nur 3 Zeilen: Evidenz, Herkunft/Institut und warum die Studie fuer SecretLeaf relevant sein koennte.
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
                <p className="text-xs text-[#6b8577]">Spaeter</p>
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
            ["later", `Spaeter (${stats.later})`],
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
                          {decision === "accepted" ? "Rein" : decision === "later" ? "Spaeter" : "Nein"}
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
                      Quelle oeffnen
                    </a>
                    <button onClick={() => setDecision(study.id, "accepted")} className="rounded-xl bg-[#1f7a4f] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#17613f]">
                      Rein
                    </button>
                    <button onClick={() => setDecision(study.id, "later")} className="rounded-xl bg-[#c89a3f] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#b4872f]">
                      Spaeter
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