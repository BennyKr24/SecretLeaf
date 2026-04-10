import Link from "next/link";
import type { Route } from "next";

export default function ToolsHubPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white px-6 py-10">
      <section className="mx-auto max-w-6xl space-y-6">
        <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Tools</p>
          <h1 className="mt-1 text-4xl font-bold text-slate-900">Werkzeuge</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-600">
            Praktische Werkzeuge für Planung, Vergleich und Entscheidungen. Alle Tools sind auf schnelle, klare Abläufe ausgelegt.
          </p>
        </header>

        <div className="grid gap-4 md:grid-cols-2">
          <Link
            href={"/tools/plans" as Route}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50"
          >
            <p className="text-sm font-semibold text-emerald-700">Planung</p>
            <h2 className="mt-1 text-xl font-bold text-slate-900">Düngerpläne</h2>
            <p className="mt-2 text-sm text-slate-600">
              Fertige Düngerpläne, filterbar nach Setup, Budget und Ziel.
            </p>
          </Link>

          <Link
            href={"/search" as Route}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-cyan-300 hover:bg-cyan-50"
          >
            <p className="text-sm font-semibold text-cyan-700">Discovery</p>
            <h2 className="mt-1 text-xl font-bold text-slate-900">Globale Suche</h2>
            <p className="mt-2 text-sm text-slate-600">
              Schneller Zugriff auf Studies, Quellen und Datenbankeinträge.
            </p>
          </Link>
        </div>
      </section>
    </main>
  );
}
