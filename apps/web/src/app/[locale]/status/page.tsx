import { Link } from "@/i18n/navigation";
import type { Route } from "next";
import { getApiHealth, getPublicOverview, getPublicStatusReport } from "@/lib/publicApi";
import { getAllUpdates, getBadgeClasses, getCategoryMetaFor } from "@/lib/updates";
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

// A missing/unrecognized value means "we couldn't determine this," not
// "this is down" — defaulting to red here previously made the whole page
// look like an outage whenever a single upstream field was absent, even
// though the underlying feature worked fine. Unknown maps to yellow.
const toRiskLevel = (value: string | null | undefined): "green" | "yellow" | "red" => {
  if (value === "red" || value === "yellow" || value === "green") {
    return value;
  }
  return "yellow";
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

const getImpactModel = (overallStatus: string) => {
  if (overallStatus === "red") {
    return {
      headline: "Gerade läuft nicht alles rund",
      summaryTitle: "Störung",
      summaryText: "Einige Funktionen sind aktuell nicht nutzbar. Wir arbeiten daran.",
      impactTitle: "Was das für dich bedeutet",
      impactText: "Grow-Tracking, Rechner und Studien können gerade eingeschränkt oder nicht erreichbar sein.",
      impactItems: [
        "Login und gespeicherte Grow-Daten können vorübergehend nicht abrufbar sein.",
        "Aktuelle Zahlen (z. B. Studien-Coverage) können veraltet sein.",
        "Diese Seite bleibt erreichbar und zeigt dir, sobald es wieder normal läuft."
      ],
      actionTitle: "Was du tun kannst",
      actionText: "Am einfachsten: kurz warten und später neu laden.",
      actionItems: [
        "Wichtige Eingaben nicht mehrfach absenden.",
        "In ein paar Minuten diese Seite neu laden.",
        "Bestehende Grow-Daten bleiben gespeichert, auch wenn sie kurz nicht sichtbar sind."
      ]
    };
  }

  if (overallStatus === "yellow") {
    return {
      headline: "Grundfunktionen laufen, einiges ist gerade langsamer",
      summaryTitle: "Eingeschränkter Betrieb",
      summaryText: "Die App funktioniert, aber manche Inhalte sind nicht ganz aktuell oder etwas langsamer als sonst.",
      impactTitle: "Was das für dich bedeutet",
      impactText: "Rechner, Grow-Tracking und Studien sind nutzbar — einzelne Daten können leicht veraltet sein.",
      impactItems: [
        "Neue Studien oder Aktualisierungen können etwas verzögert erscheinen.",
        "Alle Kernfunktionen (Tools, Grow, Login) funktionieren normal.",
        "Kein Grund, etwas doppelt einzutragen oder erneut zu versuchen."
      ],
      actionTitle: "Was du tun kannst",
      actionText: "Normal weiter nutzen — es ist keine besondere Vorsicht nötig.",
      actionItems: [
        "App wie gewohnt verwenden.",
        "Bei einzelnen Ladefehlern die Seite neu laden.",
        "Falls etwas seltsam aussieht, später nochmal reinschauen."
      ]
    };
  }

  return {
    headline: "Alles läuft normal",
    summaryTitle: "Normalbetrieb",
    summaryText: "Keine bekannten Störungen — alle Funktionen sind wie gewohnt nutzbar.",
    impactTitle: "Was das für dich bedeutet",
    impactText: "Es gibt aktuell keine Einschränkungen.",
    impactItems: [
      "Grow-Tracking, Rechner und Studien sind normal erreichbar.",
      "Daten sind aktuell.",
      "Kein Handlungsbedarf."
    ],
    actionTitle: "Was du tun kannst",
    actionText: "Nichts Besonderes — einfach normal weiter nutzen.",
    actionItems: [
      "App normal nutzen.",
      "Diese Seite bei Bedarf jederzeit als Referenz nutzen."
    ]
  };
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

const getPriorityCards = () => {
  return [
    {
      title: "Rechner nutzen",
      text: "VPD, Licht, Nährstoffe und Ertrag berechnen — funktioniert unabhängig vom aktuellen Status.",
      href: "/tools",
      cta: "Zu den Tools"
    },
    {
      title: "Düngerpläne",
      text: "Fertige Düngerpläne für dein Setup, Budget und Ziel.",
      href: "/tools/plans",
      cta: "Pläne ansehen"
    },
    {
      title: "Studien & Quellen",
      text: "Fachartikel und das komplette Quellenregister durchsuchen.",
      href: "/studies/sources",
      cta: "Quellenregister"
    }
  ];
};

export default async function StatusPage() {
  const [health, overview, statusReport] = await Promise.all([
    getApiHealth(),
    getPublicOverview(),
    getPublicStatusReport()
  ]);

  // health === null means the self-fetch to /api/health didn't resolve
  // (e.g. transient SSR fetch hiccup), not that the API is confirmed down —
  // only an explicit non-"ok" status justifies red. Folded into the overall
  // status as a safety net, without exposing raw API/DB jargon in the UI.
  const healthLevel = health === null ? "yellow" : health.status === "ok" ? "green" : "red";
  const overallStatus = mergeWorstLevel(statusReport?.overallStatus ?? "yellow", healthLevel);
  const generatedAt = statusReport ? new Date(statusReport.generatedAt).toLocaleString("de-DE") : "Kein Report verfügbar";
  const historyDays = buildStatusHistory(statusReport?.windowDays ?? 30, overallStatus, statusReport?.events ?? []);
  const impactModel = getImpactModel(overallStatus);
  const statusFreshness = getFreshnessMeta(statusReport?.generatedAt ?? null);
  const liveStudyCoveragePercent = overview?.stats.studyCoveragePercent ?? 0;
  const newStudiesLast24h = (statusReport?.events ?? []).find((event: StatusEvent) => event.key === "NEW_STUDIES_24H")?.count ?? 0;
  const coverageFreshness = getFreshnessMeta(overview?.stats.latestStudyAt ?? null);
  const priorityCards = getPriorityCards();

  // Zwei getrennte Blöcke weiter unten — bewusst NICHT gemischt:
  //   • "Automatischer Betrieb" = statusReport.events (Import-/Sync-/Coverage-
  //     Läufe der Pipeline).
  //   • "Neuigkeiten" = die `updates`-Tabelle (im Admin unter Neuigkeiten
  //     gepflegt) — neue Inhalte/Features, die Benny selbst einträgt.
  const news = (await getAllUpdates()).slice(0, 6);

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-[#145c3b] to-[#1f7a4f] text-sm font-bold text-white shadow-sm">S</div>
            <div>
              <div className="text-xl font-bold tracking-tight text-foreground">SecretLeaf Status</div>
              <div className="text-xs text-muted-fg">Ist gerade alles verfügbar?</div>
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
              Systemstatus
            </p>
            <h1 className="mt-4 text-5xl font-bold leading-tight text-foreground">{impactModel.headline}</h1>
            <p className="mt-3 max-w-3xl text-lg leading-relaxed text-muted-fg">
              {impactModel.summaryText}
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${levelClasses[overallStatus]}`}>
                <span className={`h-2.5 w-2.5 rounded-full ${levelDotClasses[overallStatus]}`} />
                {overallStatus === "green" ? "Alles läuft" : overallStatus === "yellow" ? "Eingeschränkt" : "Störung"}
              </span>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-border bg-background p-4">
                <div className="text-sm font-semibold text-foreground">{generatedAt}</div>
                <div className="mt-1 text-xs text-muted-fg">Letzte Prüfung</div>
                <span className={`mt-2 inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold ${statusFreshness.className}`}>
                  {statusFreshness.label}
                </span>
              </div>
              <div className="rounded-2xl border border-border bg-background p-4">
                <div className="text-sm font-semibold text-foreground">
                  {overview?.stats.latestStudyAt ? new Date(overview.stats.latestStudyAt).toLocaleString("de-DE") : "n/a"}
                </div>
                <div className="mt-1 text-xs text-muted-fg">Studien-Daten zuletzt aktualisiert</div>
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
                <div className="text-2xl font-bold text-foreground">{newStudiesLast24h}</div>
                <div className="mt-1 text-xs text-muted-fg">neue Studien (24h)</div>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-border bg-background p-4">
              <h3 className="text-base font-semibold text-foreground">Aktuelle Auswirkung</h3>
              <p className="mt-2 text-sm text-muted-fg">{impactModel.impactText}</p>
            </div>
          </aside>
        </div>

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
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-400">Weiter geht&apos;s</p>
          <h2 className="mt-2 text-2xl font-bold text-foreground">Direkt weitermachen</h2>
          <p className="mt-2 text-sm text-muted-fg">
            Diese Bereiche funktionieren unabhängig vom aktuellen Status.
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

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Link href="/status" className="rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground hover:bg-background">
              Status Fokus
            </Link>
            <Link href={"/tools/plans" as Route} className="rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground hover:bg-background">
              Coverage Audit
            </Link>
            <Link href={"/studies/sources" as Route} className="rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground hover:bg-background">
              Quellenregister
            </Link>
          </div>
        </section>

        <section className="mt-8 rounded-[28px] border border-border bg-card p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-400">Coverage</p>
          <h2 className="mt-2 text-2xl font-bold text-foreground">Studien-Coverage</h2>
          <p className="mt-2 text-sm text-muted-fg">
            Live Studien-Coverage: {overview?.stats.goodStudies ?? 0} von {overview?.stats.totalStudies ?? 0} als good markiert ({liveStudyCoveragePercent}%).
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-background p-4">
              <p className="text-xs text-muted-fg">Datenfrische</p>
              <div className={`mt-2 inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${coverageFreshness.className}`}>
                {coverageFreshness.label}
              </div>
            </div>
            <div className="rounded-xl border border-border bg-background p-4">
              <p className="text-xs text-muted-fg">Neue Studien (24h)</p>
              <p className="mt-2 text-2xl font-bold text-foreground">{newStudiesLast24h}</p>
            </div>
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
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-400">Automatischer Betrieb</p>
            <h2 className="mt-2 text-2xl font-bold text-foreground">Automatische Läufe &amp; Datenaktualität</h2>
            <p className="mt-2 text-sm text-muted-fg">
              Import-, Sync- und Coverage-Läufe der Pipeline aus den letzten 30 Tagen — wie frisch die Daten sind und ob etwas auffällig war.
            </p>

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
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-400">Neuigkeiten</p>
            <h2 className="mt-2 text-2xl font-bold text-foreground">Neue Inhalte, Features &amp; Fixes</h2>
            <p className="mt-2 text-sm text-muted-fg">Manuell gepflegte Änderungen an SecretLeaf — getrennt von den automatischen Läufen links.</p>

            <div className="mt-5 space-y-3">
              {news.length === 0 && (
                <p className="rounded-xl border border-border bg-background p-4 text-sm text-muted-fg">
                  Noch keine Einträge.
                </p>
              )}
              {news.map((entry) => (
                <article key={entry.slug} className="rounded-xl border border-border bg-background p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getBadgeClasses(entry.category)}`}>
                      {getCategoryMetaFor(entry.category).label}
                    </span>
                    {entry.version && (
                      <span className="rounded-full border border-border bg-card px-2.5 py-0.5 text-xs font-mono text-muted-fg">
                        {entry.version}
                      </span>
                    )}
                    <time className="ml-auto text-xs text-muted-fg">
                      {new Date(entry.date).toLocaleDateString("de-DE", { day: "2-digit", month: "long", year: "numeric" })}
                    </time>
                  </div>
                  <h3 className="mt-2 text-sm font-semibold text-foreground">{entry.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-muted-fg">{entry.summary}</p>
                </article>
              ))}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
