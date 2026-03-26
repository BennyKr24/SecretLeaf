import Link from "next/link";
import { getApiHealth, getPublicListings, getPublicOverview, getPublicStatusReport } from "../lib/publicApi";

type PageProps = {
  searchParams?: {
    zone?: string;
    minPrice?: string;
    maxPrice?: string;
  };
};

const toNumber = (value?: string): number | undefined => {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

export default async function LandingPage({ searchParams }: PageProps) {
  const selectedZone = searchParams?.zone;
  const minPrice = toNumber(searchParams?.minPrice);
  const maxPrice = toNumber(searchParams?.maxPrice);

  const listingFilters = {
    ...(selectedZone ? { locationZone: selectedZone } : {}),
    ...(minPrice !== undefined ? { minPrice } : {}),
    ...(maxPrice !== undefined ? { maxPrice } : {}),
    limit: 6
  };

  const overview = await getPublicOverview();
  const health = await getApiHealth();
  const statusReport = await getPublicStatusReport();
  const filteredResponse = await getPublicListings(listingFilters);

  const activeListings = overview?.stats.activeListings ?? 0;
  const providers = overview?.stats.providers ?? 0;
  const featured = filteredResponse?.listings ?? overview?.featuredListings ?? [];
  const apiOnline = Boolean(overview) && Boolean(health?.status === "ok");
  const degraded = Boolean(overview?.degraded);
  const filteredDegraded = Boolean(filteredResponse?.degraded);
  const statusOverall = statusReport?.overallStatus ?? "yellow";

  const trafficLight = apiOnline ? (degraded || filteredDegraded ? "yellow" : "green") : "red";

  const trafficLabel =
    trafficLight === "green"
      ? "Gruen: Live-Daten aktiv"
      : trafficLight === "yellow"
        ? "Gelb: Fallback aktiv"
        : "Rot: API nicht erreichbar";

  const levelClasses: Record<string, string> = {
    green: "bg-emerald-100 text-emerald-700",
    yellow: "bg-amber-100 text-amber-700",
    red: "bg-rose-100 text-rose-700"
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#f4faf6] via-[#eef6f1] to-[#f7fbf9]">
      <header className="border-b border-[#d8e8dd] bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-[#1f7a4f] text-sm font-bold text-white">S</div>
            <div>
              <div className="text-xl font-bold tracking-tight text-[#123024]">SecretLeaf</div>
              <div className="text-xs text-[#4d685a]">Diskret. Sicher. Legal.</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a href="/status" className="rounded-lg border border-[#d6e5d9] bg-white px-3 py-2 text-xs font-semibold text-[#1f7a4f] hover:bg-[#f5faf7]">
              Status-Center
            </a>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                trafficLight === "green"
                  ? "bg-emerald-100 text-emerald-700"
                  : trafficLight === "yellow"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-rose-100 text-rose-700"
              }`}
            >
              {trafficLabel}
            </span>
            <Link href="/auth" className="rounded-lg border border-[#d6e5d9] bg-white px-4 py-2 text-sm font-medium text-[#123024] hover:bg-[#f5faf7]">
              Login / Register
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-8 px-6 py-16 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <p className="inline-flex rounded-full border border-[#c8ddcf] bg-[#eef7f1] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#1f7a4f]">
            Privacy-first Cannabis Marketplace
          </p>

          <h1 className="mt-4 text-5xl font-bold leading-tight text-[#10281e]">
            Moderne Cannabis-Plattform
            <br />
            mit echter API-Intelligenz
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-[#4d685a]">
            SecretLeaf verbindet Diskretion, verifizierte Anbieter und transparente Preisstrukturen. Jetzt mit Live-Daten aus der API fuer Listings, Anbieter und Aktivitaet.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href="/dashboard" className="inline-flex items-center justify-center rounded-xl bg-[#1f7a4f] px-7 py-3 font-semibold text-white shadow hover:bg-[#155638]">
              Jetzt suchen
            </Link>
            <Link href="/auth?tab=register" className="inline-flex items-center justify-center rounded-xl border border-[#cde1d2] bg-white px-7 py-3 font-semibold text-[#123024] hover:bg-[#f5faf7]">
              Als Provider anmelden
            </Link>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-[#d6e5d9] bg-white p-4">
              <div className="text-2xl font-bold text-[#123024]">{activeListings}</div>
              <div className="text-sm text-[#4d685a]">Aktive Listings</div>
            </div>
            <div className="rounded-xl border border-[#d6e5d9] bg-white p-4">
              <div className="text-2xl font-bold text-[#123024]">{providers}</div>
              <div className="text-sm text-[#4d685a]">Verifizierte Provider</div>
            </div>
            <div className="rounded-xl border border-[#d6e5d9] bg-white p-4">
              <div className="text-2xl font-bold text-[#123024]">{overview?.stats.privacyMode ?? "minimal-logging"}</div>
              <div className="text-sm text-[#4d685a]">Privacy Modus</div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[#d6e5d9] bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-[#123024]">API Snapshot</h2>
          <p className="mt-2 text-sm text-[#4d685a]">Live aus dem Endpoint /public/overview geladen.</p>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between rounded-lg bg-[#f2f8f4] px-3 py-2">
              <dt className="text-[#4d685a]">Status</dt>
              <dd className="font-semibold text-[#123024]">{apiOnline ? "Verbunden" : "Nicht erreichbar"}</dd>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-[#f2f8f4] px-3 py-2">
              <dt className="text-[#4d685a]">Aktualisiert</dt>
              <dd className="font-semibold text-[#123024]">{overview ? new Date(overview.generatedAt).toLocaleString("de-DE") : "-"}</dd>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-[#f2f8f4] px-3 py-2">
              <dt className="text-[#4d685a]">Featured Datensaetze</dt>
              <dd className="font-semibold text-[#123024]">{featured.length}</dd>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-[#f2f8f4] px-3 py-2">
              <dt className="text-[#4d685a]">Datenmodus</dt>
              <dd className="font-semibold text-[#123024]">{degraded ? "Fallback ohne DB" : "Live-Daten"}</dd>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-[#f2f8f4] px-3 py-2">
              <dt className="text-[#4d685a]">Health Endpoint</dt>
              <dd className="font-semibold text-[#123024]">{health?.status ?? "offline"}</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="border-y border-[#d6e5d9] bg-white py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold text-[#10281e]">Featured Listings aus der API</h2>
              <p className="mt-2 text-[#4d685a]">Automatisch aktualisiert fuer eine lebendige, datengetriebene Startseite.</p>
            </div>
            <Link href="/dashboard" className="text-sm font-semibold text-[#1f7a4f] hover:text-[#155638]">
              Alle Angebote im Dashboard ansehen →
            </Link>
          </div>

          <div className="mb-5 flex flex-wrap items-center gap-2 text-xs font-semibold">
            <span className="text-[#4d685a]">Schnellfilter:</span>
            <Link href="/" className="rounded-full border border-[#cfe3d4] bg-[#f4faf6] px-3 py-1 text-[#1f7a4f]">Alle</Link>
            <Link href="/?zone=berlin-mitte" className="rounded-full border border-[#cfe3d4] bg-[#f4faf6] px-3 py-1 text-[#1f7a4f]">Berlin Mitte</Link>
            <Link href="/?zone=hamburg-altona" className="rounded-full border border-[#cfe3d4] bg-[#f4faf6] px-3 py-1 text-[#1f7a4f]">Hamburg Altona</Link>
            <Link href="/?minPrice=5&maxPrice=10" className="rounded-full border border-[#cfe3d4] bg-[#f4faf6] px-3 py-1 text-[#1f7a4f]">€5-€10</Link>
            <Link href="/?minPrice=10" className="rounded-full border border-[#cfe3d4] bg-[#f4faf6] px-3 py-1 text-[#1f7a4f]">ab €10</Link>
          </div>

          {(selectedZone || minPrice !== undefined || maxPrice !== undefined) && (
            <div className="mb-4 rounded-lg border border-[#d6e5d9] bg-[#f6fbf8] px-3 py-2 text-xs text-[#4d685a]">
              Aktive Filter: {selectedZone ? `Zone=${selectedZone} ` : ""}
              {minPrice !== undefined ? `MinPreis=${minPrice} ` : ""}
              {maxPrice !== undefined ? `MaxPreis=${maxPrice}` : ""}
            </div>
          )}

          {featured.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {featured.map((item) => (
                <article key={item.id} className="rounded-2xl border border-[#d6e5d9] bg-[#fbfefc] p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-lg font-semibold text-[#123024]">{item.title}</h3>
                    <span className="rounded-full bg-[#e9f5ed] px-2.5 py-1 text-xs font-semibold text-[#1f7a4f]">{item.locationZone}</span>
                  </div>

                  <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-[#4d685a]">
                    {item.description || "Diskretes Angebot ohne öffentliche Zusatzdetails."}
                  </p>

                  <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                    <div className="rounded-lg bg-white p-2">
                      <div className="text-xs text-[#4d685a]">Verfuegbar</div>
                      <div className="font-semibold text-[#123024]">{item.quantityAvailable} {item.unit}</div>
                    </div>
                    <div className="rounded-lg bg-white p-2">
                      <div className="text-xs text-[#4d685a]">Ab Preis</div>
                      <div className="font-semibold text-[#123024]">€ {item.cheapestPrice.toFixed(2)}</div>
                    </div>
                  </div>

                  <div className="mt-4 text-xs text-[#4d685a]">Provider: {item.provider}</div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-[#c8ddcf] bg-[#f4faf6] p-8 text-center text-[#4d685a]">
              Noch keine Live-Listings verfuegbar. Sobald Provider Angebote einstellen, erscheinen sie hier automatisch.
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <h2 className="text-3xl font-bold text-[#10281e]">Mehr API. Mehr Kontrolle.</h2>
        <p className="mt-3 max-w-3xl text-[#4d685a]">
          Die Website zeigt jetzt nicht nur Design, sondern echte Plattformdaten. Damit hast du eine starke Marketingseite und gleichzeitig einen produktnahen Einstieg fuer junge Nutzergruppen.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-[#d6e5d9] bg-white p-5">
            <h3 className="font-semibold text-[#123024]">Public Overview API</h3>
            <p className="mt-2 text-sm text-[#4d685a]">Endpoint fuer Landing-Metriken und Featured Listings ohne Login.</p>
          </div>
          <div className="rounded-xl border border-[#d6e5d9] bg-white p-5">
            <h3 className="font-semibold text-[#123024]">Resilientes Rendering</h3>
            <p className="mt-2 text-sm text-[#4d685a]">Bei API-Ausfall bleibt die Seite verfuegbar und zeigt einen sauberen Fallback.</p>
          </div>
          <div className="rounded-xl border border-[#d6e5d9] bg-white p-5">
            <h3 className="font-semibold text-[#123024]">Security-first Datenmodell</h3>
            <p className="mt-2 text-sm text-[#4d685a]">Nur aggregierte Daten und bereits oeffentliche Angebotsinfos werden ausgespielt.</p>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#d6e5d9] py-8 text-center text-sm text-[#4d685a]">
        <p className="mb-2">© 2026 SecretLeaf. Privacy-first. API-powered.</p>
        <p className="text-xs">
          Systemampel: {trafficLabel}. Bei Gelb/Rot bleibt die Seite online und zeigt Fallback-Daten statt Fehlern.
        </p>
      </footer>
    </main>
  );
}
