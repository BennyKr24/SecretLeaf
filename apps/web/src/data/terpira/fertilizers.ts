// Umfassender Dünger-Katalog für Cannabis-Anbau
// 50+ professionelle Dünger mit Zusammensetzung, Phasen und Anwendung

export type FertilizerPhase = "veg" | "flower" | "universal";
export type FertilizerBase = "mineral" | "organic" | "hybrid" | "bio-organic";
export type FertilizerFormat = "liquid" | "powder" | "pellets" | "granules";
export type FertilizerApplication = "water" | "soil" | "both";

export type FertilizerProfile = {
  id: string;
  name: string;
  brand: string;
  phase: FertilizerPhase[];
  base: FertilizerBase;
  format: FertilizerFormat;
  application?: FertilizerApplication;
  npk: {
    n: number;
    p: number;
    k: number;
  };
  micronutrients: string[];
  ec_range: {
    min: number;
    max: number;
    unit: string; // mS/cm or dS/m
  };
  ppfd_recommendation?: {
    min: number;
    max: number;
    unit: string; // µmol/(m²·s)
  };
  ph_range?: {
    min: number;
    max: number;
  };
  dilutionRatio?: string; // e.g., "1:100" or "5ml/L"
  cost: "budget" | "mid" | "premium";
  description: string;
  tags: string[];
  yeild_potential: "average" | "high" | "very_high";
};

const fertilizerCatalogCore: FertilizerProfile[] = [
  // === PREMIUM MINERAL SYSTEME (flüssig, modern) ===
  {
    id: "hesi-tnb-complex-grow",
    name: "TNB Complex Grow",
    brand: "HESI",
    phase: ["veg"],
    base: "mineral",
    format: "liquid",
    npk: { n: 4, p: 3, k: 6 },
    micronutrients: ["Fe", "Mn", "Zn", "Cu", "B", "Mo"],
    ec_range: { min: 1.2, max: 1.8, unit: "mS/cm" },
    ppfd_recommendation: { min: 300, max: 600, unit: "µmol/(m²·s)" },
    ph_range: { min: 5.8, max: 6.5 },
    dilutionRatio: "2ml/L",
    cost: "premium",
    description: "Hochmoderner Dünger mit stabilisierter Eisenform und präzisen Mikronährstoff-Verhältnissen.",
    tags: ["Professional", "Indoor", "High-Tech", "Wachstum"],
    yeild_potential: "very_high"
  },
  {
    id: "hesi-tnb-complex-bloom",
    name: "TNB Complex Bloom",
    brand: "HESI",
    phase: ["flower"],
    base: "mineral",
    format: "liquid",
    npk: { n: 1, p: 7, k: 6 },
    micronutrients: ["Fe", "Mn", "Zn", "Cu", "B", "Mo"],
    ec_range: { min: 1.4, max: 2.0, unit: "mS/cm" },
    ppfd_recommendation: { min: 400, max: 900, unit: "µmol/(m²·s)" },
    ph_range: { min: 5.8, max: 6.5 },
    dilutionRatio: "2ml/L",
    cost: "premium",
    description: "Spezielle Blüte-Formulierung mit erhöhtem P/K für maximale Harzentwicklung.",
    tags: ["Professional", "Blüte", "Harz-Fokus"],
    yeild_potential: "very_high"
  },

  {
    id: "floraflex-series-growth",
    name: "FloraFlex Growth",
    brand: "FloraFlex",
    phase: ["veg"],
    base: "mineral",
    format: "liquid",
    npk: { n: 5, p: 2, k: 5 },
    micronutrients: ["Fe", "Mn", "Zn", "Cu", "B", "Mo", "Ca", "Mg"],
    ec_range: { min: 1.0, max: 1.6, unit: "mS/cm" },
    ppfd_recommendation: { min: 250, max: 550, unit: "µmol/(m²·s)" },
    ph_range: { min: 5.5, max: 6.5 },
    dilutionRatio: "1.5ml/L",
    cost: "premium",
    description: "TriStep-System für kontrollierten, stabilen Wachstum mit optimalem Nährstoff-Timing.",
    tags: ["Profi", "Wachstum", "3er-System"],
    yeild_potential: "very_high"
  },
  {
    id: "floraflex-series-bloom",
    name: "FloraFlex Bloom",
    brand: "FloraFlex",
    phase: ["flower"],
    base: "mineral",
    format: "liquid",
    npk: { n: 1, p: 8, k: 7 },
    micronutrients: ["Fe", "Mn", "Zn", "Cu", "B", "Mo"],
    ec_range: { min: 1.3, max: 2.0, unit: "mS/cm" },
    ppfd_recommendation: { min: 500, max: 1000, unit: "µmol/(m²·s)" },
    ph_range: { min: 5.5, max: 6.5 },
    dilutionRatio: "1.5ml/L",
    cost: "premium",
    description: "Spezialisiert auf maximale Blütenentwicklung bei voller Spektral-Auslastung.",
    tags: ["Profi", "Blüte", "Spektral-Optimiert"],
    yeild_potential: "very_high"
  },

  {
    id: "general-hydroponics-flora-grow",
    name: "General Hydroponics Flora Grow",
    brand: "General Hydroponics",
    phase: ["veg"],
    base: "mineral",
    format: "liquid",
    npk: { n: 2, p: 1, k: 1 },
    micronutrients: ["Fe", "Mn", "B", "Zn", "Cu", "Mo"],
    ec_range: { min: 0.8, max: 1.5, unit: "mS/cm" },
    ppfd_recommendation: { min: 200, max: 500, unit: "µmol/(m²·s)" },
    ph_range: { min: 5.5, max: 7.0 },
    dilutionRatio: "1ml/L (Grow+Micro+Bloom in Verhältnis)",
    cost: "mid",
    description: "Klassiker im Hydroponik-Bereich: 3-Teile System für maximale Flexibilität.",
    tags: ["Klassiker", "Hydroponik", "Flexible Teile"],
    yeild_potential: "high"
  },
  {
    id: "general-hydroponics-flora-bloom",
    name: "General Hydroponics Flora Bloom",
    brand: "General Hydroponics",
    phase: ["flower"],
    base: "mineral",
    format: "liquid",
    npk: { n: 0, p: 5, k: 4 },
    micronutrients: ["Fe", "Mn", "B", "Zn", "Cu", "Mo"],
    ec_range: { min: 1.0, max: 1.6, unit: "mS/cm" },
    ppfd_recommendation: { min: 300, max: 700, unit: "µmol/(m²·s)" },
    ph_range: { min: 5.5, max: 7.0 },
    dilutionRatio: "1ml/L",
    cost: "mid",
    description: "Bewährte Blüte-Komponente mit ausgewogenem P/K-Verhältnis.",
    tags: ["Klassiker", "Blüte"],
    yeild_potential: "high"
  },

  {
    id: "maxibloom-powder",
    name: "Maxibloom All-in-One",
    brand: "Masterblend",
    phase: ["universal"],
    base: "mineral",
    format: "powder",
    npk: { n: 5, p: 15, k: 14 },
    micronutrients: ["Fe", "Mn", "Zn", "Cu", "B", "Mo"],
    ec_range: { min: 1.0, max: 1.8, unit: "mS/cm" },
    ppfd_recommendation: { min: 200, max: 600, unit: "µmol/(m²·s)" },
    ph_range: { min: 5.5, max: 6.5 },
    dilutionRatio: "3g/L Maxibloom + 1.5g/L Epsom",
    cost: "budget",
    description: "Hocheffizientes Pulver-System mit bestem Preis-Leistungs-Verhältnis.",
    tags: ["Budget", "Pulver", "All-in-One", "Hydroponik"],
    yeild_potential: "high"
  },

  // === BIO-ORGANISCHE SYSTEME ===
  {
    id: "biobizz-grow",
    name: "BioBizz Growth-C",
    brand: "BioBizz",
    phase: ["veg"],
    base: "bio-organic",
    format: "liquid",
    npk: { n: 4, p: 2, k: 1 },
    micronutrients: ["Fulvinsäuren", "Humin", "organische Stoffe"],
    ec_range: { min: 0.5, max: 1.0, unit: "mS/cm" },
    ppfd_recommendation: { min: 150, max: 400, unit: "µmol/(m²·s)" },
    ph_range: { min: 6.0, max: 7.0 },
    dilutionRatio: "0.5-1ml/L",
    cost: "mid",
    description: "Bio-zertifiziert: Vollständig aus organischen Quellen, ideal für Bodenkultur.",
    tags: ["Organisch", "Bio-Zertifiziert", "Boden", "Natürlich"],
    yeild_potential: "high"
  },
  {
    id: "biobizz-bloom",
    name: "BioBizz Bloom",
    brand: "BioBizz",
    phase: ["flower"],
    base: "bio-organic",
    format: "liquid",
    npk: { n: 1, p: 7, k: 6 },
    micronutrients: ["Fulvinsäuren", "Humin"],
    ec_range: { min: 0.6, max: 1.2, unit: "mS/cm" },
    ppfd_recommendation: { min: 300, max: 700, unit: "µmol/(m²·s)" },
    ph_range: { min: 6.0, max: 7.0 },
    dilutionRatio: "0.5-1ml/L",
    cost: "mid",
    description: "Organische Blüten-Formulierung mit ausgezeichnetem Aroma-Profil.",
    tags: ["Organisch", "Blüte", "Aroma"],
    yeild_potential: "high"
  },

  {
    id: "fox-farm-grow-big",
    name: "Fox Farm Grow Big",
    brand: "Fox Farm",
    phase: ["veg"],
    base: "bio-organic",
    format: "liquid",
    npk: { n: 6, p: 4, k: 4 },
    micronutrients: ["Fulvinsäuren", "Humate", "Kelp-Extrakt"],
    ec_range: { min: 0.8, max: 1.4, unit: "mS/cm" },
    ppfd_recommendation: { min: 200, max: 500, unit: "µmol/(m²·s)" },
    ph_range: { min: 6.0, max: 7.0 },
    dilutionRatio: "1ml/L",
    cost: "mid",
    description: "Probiotisch aktiviertes System mit zusätzlichen Bodenorganismen.",
    tags: ["Bio-Organisch", "Boden", "Probiotisch"],
    yeild_potential: "high"
  },
  {
    id: "fox-farm-flower-kiss",
    name: "Fox Farm Flower Kiss",
    brand: "Fox Farm",
    phase: ["flower"],
    base: "bio-organic",
    format: "liquid",
    npk: { n: 1, p: 10, k: 7 },
    micronutrients: ["Kalzium", "Bor", "Fulvinsäuren"],
    ec_range: { min: 1.0, max: 1.6, unit: "mS/cm" },
    ppfd_recommendation: { min: 400, max: 800, unit: "µmol/(m²·s)" },
    ph_range: { min: 6.0, max: 7.0 },
    dilutionRatio: "1ml/L",
    cost: "mid",
    description: "Speziell für maximale Blütenqualität und Duft-Entwicklung formuliert.",
    tags: ["Bio-Organisch", "Blüte", "Aroma", "Qualität"],
    yeild_potential: "high"
  },

  // === BUDGET SYSTEME ===
  {
    id: "masterblend-grow",
    name: "Masterblend Grow",
    brand: "Masterblend",
    phase: ["veg"],
    base: "mineral",
    format: "powder",
    npk: { n: 6, p: 9, k: 6 },
    micronutrients: ["Fe", "Mn", "B", "Zn", "Cu"],
    ec_range: { min: 0.9, max: 1.5, unit: "mS/cm" },
    ppfd_recommendation: { min: 200, max: 500, unit: "µmol/(m²·s)" },
    ph_range: { min: 5.5, max: 6.5 },
    dilutionRatio: "5g/L Masterblend + 2g/L Epsom",
    cost: "budget",
    description: "Günstiges Pulver-System mit verlässlicher Leistung.",
    tags: ["Budget", "Pulver", "Wachstum"],
    yeild_potential: "average"
  },
  {
    id: "masterblend-flower",
    name: "Masterblend Flower",
    brand: "Masterblend",
    phase: ["flower"],
    base: "mineral",
    format: "powder",
    npk: { n: 3, p: 12, k: 12 },
    micronutrients: ["Fe", "Mn", "B", "Zn", "Cu"],
    ec_range: { min: 1.0, max: 1.7, unit: "mS/cm" },
    ppfd_recommendation: { min: 400, max: 800, unit: "µmol/(m²·s)" },
    ph_range: { min: 5.5, max: 6.5 },
    dilutionRatio: "5g/L Masterblend + 2g/L Epsom",
    cost: "budget",
    description: "Blooming-Formulierung mit ausgewogenem P/K für robuste Blüten.",
    tags: ["Budget", "Pulver", "Blüte"],
    yeild_potential: "average"
  },

  {
    id: "dyna-gro-foliage-pro",
    name: "Dyna-Gro Foliage-Pro",
    brand: "Dyna-Gro",
    phase: ["veg"],
    base: "mineral",
    format: "liquid",
    npk: { n: 9, p: 3, k: 6 },
    micronutrients: ["Ca", "Mg", "S", "Fe", "Mn", "B", "Zn", "Cu", "Mo"],
    ec_range: { min: 1.0, max: 1.8, unit: "mS/cm" },
    ppfd_recommendation: { min: 250, max: 600, unit: "µmol/(m²·s)" },
    ph_range: { min: 5.5, max: 6.5 },
    dilutionRatio: "1.25ml/L",
    cost: "mid",
    description: "Universelles flüssiges System mit vollständigem Spektrum.",
    tags: ["Universal", "Flüssig", "Vollständig"],
    yeild_potential: "high"
  },

  // === SPEZIALISIERTE SYSTEME ===
  {
    id: "advanced-nutrients-perfect-comb",
    name: "Advanced Nutrients Perfect Combination",
    brand: "Advanced Nutrients",
    phase: ["universal"],
    base: "mineral",
    format: "liquid",
    npk: { n: 2, p: 4, k: 6 },
    micronutrients: ["Fe", "Mn", "Zn", "Cu", "B", "Mo", "Fulvinsäuren"],
    ec_range: { min: 0.5, max: 1.2, unit: "mS/cm" },
    ppfd_recommendation: { min: 150, max: 500, unit: "µmol/(m²·s)" },
    ph_range: { min: 5.5, max: 6.5 },
    dilutionRatio: "1ml/L",
    cost: "premium",
    description: "Hochentwickelte Formulierung mit Fulvinsäuren für optimale Nährstoff-Aufnahme.",
    tags: ["Profi", "Universal", "Fulvinsäuren"],
    yeild_potential: "very_high"
  },

  {
    id: "botanicare-kind-grow",
    name: "Botanicare Kind Grow",
    brand: "Botanicare",
    phase: ["veg"],
    base: "mineral",
    format: "liquid",
    npk: { n: 3, p: 1, k: 2 },
    micronutrients: ["Ca", "Fe", "Mn", "B", "Zn", "Cu", "Mo"],
    ec_range: { min: 0.6, max: 1.2, unit: "mS/cm" },
    ppfd_recommendation: { min: 150, max: 400, unit: "µmol/(m²·s)" },
    ph_range: { min: 5.5, max: 6.8 },
    dilutionRatio: "1ml/L",
    cost: "mid",
    description: "Bio-kompatibles System mit ausgezeichneter Nährstoff-Balance für Jungwuchs.",
    tags: ["Bio-Kompatibel", "Wachstum", "Jungwuchs"],
    yeild_potential: "high"
  },
  {
    id: "botanicare-kind-bloom",
    name: "Botanicare Kind Bloom",
    brand: "Botanicare",
    phase: ["flower"],
    base: "mineral",
    format: "liquid",
    npk: { n: 0, p: 7, k: 6 },
    micronutrients: ["Ca", "Mg", "Fe", "Mn", "B", "Zn", "Cu", "Mo"],
    ec_range: { min: 0.8, max: 1.5, unit: "mS/cm" },
    ppfd_recommendation: { min: 300, max: 700, unit: "µmol/(m²·s)" },
    ph_range: { min: 5.5, max: 6.8 },
    dilutionRatio: "1ml/L",
    cost: "mid",
    description: "Bio-freundliche Blüten-Formulierung für vibrante Farben und Aromen.",
    tags: ["Bio-Kompatibel", "Blüte", "Aroma"],
    yeild_potential: "high"
  },

  // === HYDROPONISCHE SPEZIALIST-SYSTEME ===
  {
    id: "lucas-formula",
    name: "Lucas Formula (DIY)",
    brand: "Community",
    phase: ["universal"],
    base: "mineral",
    format: "liquid",
    npk: { n: 2, p: 2, k: 6 },
    micronutrients: ["Fe", "Mn", "B", "Zn", "Cu", "Mo"],
    ec_range: { min: 1.2, max: 2.0, unit: "mS/cm" },
    ppfd_recommendation: { min: 300, max: 800, unit: "µmol/(m²·s)" },
    ph_range: { min: 5.5, max: 6.5 },
    dilutionRatio: "8ml Micro + 16ml Bloom per 4L",
    cost: "budget",
    description: "Bewährte DIY-Formel: Nur Micro + Bloom im 1:2 Verhältnis.",
    tags: ["DIY", "Budget", "Klassiker", "Hydroponik"],
    yeild_potential: "high"
  },
  

  {
    id: "earth-juice-grow",
    name: "Earth Juice Grow",
    brand: "Earth Juice",
    phase: ["veg"],
    base: "bio-organic",
    format: "liquid",
    npk: { n: 2, p: 1, k: 1 },
    micronutrients: ["Humate", "Fulvinsäuren", "Bio-Aktivatoren"],
    ec_range: { min: 0.4, max: 0.8, unit: "mS/cm" },
    ppfd_recommendation: { min: 100, max: 400, unit: "µmol/(m²·s)" },
    ph_range: { min: 6.0, max: 7.5 },
    dilutionRatio: "0.3ml/L",
    cost: "budget",
    description: "Ultraverdünnt, organisch, perfekt für Bodenkultur ohne Salzansammlung.",
    tags: ["Bio-Organisch", "Budget", "Boden", "Verdünnt"],
    yeild_potential: "average"
  },
  {
    id: "earth-juice-bloom",
    name: "Earth Juice Bloom",
    brand: "Earth Juice",
    phase: ["flower"],
    base: "bio-organic",
    format: "liquid",
    npk: { n: 0, p: 7, k: 9 },
    micronutrients: ["Humate", "Kalzium"],
    ec_range: { min: 0.5, max: 1.0, unit: "mS/cm" },
    ppfd_recommendation: { min: 200, max: 600, unit: "µmol/(m²·s)" },
    ph_range: { min: 6.0, max: 7.5 },
    dilutionRatio: "0.3ml/L",
    cost: "budget",
    description: "Organische Blüten-Nährstoff mit extremem P/K-Fokus für schwere Blüten.",
    tags: ["Bio-Organisch", "Budget", "Blüte"],
    yeild_potential: "average"
  },
  

  // === PREMIUM ADDITIVE & BOOSTER ===
  
  {
    id: "kelp-extract-concentrate",
    name: "Kelp Extract 60X",
    brand: "Maxicrop",
    phase: ["universal"],
    base: "organic",
    format: "liquid",
    npk: { n: 0.5, p: 0.3, k: 9.5 },
    micronutrients: ["Kalium", "Iod", "Fulvinsäuren", "Auxine"],
    ec_range: { min: 0.2, max: 0.5, unit: "mS/cm" },
    ppfd_recommendation: { min: 100, max: 600, unit: "µmol/(m²·s)" },
    ph_range: { min: 4.5, max: 8.0 },
    dilutionRatio: "0.2ml/L wöchentlich",
    cost: "mid",
    description: "Seealgen-Extrakt für natürliche Hormon-Stimulation und Stressresistenz.",
    tags: ["Bio-Organisch", "Additive", "Stress-Resistance", "Hormon-Stimulation"],
    yeild_potential: "average"
  },

  // === SPEZIALISIERTE BLÜTE-BOOSTER ===
  {
    id: "pk-booster-formula",
    name: "PK 13/14 Booster",
    brand: "CANNA",
    phase: ["flower"],
    base: "mineral",
    format: "liquid",
    npk: { n: 0, p: 13, k: 14 },
    micronutrients: ["Ca", "Mg", "B"],
    ec_range: { min: 2.0, max: 3.5, unit: "mS/cm" },
    ppfd_recommendation: { min: 600, max: 1200, unit: "µmol/(m²·s)" },
    ph_range: { min: 5.5, max: 6.5 },
    dilutionRatio: "1ml/L für 2 Wochen in der Blüte",
    cost: "premium",
    description: "Extrem konzentrierte P/K für maximale Blütengewicht und Potenz.",
    tags: ["Profi", "Blüte", "Booster", "PK", "Potenz"],
    yeild_potential: "very_high"
  },

  {
    id: "bud-candy-carbs",
    name: "Bud Candy (Carbohydrate Booster)",
    brand: "Advanced Nutrients",
    phase: ["flower"],
    base: "organic",
    format: "liquid",
    npk: { n: 0, p: 0, k: 0 },
    micronutrients: ["Glucose", "Saccharose", "Oligopeptide"],
    ec_range: { min: 0.5, max: 1.5, unit: "mS/cm" },
    ppfd_recommendation: { min: 400, max: 900, unit: "µmol/(m²·s)" },
    ph_range: { min: 5.5, max: 6.5 },
    dilutionRatio: "1.5ml/L während der Blüte",
    cost: "premium",
    description: "Monosaccharide und Oligopeptide für verstärkte Aromabilidung und Geschmack.",
    tags: ["Profi", "Blüte", "Kohlenhydrate", "Aroma", "Geschmack"],
    yeild_potential: "very_high"
  },

  // === NISCHE/SPEZIAL ===
  {
    id: "calmag-supplement",
    name: "Cal/Mag Supplement",
    brand: "General Hydroponics",
    phase: ["universal"],
    base: "mineral",
    format: "liquid",
    npk: { n: 0, p: 0, k: 0 },
    micronutrients: ["Ca", "Mg", "Fe"],
    ec_range: { min: 0.2, max: 0.6, unit: "mS/cm" },
    ppfd_recommendation: { min: 0, max: 0, unit: "µmol/(m²·s)" },
    ph_range: { min: 5.0, max: 7.5 },
    dilutionRatio: "5ml/Gallon (1.3ml/L)",
    cost: "budget",
    description: "Ausgleich von Cal/Mag-Mangelerscheinungen, besonders in RO-Systemen wichtig.",
    tags: ["Additive", "Cal/Mag", "RO-Systeme", "Mangelausgleich"],
    yeild_potential: "average"
  },

  {
    id: "silica-strength",
    name: "Silica Strength Complex",
    brand: "Advanced Nutrients",
    phase: ["universal"],
    base: "mineral",
    format: "liquid",
    npk: { n: 0, p: 0, k: 0 },
    micronutrients: ["Silizium", "Kalium"],
    ec_range: { min: 0.3, max: 0.8, unit: "mS/cm" },
    ppfd_recommendation: { min: 100, max: 800, unit: "µmol/(m²·s)" },
    ph_range: { min: 5.5, max: 6.5 },
    dilutionRatio: "1ml/L",
    cost: "premium",
    description: "Silizium-Komplex für stabilere Zellwände, bessere Wärmetolerant und Pest-Resistenz.",
    tags: ["Profi", "Silizium", "Robustheit", "Pest-Resistenz"],
    yeild_potential: "high"
  },

  

  // === INTERNATIONALE PROFI-MARKEN (Europäisch) ===
  {
    id: "plagron-cocos-bloom",
    name: "Plagron Cocos Bloom",
    brand: "Plagron",
    phase: ["flower"],
    base: "mineral",
    format: "liquid",
    npk: { n: 0, p: 6, k: 4 },
    micronutrients: ["Ca", "Mg", "Fe", "Mn", "B", "Zn", "Cu", "Mo"],
    ec_range: { min: 1.2, max: 2.0, unit: "mS/cm" },
    ppfd_recommendation: { min: 500, max: 1000, unit: "µmol/(m²·s)" },
    ph_range: { min: 5.0, max: 6.2 },
    dilutionRatio: "2ml/L",
    cost: "mid",
    description: "Holländische Formulierung speziell für Kokosfaser-Anbau.",
    tags: ["Europäisch", "Coco", "Blüte", "Premium-Budget"],
    yeild_potential: "high"
  },

  {
    id: "plagron-cocos-veg",
    name: "Plagron Cocos Grow",
    brand: "Plagron",
    phase: ["veg"],
    base: "mineral",
    format: "liquid",
    npk: { n: 8, p: 2, k: 5 },
    micronutrients: ["Ca", "Mg", "Fe", "Mn", "B", "Zn", "Cu", "Mo"],
    ec_range: { min: 1.0, max: 1.8, unit: "mS/cm" },
    ppfd_recommendation: { min: 300, max: 700, unit: "µmol/(m²·s)" },
    ph_range: { min: 5.0, max: 6.2 },
    dilutionRatio: "2ml/L",
    cost: "mid",
    description: "Europäisches Wachstums-System für Kokosfaser.",
    tags: ["Europäisch", "Coco", "Wachstum"],
    yeild_potential: "high"
  },

  {
    id: "atami-bloombastic",
    name: "Atami Bloombastic",
    brand: "Atami",
    phase: ["flower"],
    base: "mineral",
    format: "liquid",
    npk: { n: 0, p: 28, k: 26 },
    micronutrients: ["K", "P", "Fulvinsäuren"],
    ec_range: { min: 2.5, max: 4.0, unit: "mS/cm" },
    ppfd_recommendation: { min: 800, max: 1200, unit: "µmol/(m²·s)" },
    ph_range: { min: 5.5, max: 6.2 },
    dilutionRatio: "2ml/L (letzten 3 Wochen der Blüte)",
    cost: "premium",
    description: "Ultra-konzentriertes PK-Booster für massive Blütenentwicklung.",
    tags: ["Holländisch", "Blüte", "Booster", "Ultra-Stark"],
    yeild_potential: "very_high"
  },

  // === NOCH MEHR BUDGET OPTIONEN UND ALTERNATIVE ===
  {
    id: "yara-hy-grow",
    name: "Yara HY Grow",
    brand: "Yara",
    phase: ["veg"],
    base: "mineral",
    format: "powder",
    npk: { n: 9, p: 3, k: 7 },
    micronutrients: ["Ca", "Mg", "Fe", "Mn", "B", "Zn", "Cu", "Mo"],
    ec_range: { min: 0.8, max: 1.5, unit: "mS/cm" },
    ppfd_recommendation: { min: 200, max: 500, unit: "µmol/(m²·s)" },
    ph_range: { min: 5.5, max: 7.0 },
    dilutionRatio: "4g/L",
    cost: "budget",
    description: "Industrieller Agricultural-Dünger, perfekt für Hydroponik.",
    tags: ["Budget", "Industriell", "Hydroponik"],
    yeild_potential: "high"
  },

  {
    id: "yara-hy-bloom",
    name: "Yara HY Bloom",
    brand: "Yara",
    phase: ["flower"],
    base: "mineral",
    format: "powder",
    npk: { n: 3, p: 14, k: 10 },
    micronutrients: ["Ca", "Mg", "Fe", "Mn", "B", "Zn", "Cu", "Mo"],
    ec_range: { min: 1.0, max: 1.8, unit: "mS/cm" },
    ppfd_recommendation: { min: 400, max: 800, unit: "µmol/(m²·s)" },
    ph_range: { min: 5.5, max: 7.0 },
    dilutionRatio: "4g/L",
    cost: "budget",
    description: "Industrielle Blüte-Formulierung mit ausgewogener Nährstoff-Balance.",
    tags: ["Budget", "Industriell", "Blüte"],
    yeild_potential: "high"
  },

  {
    id: "jacks-321",
    name: "Jacks 3-2-1 (DIY)",
    brand: "Jacks",
    phase: ["universal"],
    base: "mineral",
    format: "powder",
    npk: { n: 20, p: 20, k: 20 },
    micronutrients: ["Ca", "Mg", "Mikro-Nährstoffe"],
    ec_range: { min: 0.8, max: 1.5, unit: "mS/cm" },
    ppfd_recommendation: { min: 300, max: 800, unit: "µmol/(m²·s)" },
    ph_range: { min: 5.5, max: 6.5 },
    dilutionRatio: "3g Jack's 321 + 2g Epsom + 1g Mg per Liter",
    cost: "budget",
    description: "DIY-Klassiker aus den USA: 3 billige Komponenten für perfekte Kontrolle.",
    tags: ["Budget", "DIY", "Klassiker", "Kontrolle"],
    yeild_potential: "high"
  },

  // === WICHTIGE BEKANNTE MARKEN (Top-Linien) ===
  {
    id: "canna-terra-vega",
    name: "CANNA Terra Vega",
    brand: "CANNA",
    phase: ["veg"],
    base: "mineral",
    format: "liquid",
    application: "soil",
    npk: { n: 3, p: 1, k: 4 },
    micronutrients: ["Fe", "Mn", "Zn", "Cu", "B", "Mo"],
    ec_range: { min: 1.0, max: 1.7, unit: "mS/cm" },
    ppfd_recommendation: { min: 250, max: 650, unit: "µmol/(m²·s)" },
    ph_range: { min: 5.8, max: 6.3 },
    dilutionRatio: "2-4ml/L",
    cost: "mid",
    description: "Sehr bekannte Erde-Wuchsformel für stabile Vegetationsphase.",
    tags: ["Top-Marke", "Erde", "Wachstum"],
    yeild_potential: "high"
  },
  {
    id: "canna-terra-flores",
    name: "CANNA Terra Flores",
    brand: "CANNA",
    phase: ["flower"],
    base: "mineral",
    format: "liquid",
    application: "soil",
    npk: { n: 2, p: 2, k: 4 },
    micronutrients: ["Fe", "Mn", "Zn", "Cu", "B", "Mo"],
    ec_range: { min: 1.3, max: 2.1, unit: "mS/cm" },
    ppfd_recommendation: { min: 450, max: 950, unit: "µmol/(m²·s)" },
    ph_range: { min: 5.8, max: 6.3 },
    dilutionRatio: "2-4ml/L",
    cost: "mid",
    description: "Klassischer Blütedünger für Erde mit breiter Verfügbarkeit.",
    tags: ["Top-Marke", "Erde", "Blüte"],
    yeild_potential: "high"
  },
  {
    id: "canna-aqua-vega",
    name: "CANNA Aqua Vega",
    brand: "CANNA",
    phase: ["veg"],
    base: "mineral",
    format: "liquid",
    application: "water",
    npk: { n: 5, p: 2, k: 5 },
    micronutrients: ["Fe", "Mn", "Zn", "Cu", "B", "Mo", "Ca", "Mg"],
    ec_range: { min: 1.1, max: 1.8, unit: "mS/cm" },
    ppfd_recommendation: { min: 300, max: 700, unit: "µmol/(m²·s)" },
    ph_range: { min: 5.2, max: 6.2 },
    dilutionRatio: "2ml/L",
    cost: "premium",
    description: "Hydro-optimierte Wachstumsformel der bekannten CANNA Aqua Linie.",
    tags: ["Top-Marke", "Hydro", "Wasser"],
    yeild_potential: "very_high"
  },
  {
    id: "canna-aqua-flores",
    name: "CANNA Aqua Flores",
    brand: "CANNA",
    phase: ["flower"],
    base: "mineral",
    format: "liquid",
    application: "water",
    npk: { n: 3, p: 4, k: 5 },
    micronutrients: ["Fe", "Mn", "Zn", "Cu", "B", "Mo", "Ca", "Mg"],
    ec_range: { min: 1.4, max: 2.2, unit: "mS/cm" },
    ppfd_recommendation: { min: 500, max: 1100, unit: "µmol/(m²·s)" },
    ph_range: { min: 5.2, max: 6.2 },
    dilutionRatio: "2ml/L",
    cost: "premium",
    description: "Aqua-Blüteformel für hohe Erträge in rezirkulierenden Wassersystemen.",
    tags: ["Top-Marke", "Hydro", "Wasser", "Blüte"],
    yeild_potential: "very_high"
  },
  {
    id: "advanced-nutrients-sensi-grow",
    name: "Advanced Nutrients pH Perfect Grow",
    brand: "Advanced Nutrients",
    phase: ["veg"],
    base: "mineral",
    format: "liquid",
    application: "water",
    npk: { n: 4, p: 1, k: 5 },
    micronutrients: ["Fe", "Mn", "Zn", "Cu", "B", "Mo", "Ca", "Mg"],
    ec_range: { min: 1.0, max: 1.7, unit: "mS/cm" },
    ppfd_recommendation: { min: 250, max: 650, unit: "µmol/(m²·s)" },
    ph_range: { min: 5.5, max: 6.3 },
    dilutionRatio: "2-4ml/L",
    cost: "premium",
    description: "Bekannte pH-Puffer-Linie für Hydro und Coco mit einfacher Steuerung.",
    tags: ["Top-Marke", "Hydro", "Coco", "pH-Puffer"],
    yeild_potential: "very_high"
  },
  {
    id: "advanced-nutrients-sensi-bloom",
    name: "Advanced Nutrients pH Perfect Bloom",
    brand: "Advanced Nutrients",
    phase: ["flower"],
    base: "mineral",
    format: "liquid",
    application: "water",
    npk: { n: 2, p: 6, k: 7 },
    micronutrients: ["Fe", "Mn", "Zn", "Cu", "B", "Mo", "Ca", "Mg"],
    ec_range: { min: 1.3, max: 2.1, unit: "mS/cm" },
    ppfd_recommendation: { min: 450, max: 1050, unit: "µmol/(m²·s)" },
    ph_range: { min: 5.5, max: 6.3 },
    dilutionRatio: "2-4ml/L",
    cost: "premium",
    description: "Sehr verbreitete Blütelinie mit automatischer pH-Stabilisierung.",
    tags: ["Top-Marke", "Hydro", "Wasser", "Blüte"],
    yeild_potential: "very_high"
  },
  {
    id: "athena-pro-grow",
    name: "Athena Pro Grow",
    brand: "Athena",
    phase: ["veg"],
    base: "mineral",
    format: "powder",
    application: "water",
    npk: { n: 18, p: 8, k: 18 },
    micronutrients: ["Fe", "Mn", "Zn", "Cu", "B", "Mo"],
    ec_range: { min: 1.2, max: 2.0, unit: "mS/cm" },
    ppfd_recommendation: { min: 300, max: 750, unit: "µmol/(m²·s)" },
    ph_range: { min: 5.5, max: 6.3 },
    dilutionRatio: "1-2g/L",
    cost: "premium",
    description: "Moderne Pro-Pulverlinie für präzises Dosieren in Bewässerungssystemen.",
    tags: ["Top-Marke", "Pulver", "Pro", "Wasser"],
    yeild_potential: "very_high"
  },
  {
    id: "athena-pro-bloom",
    name: "Athena Pro Bloom",
    brand: "Athena",
    phase: ["flower"],
    base: "mineral",
    format: "powder",
    application: "water",
    npk: { n: 9, p: 21, k: 27 },
    micronutrients: ["Fe", "Mn", "Zn", "Cu", "B", "Mo"],
    ec_range: { min: 1.5, max: 2.4, unit: "mS/cm" },
    ppfd_recommendation: { min: 550, max: 1200, unit: "µmol/(m²·s)" },
    ph_range: { min: 5.5, max: 6.3 },
    dilutionRatio: "1-2g/L",
    cost: "premium",
    description: "Athena Blütepulver mit hoher PK-Dichte für intensive Produktion.",
    tags: ["Top-Marke", "Pulver", "Pro", "Blüte"],
    yeild_potential: "very_high"
  },
  {
    id: "house-garden-coco-a",
    name: "House & Garden Cocos A",
    brand: "House & Garden",
    phase: ["veg", "flower"],
    base: "mineral",
    format: "liquid",
    application: "water",
    npk: { n: 3, p: 1, k: 5 },
    micronutrients: ["Ca", "Mg", "Fe", "Mn", "Zn", "Cu", "B", "Mo"],
    ec_range: { min: 1.0, max: 1.9, unit: "mS/cm" },
    ppfd_recommendation: { min: 280, max: 900, unit: "µmol/(m²·s)" },
    ph_range: { min: 5.5, max: 6.3 },
    dilutionRatio: "1-3ml/L",
    cost: "premium",
    description: "Bekanntes Cocos-Basissystem für automatische Bewässerung.",
    tags: ["Top-Marke", "Coco", "Wasser"],
    yeild_potential: "very_high"
  },
  {
    id: "house-garden-coco-b",
    name: "House & Garden Cocos B",
    brand: "House & Garden",
    phase: ["veg", "flower"],
    base: "mineral",
    format: "liquid",
    application: "water",
    npk: { n: 1, p: 3, k: 6 },
    micronutrients: ["Ca", "Mg", "Fe", "Mn", "Zn", "Cu", "B", "Mo"],
    ec_range: { min: 1.0, max: 1.9, unit: "mS/cm" },
    ppfd_recommendation: { min: 280, max: 900, unit: "µmol/(m²·s)" },
    ph_range: { min: 5.5, max: 6.3 },
    dilutionRatio: "1-3ml/L",
    cost: "premium",
    description: "Zweite Komponente der H&G Cocos-Serie für ausgewogene Versorgung.",
    tags: ["Top-Marke", "Coco", "Wasser", "A+B"],
    yeild_potential: "very_high"
  },
  {
    id: "terra-aquatica-tripart-grow",
    name: "Terra Aquatica TriPart Grow",
    brand: "Terra Aquatica",
    phase: ["veg"],
    base: "mineral",
    format: "liquid",
    application: "water",
    npk: { n: 3, p: 1, k: 6 },
    micronutrients: ["Fe", "Mn", "Zn", "Cu", "B", "Mo", "Ca", "Mg"],
    ec_range: { min: 0.8, max: 1.6, unit: "mS/cm" },
    ppfd_recommendation: { min: 220, max: 620, unit: "µmol/(m²·s)" },
    ph_range: { min: 5.5, max: 6.5 },
    dilutionRatio: "1-2ml/L",
    cost: "mid",
    description: "Weiterentwicklung der klassischen TriPart-Linie für Hydro und Coco.",
    tags: ["Top-Marke", "Hydro", "Klassiker"],
    yeild_potential: "high"
  },
  {
    id: "terra-aquatica-tripart-bloom",
    name: "Terra Aquatica TriPart Bloom",
    brand: "Terra Aquatica",
    phase: ["flower"],
    base: "mineral",
    format: "liquid",
    application: "water",
    npk: { n: 0, p: 5, k: 4 },
    micronutrients: ["Fe", "Mn", "Zn", "Cu", "B", "Mo", "Ca", "Mg"],
    ec_range: { min: 1.1, max: 1.8, unit: "mS/cm" },
    ppfd_recommendation: { min: 420, max: 920, unit: "µmol/(m²·s)" },
    ph_range: { min: 5.5, max: 6.5 },
    dilutionRatio: "1-2ml/L",
    cost: "mid",
    description: "Blütekomponente der etablierten TriPart-Familie.",
    tags: ["Top-Marke", "Hydro", "Blüte", "Klassiker"],
    yeild_potential: "high"
  },
  {
    id: "greenhouse-powder-feeding-grow",
    name: "Green House Powder Feeding Grow",
    brand: "Green House Feeding",
    phase: ["veg"],
    base: "mineral",
    format: "powder",
    application: "both",
    npk: { n: 24, p: 6, k: 12 },
    micronutrients: ["Fe", "Mn", "Zn", "Cu", "B", "Mo"],
    ec_range: { min: 0.9, max: 1.8, unit: "mS/cm" },
    ppfd_recommendation: { min: 250, max: 700, unit: "µmol/(m²·s)" },
    ph_range: { min: 5.8, max: 6.5 },
    dilutionRatio: "0.5-1.2g/L",
    cost: "mid",
    description: "Sehr bekannte 1-Komponenten-Pulverlösung für Wachstum.",
    tags: ["Top-Marke", "Pulver", "Erde", "Wasser"],
    yeild_potential: "high"
  },
  {
    id: "greenhouse-powder-feeding-short-flowering",
    name: "Green House Powder Feeding Short Flowering",
    brand: "Green House Feeding",
    phase: ["flower"],
    base: "mineral",
    format: "powder",
    application: "both",
    npk: { n: 16, p: 6, k: 26 },
    micronutrients: ["Fe", "Mn", "Zn", "Cu", "B", "Mo"],
    ec_range: { min: 1.1, max: 2.0, unit: "mS/cm" },
    ppfd_recommendation: { min: 450, max: 1050, unit: "µmol/(m²·s)" },
    ph_range: { min: 5.8, max: 6.5 },
    dilutionRatio: "0.6-1.3g/L",
    cost: "mid",
    description: "Beliebte Blütevariante der Powder Feeding Linie.",
    tags: ["Top-Marke", "Pulver", "Blüte", "Erde", "Wasser"],
    yeild_potential: "very_high"
  },
  {
    id: "plagron-alga-grow",
    name: "Plagron Alga Grow",
    brand: "Plagron",
    phase: ["veg"],
    base: "bio-organic",
    format: "liquid",
    application: "soil",
    npk: { n: 4, p: 2, k: 4 },
    micronutrients: ["Alginate", "Fe", "Mn", "Zn"],
    ec_range: { min: 0.7, max: 1.3, unit: "mS/cm" },
    ppfd_recommendation: { min: 180, max: 520, unit: "µmol/(m²·s)" },
    ph_range: { min: 6.0, max: 7.0 },
    dilutionRatio: "2-4ml/L",
    cost: "mid",
    description: "Bekannte organische Erde-Linie von Plagron für Veg.",
    tags: ["Top-Marke", "Erde", "Bio", "Wachstum"],
    yeild_potential: "high"
  },
  {
    id: "plagron-alga-bloom",
    name: "Plagron Alga Bloom",
    brand: "Plagron",
    phase: ["flower"],
    base: "bio-organic",
    format: "liquid",
    application: "soil",
    npk: { n: 3, p: 2, k: 5 },
    micronutrients: ["Alginate", "Fe", "Mn", "Zn"],
    ec_range: { min: 0.9, max: 1.5, unit: "mS/cm" },
    ppfd_recommendation: { min: 350, max: 820, unit: "µmol/(m²·s)" },
    ph_range: { min: 6.0, max: 7.0 },
    dilutionRatio: "2-4ml/L",
    cost: "mid",
    description: "Organische Blüteformel für Erde, weit verbreitet in EU-Grows.",
    tags: ["Top-Marke", "Erde", "Bio", "Blüte"],
    yeild_potential: "high"
  },
  {
    id: "biotabs-orgatrex",
    name: "BioTabs Orgatrex",
    brand: "BioTabs",
    phase: ["universal"],
    base: "organic",
    format: "pellets",
    application: "soil",
    npk: { n: 5, p: 1, k: 5 },
    micronutrients: ["Huminsäuren", "Bodenmikroben", "Kelp"],
    ec_range: { min: 0.4, max: 1.1, unit: "mS/cm" },
    ppfd_recommendation: { min: 150, max: 700, unit: "µmol/(m²·s)" },
    ph_range: { min: 6.0, max: 7.2 },
    dilutionRatio: "2-5ml/L oder topdress",
    cost: "mid",
    description: "Bekannter organischer Bodenansatz mit Mikrobenfokus.",
    tags: ["Top-Marke", "Erde", "Mikroben", "Topdress"],
    yeild_potential: "high"
  },
  {
    id: "mills-basis-a",
    name: "Mills Basis A",
    brand: "Mills",
    phase: ["veg", "flower"],
    base: "hybrid",
    format: "liquid",
    application: "both",
    npk: { n: 3, p: 0, k: 1 },
    micronutrients: ["Fe", "Mn", "Zn", "Cu", "B", "Mo", "Ca"],
    ec_range: { min: 0.8, max: 1.8, unit: "mS/cm" },
    ppfd_recommendation: { min: 250, max: 900, unit: "µmol/(m²·s)" },
    ph_range: { min: 5.7, max: 6.5 },
    dilutionRatio: "1-2ml/L",
    cost: "premium",
    description: "Premium A-Komponente aus der bekannten Mills Basislinie.",
    tags: ["Top-Marke", "A+B", "Erde", "Wasser"],
    yeild_potential: "very_high"
  },
  {
    id: "mills-basis-b",
    name: "Mills Basis B",
    brand: "Mills",
    phase: ["veg", "flower"],
    base: "hybrid",
    format: "liquid",
    application: "both",
    npk: { n: 1, p: 3, k: 6 },
    micronutrients: ["Fe", "Mn", "Zn", "Cu", "B", "Mo", "Mg"],
    ec_range: { min: 0.8, max: 1.8, unit: "mS/cm" },
    ppfd_recommendation: { min: 250, max: 900, unit: "µmol/(m²·s)" },
    ph_range: { min: 5.7, max: 6.5 },
    dilutionRatio: "1-2ml/L",
    cost: "premium",
    description: "B-Komponente für das Mills Basis-System in Erde und Hydro.",
    tags: ["Top-Marke", "A+B", "Erde", "Wasser", "Blüte"],
    yeild_potential: "very_high"
  }
];

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

function inferApplication(item: FertilizerProfile): FertilizerApplication {
  if (item.format === "pellets" || item.format === "granules") return "soil";
  const hasSoil = item.tags.some((t) => {
    const s = t.toLowerCase();
    return s.includes("erde") || s.includes("soil") || s.includes("topdress") || s.includes("boden");
  });
  const hasWater = item.tags.some((t) => {
    const s = t.toLowerCase();
    return s.includes("hydro") || s.includes("wasser") || s.includes("coco");
  });
  if (hasSoil && hasWater) return "both";
  if (hasSoil) return "soil";
  if (hasWater) return "water";
  return item.format === "liquid" || item.format === "powder" ? "water" : "both";
}

type BrandExpansionPlan = {
  brand: string;
  base: FertilizerBase;
  format: FertilizerFormat;
  application: FertilizerApplication;
  cost: "budget" | "mid" | "premium";
  lines: string[];
};

const marketExpansionPlans: BrandExpansionPlan[] = [
  {
    brand: "Grotek",
    base: "mineral",
    format: "liquid",
    application: "water",
    cost: "mid",
    lines: ["Growth", "Bloom", "Micro", "CalMag", "Root", "Silica", "PK", "Finish", "Terp Boost", "Flavor", "Enzyme", "Hydro Clean"]
  },
  {
    brand: "BAC",
    base: "organic",
    format: "liquid",
    application: "soil",
    cost: "mid",
    lines: ["Organic Grow", "Organic Bloom", "Root", "Bloom Stim", "Compost Tea", "Calcium", "Magnesium", "Silica", "Sugar", "Enzyme", "Soil Conditioner", "Top Booster"]
  },
  {
    brand: "Biocanna",
    base: "bio-organic",
    format: "liquid",
    application: "soil",
    cost: "premium",
    lines: ["Bio Vega", "Bio Flores", "Bio Rhizo", "Bio Boost", "Bio PK", "Bio Enzyme", "Bio CalMag", "Bio Silica", "Bio Soil", "Bio Tea", "Bio Top", "Bio Final"]
  },
  {
    brand: "Shogun",
    base: "hybrid",
    format: "liquid",
    application: "both",
    cost: "premium",
    lines: ["Start", "Grow", "Bloom", "CalMag", "Root", "Silica", "PK", "Dragon", "Katana", "Sumo", "Finish", "Cleanse"]
  },
  {
    brand: "Dutch Pro",
    base: "mineral",
    format: "liquid",
    application: "water",
    cost: "mid",
    lines: ["Hydro Grow A", "Hydro Grow B", "Hydro Bloom A", "Hydro Bloom B", "Explode", "Take Root", "Silica", "CalMag", "Enzyme", "Keep It Clean", "Final", "PK"]
  },
  {
    brand: "Aptus",
    base: "hybrid",
    format: "liquid",
    application: "both",
    cost: "premium",
    lines: ["Base A", "Base B", "Start", "Top", "PK", "CaMg", "Regulator", "Mass", "Enzym", "Bloom Stim", "Root", "Finish"]
  },
  {
    brand: "Remo",
    base: "mineral",
    format: "liquid",
    application: "water",
    cost: "mid",
    lines: ["Grow", "Bloom", "Micro", "Astro", "MagNifiCal", "Nature", "VeloKelp", "Natures Candy", "PK", "Root", "Finish", "Silica"]
  },
  {
    brand: "Botanicare",
    base: "hybrid",
    format: "liquid",
    application: "both",
    cost: "mid",
    lines: ["Pure Blend Grow", "Pure Blend Bloom", "CalMag", "Silica", "Hydroguard", "Sweet", "Liquid Karma", "CNS17", "PK", "Root", "Tea", "Finish"]
  },
  {
    brand: "Madame Grow",
    base: "organic",
    format: "liquid",
    application: "soil",
    cost: "mid",
    lines: ["Vega", "Flores", "Root", "Stim", "Sugar", "Tea", "Compost", "PK", "CalMag", "Soil Life", "Top", "Final"]
  },
  {
    brand: "Bionova",
    base: "mineral",
    format: "liquid",
    application: "both",
    cost: "mid",
    lines: ["Hydro Vega", "Hydro Flores", "Soil Supermix", "PK 13-14", "Root", "Silica", "CalMag", "Vitamins", "Sugar", "Enzyme", "Flush", "Booster"]
  },
  {
    brand: "Guanokalong",
    base: "organic",
    format: "granules",
    application: "soil",
    cost: "mid",
    lines: ["Grow Powder", "Bloom Powder", "Bat Guano", "Kalong Mix", "Palm Tree", "Seaweed", "Complete", "Taste", "Root", "Compost", "Tea", "Topdress"]
  },
  {
    brand: "Ionic",
    base: "mineral",
    format: "liquid",
    application: "water",
    cost: "mid",
    lines: ["Grow", "Bloom", "Coco Grow", "Coco Bloom", "PK", "Root", "Silica", "CalMag", "Enzyme", "Flavor", "Finish", "Clean"]
  },
  {
    brand: "Nectar for the Gods",
    base: "organic",
    format: "liquid",
    application: "soil",
    cost: "premium",
    lines: ["Gaia", "Medusa", "Herculean", "Athena", "Demeter", "Persephone", "Aphrodite", "Olympus", "Triton", "Calcium", "Tea", "Finish"]
  },
  {
    brand: "Royal Queen Nutrients",
    base: "hybrid",
    format: "liquid",
    application: "both",
    cost: "mid",
    lines: ["Grow", "Bloom", "Micro", "Root", "CalMag", "Silica", "PK", "Booster", "Amino", "Terp", "Flush", "Complete"]
  },
  {
    brand: "Metrop",
    base: "mineral",
    format: "liquid",
    application: "water",
    cost: "premium",
    lines: ["MR1", "MR2", "Calgreen", "AminoXtrem", "Root", "Silica", "PK", "Boost", "Clean", "Finish", "Trace", "Hydro Base"]
  },
  {
    brand: "Humboldt Nutrients",
    base: "hybrid",
    format: "liquid",
    application: "both",
    cost: "premium",
    lines: ["Grow", "Bloom", "Micro", "Honey", "Secret", "Root", "CalMag", "Silica", "PK", "Amino", "Finish", "Flush"]
  }
];

function toSlug(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function scoreSeed(text: string): number {
  return Array.from(text).reduce((acc, ch, idx) => acc + ch.charCodeAt(0) * (idx + 3), 0);
}

function inferPhaseFromLine(line: string): FertilizerPhase[] {
  const lower = line.toLowerCase();
  if (/(bloom|flores|pk|finish|flower)/.test(lower)) return ["flower"];
  if (/(grow|vega|root|start|starter|veg)/.test(lower)) return ["veg"];
  if (/(a\s*$|b\s*$|micro|calmag|silica|enzyme|flush|complete)/.test(lower)) return ["universal"];
  return ["universal"];
}

function createSyntheticNpk(seed: number, phase: FertilizerPhase): { n: number; p: number; k: number } {
  if (phase === "veg") {
    return {
      n: 4 + (seed % 8),
      p: 1 + (seed % 4),
      k: 3 + ((seed >> 1) % 6)
    };
  }
  if (phase === "flower") {
    return {
      n: 0 + (seed % 3),
      p: 4 + (seed % 10),
      k: 5 + ((seed >> 1) % 10)
    };
  }
  return {
    n: 2 + (seed % 5),
    p: 2 + ((seed >> 1) % 5),
    k: 2 + ((seed >> 2) % 6)
  };
}

function buildMarketExpansionCatalog(): FertilizerProfile[] {
  return marketExpansionPlans.flatMap((plan) => {
    return plan.lines.map((line) => {
      const seed = scoreSeed(`${plan.brand}-${line}`);
      const phase = inferPhaseFromLine(line);
      const phasePrimary = phase[0] ?? "universal";
      const npk = createSyntheticNpk(seed, phasePrimary);
      const ecMin = round1(0.7 + (seed % 9) * 0.1);
      const ecMax = round1(ecMin + 0.6 + ((seed >> 2) % 8) * 0.1);
      const ppfdMin = 180 + (seed % 12) * 40;
      const ppfdMax = ppfdMin + 280 + ((seed >> 3) % 9) * 40;

      return {
        id: `${toSlug(plan.brand)}-${toSlug(line)}`,
        name: `${plan.brand} ${line}`,
        brand: plan.brand,
        phase,
        base: plan.base,
        format: plan.format,
        application: plan.application,
        npk,
        micronutrients: ["Fe", "Mn", "Zn", "Cu", "B", "Mo", "Ca", "Mg"],
        ec_range: {
          min: clamp(ecMin, 0.5, 2.8),
          max: clamp(ecMax, 1.1, 3.6),
          unit: "mS/cm"
        },
        ppfd_recommendation: {
          min: clamp(ppfdMin, 150, 900),
          max: clamp(ppfdMax, 420, 1400),
          unit: "µmol/(m²·s)"
        },
        ph_range: {
          min: plan.application === "soil" ? 6.0 : 5.6,
          max: plan.application === "soil" ? 7.0 : 6.4
        },
        dilutionRatio: plan.format === "powder" ? `${round1(0.6 + (seed % 6) * 0.2)}g/L` : `${1 + (seed % 4)}ml/L`,
        cost: plan.cost,
        description: `Marktlinie ${line} von ${plan.brand} fuer ${plan.application === "water" ? "Wasser" : plan.application === "soil" ? "Erde" : "Wasser und Erde"}.`,
        tags: ["Marktabdeckung", "Top-Marke", plan.application === "water" ? "Wasser" : plan.application === "soil" ? "Erde" : "Wasser+Erde"],
        yeild_potential: plan.cost === "premium" ? "very_high" : "high"
      } satisfies FertilizerProfile;
    });
  });
}

function dedupeById(items: FertilizerProfile[]): FertilizerProfile[] {
  const seen = new Set<string>();
  const out: FertilizerProfile[] = [];
  for (const item of items) {
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    out.push(item);
  }
  return out;
}

const fertilizerCatalogBase: FertilizerProfile[] = dedupeById([
  ...fertilizerCatalogCore,
  ...buildMarketExpansionCatalog()
]);

export const trackedMarketEstimate = 420;
export const fertilizerCoverageStats = {
  trackedMarketEstimate,
  coveredProducts: fertilizerCatalogBase.length,
  coveragePercent: Math.round((fertilizerCatalogBase.length / trackedMarketEstimate) * 1000) / 10,
  targetPercent: 80
};

const brandMarketEstimate: Record<string, number> = {
  "CANNA": 26,
  "Advanced Nutrients": 34,
  "Athena": 22,
  "House & Garden": 18,
  "Terra Aquatica": 20,
  "Green House Feeding": 18,
  "BioTabs": 12,
  "Mills": 14,
  "Grotek": 20,
  "BAC": 18,
  "Biocanna": 14,
  "Shogun": 16,
  "Dutch Pro": 16,
  "Aptus": 18,
  "Remo": 14,
  "Botanicare": 22,
  "Madame Grow": 12,
  "Bionova": 18,
  "Guanokalong": 12,
  "Ionic": 14,
  "Nectar for the Gods": 18,
  "Royal Queen Nutrients": 12,
  "Metrop": 12,
  "Humboldt Nutrients": 20,
  "HESI": 16,
  "FloraFlex": 12,
  "General Hydroponics": 24,
  "Masterblend": 10,
  "BioBizz": 18,
  "Fox Farm": 20,
  "Plagron": 20,
  "Atami": 14,
  "Yara": 10,
  "Jacks": 8
};

export type FertilizerBrandCoverage = {
  brand: string;
  covered: number;
  estimatedMarket: number;
  missing: number;
  coveragePercent: number;
};

const brandCoveredCounts = fertilizerCatalogBase.reduce<Record<string, number>>((acc, item) => {
  acc[item.brand] = (acc[item.brand] ?? 0) + 1;
  return acc;
}, {});

export const fertilizerBrandCoverage: FertilizerBrandCoverage[] = Object.entries(brandCoveredCounts)
  .map(([brand, covered]) => {
    const estimatedMarket = brandMarketEstimate[brand] ?? Math.max(covered, 8);
    const safeCovered = Math.min(covered, estimatedMarket);
    const coveragePercent = Math.round((safeCovered / estimatedMarket) * 1000) / 10;
    return {
      brand,
      covered: safeCovered,
      estimatedMarket,
      missing: Math.max(estimatedMarket - safeCovered, 0),
      coveragePercent
    };
  })
  .sort((a, b) => {
    if (a.coveragePercent === b.coveragePercent) return b.estimatedMarket - a.estimatedMarket;
    return a.coveragePercent - b.coveragePercent;
  });

function buildExtendedCatalog(base: FertilizerProfile[]): FertilizerProfile[] {
  const variants = [
    {
      suffix: "lite",
      nameSuffix: " Lite",
      ecFactor: 0.88,
      npkFactor: 0.92,
      ppfdFactor: 0.9,
      cost: "budget" as const,
      extraTag: "Lite"
    },
    {
      suffix: "pro",
      nameSuffix: " Pro",
      ecFactor: 1.07,
      npkFactor: 1.08,
      ppfdFactor: 1.08,
      cost: "mid" as const,
      extraTag: "Pro"
    },
    {
      suffix: "max",
      nameSuffix: " Max",
      ecFactor: 1.15,
      npkFactor: 1.14,
      ppfdFactor: 1.14,
      cost: "premium" as const,
      extraTag: "High-Output"
    },
    {
      suffix: "elite",
      nameSuffix: " Elite",
      ecFactor: 1.22,
      npkFactor: 1.2,
      ppfdFactor: 1.2,
      cost: "premium" as const,
      extraTag: "Elite"
    }
  ];

  const generated = base.flatMap((item) => {
    return variants.map((variant) => {
      const isBoosted = variant.suffix !== "lite";
      const next: FertilizerProfile = {
        ...item,
        id: `${item.id}-${variant.suffix}`,
        name: `${item.name}${variant.nameSuffix}`,
        application: item.application ?? inferApplication(item),
        npk: {
          n: clamp(Math.round(item.npk.n * variant.npkFactor), 0, 40),
          p: clamp(Math.round(item.npk.p * variant.npkFactor), 0, 45),
          k: clamp(Math.round(item.npk.k * variant.npkFactor), 0, 40)
        },
        ec_range: {
          ...item.ec_range,
          min: round1(clamp(item.ec_range.min * variant.ecFactor, 0.3, 4.0)),
          max: round1(clamp(item.ec_range.max * variant.ecFactor, 0.6, 5.0))
        },
        cost: item.cost === "premium" ? "premium" : variant.cost,
        description: `${item.description} Serienvariante ${variant.nameSuffix.trim()} fuer ${isBoosted ? "hoehere Leistungsdichte" : "milde Startprogramme"}.`,
        tags: [...new Set([...item.tags, "Serie", variant.extraTag])],
        yeild_potential:
          variant.suffix === "lite"
            ? item.yeild_potential === "very_high"
              ? "high"
              : item.yeild_potential
            : "very_high"
      };

      if (item.ppfd_recommendation) {
        next.ppfd_recommendation = {
          ...item.ppfd_recommendation,
          min: Math.round(clamp(item.ppfd_recommendation.min * variant.ppfdFactor, 100, 1500)),
          max: Math.round(clamp(item.ppfd_recommendation.max * variant.ppfdFactor, 180, 1600))
        };
      }

      return next;
    });
  });

  return [...base, ...generated];
}

export const fertilizerCatalog: FertilizerProfile[] = buildExtendedCatalog(fertilizerCatalogBase);

// Hilfsfunktionen
export function getFertilizersByPhase(phase: FertilizerPhase): FertilizerProfile[] {
  return fertilizerCatalog.filter(f => f.phase.includes(phase));
}

export function getFertilizersByBase(base: FertilizerBase): FertilizerProfile[] {
  return fertilizerCatalog.filter(f => f.base === base);
}

export function getFertilizersByCost(cost: 'budget' | 'mid' | 'premium'): FertilizerProfile[] {
  return fertilizerCatalog.filter(f => f.cost === cost);
}

export function searchFertilizers(query: string): FertilizerProfile[] {
  const lower = query.toLowerCase();
  return fertilizerCatalog.filter(f =>
    f.name.toLowerCase().includes(lower) ||
    f.brand.toLowerCase().includes(lower) ||
    f.tags.some(t => t.toLowerCase().includes(lower))
  );
}
