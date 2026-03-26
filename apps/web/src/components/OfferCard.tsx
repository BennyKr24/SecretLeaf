import { Offer } from "@/lib/types";

type OfferCardProps = {
  offer: Offer;
};

export function OfferCard({ offer }: OfferCardProps) {
  const minPrice = Math.min(...offer.priceTiers.map((t) => t.pricePerUnit));
  const maxPrice = Math.max(...offer.priceTiers.map((t) => t.pricePerUnit));

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-900 text-lg">{offer.title}</h3>
          <p className="text-sm text-gray-600 mt-1">von @{offer.provider}</p>
        </div>
        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
          {offer.locationZone}
        </span>
      </div>

      {/* Description */}
      {offer.description && (
        <p className="text-sm text-gray-600 mb-4">{offer.description}</p>
      )}

      {/* Availability */}
      <p className="text-sm font-medium text-gray-700 mb-4">
        Verfügbar: <span className="text-green-600">{offer.quantityAvailable} {offer.unit}</span>
      </p>

      {/* Price Tiers */}
      <div className="space-y-2 mb-4 p-3 bg-gray-50 rounded-lg">
        <p className="text-xs text-gray-600 uppercase font-semibold">Preisgestafflung</p>
        <div className="space-y-1">
          {offer.priceTiers.map((tier, idx) => (
            <div key={idx} className="flex justify-between text-sm">
              <span className="text-gray-600">ab {tier.qty} {offer.unit}:</span>
              <span className="font-medium text-gray-900">€{tier.pricePerUnit.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <button className="w-full py-2 px-4 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition">
        Kontaktieren
      </button>
    </div>
  );
}
