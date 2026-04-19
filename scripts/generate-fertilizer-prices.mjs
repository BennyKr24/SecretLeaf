#!/usr/bin/env node
/**
 * Algorithmischer Preisgenerator für alle Katalog-Produkte.
 *
 * Berechnet realistische Preise auf Basis von:
 *   - Kostenstufe (budget / mid / premium)
 *   - Format (liquid / powder / pellets / granules)
 *   - Marken-Premium (bekannte Marken = leichter Aufschlag)
 *   - Shop-spezifische Varianz (±12 %)
 *   - Versandkosten pro Shop/Region
 *
 * Usage:  node scripts/generate-fertilizer-prices.mjs
 * Output: apps/web/src/data/terpira/fertilizerPrices.json
 */

import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const FERTILIZER_FILE = path.join(ROOT, "apps/web/src/data/terpira/fertilizers.ts");
const PRICE_FILE = path.join(ROOT, "apps/web/src/data/terpira/fertilizerPrices.json");

// ── Shops with realistic names and base shipping ─────────────────────────
const SHOPS = [
  { shop: "Grow-Shop24.de",   country: "DE", baseShipping: 4.90, variance: 0 },
  { shop: "Growland.net",     country: "DE", baseShipping: 4.49, variance: 0.03 },
  { shop: "Indoor-Discount",  country: "DE", baseShipping: 5.90, variance: -0.05 },
  { shop: "HydroGarden.de",   country: "DE", baseShipping: 3.99, variance: 0.06 },
  { shop: "Canna-Shop.at",    country: "AT", baseShipping: 6.90, variance: 0.04 },
  { shop: "GrowBerlin",       country: "DE", baseShipping: 4.50, variance: -0.02 },
  { shop: "BioGrow.ch",       country: "CH", baseShipping: 8.90, variance: 0.12 },
  { shop: "PlantFactory.eu",  country: "EU", baseShipping: 5.50, variance: 0.02 },
];

// ── Deterministic seeded PRNG (mulberry32) ───────────────────────────────
function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return h >>> 0;
}

// ── Price model ──────────────────────────────────────────────────────────

const COST_BASE = { budget: 6.5, mid: 11.5, premium: 18.0 };
const FORMAT_MULT = { liquid: 1.0, powder: 0.75, pellets: 0.85, granules: 0.8 };

const BRAND_PREMIUM = {
  CANNA: 1.12,
  "Advanced Nutrients": 1.18,
  Athena: 1.15,
  "House & Garden": 1.14,
  Mills: 1.10,
  Plagron: 1.05,
  "Green House Feeding": 1.02,
  BioBizz: 1.06,
  "Terra Aquatica": 1.04,
  Atami: 1.08,
};

function computeBasePrice(product) {
  const costBase = COST_BASE[product.cost] ?? 11.5;
  const formatMult = FORMAT_MULT[product.format] ?? 1.0;
  const brandMult = BRAND_PREMIUM[product.brand] ?? 1.0;

  // NPK total slightly affects price (higher concentration = marginally more)
  const npkTotal = (product.npk?.n ?? 0) + (product.npk?.p ?? 0) + (product.npk?.k ?? 0);
  const npkBonus = Math.min(npkTotal * 0.04, 1.5);

  // Yield potential bonus
  const yieldMult =
    product.yeild_potential === "very_high" ? 1.08 :
    product.yeild_potential === "high" ? 1.03 : 1.0;

  return costBase * formatMult * brandMult * yieldMult + npkBonus;
}

function generateOffersForProduct(product) {
  const rng = mulberry32(hashString(product.id));
  const base = computeBasePrice(product);

  // Pick 4-6 shops deterministically
  const shopCount = 4 + Math.floor(rng() * 3); // 4-6
  const shuffled = [...SHOPS].sort(() => rng() - 0.5).slice(0, shopCount);

  const now = new Date().toISOString();

  return shuffled
    .map((s) => {
      const shopVariance = 1 + s.variance + (rng() - 0.5) * 0.12;
      const price = Math.round(base * shopVariance * 100) / 100;

      // 85% in_stock, 10% limited, 5% out_of_stock
      const avRoll = rng();
      const availability =
        avRoll < 0.05 ? "out_of_stock" :
        avRoll < 0.15 ? "limited" : "in_stock";

      // Some shops occasionally have free shipping for premium products
      const freeShipping = product.cost === "premium" && rng() > 0.75;
      const shipping = freeShipping ? 0 : Math.round((s.baseShipping + (rng() - 0.5) * 1.5) * 100) / 100;

      return {
        shop: s.shop,
        title: `${product.brand} ${product.name} – ${product.format === "powder" || product.format === "granules" ? "500g" : "1L"}`,
        productUrl: `https://www.${s.shop.toLowerCase().replace(/[^a-z0-9]/g, "")}.example/p/${product.id}`,
        price: Math.max(2.49, price),
        shipping: Math.max(0, shipping),
        country: s.country,
        availability,
        currency: "EUR",
        lastSeenAt: now,
      };
    })
    .sort((a, b) => (a.price + a.shipping) - (b.price + b.shipping));
}

// ── Slug helper (must match TS toSlug) ───────────────────────────────────

function toSlug(input) {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// ── Parse product IDs + metadata from TS source ──────────────────────────

function parseCoreProducts(source) {
  const products = [];
  const blockRegex = /\{\s*id:\s*"([^"]+)"[\s\S]*?yeild_potential:\s*"([^"]+)"\s*\}/g;
  let match;

  while ((match = blockRegex.exec(source)) !== null) {
    const block = match[0];
    const id = match[1];

    const get = (key) => {
      const m = block.match(new RegExp(`${key}:\\s*"([^"]+)"`));
      return m ? m[1] : null;
    };
    const getNum = (key) => {
      const m = block.match(new RegExp(`${key}:\\s*(\\d+(?:\\.\\d+)?)`));
      return m ? Number(m[1]) : 0;
    };

    products.push({
      id,
      name: get("name") ?? id,
      brand: get("brand") ?? "Unknown",
      cost: get("cost") ?? "mid",
      format: get("format") ?? "liquid",
      yeild_potential: match[2],
      npk: { n: getNum("n"), p: getNum("p"), k: getNum("k") },
    });
  }

  return products;
}

function parseExpansionPlans(source) {
  const products = [];
  // Find marketExpansionPlans blocks:  { brand: "X", ..., cost: "y", lines: [...] }
  const planRegex = /\{\s*brand:\s*"([^"]+)"[\s\S]*?base:\s*"([^"]+)"[\s\S]*?format:\s*"([^"]+)"[\s\S]*?cost:\s*"([^"]+)"[\s\S]*?lines:\s*\[([^\]]*)\]\s*\}/g;
  let m;

  while ((m = planRegex.exec(source)) !== null) {
    const brand = m[1];
    const base = m[2];
    const format = m[3];
    const cost = m[4];
    const linesStr = m[5];

    // Extract line names from the array
    const lineNames = [...linesStr.matchAll(/"([^"]+)"/g)].map((x) => x[1]);

    for (const line of lineNames) {
      const id = `${toSlug(brand)}-${toSlug(line)}`;
      products.push({
        id,
        name: `${brand} ${line}`,
        brand,
        cost,
        format,
        yeild_potential: cost === "premium" ? "very_high" : "high",
        npk: { n: 3, p: 3, k: 3 }, // generic — price is driven by cost/format/brand
      });
    }
  }

  return products;
}

function parseProducts(source) {
  const core = parseCoreProducts(source);
  const expansion = parseExpansionPlans(source);
  const all = [...core, ...expansion];

  // Dedupe by id (core wins over expansion)
  const seen = new Set();
  return all.filter((p) => {
    if (seen.has(p.id)) return false;
    seen.add(p.id);
    return true;
  });
}

// ── Main ─────────────────────────────────────────────────────────────────

async function main() {
  const source = await fs.readFile(FERTILIZER_FILE, "utf8");
  const products = parseProducts(source);

  if (products.length === 0) {
    throw new Error("Keine Produkte aus fertilizers.ts geparst.");
  }

  const offersByProduct = {};
  for (const product of products) {
    offersByProduct[product.id] = generateOffersForProduct(product);
  }

  const snapshot = {
    updatedAt: new Date().toISOString(),
    currency: "EUR",
    source: "algorithmisch:katalog-basiert",
    offersByProduct,
  };

  await fs.writeFile(PRICE_FILE, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");

  const totalOffers = Object.values(offersByProduct).reduce((s, a) => s + a.length, 0);
  console.log(`✓ ${products.length} Produkte · ${totalOffers} Angebote generiert`);
  console.log(`  → ${PRICE_FILE}`);
}

main().catch((err) => {
  console.error("Fehler:", err);
  process.exit(1);
});
