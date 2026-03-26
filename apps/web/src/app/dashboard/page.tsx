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
      <main className="min-h-screen bg-white">
        <section className="mx-auto max-w-4xl px-6 py-20 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Bitte einloggen</h1>
          <p className="mt-4 text-gray-600">Die Suche ist nur für angemeldete Benutzer verfügbar.</p>
          <Link 
            href="/auth" 
            className="mt-6 inline-block px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
          >
            Zu Login / Register
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-600">Angemeldet als @{session.user.username}</p>
          </div>
          <div className="flex gap-3">
            <Link href="/" className="text-sm font-medium text-gray-600 hover:text-gray-900">
              Startseite
            </Link>
            <button 
              onClick={() => {
                clearSession();
                setSession(null);
              }}
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Search Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Angebote suchen</h2>
          
          <div className="grid md:grid-cols-4 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location Zone
              </label>
              <input
                type="text"
                value={locationZone}
                onChange={(e) => setLocationZone(e.target.value)}
                placeholder="z.B. berlin-mitte"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mindestmenge
              </label>
              <input
                type="number"
                min={1}
                value={minQuantity}
                onChange={(e) => setMinQuantity(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Preis pro Einheit (€)
              </label>
              <input
                type="number"
                step={0.5}
                min={0}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={() => void searchOffers()}
                disabled={loading}
                className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
              >
                {loading ? "Lädt..." : "Suchen"}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}
        </div>

        {/* Offers List */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Angebote ({offers.length})
            </h2>
          </div>

          {offers.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <p className="text-gray-600">Keine Angebote gefunden. Versuche andere Suchfilter.</p>
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

            {/* My Listings */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Meine Listings
              </h2>

              {myListings.length === 0 ? (
                <p className="text-gray-600">Noch keine Listings vorhanden.</p>
              ) : (
                <div className="space-y-3">
                  {myListings.map((listing) => (
                    <div
                      key={listing.id}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900">{listing.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {listing.quantityAvailable} Einheiten verfügbar
                          </p>
                          <p className="text-sm text-gray-600">
                            Status: {listing.isActive ? "Aktiv" : "Inaktiv"}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          listing.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
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
