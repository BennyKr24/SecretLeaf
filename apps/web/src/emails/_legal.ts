// ────────────────────────────────────────────────────────────────────────────
// Footer-Rechtsdaten. EIN Ort, damit die Templates unangetastet bleiben, wenn
// aus dem privaten ein gewerblicher Betrieb wird (§ 5 DDG — siehe
// docs/EMAIL_TEMPLATES_PLAN.md §1.8).
//
// Aktuell (nicht-gewerblich): Name + Anschrift + Kontakt reichen und wirken
// professionell. Mit Pro/Monetarisierung `commercial: true` setzen und
// `vatId` / `register` befüllen — dann rendert der Footer die vollen
// Pflichtangaben als Text.
// ────────────────────────────────────────────────────────────────────────────

export const legal = {
  productName: "SecretLeaf",
  operator: "Benjamin Kreb",
  addressLines: ["Am Kreuzstein 21", "66994 Dahn", "Deutschland"],
  contactEmail: "contact@secretleaf.net",
  siteUrl: "https://secretleaf.net",

  // Wird gewerblich → auf true; dann USt-ID etc. ergänzen.
  commercial: false,
  vatId: "" as string, // z. B. "DE123456789"
  register: "" as string, // z. B. "Amtsgericht … HRB …"
  managingDirector: "" as string,
} as const;
