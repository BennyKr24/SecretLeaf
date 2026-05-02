"use client";

import { useTranslations } from "next-intl";
import { Offer } from "@/lib/types";

type OfferCardProps = {
  offer: Offer;
};

export function OfferCard({ offer }: OfferCardProps) {
  const t = useTranslations("offers");

  return (
    <div className="bg-card rounded-lg shadow-sm border border-border hover:shadow-md transition p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-foreground text-lg">{offer.title}</h3>
          <p className="text-sm text-muted-fg mt-1">{t("by", { provider: offer.provider })}</p>
        </div>
        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
          {offer.locationZone}
        </span>
      </div>

      {/* Description */}
      {offer.description && (
        <p className="text-sm text-muted-fg mb-4">{offer.description}</p>
      )}

      {/* Availability */}
      <p className="text-sm font-medium text-foreground mb-4">
        {t("available")}{" "}
        <span className="text-green-600">{offer.quantityAvailable} {offer.unit}</span>
      </p>

      {/* Price Tiers */}
      <div className="space-y-2 mb-4 p-3 bg-background rounded-lg">
        <p className="text-xs text-muted-fg uppercase font-semibold">{t("priceTiers")}</p>
        <div className="space-y-1">
          {offer.priceTiers.map((tier, idx) => (
            <div key={idx} className="flex justify-between text-sm">
              <span className="text-muted-fg">{t("tierFrom", { qty: tier.qty, unit: offer.unit })}</span>
              <span className="font-medium text-foreground">€{tier.pricePerUnit.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <button className="w-full py-2 px-4 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition">
        {t("contact")}
      </button>
    </div>
  );
}
