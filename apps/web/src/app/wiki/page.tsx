import type { Route } from "next";
import { categoryLabels, difficultyLabels, wikiArticles, sourceRegister } from "@/data/terpira/wiki";
import WikiHubClient from "@/components/WikiHubClient";
import WikiAskBot from "@/components/WikiAskBot";
import Link from "next/link";

export const metadata = {
  title: "Cannabis Wiki Hub – SecretLeaf",
  description: "Evidenzbasierte Wiki-Artikel zu Anbau, Terpenen, Medizin, Recht und Qualität. Mit Quellennachweisen aus über 50 Fachjournalen.",
};

export default function WikiPage() {
  const autoSources = sourceRegister.filter((s) => s.sourceType === "auto").length;
  const weeklyUpdates = [...wikiArticles]
    .sort((a, b) => b.lastUpdated.localeCompare(a.lastUpdated))
    .slice(0, 8);
  const featuredCollections = [
    {
      title: "Startklar in 45 Minuten",
      desc: "Schneller Einstieg mit den wichtigsten Grundlagen fuer sichere Entscheidungen.",
      accent: "border-emerald-200 bg-emerald-50",
      links: [
        { label: "Anbau-Grundlagen", href: "/wiki/cannabis-anbau-grundlagen" },
        { label: "VPD einfach erklärt", href: "/wiki/vpd-einfach-erklaert" },
        { label: "COA richtig lesen", href: "/wiki/coa-richtig-lesen" },
      ],
    },
    {
      title: "Qualitaet & Sicherheit Deep Dive",
      desc: "Von Curing bis Recall-Prozess fuer Teams mit Qualitätsanspruch.",
      accent: "border-cyan-200 bg-cyan-50",
      links: [
        { label: "Wasseraktivitaet und Curing", href: "/wiki/wasseraktivitaet-und-curing" },
        { label: "PGR und Kontaminanten", href: "/wiki/pgr-und-kontaminanten" },
        { label: "Recall- und Sperrprozesse", href: "/wiki/recall-und-sperrprozesse-fuer-chargen" },
      ],
    },
    {
      title: "Profi-Track Operations",
      desc: "Recht, Markt, Daten und Governance fuer den ersten grossen Drop.",
      accent: "border-purple-200 bg-purple-50",
      links: [
        { label: "Rechtliche Grundlagen DACH", href: "/wiki/rechtliche-grundlagen-dach" },
        { label: "Markttransparenz und Preise", href: "/wiki/markttransparenz-und-preise" },
        { label: "Content-Taxonomie & Governance", href: "/wiki/content-taxonomie-und-tag-governance" },
      ],
    },
  ];
  const tutorialTracks = [
    {
      title: "How to Grow fuer Anfaenger",
      desc: "Vom ersten Setup bis zur Ernte mit defensiven Sollwerten, klaren Tageschecks und einfacher Fehlervermeidung.",
      href: "/wiki/how-to-grow-cannabis-anfaenger-tutorial",
      badge: "Einsteiger",
      accent: "border-blue-200 bg-blue-50",
      points: ["Setup klein halten", "Giessen ohne Chaos", "Erntefenster richtig lesen"],
    },
    {
      title: "How to Grow fuer Fortgeschrittene",
      desc: "Canopy, Feed, VPD und Review-Struktur aufeinander abstimmen, damit Performance reproduzierbar wird.",
      href: "/wiki/how-to-grow-cannabis-fortgeschritten-tutorial",
      badge: "Fortgeschritten",
      accent: "border-amber-200 bg-amber-50",
      points: ["Zielkorridore pro Phase", "Canopy aktiv fuehren", "Run-Reviews nutzen"],
    },
    {
      title: "How to Grow fuer Profis",
      desc: "SOPs, Chargendenken, QA und Risiko-Management fuer Teams mit hohem Wiederholbarkeitsanspruch.",
      href: "/wiki/how-to-grow-cannabis-profi-tutorial",
      badge: "Profi",
      accent: "border-purple-200 bg-purple-50",
      points: ["SOP- und Gate-System", "Zonen- und Chargenvergleich", "Postharvest als Prozess"],
    },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#f7fbf8] via-white to-white">

      {/* ── Hero ────────────────────────────────────────────────── */}
      <section className="border-b border-slate-200 bg-gradient-to-br from-[#0f2419] to-[#1f4a32] px-6 py-14">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-wrap items-center gap-2 mb-5">
            <span className="inline-flex rounded-full border border-emerald-700/40 bg-emerald-900/60
              px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-300">
              Terpira × SecretLeaf
            </span>
            <span className="inline-flex rounded-full border border-amber-700/40 bg-amber-900/40
              px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-300">
              {sourceRegister.length} Quellen · {autoSources} Auto-Studien
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight">
            Cannabis Wiki Hub
          </h1>
          <p className="mt-3 max-w-2xl text-base text-emerald-200/90">
            Evidenzbasierte Artikel zu Anbau, Chemie, Medizin, Recht und Qualität –
            mit Quellennachweis aus über {sourceRegister.length} peer-reviewed Journalen und
            internationalen Standards.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/wiki/quellen"
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 border border-white/20
                px-4 py-2 text-sm font-semibold text-white hover:bg-white/20 transition backdrop-blur-sm">
              🔬 Quellenregister
            </Link>
            <Link href="/wiki/schaedlinge"
              className="inline-flex items-center gap-2 rounded-xl bg-rose-500/20 border border-rose-300/40
                px-4 py-2 text-sm font-semibold text-rose-100 hover:bg-rose-500/30 transition">
              🐛 Schädlings-Lexikon
            </Link>
            <Link href="/wiki/naehrstoffmaengel"
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-500/20 border border-cyan-300/40
                px-4 py-2 text-sm font-semibold text-cyan-100 hover:bg-cyan-500/30 transition">
              🧪 Nährstoffmängel-Lexikon
            </Link>
            <Link href="/fertilizers"
              className="inline-flex items-center gap-2 rounded-xl bg-amber-500/20 border border-amber-400/30
                px-4 py-2 text-sm font-semibold text-amber-200 hover:bg-amber-500/30 transition">
              🌿 Dünger-Katalog
            </Link>
            <Link href={"/search" as Route}
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 border border-white/20
                px-4 py-2 text-sm font-semibold text-white hover:bg-white/20 transition">
              🔍 Volltext-Suche
            </Link>
          </div>
        </div>
      </section>

      {/* ── Lernpfade ────────────────────────────────────────────── */}
      <section className="border-b border-slate-200 bg-white px-6 py-8">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">Empfohlene Lernpfade</p>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              {
                label: 'Path A – Beginner Grow',
                icon: '🌱',
                color: 'border-blue-200 bg-blue-50',
                textColor: 'text-blue-900',
                subColor: 'text-blue-700',
                desc: 'Der komplette Einstieg: Tutorial, Klima-Basis, Bewaesserung und Wurzelzone.',
                steps: ['how-to-grow-cannabis-anfaenger-tutorial', 'cannabis-anbau-grundlagen', 'bewaesserung-ohne-uebergiessen', 'cannabis-substrat-und-wurzelzone'],
              },
              {
                label: 'Path B – Intermediate Grow',
                icon: '🧪',
                color: 'border-amber-200 bg-amber-50',
                textColor: 'text-amber-900',
                subColor: 'text-amber-700',
                desc: 'Canopy, Feed, Naehrstoffdynamik und Review-System fuer den naechsten Performance-Schritt.',
                steps: ['how-to-grow-cannabis-fortgeschritten-tutorial', 'naehrstoffbedarf-cannabis-lebenszyklus', 'substrat-vergleich-coco-erde-hydro', 'naehrstoffblockaden-und-antagonismen'],
              },
              {
                label: 'Path C – Pro Operations',
                icon: '⚙️',
                color: 'border-purple-200 bg-purple-50',
                textColor: 'text-purple-900',
                subColor: 'text-purple-700',
                desc: 'SOPs, Chargendenken, Hygiene, QA und Postharvest fuer professionelle Teams.',
                steps: ['how-to-grow-cannabis-profi-tutorial', 'mutterpflanzen-und-clone-hygiene', 'grow-log-und-kpi-dashboard', 'schimmel-und-mykotoxine-bei-cannabis'],
              },
            ].map(path => (
              <div key={path.label} className={`rounded-xl border p-4 ${path.color}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{path.icon}</span>
                  <p className={`text-sm font-bold ${path.textColor}`}>{path.label}</p>
                </div>
                <p className={`text-xs mb-3 ${path.subColor}`}>{path.desc}</p>
                <div className="space-y-1">
                  {path.steps.map(slug => (
                    <Link key={slug} href={`/wiki/${slug}` as Route}
                      className={`block text-xs font-medium ${path.subColor} hover:underline`}>
                      → {slug}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How To Grow Tutorials ─────────────────────────────── */}
      <section className="border-b border-slate-200 bg-white px-6 py-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Step by Step</p>
              <h2 className="mt-1 text-2xl font-bold text-slate-900">How-to-Grow Tutorials fuer jedes Niveau</h2>
              <p className="mt-1 max-w-3xl text-sm text-slate-600">
                Ausfuehrliche Leitfaeden fuer Anfaenger, Fortgeschrittene und Profis - mit wissenschaftlicher Basis und Routinen aus professionellen Grow-Setups.
              </p>
            </div>
            <Link
              href="/wiki/quellen"
              className="inline-flex rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:border-emerald-300 hover:text-emerald-700 transition"
            >
              Studienbasis ansehen
            </Link>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            {tutorialTracks.map((track) => (
              <article key={track.href} className={`rounded-2xl border p-5 shadow-sm ${track.accent}`}>
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-full border border-white/70 bg-white/80 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                    {track.badge}
                  </span>
                </div>
                <h3 className="mt-3 text-lg font-bold text-slate-900">{track.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{track.desc}</p>
                <ul className="mt-3 space-y-1 text-sm text-slate-700">
                  {track.points.map((point) => (
                    <li key={point} className="flex items-start gap-2">
                      <span className="mt-0.5 text-emerald-600">•</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={track.href as Route}
                  className="mt-4 inline-flex rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:border-emerald-300 hover:text-emerald-700 transition"
                >
                  Tutorial oeffnen
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Collections ────────────────────────────────── */}
      <section className="border-b border-slate-200 bg-slate-50/50 px-6 py-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Editor Picks</p>
              <h2 className="mt-1 text-2xl font-bold text-slate-900">Kuratiert fuer den ersten Drop</h2>
            </div>
            <Link
              href="/wiki/quellen"
              className="inline-flex rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 hover:border-emerald-300 hover:text-emerald-700 transition"
            >
              Quellenlage ansehen
            </Link>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            {featuredCollections.map((collection) => (
              <article key={collection.title} className={`rounded-2xl border p-5 shadow-sm ${collection.accent}`}>
                <h3 className="text-lg font-bold text-slate-900">{collection.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{collection.desc}</p>
                <div className="mt-3 space-y-1.5">
                  {collection.links.map((entry) => (
                    <Link
                      key={entry.href}
                      href={entry.href as Route}
                      className="block rounded-lg border border-white/70 bg-white/80 px-3 py-2 text-sm font-medium text-slate-700 hover:border-emerald-300 hover:text-emerald-700 transition"
                    >
                      → {entry.label}
                    </Link>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Weekly Updates ─────────────────────────────────────── */}
      <section className="border-b border-slate-200 bg-white px-6 py-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Updated This Week</p>
              <p className="text-lg font-bold text-slate-900">Frisch aktualisiert und neu eingepflegt</p>
            </div>
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              {weeklyUpdates.length} aktuelle Einträge
            </span>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1">
            {weeklyUpdates.map((entry) => (
              <Link
                key={entry.slug}
                href={`/wiki/${entry.slug}` as Route}
                className="min-w-[250px] rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50"
              >
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{entry.lastUpdated}</p>
                <p className="mt-1 line-clamp-2 text-sm font-semibold text-slate-800">{entry.title}</p>
                <p className="mt-1 text-xs text-slate-500">{categoryLabels[entry.category]}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Register Special: Schaedlinge ─────────────────────── */}
      <section className="border-b border-slate-200 bg-rose-50/40 px-6 py-8">
        <div className="mx-auto max-w-6xl rounded-2xl border border-rose-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-rose-600">Neu im Register</p>
              <h2 className="mt-1 text-2xl font-bold text-slate-900">Schädlings-Bereich mit vollständigem Lexikon</h2>
              <p className="mt-1 text-sm text-slate-600">
                Kategorisierte Schädlinge, Bildkarten, Symptome, Monitoring, Prävention und integrierte Maßnahmen mit praktischen Filtern.
              </p>

              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                <Link href="/wiki/schaedlinge#ampel" className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-800 hover:bg-rose-100">
                  Modus 1: Schnellhilfe (24h)
                </Link>
                <Link href="/wiki/schaedlinge#filter" className="rounded-lg border border-cyan-200 bg-cyan-50 px-3 py-2 text-xs font-semibold text-cyan-800 hover:bg-cyan-100">
                  Modus 2: Analyse & Filter
                </Link>
                <Link href="/wiki/schaedlinge#downloads" className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-100">
                  Modus 3: Protokoll-Download
                </Link>
              </div>
            </div>
            <Link
              href="/wiki/schaedlinge"
              className="inline-flex rounded-xl border border-rose-300 bg-rose-100 px-4 py-2 text-sm font-semibold text-rose-800 hover:bg-rose-200"
            >
              Zum Schädlings-Lexikon
            </Link>
          </div>
        </div>
      </section>

      {/* ── Register Special: Naehrstoffmaengel ───────────────── */}
      <section className="border-b border-slate-200 bg-cyan-50/40 px-6 py-8">
        <div className="mx-auto max-w-6xl rounded-2xl border border-cyan-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-cyan-700">Neu im Register</p>
              <h2 className="mt-1 text-2xl font-bold text-slate-900">Nährstoffmängel-Lexikon mit Diagnose-Flow</h2>
              <p className="mt-1 text-sm text-slate-600">
                Mangelbilder nach Mobilität und Risiko sortiert, inklusive Symptom-Check, Korrektur-Matrix und 24h-Sofortprotokoll.
              </p>

              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                <Link href="/wiki/naehrstoffmaengel#ampel" className="rounded-lg border border-cyan-200 bg-cyan-50 px-3 py-2 text-xs font-semibold text-cyan-800 hover:bg-cyan-100">
                  Modus 1: Schnellhilfe (24h)
                </Link>
                <Link href="/wiki/naehrstoffmaengel#filter" className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-100">
                  Modus 2: Analyse & Filter
                </Link>
                <Link href="/wiki/naehrstoffmaengel#downloads" className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800 hover:bg-amber-100">
                  Modus 3: Protokoll-Download
                </Link>
              </div>
            </div>
            <Link
              href="/wiki/naehrstoffmaengel"
              className="inline-flex rounded-xl border border-cyan-300 bg-cyan-100 px-4 py-2 text-sm font-semibold text-cyan-900 hover:bg-cyan-200"
            >
              Zum Nährstoffmängel-Lexikon
            </Link>
          </div>
        </div>
      </section>

      {/* ── Studienartikel Spotlight ──────────────────────────── */}
      <section className="border-b border-slate-200 bg-violet-50/30 px-6 py-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-violet-600">Wissenschaftliche Grundlagen</p>
              <h2 className="mt-1 text-2xl font-bold text-slate-900">Studienartikel: Substrat, Nährstoffe & Anbausysteme</h2>
              <p className="mt-1 text-sm text-slate-600">
                Peer-reviewte Evidenz aufbereitet – searchbar unter <strong>Schädlinge</strong> oder <strong>Nährstoffe</strong> filterbar.
              </p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                slug: 'naehrstoffbedarf-cannabis-lebenszyklus',
                title: 'Nährstoffbedarf im Cannabis-Lebenszyklus',
                tag: 'Nährstoffe · NPK',
                tagColor: 'border-cyan-200 bg-cyan-50 text-cyan-700',
                accent: 'border-cyan-200',
                desc: 'Phasenweise NPK-, Ca- und Mg-Übersicht für Photo- und Autoflower in Erde und Coco.',
                icon: '🧪',
              },
              {
                slug: 'substrat-vergleich-coco-erde-hydro',
                title: 'Substratvergleich: Coco, Erde und Hydro',
                tag: 'Substrat · Schädlinge',
                tagColor: 'border-amber-200 bg-amber-50 text-amber-700',
                accent: 'border-amber-200',
                desc: 'Ertrag, EC-Toleranz und Schädlingsanfälligkeit der drei Hauptsubstrate im Studienvergleich.',
                icon: '🌍',
              },
              {
                slug: 'indoor-outdoor-anbau-vergleich',
                title: 'Indoor vs. Outdoor: Anbauvergleich',
                tag: 'Schädlinge · Ertrag',
                tagColor: 'border-rose-200 bg-rose-50 text-rose-700',
                accent: 'border-rose-200',
                desc: 'Schädlingsdruck, Nährstoffverfügbarkeit und Ertragsunterschiede zwischen den Anbausystemen.',
                icon: '🏠',
              },
            ].map(item => (
              <Link
                key={item.slug}
                href={`/wiki/${item.slug}` as Route}
                className={`group flex flex-col gap-2 rounded-2xl border bg-white p-5 shadow-sm transition hover:shadow-md hover:border-emerald-300 ${item.accent}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className='text-2xl'>{item.icon}</span>
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${item.tagColor}`}>{item.tag}</span>
                </div>
                <p className="text-sm font-bold text-slate-900 group-hover:text-emerald-800 leading-snug">{item.title}</p>
                <p className="text-xs text-slate-500 leading-relaxed flex-1">{item.desc}</p>
                <span className="text-xs font-semibold text-emerald-600 group-hover:underline">Artikel lesen →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Hub (Filter + Artikel-Grid) ──────────────────────────── */}
      <section className="px-6 py-10">
        <div className="mx-auto max-w-6xl">
          <WikiHubClient
            articles={wikiArticles}
            categoryLabels={categoryLabels}
            difficultyLabels={difficultyLabels}
            totalSources={sourceRegister.length}
          />
        </div>
      </section>

      {/* ── Wiki-Bot ─────────────────────────────────────────────── */}
      <WikiAskBot />
    </main>
  );
}
