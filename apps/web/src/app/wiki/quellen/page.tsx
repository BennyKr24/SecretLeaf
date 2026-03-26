import Link from "next/link";
import { sourceRegister } from "@/data/terpira/wiki";

export default function WikiSourcesPage() {
  const autoCount = sourceRegister.filter((s) => s.sourceType === "auto").length;

  return (
    <main className="min-h-screen px-6 py-12">
      <section className="mx-auto max-w-5xl rounded-2xl border border-[#d8e8dd] bg-white/90 p-8 shadow-sm">
        <Link href="/wiki" className="text-sm font-semibold text-[#1f7a4f] hover:text-[#17613f]">
          ← Zurueck zum Wiki
        </Link>

        <h1 className="mt-4 text-4xl font-bold text-[#10281e]">Quellenregister</h1>
        <p className="mt-3 text-[#4d685a]">
          Zentrale Referenzen fuer das SecretLeaf-Wiki. Die Artikelseiten verweisen jeweils auf die
          relevantesten Eintraege aus diesem Register.
        </p>

        <div className="mt-3 inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
          Automatisch synchronisierte Studien: {autoCount}
        </div>

        <div className="mt-6 rounded-xl border border-[#e2eee6] bg-[#f7fbf8] p-4 text-sm text-[#355b49]">
          Redaktioneller Hinweis: Dieses Register dient als strukturierte Orientierung fuer evidenzbasierte
          Vertiefung. Vor operativen oder regulatorischen Entscheidungen sollten stets aktuelle Originaldokumente geprueft werden.
        </div>

        <ol className="mt-6 list-decimal space-y-3 pl-5 text-sm text-[#355b49]">
          {sourceRegister.map((source) => (
            <li key={source.id} className="rounded-xl border border-[#e2eee6] bg-[#fbfefc] p-4">
              <p className="text-base font-semibold text-[#123024]">{source.title}</p>
              <p className="mt-1 text-sm text-[#4d685a]">
                {source.publisher} ({source.year})
              </p>
              {source.sourceType === "auto" && (
                <p className="mt-1 inline-flex rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
                  Auto-Import
                </p>
              )}
              <p className="mt-2 text-xs text-[#6a8376]">ID: {source.id}</p>
              {source.doi && <p className="mt-1 text-xs text-[#6a8376]">DOI: {source.doi}</p>}
              <a href={source.url} target="_blank" rel="noreferrer" className="mt-2 inline-flex text-sm font-semibold text-[#1f7a4f] hover:text-[#17613f]">
                Zur Quelle
              </a>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
