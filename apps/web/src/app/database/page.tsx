import Link from "next/link";
import type { Route } from "next";

export default function DatabaseHubPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white px-6 py-10">
      <section className="mx-auto max-w-6xl space-y-6">
        <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Database</p>
          <h1 className="mt-1 text-4xl font-bold text-slate-900">Datenbank</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-600">
            Strukturierte Register für Produktdaten und Fachbereiche. Alle Bereiche sind klar voneinander getrennt.
          </p>
        </header>

        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Produktdatenbank</p>
            <div className="mt-3 grid gap-4 md:grid-cols-2">
              <Link
                href={"/database/fertilizers" as Route}
                className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-amber-300 hover:bg-amber-50"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-amber-700">Katalog</p>
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-amber-200 bg-amber-100 text-amber-700">🗂</span>
                </div>
                <h2 className="mt-1 text-xl font-bold text-slate-900">Dünger</h2>
                <p className="mt-2 flex-1 text-sm text-slate-600">
                  Vergleich nach Phase, Basis, Format, Preis und Live-Angeboten.
                </p>
                <span className="mt-3 text-xs font-semibold text-amber-700 group-hover:underline">Register öffnen →</span>
              </Link>

              <Link
                href={"/tools/plans" as Route}
                className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-cyan-300 hover:bg-cyan-50"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-cyan-700">Planung</p>
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-cyan-200 bg-cyan-100 text-cyan-700">🧰</span>
                </div>
                <h2 className="mt-1 text-xl font-bold text-slate-900">Düngerpläne</h2>
                <p className="mt-2 flex-1 text-sm text-slate-600">
                  Praxispläne als separates Tool, nicht als Unterbereich des Katalogs.
                </p>
                <span className="mt-3 text-xs font-semibold text-cyan-700 group-hover:underline">Tool öffnen →</span>
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Fachregister</p>
                <h2 className="mt-1 text-xl font-bold text-slate-900">Lexika und Quellen</h2>
                <p className="mt-1 max-w-3xl text-sm text-slate-600">
                  Diese Register sind eigenständig und nicht Teil des Dünger-Katalogs.
                </p>
              </div>
              <Link
                href={"/studies" as Route}
                className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 hover:border-emerald-300 hover:text-emerald-700"
              >
                Zur Studiensammlung
              </Link>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <Link
                href={"/studies/pests" as Route}
                className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-rose-300 hover:bg-rose-50"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-rose-700">Lexikon</p>
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-rose-200 bg-rose-100 text-rose-700">🐛</span>
                </div>
                <h3 className="mt-1 text-lg font-bold text-slate-900 group-hover:text-rose-900">Schädlinge</h3>
                <p className="mt-2 flex-1 text-sm text-slate-600">Symptome, Monitoring und Gegenmaßnahmen für den Alltag.</p>
                <span className="mt-3 text-xs font-semibold text-rose-700 group-hover:underline">Öffnen →</span>
              </Link>

              <Link
                href={"/studies/deficiencies" as Route}
                className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-sky-300 hover:bg-sky-50"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">Lexikon</p>
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-sky-200 bg-sky-100 text-sky-700">🧪</span>
                </div>
                <h3 className="mt-1 text-lg font-bold text-slate-900 group-hover:text-sky-900">Nährstoffmängel</h3>
                <p className="mt-2 flex-1 text-sm text-slate-600">Diagnose und Korrektur – klar vom Produktkatalog getrennt.</p>
                <span className="mt-3 text-xs font-semibold text-sky-700 group-hover:underline">Öffnen →</span>
              </Link>

              <Link
                href={"/studies/sources" as Route}
                className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-emerald-300 hover:bg-emerald-50"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Referenzen</p>
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-emerald-200 bg-emerald-100 text-emerald-700">🔬</span>
                </div>
                <h3 className="mt-1 text-lg font-bold text-slate-900 group-hover:text-emerald-900">Quellenregister</h3>
                <p className="mt-2 flex-1 text-sm text-slate-600">Wissenschaftliche Quellen nach Publisher, Jahr und Typ filtern.</p>
                <span className="mt-3 text-xs font-semibold text-emerald-700 group-hover:underline">Öffnen →</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
