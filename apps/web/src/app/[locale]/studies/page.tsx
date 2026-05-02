import type { Route } from "next";
import { categoryLabels, wikiArticles, sourceRegister } from "@/data/terpira/wiki";
import StudiesListView from "@/components/StudiesListView";
import Link from "next/link";

export const metadata = {
  title: "Studien – SecretLeaf",
  description: "Wissenschaftlich fundierte Inhalte zu Anbau, Terpenen, Medizin, Recht und Qualität.",
};

export default function StudiesPage() {
  return (
    <main className="min-h-screen">

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-brand-hero">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-0 top-0 h-full w-1/2 bg-emerald-600/5 blur-[80px]" />
        </div>
        <div className="relative mx-auto max-w-6xl px-5 py-12">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-emerald-400">
                Wissensplattform
              </p>
              <h1 className="mt-2 text-3xl sm:text-4xl font-bold text-white tracking-tight">Studien</h1>
              <p className="mt-2 max-w-xl text-[14px] text-slate-400 leading-relaxed">
                Wissenschaftlich fundierte Artikel zu Anbau, Chemie, Medizin, Recht und mehr –
                gestützt auf {sourceRegister.length} peer-reviewed Fachquellen.
              </p>
            </div>

            {/* Quick stats */}
            <div className="flex gap-5 sm:gap-8 flex-shrink-0">
              {[
                { value: wikiArticles.length, label: 'Artikel' },
                { value: sourceRegister.length, label: 'Quellen' },
              ].map(s => (
                <div key={s.label} className="text-right">
                  <p className="text-xl font-bold text-white">{s.value}</p>
                  <p className="text-[11px] uppercase tracking-widest text-slate-500">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Sub-links */}
          <div className="mt-6 flex flex-wrap gap-2">
            <Link href={"/studies/sources" as Route}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5
                px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white transition-all">
              🔬 Quellenregister
            </Link>
            <Link href={"/studies/pests" as Route}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5
                px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white transition-all">
              🐛 Schädlings-Lexikon
            </Link>
            <Link href={"/studies/deficiencies" as Route}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5
                px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white transition-all">
              🧪 Nährstoffmängel
            </Link>
          </div>
        </div>
      </section>

      {/* ── Studies List ──────────────────────────────────────── */}
      <section className="px-5 py-10">
        <div className="mx-auto max-w-6xl">
          <StudiesListView
            articles={wikiArticles}
            categoryLabels={categoryLabels}
          />
        </div>
      </section>

    </main>
  );
}
