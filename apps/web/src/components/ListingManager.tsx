"use client";

import { useMemo, useState } from "react";
import { apiRequest } from "@/lib/api";
import { SessionData } from "@/lib/types";

type ListingManagerProps = {
  session: SessionData;
  onRefresh: () => Promise<void>;
};

export function ListingManager({ session, onRefresh }: ListingManagerProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [quantityAvailable, setQuantityAvailable] = useState(10);
  const [unit, setUnit] = useState("Stück");
  const [locationZone, setLocationZone] = useState("berlin-mitte");
  const [priceTiersText, setPriceTiersText] = useState("1:5.00,5:4.50,10:4.00");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const isProvider = useMemo(
    () => session.user.role === "PROVIDER",
    [session.user.role]
  );

  if (!isProvider) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900">Provider-Funktionen</h2>
        <p className="text-gray-600 mt-2">Dein Konto ist aktuell nur für die Suche konfiguriert.</p>
      </div>
    );
  }

  const submitListing = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(false);
    setSaving(true);

    try {
      const priceTiers = priceTiersText
        .split(",")
        .map((entry) => entry.trim())
        .filter(Boolean)
        .map((entry) => {
          const [qty, pricePerUnit] = entry.split(":");
          return {
            qty: Number(qty),
            pricePerUnit: Number(pricePerUnit)
          };
        });

      if (priceTiers.length === 0) {
        throw new Error("Mindestens eine Preisgestafflung erforderlich");
      }

      await apiRequest("/listings", {
        method: "POST",
        session,
        body: {
          title,
          description: description || undefined,
          quantityAvailable,
          unit,
          locationZone,
          priceTiers
        }
      });

      setTitle("");
      setDescription("");
      setQuantityAvailable(10);
      setUnit("Stück");
      setPriceTiersText("1:5.00,5:4.50,10:4.00");
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      
      await onRefresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Listing konnte nicht erstellt werden");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Neues Angebot erstellen</h2>

      <form onSubmit={submitListing} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Titel *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            minLength={3}
            maxLength={128}
            placeholder="z.B. Bio-Gemüse aus Region"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Beschreibung (optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={500}
            placeholder="Details zum Angebot..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Verfügbare Menge *
            </label>
            <input
              type="number"
              min={1}
              value={quantityAvailable}
              onChange={(e) => setQuantityAvailable(Number(e.target.value))}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Unit */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Einheit
            </label>
            <input
              type="text"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              maxLength={32}
              placeholder="Stück, kg, L, etc."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Location Zone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location Zone *
            </label>
            <input
              type="text"
              value={locationZone}
              onChange={(e) => setLocationZone(e.target.value)}
              required
              placeholder="z.B. berlin-mitte"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <p className="text-xs text-gray-500 mt-1">Privacy: Wird nur grob gespeichert, nicht exakt.</p>
          </div>

          {/* Price Tiers */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preisgestafflung * <span className="text-gray-500 font-normal">(qty:€price,...)</span>
            </label>
            <input
              type="text"
              value={priceTiersText}
              onChange={(e) => setPriceTiersText(e.target.value)}
              required
              placeholder="1:5.00,5:4.50,10:4.00"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">Format: Menge:Preis, getrennt durch Komma</p>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
            ✓ Listing erfolgreich erstellt!
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={saving}
          className="w-full py-2 px-4 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {saving ? "Wird gespeichert..." : "Angebot erstellen"}
        </button>
      </form>
    </div>
  );
}
