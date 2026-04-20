import type { ToolMeta } from "./types";

export const toolRegistry: ToolMeta[] = [
  {
    slug: "abluft-rechner",
    title: "Abluft-Rechner",
    shortDescription: "Luftumwälzung und Lüftergröße berechnen",
    category: "klima",
    icon: "🌡️",
    difficulty: "einsteiger",
    relatedArticleSlugs: ["indoor-outdoor-anbau-vergleich"],
    relatedToolSlugs: ["licht-rechner", "naehrstoff-rechner"],
    coverageKey: "klima",
  },
  {
    slug: "licht-rechner",
    title: "Licht-Rechner",
    shortDescription: "PPFD, DLI und Lichtintensität berechnen",
    category: "licht",
    icon: "💡",
    difficulty: "einsteiger",
    relatedArticleSlugs: ["indoor-outdoor-anbau-vergleich"],
    relatedToolSlugs: ["abluft-rechner", "naehrstoff-rechner"],
    coverageKey: "licht",
  },
  {
    slug: "naehrstoff-rechner",
    title: "Nährstoff-Rechner",
    shortDescription: "EC-Ziel und Dosierung für dein Substrat berechnen",
    category: "naehrstoffe",
    icon: "🧪",
    difficulty: "fortgeschritten",
    relatedArticleSlugs: [
      "naehrstoffbedarf-cannabis-lebenszyklus",
      "naehrstoffblockaden-und-antagonismen",
    ],
    relatedToolSlugs: ["licht-rechner", "ertrags-schaetzer"],
    coverageKey: "naehrstoffe",
  },
  {
    slug: "ertrags-schaetzer",
    title: "Ertrags-Schätzer",
    shortDescription: "Ertragsprognose basierend auf Setup und Erfahrung",
    category: "planung",
    icon: "📐",
    difficulty: "einsteiger",
    relatedArticleSlugs: [
      "indoor-outdoor-anbau-vergleich",
      "feminisiert-vs-regular-vs-autoflower",
    ],
    relatedToolSlugs: ["licht-rechner", "naehrstoff-rechner"],
    coverageKey: "ertrag",
  },
  {
    slug: "vpd",
    title: "VPD-Rechner",
    shortDescription: "Optimalen VPD-Wert für jede Wachstumsphase berechnen",
    category: "klima",
    icon: "💨",
    difficulty: "fortgeschritten",
    relatedArticleSlugs: [],
    relatedToolSlugs: ["abluft-rechner", "licht-rechner"],
    coverageKey: "klima",
  },
];

export function getToolBySlug(slug: string): ToolMeta | undefined {
  return toolRegistry.find((t) => t.slug === slug);
}

export function getToolsByCategory(category: string): ToolMeta[] {
  return toolRegistry.filter((t) => t.category === category);
}
