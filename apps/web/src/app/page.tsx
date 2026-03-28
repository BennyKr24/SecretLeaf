import Link from "next/link";
import { wikiArticles, sourceRegister } from "@/data/terpira/wiki";

export default async function LandingPage() {
  const articleCount = wikiArticles.length;
  const sourceCount = sourceRegister.length;

  const featuredArticles = wikiArticles.slice(0, 3);

  return (
    <main className="min-h-screen">
      <header className="border-b border-[#d8e8dd] bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-[#1f7a4f] text-sm font-bold text-white">S</div>
            <div>
              <div className="text-xl font-bold tracking-tight text-[#123024]">SecretLeaf</div>
              <div className="text-xs text-[#4d685a]">Terpira Knowledge + Private Search</div>
            </div>
          </Link>

          <nav className="flex items-center gap-3">
            <Link href="/wiki" className="rounded-lg border border-[#d6e5d9] bg-white px-3 py-2 text-sm font-semibold text-[#1f7a4f] hover:bg-[#f5faf7]">
              Wiki
            </Link>
            <Link href="/status" className="rounded-lg border border-[#d6e5d9] bg-white px-3 py-2 text-sm font-semibold text-[#355b49] hover:bg-[#f5faf7]">
              Status
            </Link>
            <Link href="/auth" className="rounded-lg bg-[#1f7a4f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#17613f]">
              Login
            </Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="inline-flex rounded-full border border-[#c8ddcf] bg-[#eef7f1] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#1f7a4f]">
            Hauptfokus: Cannabis-Wikipedia
          </p>
          <h1 className="mt-4 text-5xl font-bold leading-tight text-[#10281e]">
            Wissen zuerst.
            <br />
            Suche nur geschuetzt.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-[#4d685a]">
            SecretLeaf verbindet Terpira-Inhalte mit einer privaten Plattformlogik:
            oeffentliches Cannabis-Wiki fuer Aufklaerung und Fachwissen, waehrend Angebotssuche
            nur fuer eingeloggte Nutzer freigeschaltet ist.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/wiki" className="rounded-xl bg-[#1f7a4f] px-5 py-3 text-sm font-semibold text-white hover:bg-[#17613f]">
              Zum Wiki
            </Link>
            <Link href="/dashboard" className="rounded-xl border border-[#c8ddcf] bg-white px-5 py-3 text-sm font-semibold text-[#123024] hover:bg-[#f5faf7]">
              Geschuetzte Suche (Login)
            </Link>
          </div>
        </div>

        <aside className="rounded-2xl border border-[#d7e7dc] bg-white/85 p-6 shadow-sm">
          <h2 className="text-xl font-bold text-[#133226]">Live-Status</h2>
          <p className="mt-2 text-sm text-[#4d685a]">Stand: aktueller Build.</p>

          <div className="mt-6 grid gap-3">
            <div className="rounded-xl border border-[#e2eee6] bg-[#f7fbf8] p-4">
              <div className="text-xs uppercase tracking-wide text-[#5f7a6b]">Plattform</div>
              <div className="mt-1 text-2xl font-bold text-emerald-700">Online</div>
            </div>
            <div className="rounded-xl border border-[#e2eee6] bg-[#f7fbf8] p-4">
              <div className="text-xs uppercase tracking-wide text-[#5f7a6b]">Wiki-Artikel</div>
              <div className="mt-1 text-2xl font-bold text-[#123024]">{articleCount}</div>
            </div>
            <div className="rounded-xl border border-[#e2eee6] bg-[#f7fbf8] p-4">
              <div className="text-xs uppercase tracking-wide text-[#5f7a6b]">Peer-Review-Quellen</div>
              <div className="mt-1 text-2xl font-bold text-[#123024]">{sourceCount}</div>
            </div>
          </div>
        </aside>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-16">
        <div className="mb-5 flex items-end justify-between">
          <h2 className="text-3xl font-bold text-[#10281e]">Featured aus dem Wiki</h2>
          <Link href="/wiki" className="text-sm font-semibold text-[#1f7a4f] hover:text-[#17613f]">
            Alle Artikel ansehen
          </Link>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {featuredArticles.map((article) => (
            <article key={article.slug} className="rounded-2xl border border-[#d8e8dd] bg-white/90 p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-[#123024]">{article.title}</h3>
              <p className="mt-2 text-sm text-[#4d685a]">{article.summary}</p>
              <div className="mt-4 text-xs text-[#5f7a6b]">{article.readMinutes} Min Lesezeit</div>
              <Link href={`/wiki/${article.slug}`} className="mt-5 inline-flex text-sm font-semibold text-[#1f7a4f] hover:text-[#17613f]">
                Weiterlesen →
              </Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
