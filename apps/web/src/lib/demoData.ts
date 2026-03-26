import { Offer, SessionData } from "./types";

export const DEMO_SESSION: SessionData = {
  token: "demo-token",
  user: {
    id: "demo-user-id",
    username: "demo_user",
    role: "CONSUMER"
  }
};

export const DEMO_SESSION_PROVIDER: SessionData = {
  token: "demo-token-provider",
  user: {
    id: "demo-provider-id",
    username: "demo_provider",
    role: "PROVIDER"
  }
};

export const DEMO_OFFERS: Offer[] = [
  {
    id: "demo-1",
    title: "Premium Indoor – Amnesia Haze",
    description: "Hochwertiger Indoor-Anbau, sehr dezentes Aroma.",
    quantityAvailable: 50,
    unit: "g",
    provider: "gruen_kollektiv",
    cheapestPrice: 800,
    locationZone: "berlin-mitte",
    priceTiers: [
      { qty: 1, pricePerUnit: 10.0 },
      { qty: 5, pricePerUnit: 9.0 },
      { qty: 10, pricePerUnit: 8.0 }
    ]
  },
  {
    id: "demo-2",
    title: "CBD-Flower – White Widow",
    description: "Entspannendes CBD-Produkt, THC unter Grenzwert.",
    quantityAvailable: 30,
    unit: "g",
    provider: "leafhouse_berlin",
    cheapestPrice: 600,
    locationZone: "berlin-mitte",
    priceTiers: [
      { qty: 1, pricePerUnit: 8.0 },
      { qty: 5, pricePerUnit: 7.5 },
      { qty: 10, pricePerUnit: 6.0 }
    ]
  },
  {
    id: "demo-3",
    title: "Outdoor Ernte – Northern Lights",
    description: "Nachhaltig angebaut, biologisch zertifiziert.",
    quantityAvailable: 100,
    unit: "g",
    provider: "urban_harvest",
    cheapestPrice: 500,
    locationZone: "berlin-prenzlauer",
    priceTiers: [
      { qty: 1, pricePerUnit: 7.0 },
      { qty: 10, pricePerUnit: 5.5 },
      { qty: 20, pricePerUnit: 5.0 }
    ]
  }
];

export const DEMO_LISTINGS = [
  {
    id: "demo-listing-1",
    title: "Premium Indoor – Amnesia Haze",
    quantityAvailable: 50,
    isActive: true,
    priceTiers: [
      { qty: 1, pricePerUnit: 10.0 },
      { qty: 5, pricePerUnit: 9.0 },
      { qty: 10, pricePerUnit: 8.0 }
    ]
  }
];
