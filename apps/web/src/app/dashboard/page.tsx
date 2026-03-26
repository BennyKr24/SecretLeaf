"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ListingManager } from "@/components/ListingManager";
import { OfferCard } from "@/components/OfferCard";
import { apiRequest } from "@/lib/api";
import { clearSession, getSession } from "@/lib/auth";
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
    setSession(getSession());
  }, []);

  const loadMyListings = useCallback(async () => {
    if (!session) return;
    const isProvider = session.user.role === "PROVIDER";
    if (!isProvider) return;

    try {
      const response = await apiRequest<ProviderListing[]>("/listings/mine", { session });
      setMyListings(response);
    } catch {
      setMyListings([]);
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
      setError(searchError instanceof Error ? searchError.message : "Suche fehlgeschlagen");
    } finally {
      setLoading(false);
    }
  }, [locationZone, minQuantity, maxPrice, session]);

  useEffect(() => {
    if (!session) return;
    void searchOffers();
    void loadMyListings();
  }, [session, searchOffers, loadMyListings]);

  const isProvider = useMemo(
    () => session?.user.role === "PROVIDER",
    [session?.user.role]
  );

  if (!session) {
    return (
      <main className="min-h-screen px-6 py-20">
        <section className="mx-auto max-w-4xl px-6 py-20 text-center">
          <h1 className="text-3xl font-bold text-[#10281e]">Bitte einloggen</h1>
          <p className="mt-4 text-[#4d685a]">Die Suche ist nur für angemeldete Benutzer verfügbar.</p>
          <Link 
            href="/auth" 
            className="mt-6 inline-block rounded-lg bg-[#1f7a4f] px-6 py-2 font-medium text-white hover:bg-[#17613f]"
          >
            Zu Login / Register
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
            <p className="text-sm text-[#4d685a]">Angemeldet als @{session.user.username}</p>
          </div>
          <div className="flex gap-3">
            <Link href="/" className="text-sm font-medium text-[#4d685a] hover:text-[#173126]">
              Startseite
            </Link>
            <Link href="/wiki" className="text-sm font-medium text-[#4d685a] hover:text-[#173126]">
              Wiki
            </Link>
            <button 
              onClick={() => {
                clearSession();
                setSession(null);
              }}
              className="text-sm font-medium text-[#4d685a] hover:text-[#173126]"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8 rounded-2xl border border-[#d8e8dd] bg-white/90 p-6 shadow-sm">
          <h2 className="mb-6 text-lg font-semibold text-[#123024]">Angebote suchen</h2>
          
          <div className="grid md:grid-cols-4 gap-6 mb-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-[#355b49]">
                Location Zone
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
                Max Preis pro Einheit (€)
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
                {loading ? "Lädt..." : "Suchen"}
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
              <h2 className="mb-6 text-lg font-semibold text-[#123024]">
                Meine Listings
              </h2>

              {myListings.length === 0 ? (
                <p className="text-[#4d685a]">Noch keine Listings vorhanden.</p>
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
                            Status: {listing.isActive ? "Aktiv" : "Inaktiv"}
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
