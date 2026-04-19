"use client";

import Link from "next/link";
import type { Route } from "next";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ListingManager } from "@/components/ListingManager";
import { OfferCard } from "@/components/OfferCard";
import { apiRequest } from "@/lib/api";
import { logoutFromSupabase, restoreSessionFromSupabase, saveSession } from "@/lib/auth";
import { Offer, SessionData } from "@/lib/types";

type SearchResponse = {
  offers: Offer[];
  total: number;
};

type ProviderListing = {
  id: string;
  title: string;
  quantityAvailable: number;
  isActive: boolean;
  priceTiers: Array<{ qty: number; pricePerUnit: number }>;
};

export default function DashboardPage() {
  const [session, setSession] = useState<SessionData | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [myListings, setMyListings] = useState<ProviderListing[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [locationZone, setLocationZone] = useState("berlin-mitte");
  const [minQuantity, setMinQuantity] = useState(1);
  const [maxPrice, setMaxPrice] = useState(25);

  useEffect(() => {
    void (async () => {
      const restored = await restoreSessionFromSupabase();
      setSession(restored);
    })();
  }, []);

  // Refresh role from API to ensure it's always up-to-date
  useEffect(() => {
    if (!session) return;
    void (async () => {
      try {
        const res = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${session.token}` },
          cache: "no-store",
        });
        if (!res.ok) return;
        const body = (await res.json()) as { user?: { role?: string } };
        const freshRole = body.user?.role;
        if (freshRole && freshRole !== session.user.role) {
          const updated: SessionData = {
            ...session,
            user: { ...session.user, role: freshRole as SessionData["user"]["role"] },
          };
          saveSession(updated);
          setSession(updated);
        }
      } catch {
        // Ignore – keep cached role
      }
    })();
  }, [session?.token]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadMyListings = useCallback(async () => {
    if (!session) return;
    const isProvider = session.user.role === "PROVIDER";
    if (!isProvider) return;

    try {
      const response = await apiRequest<ProviderListing[]>("/listings/mine", { session });
      setMyListings(response);
    } catch {
      setMyListings([]);  // Backend nicht verfügbar – kein Fehler anzeigen
    }
  }, [session]);

  const searchOffers = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        locationZone: locationZone,
        ...(minQuantity > 0 && { minQuantity: minQuantity.toString() }),
        ...(maxPrice > 0 && { maxPrice: maxPrice.toString() })
      });

      const response = await apiRequest<SearchResponse>(
        `/search/offers?${params.toString()}`,
        { session }
      );

      setOffers(response.offers);
    } catch (searchError) {
      const msg = searchError instanceof Error ? searchError.message : "";
      if (msg.toLowerCase().includes("fetch") || msg.toLowerCase().includes("network")) {
        setError("Marktplatz-API nicht erreichbar — das Backend wird noch eingerichtet.");
      } else {
        setError(msg || "Suche fehlgeschlagen");
      }
    } finally {
      setLoading(false);
    }
  }, [locationZone, minQuantity, maxPrice, session]);

  // Kein auto-fetch beim Mount – Backend läuft in Production noch nicht

  const isProvider = useMemo(
    () => session?.user.role === "PROVIDER",
    [session?.user.role]
  );

  if (!session) {
    return (
      <main className="min-h-screen px-6 py-20">
        <section className="mx-auto max-w-4xl px-6 py-20 text-center">
          <h1 className="text-3xl font-bold text-[#10281e]">Anmeldung erforderlich</h1>
          <p className="mt-4 text-[#4d685a]">Melde dich an, um das Dashboard zu nutzen.</p>
          <Link 
            href="/auth" 
            className="mt-6 inline-block rounded-lg bg-[#1f7a4f] px-6 py-2 font-medium text-white hover:bg-[#17613f]"
          >
            Jetzt anmelden
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <header className="border-b border-[#d8e8dd] bg-white/85 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#10281e]">Dashboard</h1>
            <p className="text-sm text-[#4d685a]">
              Angemeldet als @{session.user.username}
              <span className="ml-2 rounded-full bg-[#e5f4ea] px-2 py-0.5 text-[10px] font-semibold uppercase text-[#1f7a4f]">
                {session.user.role}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link href={"/dashboard/admin" as Route} className="flex items-center gap-1.5 rounded-xl bg-[#1f7a4f] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#17613f]">
              <span>⚙</span> Admin-Bereich
            </Link>
            <Link href={"/" as Route} className="text-sm font-medium text-[#4d685a] hover:text-[#173126]">
              Startseite
            </Link>
            <Link href={"/studies" as Route} className="text-sm font-medium text-[#4d685a] hover:text-[#173126]">
              Studien
            </Link>
            <button 
              onClick={() => {
                void (async () => {
                  await logoutFromSupabase();
                  setSession(null);
                })();
              }}
              className="text-sm font-medium text-[#4d685a] hover:text-[#173126]"
            >
              Abmelden
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-2xl border border-[#d8e8dd] bg-white/90 p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1f7a4f]">Redaktions-Tool</p>
            <h2 className="mt-2 text-2xl font-semibold text-[#123024]">Studien schnell prüfen</h2>
            <p className="mt-3 text-sm text-[#4d685a]">
              Neu importierte Studien werden kompakt dargestellt – mit Quelle, Autor und Institut
              – damit du schnell entscheiden kannst, was relevant ist.
            </p>
            <Link
              href={"/dashboard/review" as Route}
              className="mt-5 inline-flex rounded-xl bg-[#1f7a4f] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#17613f]"
            >
              Studien prüfen
            </Link>
          </div>

          <div className="rounded-2xl border border-[#d8e8dd] bg-[#f6faf7] p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#123024]">Bewertungskriterien</h2>
            <p className="mt-3 text-sm text-[#4d685a]">Rein: direkt verwertbar oder als Artikelidee geeignet.</p>
            <p className="mt-2 text-sm text-[#4d685a]">Später: interessant, aber noch nicht ausreichend belegt.</p>
            <p className="mt-2 text-sm text-[#4d685a]">Nein: zu schwach oder thematisch nicht relevant.</p>
          </div>
        </div>

        <div className="mb-8 rounded-2xl border border-[#d8e8dd] bg-white/90 p-6 shadow-sm">
          <h2 className="mb-6 text-lg font-semibold text-[#123024]">Angebote suchen</h2>
          
          <div className="grid md:grid-cols-4 gap-6 mb-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-[#355b49]">
                Gebiet
              </label>
              <input
                type="text"
                value={locationZone}
                onChange={(e) => setLocationZone(e.target.value)}
                placeholder="z.B. berlin-mitte"
                className="w-full rounded-xl border border-[#d8e8dd] px-3 py-2 outline-none transition focus:border-[#5ca87f] focus:ring-2 focus:ring-[#cfe8d6]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#355b49]">
                Mindestmenge
              </label>
              <input
                type="number"
                min={1}
                value={minQuantity}
                onChange={(e) => setMinQuantity(Number(e.target.value))}
                className="w-full rounded-xl border border-[#d8e8dd] px-3 py-2 outline-none transition focus:border-[#5ca87f] focus:ring-2 focus:ring-[#cfe8d6]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#355b49]">
                Max. Preis / Einheit (€)
              </label>
              <input
                type="number"
                step={0.5}
                min={0}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full rounded-xl border border-[#d8e8dd] px-3 py-2 outline-none transition focus:border-[#5ca87f] focus:ring-2 focus:ring-[#cfe8d6]"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={() => void searchOffers()}
                disabled={loading}
                className="w-full rounded-xl bg-[#1f7a4f] px-4 py-2 font-medium text-white transition hover:bg-[#17613f] disabled:opacity-50"
              >
                {loading ? 'Sucht…' : 'Suchen'}
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-[#e7c1c1] bg-[#fff4f4] p-3 text-sm text-[#a54b4b]">
              {error}
            </div>
          )}
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-[#123024]">
              Angebote ({offers.length})
            </h2>
          </div>

          {offers.length === 0 ? (
            <div className="rounded-2xl border border-[#d8e8dd] bg-white/90 p-12 text-center shadow-sm">
              <p className="text-[#4d685a]">Keine Angebote gefunden. Versuche andere Suchfilter.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {offers.map((offer) => (
                <OfferCard key={offer.id} offer={offer} />
              ))}
            </div>
          )}
        </div>

        {/* Provider Section */}
        {isProvider && (
          <>
            <ListingManager
              session={session}
              onRefresh={async () => {
                await loadMyListings();
                await searchOffers();
              }}
            />

            <div className="rounded-2xl border border-[#d8e8dd] bg-white/90 p-6 shadow-sm">
<h2 className="text-lg font-semibold text-[#123024]">
              Meine Angebote
              </h2>

              {myListings.length === 0 ? (
                <p className="text-[#4d685a]">Du hast noch keine Angebote erstellt.</p>
              ) : (
                <div className="space-y-3">
                  {myListings.map((listing) => (
                    <div
                      key={listing.id}
                      className="rounded-xl border border-[#d8e8dd] p-4 transition hover:bg-[#f5faf7]"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-[#123024]">{listing.title}</h3>
                          <p className="mt-1 text-sm text-[#4d685a]">
                            {listing.quantityAvailable} Einheiten verfügbar
                          </p>
                          <p className="text-sm text-[#4d685a]">
                            {listing.isActive ? 'Aktiv' : 'Inaktiv'}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          listing.isActive
                            ? "bg-[#e5f4ea] text-[#1f7a4f]"
                            : "bg-[#eef3f0] text-[#567264]"
                        }`}>
                          {listing.isActive ? "Aktiv" : "Inaktiv"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
