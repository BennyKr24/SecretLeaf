#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const FERTILIZER_FILE = path.join(ROOT, "apps/web/src/data/terpira/fertilizers.ts");
const PRICE_FILE = path.join(ROOT, "apps/web/src/data/terpira/fertilizerPrices.json");

const API_KEY = process.env.SERPAPI_KEY;
const GL = process.env.PRICE_SYNC_GL ?? "de";
const HL = process.env.PRICE_SYNC_HL ?? "de";
const LIMIT = Number(process.env.PRICE_SYNC_LIMIT ?? "0");
const REQUEST_DELAY_MS = Number(process.env.PRICE_SYNC_DELAY_MS ?? "450");
const OFFER_LIMIT = Number(process.env.PRICE_SYNC_OFFER_LIMIT ?? "100");

if (!API_KEY) {
  console.error("SERPAPI_KEY fehlt. Bitte als Umgebungsvariable setzen, z.B.: SERPAPI_KEY=... npm run fertilizers:prices:sync");
  process.exit(1);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseProductsFromSource(source) {
  const products = [];
  const objectRegex = /\{[\s\S]*?id:\s*"([^"]+)"[\s\S]*?name:\s*"([^"]+)"[\s\S]*?brand:\s*"([^"]+)"[\s\S]*?\}/g;

  let match;
  while ((match = objectRegex.exec(source)) !== null) {
    const [, id, name, brand] = match;
    if (!id || !name || !brand) continue;
    if (products.some((p) => p.id === id)) continue;
    products.push({ id, name, brand });
  }

  return products;
}

function parsePrice(value) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return null;
  const normalized = value
    .replace(/\./g, "")
    .replace(/,/g, ".")
    .replace(/[^\d.]/g, "")
    .trim();
  const num = Number(normalized);
  return Number.isFinite(num) ? num : null;
}

function inferCountry(productUrl, shop) {
  let host = "";
  try {
    host = new URL(productUrl).hostname.toLowerCase();
  } catch {
    host = "";
  }

  const shopLower = String(shop ?? "").toLowerCase();
  const combined = `${host} ${shopLower}`;

  if (/\bde\b|\.de\b|deutschland/.test(combined)) return "DE";
  if (/\bat\b|\.at\b|oesterreich|österreich/.test(combined)) return "AT";
  if (/\bch\b|\.ch\b|schweiz/.test(combined)) return "CH";
  if (/\.eu\b|europe|europa/.test(combined)) return "EU";
  return "OTHER";
}

function inferAvailability(item) {
  const raw = [
    item.availability,
    item.delivery,
    item.extensions,
    item.snippet
  ]
    .flat()
    .filter(Boolean)
    .map((v) => String(v).toLowerCase())
    .join(" ");

  if (!raw) return "unknown";
  if (/out of stock|nicht verfuegbar|nicht verfügbar|ausverkauft|sold out/.test(raw)) return "out_of_stock";
  if (/limited|geringer bestand|nur noch|begrenzt/.test(raw)) return "limited";
  if (/in stock|sofort lieferbar|auf lager|verfuegbar|verfügbar/.test(raw)) return "in_stock";
  return "unknown";
}

function mapSerpResultToOffer(item) {
  const price = parsePrice(item.extracted_price ?? item.price);
  if (price == null) return null;

  const shipping = parsePrice(item.shipping);
  const shop = String(item.source ?? item.merchant ?? "Unbekannter Händler").trim();
  const title = String(item.title ?? "Angebot").trim();
  const productUrl = String(item.link ?? item.product_link ?? "").trim();

  if (!productUrl) return null;

  return {
    shop,
    title,
    productUrl,
    price,
    shipping: shipping ?? undefined,
    country: inferCountry(productUrl, shop),
    availability: inferAvailability(item),
    currency: "EUR",
    lastSeenAt: new Date().toISOString()
  };
}

function takeCheapestOffers(offers, maxCount = 5) {
  const seen = new Set();
  const deduped = [];

  for (const offer of offers) {
    const key = `${offer.shop}|${offer.productUrl}`;
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(offer);
  }

  return deduped
    .sort((a, b) => (a.price + (a.shipping ?? 0)) - (b.price + (b.shipping ?? 0)))
    .slice(0, maxCount);
}

async function fetchOffersForProduct(product) {
  const query = `${product.brand} ${product.name} Dünger`;
  const url = new URL("https://serpapi.com/search.json");
  url.searchParams.set("engine", "google_shopping");
  url.searchParams.set("q", query);
  url.searchParams.set("gl", GL);
  url.searchParams.set("hl", HL);
  url.searchParams.set("api_key", API_KEY);

  const res = await fetch(url.toString(), {
    headers: {
      "accept": "application/json"
    }
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`SerpAPI Fehler (${res.status}) für ${product.id}: ${body.slice(0, 240)}`);
  }

  const payload = await res.json();
  const items = Array.isArray(payload.shopping_results) ? payload.shopping_results : [];
  const offers = items.map(mapSerpResultToOffer).filter(Boolean);
  return takeCheapestOffers(offers, OFFER_LIMIT);
}

async function main() {
  const source = await fs.readFile(FERTILIZER_FILE, "utf8");
  const products = parseProductsFromSource(source);

  const targetProducts = LIMIT > 0 ? products.slice(0, LIMIT) : products;
  if (targetProducts.length === 0) {
    throw new Error("Keine Produkte aus fertilizers.ts geparst.");
  }

  const offersByProduct = {};

  for (let index = 0; index < targetProducts.length; index += 1) {
    const product = targetProducts[index];
    process.stdout.write(`[${index + 1}/${targetProducts.length}] Preise: ${product.id} ... `);

    try {
      const offers = await fetchOffersForProduct(product);
      offersByProduct[product.id] = offers;
      process.stdout.write(`${offers.length} Treffer\n`);
    } catch (error) {
      offersByProduct[product.id] = [];
      process.stdout.write(`Fehler (${error.message})\n`);
    }

    await sleep(REQUEST_DELAY_MS);
  }

  const snapshot = {
    updatedAt: new Date().toISOString(),
    currency: "EUR",
    source: "serpapi:google-shopping",
    offersByProduct
  };

  await fs.writeFile(PRICE_FILE, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
  console.log(`Preis-Snapshot aktualisiert: ${PRICE_FILE}`);
  console.log(`Produkte verarbeitet: ${targetProducts.length}`);
}

main().catch((error) => {
  console.error("Preis-Sync fehlgeschlagen:", error);
  process.exit(1);
});
