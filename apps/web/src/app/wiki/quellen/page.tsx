'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import type { TerpiraSource } from "@/lib/terpira/types";

type QuellenApiResponse = {
  sources: TerpiraSource[];
  total: number;
  autoCount: number;
};

export default function WikiSourcesPage() {
  const [data, setData] = useState<QuellenApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/wiki/quellen", { cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error("Fehler beim Laden der Quellen");
        return res.json() as Promise<QuellenApiResponse>;
      })
      .then(setData)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Unbekannter Fehler"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen px-6 py-12">
        <section className="mx-auto max-w-5xl rounded-2xl border border-[#d8e8dd] bg-white/90 p-8 shadow-sm">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-[#e2eee6] rounded w-32" />
            <div className="h-10 bg-[#e2eee6] rounded w-64" />
            <div className="h-5 bg-[#e2eee6] rounded w-80" />
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-20 bg-[#e2eee6] rounded-xl" />
            ))}
          </div>
        </section>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen px-6 py-12">
        <section className="mx-auto max-w-5xl rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
          <p className="text-lg font-semibold text-red-700">Quellen konnten nicht geladen werden</p>
          <p className="mt-2 text-sm text-red-600">{error}</p>
          <Link href="/wiki" className="mt-4 inline-flex rounded-lg bg-[#1f7a4f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#17613f]">
            Zurueck zum Wiki
          </Link>
        </section>
      </main>
    );
  }

  const sources = data?.sources ?? [];
  const autoCount = data?.autoCount ?? 0;

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
          {sources.map((source) => (
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
