import Link from "next/link";
import { getApiHealth, getPublicOverview, getPublicStatusReport } from "../../lib/publicApi";
import changelogData from "../../data/changelog.json";
import fertilizerCoverageHistoryData from "../../data/fertilizerCoverageHistory.json";
import { fertilizerCoverageStats } from "../../data/terpira/fertilizers";

const levelClasses: Record<string, string> = {
  green: "bg-emerald-100 text-emerald-700 border-emerald-200",
  yellow: "bg-amber-100 text-amber-700 border-amber-200",
  red: "bg-rose-100 text-rose-700 border-rose-200"
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
      headline: "Zentrale Plattformfunktionen sind derzeit nicht verfuegbar",
      summaryTitle: "Erhebliche Einschraenkung",
      summaryText: "Die Seite ist als Status-Referenz nutzbar, produktive App-Funktionen gelten aktuell aber nicht als live.",
      impactTitle: "Betroffene Bereiche",
      impactText: "Interaktive oder backend-gestuetzte Funktionen sollten aktuell nicht als verlaesslich angesehen werden.",
      impactItems: [
        apiLevel === "red" ? "API-gestuetzte Inhalte, Login und dynamische Bereiche sind nicht belastbar verfuegbar." : "API ist nur eingeschraenkt verfuegbar.",
        dbLevel === "red" ? "Persistente Daten und Datenbankabfragen gelten derzeit nicht als produktiv erreichbar." : "Datenbasis ist nur teilweise erreichbar.",
        "Die Statusseite bleibt der zentrale Referenzpunkt fuer Hinweise."
      ],
      actionTitle: "Empfohlene Schritte",
      actionText: "Im roten Zustand steht Orientierung vor Interaktion.",
      actionItems: [
        "Keine sensiblen Daten neu eingeben oder Schritte mehrfach absenden.",
        "Nur Status- und Informationsseiten als verlaesslich ansehen.",
        "Spaeter erneut pruefen, ob Dienste wieder auf gelb oder gruen wechseln."
      ]
    };
  }

  if (overallStatus === "yellow") {
    return {
      headline: "Teile der Plattform laufen im Fallback- oder Wartungsmodus",
      summaryTitle: "Eingeschraenkter Betrieb",
      summaryText: "Einzelne Dienste oder Live-Daten koennen reduziert oder unvollstaendig sein.",
      impactTitle: "Moegliche Auswirkungen",
      impactText: "Grundfunktionen koennen sichtbar sein, aber Ergebnisse sind eventuell nicht vollstaendig.",
      impactItems: [
        "Live-Daten koennen aus degradierten Quellen stammen.",
        "Antwortzeiten und Datentiefe koennen eingeschraenkt sein.",
        "Die Statusseite ist der verlaesslichste Kanal fuer Updates."
      ],
      actionTitle: "Empfohlene Schritte",
      actionText: "Im gelben Zustand ist Vorsicht sinnvoll, aber nicht jede Funktion automatisch unbenutzbar.",
      actionItems: [
        "Vor wichtigen Aktionen kurz Status und Zeitstempel pruefen.",
        "Keine sensiblen Vorgaenge mehrfach absenden.",
        "Bei Unklarheiten spaeter erneut laden."
      ]
    };
  }

  return {
    headline: "Alle zentralen Statussignale wirken aktuell stabil",
    summaryTitle: "Normalbetrieb",
    summaryText: "Statusseite, API und Datenbasis melden aktuell keinen kritischen Ausfall.",
    impactTitle: "Aktuelle Auswirkung",
    impactText: "Es gibt derzeit keine groesseren Einschraenkungen fuer Nutzer laut Statusdaten.",
    impactItems: [
      "Live-Daten sind verfuegbar.",
      "Keine bekannten kritischen Plattformausfaelle im aktuellen Snapshot.",
      "Die Statusseite dient als Referenz und Historie."
    ],
    actionTitle: "Empfohlene Schritte",
    actionText: "Im Normalbetrieb sind keine besonderen Massnahmen notwendig.",
    actionItems: [
      "Plattform normal nutzen.",
      "Bei seltenen Einzelproblemen spaeter neu laden.",
      "Historie nur bei Rueckfragen oder Stoerungen konsultieren."
    ]
  };
};

const typeLabels: Record<string, { label: string; cls: string }> = {
  feature:     { label: "Feature",      cls: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  fix:         { label: "Bugfix",       cls: "bg-amber-100   text-amber-700   border-amber-200"   },
  security:    { label: "Sicherheit",   cls: "bg-rose-100    text-rose-700    border-rose-200"    },
  performance: { label: "Performance",  cls: "bg-blue-100    text-blue-700    border-blue-200"    },
  release:     { label: "Release",      cls: "bg-violet-100  text-violet-700  border-violet-200"  },
  docs:        { label: "Docs",         cls: "bg-slate-100   text-slate-700   border-slate-200"   },
  chore:       { label: "Intern",       cls: "bg-slate-100   text-slate-600   border-slate-200"   },
  update:      { label: "Update",       cls: "bg-cyan-100    text-cyan-700    border-cyan-200"    },
};

export default async function StatusPage() {
  const [health, overview, statusReport] = await Promise.all([
    getApiHealth(),
    getPublicOverview(),
    getPublicStatusReport()
  ]);

  const overallStatus = statusReport?.overallStatus ?? "yellow";
  const generatedAt = statusReport ? new Date(statusReport.generatedAt).toLocaleString("de-DE") : "Kein Report verfuegbar";
  const apiLevel = health?.status === "ok" ? "green" : (statusReport?.services.api ?? "red");
  const dbLevel = statusReport?.services.db ?? "red";
  const sourceLabel = health && overview && statusReport ? "Live API" : "Fallback / kein Vollzugriff";
  const historyDays = buildStatusHistory(statusReport?.windowDays ?? 30, overallStatus, statusReport?.events ?? []);
  const impactModel = getImpactModel(overallStatus, apiLevel, dbLevel);
  const changelog = (changelogData.releases ?? []).slice(0, 6);
  const coverageHistory = (fertilizerCoverageHistoryData.snapshots ?? []).slice(-6);

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#f4faf6] via-[#eef6f1] to-[#f7fbf9]">
      <header className="border-b border-[#d8e8dd] bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-[#1f7a4f] text-sm font-bold text-white">S</div>
            <div>
              <div className="text-xl font-bold tracking-tight text-[#123024]">SecretLeaf Status</div>
              <div className="text-xs text-[#4d685a]">Systemzustand, Nutzerwirkung, Verlauf</div>
            </div>
          </div>

          <Link href="/" className="rounded-lg border border-[#d6e5d9] bg-white px-4 py-2 text-sm font-medium text-[#123024] hover:bg-[#f5faf7]">
            Zurueck zur Homepage
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-[28px] border border-[#d6e5d9] bg-white p-7 shadow-sm">
            <p className="inline-flex rounded-full border border-[#c8ddcf] bg-[#eef7f1] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#1f7a4f]">
              Status Center
            </p>
            <h1 className="mt-4 text-5xl font-bold leading-tight text-[#10281e]">{impactModel.headline}</h1>
            <p className="mt-3 max-w-3xl text-lg leading-relaxed text-[#4d685a]">
              Diese Statusseite beantwortet zuerst die Kernfragen: Gibt es ein Problem, was ist betroffen und was sollten Nutzer jetzt tun.
            </p>

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

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-[#d6e5d9] bg-[#fbfefc] p-4">
                <div className="text-sm font-semibold text-[#123024]">{generatedAt}</div>
                <div className="mt-1 text-xs text-[#4d685a]">letztes Update</div>
              </div>
              <div className="rounded-2xl border border-[#d6e5d9] bg-[#fbfefc] p-4">
                <div className="text-sm font-semibold text-[#123024]">{sourceLabel}</div>
                <div className="mt-1 text-xs text-[#4d685a]">Datenquelle</div>
              </div>
              <div className="rounded-2xl border border-[#d6e5d9] bg-[#fbfefc] p-4">
                <div className="text-sm font-semibold text-[#123024]">{statusReport?.windowDays ?? 30} Tage</div>
                <div className="mt-1 text-xs text-[#4d685a]">Rueckblick</div>
              </div>
            </div>
          </section>

          <aside className="rounded-[28px] border border-[#d6e5d9] bg-white p-7 shadow-sm">
            <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${levelClasses[overallStatus]}`}>
              <span className={`h-2.5 w-2.5 rounded-full ${levelDotClasses[overallStatus]}`} />
              {overallStatus === "red" ? "Aktiver Incident" : overallStatus === "yellow" ? "Eingeschraenkter Betrieb" : "Kein aktiver Incident"}
            </div>
            <h2 className="mt-4 text-2xl font-bold text-[#10281e]">{impactModel.summaryTitle}</h2>
            <p className="mt-2 text-sm leading-relaxed text-[#4d685a]">{impactModel.summaryText}</p>

            <div className="mt-5 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              <div className="rounded-2xl border border-[#d6e5d9] bg-[#fbfefc] p-4">
                <div className="text-2xl font-bold text-[#123024]">{overallStatus.toUpperCase()}</div>
                <div className="mt-1 text-xs text-[#4d685a]">Gesamtstatus</div>
              </div>
              <div className="rounded-2xl border border-[#d6e5d9] bg-[#fbfefc] p-4">
                <div className="text-2xl font-bold text-[#123024]">{overview?.stats.activeListings ?? 0}</div>
                <div className="mt-1 text-xs text-[#4d685a]">aktive Listings</div>
              </div>
              <div className="rounded-2xl border border-[#d6e5d9] bg-[#fbfefc] p-4">
                <div className="text-2xl font-bold text-[#123024]">{overview?.stats.providers ?? 0}</div>
                <div className="mt-1 text-xs text-[#4d685a]">Provider im Snapshot</div>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-[#d6e5d9] bg-[#f8fcf9] p-4">
              <h3 className="text-base font-semibold text-[#123024]">Aktuelle Auswirkung</h3>
              <p className="mt-2 text-sm text-[#4d685a]">{impactModel.impactText}</p>
            </div>
          </aside>
        </div>

        <section className="mt-8 rounded-[28px] border border-[#d6e5d9] bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1f7a4f]">Verlauf</p>
          <h2 className="mt-2 text-2xl font-bold text-[#10281e]">Statusverlauf letzte 30 Tage</h2>
          <p className="mt-2 text-sm text-[#4d685a]">Links aelter, rechts aktueller. Die Punkte zeigen den grob sichtbaren Statusverlauf.</p>

          <div className="mt-5 grid gap-2" style={{ gridTemplateColumns: `repeat(${historyDays.length}, minmax(0, 1fr))` }}>
            {historyDays.map((day) => (
              <div
                key={day.date}
                className={`aspect-square rounded-full border border-black/5 ${levelDotClasses[day.level]}`}
                title={`${new Date(day.date).toLocaleDateString("de-DE")}: ${day.level.toUpperCase()}`}
              />
            ))}
          </div>

          <div className="mt-4 flex flex-wrap gap-4 text-xs text-[#4d685a]">
            <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Gruen stabil</span>
            <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> Gelb degradiert</span>
            <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-rose-500" /> Rot Stoerung</span>
          </div>
        </section>

        <section className="mt-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1f7a4f]">Dienste</p>
          <h2 className="mt-2 text-2xl font-bold text-[#10281e]">Aktueller Systemzustand</h2>
          <p className="mt-2 text-sm text-[#4d685a]">Welche Teile gerade verfuegbar sind und welche aktuell nicht als Live-Service gelten.</p>

          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-[#d6e5d9] bg-white p-5 shadow-sm">
              <div className="text-xs text-[#4d685a]">Statische Website</div>
              <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                ERREICHBAR
              </div>
              <p className="mt-3 text-sm text-[#4d685a]">Die Statusseite selbst bleibt als Referenzpunkt online, auch wenn Live-Dienste fehlen.</p>
            </div>

            <div className="rounded-2xl border border-[#d6e5d9] bg-white p-5 shadow-sm">
              <div className="text-xs text-[#4d685a]">API / Backend</div>
              <div className={`mt-3 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${levelClasses[apiLevel]}`}>
                <span className={`h-2.5 w-2.5 rounded-full ${levelDotClasses[apiLevel]}`} />
                {apiLevel.toUpperCase()}
              </div>
              <p className="mt-3 text-sm text-[#4d685a]">{health?.status === "ok" ? "API antwortet auf Health-Checks und Statusdaten." : "API ist nicht stabil als Live-Dienst erreichbar."}</p>
            </div>

            <div className="rounded-2xl border border-[#d6e5d9] bg-white p-5 shadow-sm">
              <div className="text-xs text-[#4d685a]">Datenbank</div>
              <div className={`mt-3 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${levelClasses[dbLevel]}`}>
                <span className={`h-2.5 w-2.5 rounded-full ${levelDotClasses[dbLevel]}`} />
                {dbLevel.toUpperCase()}
              </div>
              <p className="mt-3 text-sm text-[#4d685a]">{dbLevel === "green" ? "Datenbasis meldet verfuegbare Live-Daten." : "Persistente Daten oder DB-Abfragen sind eingeschraenkt oder nicht produktiv online."}</p>
            </div>

            <div className="rounded-2xl border border-[#d6e5d9] bg-white p-5 shadow-sm">
              <div className="text-xs text-[#4d685a]">Statusquelle</div>
              <div className={`mt-3 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${levelClasses[sourceLabel === "Live API" ? "green" : "yellow"]}`}>
                <span className={`h-2.5 w-2.5 rounded-full ${levelDotClasses[sourceLabel === "Live API" ? "green" : "yellow"]}`} />
                {sourceLabel}
              </div>
              <p className="mt-3 text-sm text-[#4d685a]">{sourceLabel === "Live API" ? "Werte kommen direkt aus den Status-Endpoints." : "Mindestens ein Live-Endpoint fehlt, die Seite bleibt aber als Statuskanal nutzbar."}</p>
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-[28px] border border-[#d6e5d9] bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1f7a4f]">Coverage Verlauf</p>
          <h2 className="mt-2 text-2xl font-bold text-[#10281e]">Duenger-Marktabdeckung im Zeitverlauf</h2>
          <p className="mt-2 text-sm text-[#4d685a]">
            Letzter Snapshot: {fertilizerCoverageStats.coveredProducts} von {fertilizerCoverageStats.trackedMarketEstimate} Linien ({fertilizerCoverageStats.coveragePercent}%).
          </p>

          <div className="mt-5 grid gap-3 md:grid-cols-5">
            {coverageHistory.map((point) => (
              <article key={point.date} className="rounded-xl border border-[#dfece3] bg-[#fbfefc] p-4">
                <time className="text-xs text-[#6b8577]">{new Date(point.date).toLocaleDateString("de-DE")}</time>
                <div className="mt-2 text-2xl font-bold text-[#123024]">{point.coverage}%</div>
                <div className="mt-1 h-2 rounded bg-[#e5f2ea] overflow-hidden">
                  <div className="h-full bg-[#1f7a4f]" style={{ width: `${Math.min(point.coverage, 100)}%` }} />
                </div>
                <p className="mt-2 text-xs text-[#4d685a]">{point.coveredProducts}/{point.marketEstimate}</p>
                <p className="mt-1 text-xs text-[#6b8577]">{point.note}</p>
              </article>
            ))}
          </div>
        </section>

        <div className="mt-8 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="rounded-2xl border border-[#d6e5d9] bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1f7a4f]">Nutzerwirkung</p>
            <h2 className="mt-2 text-2xl font-bold text-[#10281e]">{impactModel.impactTitle}</h2>
            <p className="mt-2 text-sm text-[#4d685a]">{impactModel.impactText}</p>
            <ul className="mt-4 space-y-3 text-sm text-[#4d685a]">
              {impactModel.impactItems.map((item) => (
                <li key={item} className="rounded-xl border border-[#dfece3] bg-[#fbfefc] px-4 py-3">{item}</li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-[#d6e5d9] bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1f7a4f]">Aktion</p>
            <h2 className="mt-2 text-2xl font-bold text-[#10281e]">{impactModel.actionTitle}</h2>
            <p className="mt-2 text-sm text-[#4d685a]">{impactModel.actionText}</p>
            <ul className="mt-4 space-y-3 text-sm text-[#4d685a]">
              {impactModel.actionItems.map((item) => (
                <li key={item} className="rounded-xl border border-[#dfece3] bg-[#fbfefc] px-4 py-3">{item}</li>
              ))}
            </ul>
          </section>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="rounded-2xl border border-[#d6e5d9] bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1f7a4f]">Historie</p>
            <h2 className="mt-2 text-2xl font-bold text-[#10281e]">Risikoreport letzte 30 Tage</h2>
            <p className="mt-2 text-sm text-[#4d685a]">Fokus auf potenziell problematische Ereignisse fuer Nutzer und Betriebsstabilitaet.</p>

            <div className="mt-5 space-y-3">
              {(statusReport?.events ?? []).map((event) => (
                <article key={event.key} className="rounded-xl border border-[#dfece3] bg-[#fbfefc] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className={`h-3 w-3 rounded-full ${levelDotClasses[event.level]}`} />
                      <h3 className="font-semibold text-[#123024]">{event.label}</h3>
                    </div>
                    <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${levelClasses[event.level]}`}>
                      {event.level.toUpperCase()} | {event.count}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-[#4d685a]">{event.description}</p>
                  <p className="mt-1 text-xs text-[#6b8577]">
                    Letztes Ereignis: {event.lastSeen ? new Date(event.lastSeen).toLocaleString("de-DE") : "kein Treffer im Zeitraum"}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-[#d6e5d9] bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1f7a4f]">Chronik</p>
            <h2 className="mt-2 text-2xl font-bold text-[#10281e]">Letzte Patches & Releases</h2>
            <p className="mt-2 text-sm text-[#4d685a]">Automatisch aus Git-Commits generiert. Wird bei jedem Build aktualisiert.</p>

            <div className="mt-5 space-y-3">
              {changelog.map((entry) => {
                const tl = typeLabels[entry.type] ?? typeLabels["update"]!;
                return (
                  <article key={entry.hash} className="rounded-xl border border-[#dfece3] bg-[#fbfefc] p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${tl.cls}`}>{tl.label}</span>
                      {entry.version && (
                        <span className="rounded-full border border-[#d6e5d9] bg-white px-2.5 py-0.5 text-xs font-mono text-[#4d685a]">v{entry.version}</span>
                      )}
                      <time className="ml-auto text-xs text-[#6b8577]">
                        {new Date(entry.date).toLocaleDateString("de-DE", { day: "2-digit", month: "long", year: "numeric" })}
                      </time>
                    </div>
                    <h3 className="mt-2 text-sm font-semibold text-[#123024]">{entry.title}</h3>
                    {entry.changes.length > 0 && (
                      <ul className="mt-2 space-y-1">
                        {entry.changes.slice(0, 4).map((change: string, i: number) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-[#4d685a]">
                            <span className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-400" />
                            {change}
                          </li>
                        ))}
                        {entry.changes.length > 4 && (
                          <li className="text-xs text-[#6b8577] pl-3.5">+ {entry.changes.length - 4} weitere Änderungen</li>
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
