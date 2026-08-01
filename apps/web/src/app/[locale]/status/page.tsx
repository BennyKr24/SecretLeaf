import { Link } from "@/i18n/navigation";
import type { Route } from "next";
import { getApiHealth, getPublicOverview, getPublicStatusReport } from "@/lib/publicApi";
import changelogData from "@/data/changelog.json";
import fertilizerCoverageHistoryData from "@/data/fertilizerCoverageHistory.json";
import { fertilizerCoverageStats } from "@/data/terpira/fertilizers";
import type { StatusEvent } from "@/lib/types";

const levelClasses: Record<string, string> = {
  green: "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/40",
  yellow: "bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/40",
  red: "bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900/40"
};

const levelDotClasses: Record<string, string> = {
  green: "bg-emerald-500",
  yellow: "bg-amber-500",
  red: "bg-rose-500"
};

const levelRank: Record<string, number> = {
  green: 0,
  yellow: 1,
  red: 2
};

const toRiskLevel = (value: string | null | undefined): "green" | "yellow" | "red" => {
  if (value === "red" || value === "yellow" || value === "green") {
    return value;
  }
  return "red";
};

const mergeWorstLevel = (...levels: Array<string | null | undefined>): "green" | "yellow" | "red" => {
  return levels
    .map((value) => toRiskLevel(value))
    .sort((a, b) => (levelRank[b] ?? 2) - (levelRank[a] ?? 2))[0] as "green" | "yellow" | "red";
};

const buildStatusHistory = (windowDays: number, overallStatus: string, events: Array<{ level: string; lastSeen: string | null }>) => {
  const totalDays = Math.max(1, Math.min(windowDays || 30, 30));
  const days = Array.from({ length: totalDays }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (totalDays - 1 - index));
    return {
      date: date.toISOString(),
      level: "green"
    };
  });

  events.forEach((event) => {
    if (!event.lastSeen) return;
    const eventDate = new Date(event.lastSeen);
    eventDate.setHours(0, 0, 0, 0);

    days.forEach((day) => {
      const dayDate = new Date(day.date);
      const eventRank = levelRank[event.level] ?? 0;
      const currentRank = levelRank[day.level] ?? 0;
      if (dayDate.getTime() === eventDate.getTime() && eventRank > currentRank) {
        day.level = event.level;
      }
    });
  });

  const lastDay = days.at(-1);
  if (lastDay) {
    lastDay.level = overallStatus;
  }
  return days;
};

const getImpactModel = (overallStatus: string, apiLevel: string, dbLevel: string) => {
  if (overallStatus === "red") {
    return {
      headline: "Zentrale Plattformfunktionen sind derzeit nicht verfügbar",
      summaryTitle: "Erhebliche Einschränkung",
      summaryText: "Die Statusseite bleibt erreichbar. Produktive Funktionen sind aktuell offline.",
      impactTitle: "Betroffene Bereiche",
      impactText: "Interaktive und backend-gestützte Funktionen sind derzeit nicht zuverlässig nutzbar.",
      impactItems: [
        apiLevel === "red" ? "API-gestützte Inhalte, Login und dynamische Bereiche sind nicht verfügbar." : "API ist nur eingeschränkt verfügbar.",
        dbLevel === "red" ? "Datenbankabfragen und gespeicherte Daten sind derzeit nicht erreichbar." : "Datenbasis ist nur teilweise erreichbar.",
        "Die Statusseite bleibt der zentrale Anlaufpunkt für Updates."
      ],
      actionTitle: "Empfohlene Schritte",
      actionText: "Im roten Zustand steht Orientierung vor Interaktion.",
      actionItems: [
        "Keine sensiblen Daten eingeben oder Aktionen mehrfach absenden.",
        "Nur Status- und Informationsseiten als zuverlässig ansehen.",
        "Später erneut prüfen, ob Dienste wieder auf Gelb oder Grün wechseln."
      ]
    };
  }

  if (overallStatus === "yellow") {
    return {
      headline: "Teile der Plattform laufen im Fallback- oder Wartungsmodus",
      summaryTitle: "Eingeschränkter Betrieb",
      summaryText: "Einzelne Dienste oder Live-Daten können eingeschränkt oder unvollständig sein.",
      impactTitle: "Mögliche Auswirkungen",
      impactText: "Grundfunktionen sind sichtbar, aber Ergebnisse sind eventuell nicht vollständig.",
      impactItems: [
        "Live-Daten können aus eingeschränkten Quellen stammen.",
        "Antwortzeiten und Datentiefe können reduziert sein.",
        "Die Statusseite ist der zuverlässigste Kanal für Updates."
      ],
      actionTitle: "Empfohlene Schritte",
      actionText: "Im gelben Zustand ist Vorsicht sinnvoll, aber nicht jede Funktion automatisch unbenutzbar.",
      actionItems: [
        "Vor wichtigen Aktionen kurz Status und Zeitstempel prüfen.",
        "Keine sensiblen Vorgänge mehrfach absenden.",
        "Bei Unklarheiten später erneut laden."
      ]
    };
  }

  return {
    headline: "Alle zentralen Statussignale sind aktuell stabil",
    summaryTitle: "Normalbetrieb",
    summaryText: "Statusseite, API und Datenbasis melden keinen kritischen Ausfall.",
    impactTitle: "Aktuelle Auswirkung",
    impactText: "Es gibt derzeit keine größeren Einschränkungen für Nutzer.",
    impactItems: [
      "Live-Daten sind verfügbar.",
      "Keine bekannten Plattformausfälle im aktuellen Snapshot.",
      "Die Statusseite dient als Referenz und Historie."
    ],
    actionTitle: "Empfohlene Schritte",
    actionText: "Im Normalbetrieb sind keine besonderen Maßnahmen nötig.",
    actionItems: [
      "Plattform normal nutzen.",
      "Bei seltenen Einzelproblemen später neu laden.",
      "Historie nur bei Rückfragen oder Störungen konsultieren."
    ]
  };
};

const typeLabels: Record<string, { label: string; cls: string }> = {
  feature:     { label: "Feature",      cls: "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/40" },
  fix:         { label: "Bugfix",       cls: "bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/40" },
  security:    { label: "Sicherheit",   cls: "bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900/40" },
  performance: { label: "Performance",  cls: "bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900/40" },
  release:     { label: "Release",      cls: "bg-violet-100 dark:bg-violet-950/40 text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-900/40" },
  docs:        { label: "Doku",         cls: "bg-border text-foreground/80 border-border" },
  chore:       { label: "Intern",       cls: "bg-border text-foreground/80 border-border" },
  update:      { label: "Update",       cls: "bg-cyan-100 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-400 border-cyan-200 dark:border-cyan-900/40" },
};

const getFreshnessMeta = (iso: string | null) => {
  if (!iso) {
    return {
      label: "Kein Timestamp",
      className: "bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900/40"
    };
  }

  const diffMs = Date.now() - new Date(iso).getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffHours <= 1) {
    return {
      label: "Sehr aktuell",
      className: "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/40"
    };
  }

  if (diffHours <= 24) {
    return {
      label: `${diffHours}h alt`,
      className: "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/40"
    };
  }

  if (diffHours <= 72) {
    return {
      label: `${diffHours}h alt`,
      className: "bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/40"
    };
  }

  return {
    label: `${diffHours}h alt`,
    className: "bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900/40"
  };
};

const getPriorityCards = (overallStatus: string) => {
  if (overallStatus === "red") {
    return [
      {
        title: "1) Betrieb absichern",
        text: "Zuerst Status und Incident-Lage prüfen, bevor weitere Ansichten bewertet werden.",
        href: "/status",
        cta: "Statusfokus"
      },
      {
        title: "2) Kritische Datenwege",
        text: "API/DB-Lage klären, damit Zahlen in Coverage- oder Marktansichten korrekt eingeordnet werden.",
        href: "/tools/plans",
        cta: "Coverage mit Vorsicht"
      },
      {
        title: "3) Kommunikation",
        text: "Nur belastbare Hinweise nach außen geben und auf Fallback-Status verweisen.",
        href: "/studies/sources",
        cta: "Quellenkontext"
      }
    ];
  }

  if (overallStatus === "yellow") {
    return [
      {
        title: "1) Engpässe priorisieren",
        text: "Eingeschränkte Teilbereiche zuerst stabilisieren, dann Inhaltstiefe und neue Features hochfahren.",
        href: "/status",
        cta: "Service-Checks"
      },
      {
        title: "2) Datenfrische prüfen",
        text: "Coverage- und Status-Timestamps gegenchecken, bevor Entscheidungen auf Trends basieren.",
        href: "/tools/plans",
        cta: "Coverage ansehen"
      },
      {
        title: "3) Evidenz priorisieren",
        text: "Bei reduzierter Live-Lage bleiben Quellenregister und Basiskennzahlen wichtig.",
        href: "/studies/sources",
        cta: "Quellenregister"
      }
    ];
  }

  return [
    {
      title: "1) Normalbetrieb halten",
      text: "Status ist stabil. Fokus kann auf Produktpflege, Content-Qualität und Sichtbarkeit liegen.",
      href: "/status",
      cta: "Statusmonitoring"
    },
    {
      title: "2) Marktbreite erweitern",
      text: "Coverage-Lücken pro Marke priorisieren und Daten-Updates in festen Intervallen planen.",
      href: "/tools/plans",
      cta: "Abdeckung prüfen"
    },
    {
      title: "3) Wissensqualität sichern",
      text: "Quellen und Fachbereiche aktuell halten, damit Priorisierungen fachlich belastbar bleiben.",
      href: "/studies/sources",
      cta: "Quellen & Studien"
    }
  ];
};

export default async function StatusPage() {
  const [health, overview, statusReport] = await Promise.all([
    getApiHealth(),
    getPublicOverview(),
    getPublicStatusReport()
  ]);

  const overallStatus = statusReport?.overallStatus ?? "yellow";
  const generatedAt = statusReport ? new Date(statusReport.generatedAt).toLocaleString("de-DE") : "Kein Report verfügbar";
  const healthLevel = health?.status === "ok" ? "green" : "red";
  const apiLevel = mergeWorstLevel(statusReport?.services.api, healthLevel);
  const dbLevel = toRiskLevel(statusReport?.services.db ?? "red");
  const sourceLabel = health && overview && statusReport ? "Live API" : "Fallback / kein Vollzugriff";
  const historyDays = buildStatusHistory(statusReport?.windowDays ?? 30, overallStatus, statusReport?.events ?? []);
  const impactModel = getImpactModel(overallStatus, apiLevel, dbLevel);
  const openCoverageGap = Math.max(fertilizerCoverageStats.trackedMarketEstimate - fertilizerCoverageStats.coveredProducts, 0);
  const coverageSnapshots = [...(fertilizerCoverageHistoryData.snapshots ?? [])].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  const coverageHistory = coverageSnapshots.slice(-6);
  const latestCoverageSnapshot = coverageSnapshots.at(-1) ?? null;
  const previousCoverageSnapshot = coverageSnapshots.length > 1 ? coverageSnapshots.at(-2) : null;
  const coverageDelta = latestCoverageSnapshot && previousCoverageSnapshot
    ? Number((latestCoverageSnapshot.coverage - previousCoverageSnapshot.coverage).toFixed(1))
    : null;
  const statusFreshness = getFreshnessMeta(statusReport?.generatedAt ?? null);
  const liveStudyCoveragePercent = overview?.stats.studyCoveragePercent ?? fertilizerCoverageStats.coveragePercent;
  const livePendingStudies = overview?.stats.pendingStudies ?? openCoverageGap;
  const totalStudies = overview?.stats.totalStudies ?? 0;
  const pipelineEvent = (statusReport?.events ?? []).find((event: StatusEvent) => event.key === "SYNC_ACTIVITY_24H") ?? null;
  const pipelineLastRunIso = pipelineEvent?.lastSeen ?? null;
  const pipelineLastRun = pipelineLastRunIso ? new Date(pipelineLastRunIso).toLocaleString("de-DE") : "Keine Daten";
  const pipelineHealthLabel =
    overallStatus === "green" ? "healthy" : overallStatus === "yellow" ? "degraded" : "failing";
  const coverageFreshness = getFreshnessMeta(overview?.stats.latestStudyAt ?? latestCoverageSnapshot?.date ?? null);
  const priorityCards = getPriorityCards(overallStatus);

  const operationalChangelog = (statusReport?.events ?? [])
    .filter((event: StatusEvent) => event.count > 0 || event.lastSeen)
    .slice(0, 4)
    .map((event: StatusEvent) => ({
      hash: `ops-${event.key}-${event.lastSeen ?? statusReport?.generatedAt ?? "now"}`,
      version: null,
      date: (event.lastSeen ?? statusReport?.generatedAt ?? new Date().toISOString()).slice(0, 10),
      title: event.label,
      type: event.level === "red" ? "security" : event.level === "yellow" ? "fix" : "update",
      changes: [event.description, `Count: ${event.count}`],
    }));

  const changelog = [...(changelogData.releases ?? []), ...operationalChangelog]
    .sort((a, b) => {
      const byDate = new Date(b.date).getTime() - new Date(a.date).getTime();
      if (byDate !== 0) return byDate;
      const aIsRelease = Boolean(a.version);
      const bIsRelease = Boolean(b.version);
      if (aIsRelease === bIsRelease) return 0;
      return aIsRelease ? -1 : 1;
    })
    .slice(0, 8);

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-[#145c3b] to-[#1f7a4f] text-sm font-bold text-white shadow-sm">S</div>
            <div>
              <div className="text-xl font-bold tracking-tight text-foreground">SecretLeaf Status Cockpit</div>
              <div className="text-xs text-muted-fg">Live-Lage, Datenfrische, Prioritätensteuerung</div>
            </div>
          </div>

          <Link href="/" className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-background">
            Zurück zur Homepage
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-[28px] border border-border bg-card p-7 shadow-sm">
            <p className="inline-flex rounded-full border border-emerald-200 dark:border-emerald-900/40 bg-emerald-100 dark:bg-emerald-950/40 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
              Status Cockpit 2026
            </p>
            <h1 className="mt-4 text-5xl font-bold leading-tight text-foreground">{impactModel.headline}</h1>
            <p className="mt-3 max-w-3xl text-lg leading-relaxed text-muted-fg">
              Diese Seite priorisiert zuerst den Betriebszustand und die Datenfrische. Danach folgen Wirkung, Verlauf und die nächsten sinnvollen Arbeitsansichten.
            </p>

            <div className="mt-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/40 bg-emerald-50 dark:bg-emerald-950/30 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">Neu auf dieser Seite</p>
              <p className="mt-1 text-sm text-emerald-800 dark:text-emerald-300">
                Priorisierungs-Block, Freshness-Badges und direkte Arbeitsnavigation wurden als erste Ebene integriert.
              </p>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${levelClasses[overallStatus]}`}>
                <span className={`h-2.5 w-2.5 rounded-full ${levelDotClasses[overallStatus]}`} />
                Gesamtstatus {overallStatus.toUpperCase()}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                Statusseite erreichbar
              </span>
              <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${levelClasses[apiLevel]}`}>
                <span className={`h-2.5 w-2.5 rounded-full ${levelDotClasses[apiLevel]}`} />
                API {apiLevel.toUpperCase()}
              </span>
              <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${levelClasses[dbLevel]}`}>
                <span className={`h-2.5 w-2.5 rounded-full ${levelDotClasses[dbLevel]}`} />
                DB {dbLevel.toUpperCase()}
              </span>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-border bg-background p-4">
                <div className="text-sm font-semibold text-foreground">{generatedAt}</div>
                <div className="mt-1 text-xs text-muted-fg">letztes Update</div>
                <span className={`mt-2 inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold ${statusFreshness.className}`}>
                  {statusFreshness.label}
                </span>
              </div>
              <div className="rounded-2xl border border-border bg-background p-4">
                <div className="text-sm font-semibold text-foreground">{sourceLabel}</div>
                <div className="mt-1 text-xs text-muted-fg">Datenquelle</div>
              </div>
              <div className="rounded-2xl border border-border bg-background p-4">
                <div className="text-sm font-semibold text-foreground">{statusReport?.windowDays ?? 30} Tage</div>
                <div className="mt-1 text-xs text-muted-fg">Rückblick</div>
              </div>
              <div className="rounded-2xl border border-border bg-background p-4">
                <div className="text-sm font-semibold text-foreground">
                  {latestCoverageSnapshot ? new Date(latestCoverageSnapshot.date).toLocaleString("de-DE") : "n/a"}
                </div>
                <div className="mt-1 text-xs text-muted-fg">Coverage Snapshot</div>
                <span className={`mt-2 inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold ${coverageFreshness.className}`}>
                  {coverageFreshness.label}
                </span>
              </div>
            </div>
          </section>

          <aside className="rounded-[28px] border border-border bg-card p-7 shadow-sm">
            <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${levelClasses[overallStatus]}`}>
              <span className={`h-2.5 w-2.5 rounded-full ${levelDotClasses[overallStatus]}`} />
              {overallStatus === "red" ? "Aktiver Incident" : overallStatus === "yellow" ? "Eingeschränkter Betrieb" : "Kein aktiver Incident"}
            </div>
            <h2 className="mt-4 text-2xl font-bold text-foreground">{impactModel.summaryTitle}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-fg">{impactModel.summaryText}</p>

            <div className="mt-4 rounded-xl border border-border bg-background px-3 py-2 text-xs text-muted-fg">
              Ansicht zuletzt neu priorisiert für Status + Coverage + Quellenkontext.
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              <div className="rounded-2xl border border-border bg-background p-4">
                <div className="text-2xl font-bold text-foreground">{overallStatus.toUpperCase()}</div>
                <div className="mt-1 text-xs text-muted-fg">Gesamtstatus</div>
              </div>
              <div className="rounded-2xl border border-border bg-background p-4">
                <div className="text-2xl font-bold text-foreground">{liveStudyCoveragePercent}%</div>
                <div className="mt-1 text-xs text-muted-fg">Studien-Coverage (good)</div>
              </div>
              <div className="rounded-2xl border border-border bg-background p-4">
                <div className="text-2xl font-bold text-foreground">{livePendingStudies}</div>
                <div className="mt-1 text-xs text-muted-fg">offene Studien-Reviews</div>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-border bg-background p-4">
              <h3 className="text-base font-semibold text-foreground">Aktuelle Auswirkung</h3>
              <p className="mt-2 text-sm text-muted-fg">{impactModel.impactText}</p>
            </div>
          </aside>
        </div>

        <section className="mt-8 rounded-[28px] border border-border bg-card p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-400">Systemstatus</p>
          <h2 className="mt-2 text-2xl font-bold text-foreground">Systemzustand auf einen Blick</h2>
          <p className="mt-2 text-sm text-muted-fg">
            API- und Datenbankstatus, letzte Pipeline-Ausführung sowie Datenaktualität in einer kompakten Übersicht.
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <article className="rounded-2xl border border-border bg-background p-4">
              <p className="text-xs text-muted-fg">API-Status</p>
              <p className="mt-1 text-2xl font-bold text-foreground">{apiLevel.toUpperCase()}</p>
            </article>
            <article className="rounded-2xl border border-border bg-background p-4">
              <p className="text-xs text-muted-fg">Datenbank-Verbindung</p>
              <p className="mt-1 text-2xl font-bold text-foreground">{dbLevel.toUpperCase()}</p>
            </article>
            <article className="rounded-2xl border border-border bg-background p-4">
              <p className="text-xs text-muted-fg">Pipeline-Health</p>
              <p className="mt-1 text-2xl font-bold text-foreground">{pipelineHealthLabel}</p>
            </article>
            <article className="rounded-2xl border border-border bg-background p-4">
              <p className="text-xs text-muted-fg">Letzter Pipeline-Run</p>
              <p className="mt-1 text-sm font-semibold text-foreground">{pipelineLastRun}</p>
            </article>
            <article className="rounded-2xl border border-border bg-background p-4">
              <p className="text-xs text-muted-fg">Letztes Update</p>
              <p className="mt-1 text-sm font-semibold text-foreground">{generatedAt}</p>
            </article>
            <article className="rounded-2xl border border-border bg-background p-4">
              <p className="text-xs text-muted-fg">Anzahl Studien</p>
              <p className="mt-1 text-2xl font-bold text-foreground">{totalStudies}</p>
            </article>
          </div>
        </section>

        <section className="mt-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-400">Betrieb</p>
          <h2 className="mt-2 text-2xl font-bold text-foreground">Aktueller Systemzustand</h2>
          <p className="mt-2 text-sm text-muted-fg">Erst die Live-Fähigkeit prüfen, dann Fachzahlen interpretieren.</p>

          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="text-xs text-muted-fg">Statische Website</div>
              <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                ERREICHBAR
              </div>
              <p className="mt-3 text-sm text-muted-fg">Die Statusseite bleibt als Referenzpunkt online, auch wenn Live-Dienste fehlen.</p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="text-xs text-muted-fg">API / Backend</div>
              <div className={`mt-3 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${levelClasses[apiLevel]}`}>
                <span className={`h-2.5 w-2.5 rounded-full ${levelDotClasses[apiLevel]}`} />
                {apiLevel.toUpperCase()}
              </div>
              <p className="mt-3 text-sm text-muted-fg">{health?.status === "ok" ? "API antwortet auf Health-Checks und Statusdaten." : "API ist nicht stabil als Live-Dienst erreichbar."}</p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="text-xs text-muted-fg">Datenbank</div>
              <div className={`mt-3 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${levelClasses[dbLevel]}`}>
                <span className={`h-2.5 w-2.5 rounded-full ${levelDotClasses[dbLevel]}`} />
                {dbLevel.toUpperCase()}
              </div>
              <p className="mt-3 text-sm text-muted-fg">{dbLevel === "green" ? "Datenbasis meldet verfügbare Live-Daten." : "Datenbankabfragen sind eingeschränkt oder nicht produktiv erreichbar."}</p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="text-xs text-muted-fg">Statusquelle</div>
              <div className={`mt-3 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${levelClasses[sourceLabel === "Live API" ? "green" : "yellow"]}`}>
                <span className={`h-2.5 w-2.5 rounded-full ${levelDotClasses[sourceLabel === "Live API" ? "green" : "yellow"]}`} />
                {sourceLabel}
              </div>
              <p className="mt-3 text-sm text-muted-fg">{sourceLabel === "Live API" ? "Werte kommen direkt aus den Status-Endpoints." : "Mindestens ein Live-Endpoint fehlt, die Seite bleibt aber als Statuskanal verfügbar."}</p>
            </div>
          </div>
        </section>

        <div className="mt-8 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-400">Nutzerwirkung</p>
            <h2 className="mt-2 text-2xl font-bold text-foreground">{impactModel.impactTitle}</h2>
            <p className="mt-2 text-sm text-muted-fg">{impactModel.impactText}</p>
            <ul className="mt-4 space-y-3 text-sm text-muted-fg">
              {impactModel.impactItems.map((item) => (
                <li key={item} className="rounded-xl border border-border bg-background px-4 py-3">{item}</li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-400">Aktion</p>
            <h2 className="mt-2 text-2xl font-bold text-foreground">{impactModel.actionTitle}</h2>
            <p className="mt-2 text-sm text-muted-fg">{impactModel.actionText}</p>
            <ul className="mt-4 space-y-3 text-sm text-muted-fg">
              {impactModel.actionItems.map((item) => (
                <li key={item} className="rounded-xl border border-border bg-background px-4 py-3">{item}</li>
              ))}
            </ul>
          </section>
        </div>

        <section className="mt-8 rounded-[28px] border border-border bg-card p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-400">Priorisierung</p>
          <h2 className="mt-2 text-2xl font-bold text-foreground">Was jetzt zuerst wichtig ist</h2>
          <p className="mt-2 text-sm text-muted-fg">
            Diese Reihenfolge ist die operative Arbeitsreihenfolge nach Statuslage.
          </p>

          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            {priorityCards.map((card) => (
              <article key={card.title} className="rounded-2xl border border-border bg-background p-5">
                <h3 className="text-lg font-semibold text-foreground">{card.title}</h3>
                <p className="mt-2 text-sm text-muted-fg">{card.text}</p>
                <Link
                  href={card.href as Route}
                  className="mt-4 inline-flex items-center rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-background"
                >
                  {card.cta}
                </Link>
              </article>
            ))}
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Link href="/status" className="rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground hover:bg-background">
              Status Fokus
            </Link>
            <Link href={"/tools/plans" as Route} className="rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground hover:bg-background">
              Coverage Audit
            </Link>
            <Link href={"/studies/sources" as Route} className="rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground hover:bg-background">
              Quellenregister
            </Link>
            <Link href={"/database/fertilizers" as Route} className="rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground hover:bg-background">
              Dünger-Katalog
            </Link>
          </div>
        </section>

        <section className="mt-8 rounded-[28px] border border-border bg-card p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-400">Coverage Verlauf</p>
          <h2 className="mt-2 text-2xl font-bold text-foreground">Dünger-Marktabdeckung im Zeitverlauf</h2>
          <p className="mt-2 text-sm text-muted-fg">
            Live Studien-Coverage: {overview?.stats.goodStudies ?? 0} von {overview?.stats.totalStudies ?? 0} als good markiert ({liveStudyCoveragePercent}%).
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-border bg-background p-4">
              <p className="text-xs text-muted-fg">Datenfrische</p>
              <div className={`mt-2 inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${coverageFreshness.className}`}>
                {coverageFreshness.label}
              </div>
            </div>
            <div className="rounded-xl border border-border bg-background p-4">
              <p className="text-xs text-muted-fg">Trend vs. letzter Snapshot</p>
              <p className="mt-2 text-2xl font-bold text-foreground">
                {coverageDelta == null ? "n/a" : `${coverageDelta > 0 ? "+" : ""}${coverageDelta}%`}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-background p-4">
              <p className="text-xs text-muted-fg">Offene Reviews</p>
              <p className="mt-2 text-2xl font-bold text-foreground">{livePendingStudies}</p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-5">
            {coverageHistory.map((point) => (
              <article key={point.date} className="rounded-xl border border-border bg-background p-4">
                <time className="text-xs text-muted-fg">{new Date(point.date).toLocaleDateString("de-DE")}</time>
                <div className="mt-2 text-2xl font-bold text-foreground">{point.coverage}%</div>
                <div className="mt-1 h-2 rounded bg-emerald-100 dark:bg-emerald-950/40 overflow-hidden">
                  <div className="h-full bg-emerald-600 dark:bg-emerald-500" style={{ width: `${Math.min(point.coverage, 100)}%` }} />
                </div>
                <p className="mt-2 text-xs text-muted-fg">{point.coveredProducts}/{point.marketEstimate}</p>
                <p className="mt-1 text-xs text-muted-fg">{point.note}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-[28px] border border-border bg-card p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-400">Verlauf</p>
          <h2 className="mt-2 text-2xl font-bold text-foreground">Statusverlauf letzte 30 Tage</h2>
          <p className="mt-2 text-sm text-muted-fg">Links älter, rechts aktueller. Die Punkte zeigen den groben Statusverlauf.</p>

          <div className="mt-5 grid gap-2" style={{ gridTemplateColumns: `repeat(${historyDays.length}, minmax(0, 1fr))` }}>
            {historyDays.map((day) => (
              <div
                key={day.date}
                className={`aspect-square rounded-full border border-black/5 ${levelDotClasses[day.level]}`}
                title={`${new Date(day.date).toLocaleDateString("de-DE")}: ${day.level.toUpperCase()}`}
              />
            ))}
          </div>

          <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-fg">
            <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Grün — stabil</span>
            <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> Gelb — eingeschränkt</span>
            <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-rose-500" /> Rot — Störung</span>
          </div>
        </section>

        <div className="mt-8 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-400">Historie</p>
            <h2 className="mt-2 text-2xl font-bold text-foreground">Risikoreport letzte 30 Tage</h2>
            <p className="mt-2 text-sm text-muted-fg">Fokus auf potenziell problematische Ereignisse für Nutzer und Betriebsstabilität.</p>

            <div className="mt-5 space-y-3">
              {(statusReport?.events ?? []).map((event: StatusEvent) => (
                <article key={event.key} className="rounded-xl border border-border bg-background p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className={`h-3 w-3 rounded-full ${levelDotClasses[event.level]}`} />
                      <h3 className="font-semibold text-foreground">{event.label}</h3>
                    </div>
                    <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${levelClasses[event.level]}`}>
                      {event.level.toUpperCase()} | {event.count}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-muted-fg">{event.description}</p>
                  <p className="mt-1 text-xs text-muted-fg">
                    Letztes Ereignis: {event.lastSeen ? new Date(event.lastSeen).toLocaleString("de-DE") : "kein Treffer im Zeitraum"}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-400">Chronik</p>
            <h2 className="mt-2 text-2xl font-bold text-foreground">Letzte Patches, Releases und Prioritätswechsel</h2>
            <p className="mt-2 text-sm text-muted-fg">Automatisch aus Git-Commits generiert und als Kontext für Betriebs- und Produktentscheidungen nutzbar.</p>

            <div className="mt-5 space-y-3">
              {changelog.map((entry) => {
                const tl = typeLabels[entry.type] ?? typeLabels["update"]!;
                return (
                  <article key={entry.hash} className="rounded-xl border border-border bg-background p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${tl.cls}`}>{tl.label}</span>
                      {entry.version && (
                        <span className="rounded-full border border-border bg-card px-2.5 py-0.5 text-xs font-mono text-muted-fg">v{entry.version}</span>
                      )}
                      <time className="ml-auto text-xs text-muted-fg">
                        {new Date(entry.date).toLocaleDateString("de-DE", { day: "2-digit", month: "long", year: "numeric" })}
                      </time>
                    </div>
                    <h3 className="mt-2 text-sm font-semibold text-foreground">{entry.title}</h3>
                    {entry.changes.length > 0 && (
                      <ul className="mt-2 space-y-1">
                        {entry.changes.slice(0, 4).map((change: string, i: number) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-muted-fg">
                            <span className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-400" />
                            {change}
                          </li>
                        ))}
                        {entry.changes.length > 4 && (
                          <li className="text-xs text-muted-fg pl-3.5">+ {entry.changes.length - 4} weitere Änderungen</li>
                        )}
                      </ul>
                    )}
                  </article>
                );
              })}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
