import priceSnapshot from "./fertilizerPrices.json";

export type FertilizerOfferCountry = "DE" | "AT" | "CH" | "EU" | "OTHER";

export type FertilizerPriceOffer = {
  shop: string;
  title: string;
  productUrl: string;
  price: number;
  shipping?: number;
  country?: FertilizerOfferCountry;
  availability?: "in_stock" | "limited" | "out_of_stock" | "unknown";
  currency: "EUR";
  lastSeenAt: string;
};

export type FertilizerPriceSnapshot = {
  updatedAt: string | null;
  currency: "EUR";
  source: string;
  offersByProduct: Record<string, FertilizerPriceOffer[]>;
};

export const fertilizerPriceSnapshot: FertilizerPriceSnapshot = priceSnapshot as FertilizerPriceSnapshot;

function normalizeId(productId: string): string {
  return productId.replace(/-(lite|pro|max|elite)$/i, "");
}

export function getOffersForProduct(productId: string, limit = 5): FertilizerPriceOffer[] {
  const direct = fertilizerPriceSnapshot.offersByProduct[productId] ?? [];
  if (direct.length > 0) return direct.slice(0, limit);

  const base = fertilizerPriceSnapshot.offersByProduct[normalizeId(productId)] ?? [];
  return base.slice(0, limit);
}

export function filterOffers(
  offers: FertilizerPriceOffer[],
  options?: {
    region?: "all" | FertilizerOfferCountry;
    onlyAvailable?: boolean;
    onlyWithShipping?: boolean;
  }
): FertilizerPriceOffer[] {
  const region = options?.region ?? "all";
  const onlyAvailable = options?.onlyAvailable ?? false;
  const onlyWithShipping = options?.onlyWithShipping ?? false;

  return offers.filter((offer) => {
    if (region !== "all" && (offer.country ?? "OTHER") !== region) return false;
    if (onlyAvailable && offer.availability === "out_of_stock") return false;
    if (onlyWithShipping && offer.shipping == null) return false;
    return true;
  });
}

export function getBestPriceForProduct(productId: string): number | null {
  const offers = getOffersForProduct(productId, 1);
  const first = offers[0];
  return first ? first.price : null;
}

export function getEffectivePrice(offer: FertilizerPriceOffer): number {
  return offer.price + (offer.shipping ?? 0);
}

export function formatEuro(price: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(price);
}
