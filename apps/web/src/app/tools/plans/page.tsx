"use client";

import Link from "next/link";
import type { Route } from "next";
import { useMemo, useState } from "react";
import { fertilizerCatalog, type FertilizerProfile } from "@/data/terpira/fertilizers";

type PlanCategory = "starter" | "stabilitaet" | "budget" | "qualitaet" | "leistung";
type PlanSetup = "soil" | "hydro" | "hybrid";
type PlanLevel = "einsteiger" | "fortgeschritten" | "profi";
type PlanGoal = "stabil" | "einfach" | "ertrag" | "qualitaet";

type PlanStage = {
  label: string;
  targetEc: string;
  notes: string;
  productIds: string[];
};

type FertilizerPlan = {
  id: string;
  title: string;
  subtitle: string;
  setup: PlanSetup;
  level: PlanLevel;
  goal: PlanGoal;
  cultivation: string;
  budget: "budget" | "mid" | "premium";
  phRange: string;
  durationWeeks: number;
  categories: PlanCategory[];
  waterHint: string;
  stages: PlanStage[];
};

const plans: FertilizerPlan[] = [
  {
    id: "soil-balanced",
    title: "Düngerplan Erde Ausgewogen",
    subtitle: "Solider Plan für Einsteiger und vielseitige Durchläufe mit Fokus auf Fehlertoleranz.",
    setup: "soil",
    level: "einsteiger",
    goal: "stabil",
    cultivation: "Erde / Bio-orientiert",
    budget: "mid",
    phRange: "6.1 - 6.5",
    durationWeeks: 8,
    categories: ["starter", "stabilitaet"],
    waterHint: "Leitungswasser mittel/hart: CalMag reduzieren",
    stages: [
      {
        label: "Woche 1-2 (Veg Start)",
        targetEc: "0.8 - 1.1",
        notes: "Niedrig starten, auf Blattbild reagieren und nur langsam erhöhen.",
        productIds: ["biobizz-grow", "calmag-supplement"]
      },
      {
        label: "Woche 3-4 (Vegetationsaufbau)",
        targetEc: "1.1 - 1.4",
        notes: "Wachstum stabilisieren, CalMag nur bei weichem Wasser konstant geben.",
        productIds: ["canna-terra-vega", "calmag-supplement"]
      },
      {
        label: "Woche 5-8 (Blüte Basis)",
        targetEc: "1.4 - 1.8",
        notes: "Auf gleichmäßige Drain-Werte achten und Stickstoff schrittweise reduzieren.",
        productIds: ["canna-terra-flores", "biobizz-bloom"]
      }
    ]
  },
  {
    id: "hydro-performance",
    title: "Düngerplan Hydro Leistung",
    subtitle: "Für aktive Wasser-Systeme mit höherer Lichtleistung und enger Steuerung.",
    setup: "hydro",
    level: "profi",
    goal: "ertrag",
    cultivation: "Hydro / Coco",
    budget: "premium",
    phRange: "5.6 - 6.1",
    durationWeeks: 8,
    categories: ["leistung"],
    waterHint: "Bei RO-Wasser konstant CalMag fahren",
    stages: [
      {
        label: "Woche 1-2 (Wurzelaufbau)",
        targetEc: "1.0 - 1.4",
        notes: "Nährlösung sauber halten, Reservoir stabil fahren und täglich prüfen.",
        productIds: ["house-garden-coco-a", "house-garden-coco-b", "calmag-supplement"]
      },
      {
        label: "Woche 3-4 (Vegetative Leistung)",
        targetEc: "1.4 - 1.8",
        notes: "Nur erhöhen, wenn kein Blattstress sichtbar ist.",
        productIds: ["athena-pro-grow", "house-garden-coco-a"]
      },
      {
        label: "Woche 5-8 (Blüteertrag)",
        targetEc: "1.8 - 2.2",
        notes: "PK-Last langsam erhöhen, pH-Drift täglich protokollieren.",
        productIds: ["athena-pro-bloom", "pk-booster-formula"]
      }
    ]
  },
  {
    id: "budget-smart",
    title: "Düngerplan Budget Klar",
    subtitle: "Kosteneffizient mit solider Ertragsbasis und wenigen Produkten.",
    setup: "hybrid",
    level: "einsteiger",
    goal: "einfach",
    cultivation: "Erde + Wasser (hybrid)",
    budget: "budget",
    phRange: "Erde 6.2 / Hydro 5.8",
    durationWeeks: 8,
    categories: ["starter", "budget"],
    waterHint: "Für hartes Wasser Ziel-EC um 0.1 niedriger setzen",
    stages: [
      {
        label: "Woche 1-3 (Einfacher Start)",
        targetEc: "0.9 - 1.3",
        notes: "Mit einem Kernprodukt beginnen und Reaktionen beobachten.",
        productIds: ["maxibloom-powder", "greenhouse-powder-feeding-grow"]
      },
      {
        label: "Woche 4-6 (Übergang)",
        targetEc: "1.2 - 1.6",
        notes: "Von Veg auf Blüte gleitend umstellen, kein harter Wechsel.",
        productIds: ["greenhouse-powder-feeding-short-flowering", "maxibloom-powder"]
      },
      {
        label: "Woche 7-8 (Endphase)",
        targetEc: "1.4 - 1.8",
        notes: "Nur pushen, wenn Pflanzen gesund und stabil sind.",
        productIds: ["greenhouse-powder-feeding-short-flowering", "pk-booster-formula"]
      }
    ]
  },
  {
    id: "organic-quality",
    title: "Düngerplan Organische Qualität",
    subtitle: "Mit Fokus auf Aroma, sauberes Blattbild und eine ruhige Blüteführung.",
    setup: "soil",
    level: "fortgeschritten",
    goal: "qualitaet",
    cultivation: "Erde / organisch",
    budget: "mid",
    phRange: "6.2 - 6.6",
    durationWeeks: 9,
    categories: ["qualitaet"],
    waterHint: "Bei sehr weichem Wasser kleine CalMag-Zugabe in Veg",
    stages: [
      {
        label: "Woche 1-3 (Vegetation nach dem Anwurzeln)",
        targetEc: "0.7 - 1.1",
        notes: "Mild fahren, um Mikrobenaktivität in Erde stabil zu halten.",
        productIds: ["biobizz-grow", "canna-terra-vega"]
      },
      {
        label: "Woche 4-6 (Übergang)",
        targetEc: "1.1 - 1.5",
        notes: "Übergang auf Blüte ohne harte Sprünge in der Nährstoffdichte.",
        productIds: ["biobizz-bloom", "canna-terra-flores"]
      },
      {
        label: "Woche 7-9 (Aroma-Phase)",
        targetEc: "1.3 - 1.7",
        notes: "PK nur moderat einsetzen, Fokus auf Konstanz und Blattgesundheit.",
        productIds: ["biobizz-bloom", "pk-booster-formula"]
      }
    ]
  },
  {
    id: "coco-control",
    title: "Düngerplan Coco Control",
    subtitle: "Kontrolliertes Coco-Protokoll mit klaren A/B-Phasen.",
    setup: "hydro",
    level: "fortgeschritten",
    goal: "stabil",
    cultivation: "Coco / Ablaufbewässerung",
    budget: "premium",
    phRange: "5.7 - 6.1",
    durationWeeks: 8,
    categories: ["stabilitaet", "leistung"],
    waterHint: "Ablaufmenge bei 10-20 % halten, Salzaufbau aktiv vermeiden",
    stages: [
      {
        label: "Woche 1-2 (Coco Start)",
        targetEc: "0.9 - 1.3",
        notes: "Früh gleichmäßige A/B-Balance aufbauen.",
        productIds: ["house-garden-coco-a", "house-garden-coco-b"]
      },
      {
        label: "Woche 3-5 (Vegetationsaufbau)",
        targetEc: "1.3 - 1.8",
        notes: "Vegetative Leistung hochfahren, pH-Schwankung eng halten.",
        productIds: ["athena-pro-grow", "house-garden-coco-a"]
      },
      {
        label: "Woche 6-8 (Blüteaufbau)",
        targetEc: "1.7 - 2.2",
        notes: "PK moderat staffeln und tägliche Kontrolle beibehalten.",
        productIds: ["athena-pro-bloom", "pk-booster-formula"]
      }
    ]
  },
  {
    id: "minimal-products",
    title: "Düngerplan Wenige Produkte",
    subtitle: "Möglichst einfache Routine mit nur wenigen Produkten.",
    setup: "hybrid",
    level: "einsteiger",
    goal: "einfach",
    cultivation: "Erde + Hydro Basics",
    budget: "budget",
    phRange: "Erde 6.2 / Hydro 5.8",
    durationWeeks: 7,
    categories: ["starter", "budget"],
    waterHint: "Bei Defiziten nur CalMag ergänzen, sonst minimal halten",
    stages: [
      {
        label: "Woche 1-3 (Basisversorgung)",
        targetEc: "0.8 - 1.2",
        notes: "Ein Kernprodukt als Basis, keine unnötigen Additive.",
        productIds: ["maxibloom-powder", "calmag-supplement"]
      },
      {
        label: "Woche 4-5 (Mittlere Blüte)",
        targetEc: "1.1 - 1.5",
        notes: "Schrittweise Erhöhung nur bei gesundem Blattbild.",
        productIds: ["greenhouse-powder-feeding-short-flowering", "maxibloom-powder"]
      },
      {
        label: "Woche 6-7 (Endphase)",
        targetEc: "1.2 - 1.6",
        notes: "Stabil halten statt aggressiv pushen.",
        productIds: ["greenhouse-powder-feeding-short-flowering", "calmag-supplement"]
      }
    ]
  }
];

const budgetBadge: Record<FertilizerPlan["budget"], string> = {
  budget: "border-emerald-200 bg-emerald-50 text-emerald-700",
  mid: "border-amber-200 bg-amber-50 text-amber-700",
  premium: "border-rose-200 bg-rose-50 text-rose-700"
};

const budgetLabel: Record<FertilizerPlan["budget"], string> = {
  budget: "Budget",
  mid: "Mittel",
  premium: "Premium"
};

const setupLabel: Record<PlanSetup, string> = {
  soil: "Erde",
  hydro: "Hydro/Coco",
  hybrid: "Hybrid"
};

const levelLabel: Record<PlanLevel, string> = {
  einsteiger: "Einsteiger",
  fortgeschritten: "Fortgeschritten",
  profi: "Profi"
};

const goalLabel: Record<PlanGoal, string> = {
  stabil: "Stabilität",
  einfach: "Einfachheit",
  ertrag: "Ertrag",
  qualitaet: "Qualität"
};

const categoryLabel: Record<PlanCategory, string> = {
  starter: "Starter",
  stabilitaet: "Stabilität",
  budget: "Budget",
  qualitaet: "Qualität",
  leistung: "Leistung"
};

function byId(id: string): FertilizerProfile | undefined {
  return fertilizerCatalog.find((item) => item.id === id);
}

export default function FertilizerPlansPage() {
  const [query, setQuery] = useState("");
  const [activeSetup, setActiveSetup] = useState<PlanSetup | "all">("all");
  const [activeBudget, setActiveBudget] = useState<FertilizerPlan["budget"] | "all">("all");
  const [activeLevel, setActiveLevel] = useState<PlanLevel | "all">("all");
  const [activeGoal, setActiveGoal] = useState<PlanGoal | "all">("all");
  const [activeCategory, setActiveCategory] = useState<PlanCategory | "all">("all");
  const [sortBy, setSortBy] = useState<"recommended" | "durationAsc" | "durationDesc">("recommended");

  const uniqueProductCount = new Set(plans.flatMap((p) => p.stages.flatMap((s) => s.productIds))).size;

  const categoryCounts = useMemo(() => {
    const map: Record<PlanCategory, number> = {
      starter: 0,
      stabilitaet: 0,
      budget: 0,
      qualitaet: 0,
      leistung: 0
    };
    for (const plan of plans) {
      for (const category of plan.categories) {
        map[category] += 1;
      }
    }
    return map;
  }, []);

  const filteredPlans = useMemo(() => {
    const q = query.trim().toLowerCase();
    const pool = plans.filter((plan) => {
      if (activeSetup !== "all" && plan.setup !== activeSetup) return false;
      if (activeBudget !== "all" && plan.budget !== activeBudget) return false;
      if (activeLevel !== "all" && plan.level !== activeLevel) return false;
      if (activeGoal !== "all" && plan.goal !== activeGoal) return false;
      if (activeCategory !== "all" && !plan.categories.includes(activeCategory)) return false;
      if (!q) return true;
      const hay = `${plan.title} ${plan.subtitle} ${plan.cultivation} ${plan.waterHint}`.toLowerCase();
      return hay.includes(q);
    });

    return [...pool].sort((a, b) => {
      if (sortBy === "durationAsc") return a.durationWeeks - b.durationWeeks;
      if (sortBy === "durationDesc") return b.durationWeeks - a.durationWeeks;
      const levelRank: Record<PlanLevel, number> = { einsteiger: 0, fortgeschritten: 1, profi: 2 };
      const goalRank: Record<PlanGoal, number> = { einfach: 0, stabil: 1, qualitaet: 2, ertrag: 3 };
      const scoreA = levelRank[a.level] + goalRank[a.goal];
      const scoreB = levelRank[b.level] + goalRank[b.goal];
      return scoreA - scoreB;
    });
  }, [query, activeSetup, activeBudget, activeLevel, activeGoal, activeCategory, sortBy]);

  const hasFilters =
    query.trim().length > 0 ||
    activeSetup !== "all" ||
    activeBudget !== "all" ||
    activeLevel !== "all" ||
    activeGoal !== "all" ||
    activeCategory !== "all";

  const resetFilters = () => {
    setQuery("");
    setActiveSetup("all");
    setActiveBudget("all");
    setActiveLevel("all");
    setActiveGoal("all");
    setActiveCategory("all");
    setSortBy("recommended");
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <Link href={"/tools" as Route} className="inline-flex items-center gap-2 text-sm font-medium text-emerald-700 hover:text-emerald-800">
            ← Zurück zu Werkzeuge
          </Link>
          <h1 className="mt-3 text-4xl font-bold text-slate-900">Düngerpläne</h1>
          <p className="mt-2 max-w-3xl text-slate-600">
            Vorgefertigte Düngepläne auf Basis der Produkte im SecretLeaf-Katalog. Alle Pläne sind als belastbare
            Startpunkte gedacht und sollten anhand von Pflanzenzustand, Wasserwerten und Lichtintensität angepasst werden.
          </p>
        </div>

        <section className="mb-8 grid gap-4 md:grid-cols-3">
          <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Planbibliothek</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{plans.length}</p>
            <p className="text-sm text-slate-500">kuratierte Düngepläne</p>
          </article>
          <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Produkte referenziert</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{uniqueProductCount}</p>
            <p className="text-sm text-slate-500">aus dem Katalog</p>
          </article>
          <article className="rounded-xl border border-cyan-200 bg-cyan-50 p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-cyan-700">Hinweis</p>
            <p className="mt-1 text-sm font-medium text-cyan-900">
              Werte sind Startkorridore, keine starre Rezeptur. Immer in kleinen Schritten anpassen.
            </p>
          </article>
        </section>

        <section className="mb-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid gap-3 lg:grid-cols-[1.2fr_repeat(5,minmax(0,1fr))_220px_auto]">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Plan suchen, z. B. Hydro, Budget oder Qualität..."
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <select value={activeSetup} onChange={(e) => setActiveSetup(e.target.value as PlanSetup | "all")} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
              <option value="all">Alle Setups</option>
              <option value="soil">Erde</option>
              <option value="hydro">Hydro/Coco</option>
              <option value="hybrid">Hybrid</option>
            </select>
            <select value={activeBudget} onChange={(e) => setActiveBudget(e.target.value as FertilizerPlan["budget"] | "all")} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
              <option value="all">Alle Budgets</option>
              <option value="budget">Budget</option>
              <option value="mid">Mittel</option>
              <option value="premium">Premium</option>
            </select>
            <select value={activeLevel} onChange={(e) => setActiveLevel(e.target.value as PlanLevel | "all")} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
              <option value="all">Alle Stufen</option>
              <option value="einsteiger">Einsteiger</option>
              <option value="fortgeschritten">Fortgeschritten</option>
              <option value="profi">Profi</option>
            </select>
            <select value={activeGoal} onChange={(e) => setActiveGoal(e.target.value as PlanGoal | "all")} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
              <option value="all">Alle Ziele</option>
              <option value="stabil">Stabilität</option>
              <option value="einfach">Einfachheit</option>
              <option value="ertrag">Ertrag</option>
              <option value="qualitaet">Qualität</option>
            </select>
            <select value={activeCategory} onChange={(e) => setActiveCategory(e.target.value as PlanCategory | "all")} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
              <option value="all">Alle Kategorien</option>
              <option value="starter">Starter</option>
              <option value="stabilitaet">Stabilität</option>
              <option value="budget">Budget</option>
              <option value="qualitaet">Qualität</option>
              <option value="leistung">Leistung</option>
            </select>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as "recommended" | "durationAsc" | "durationDesc")} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
              <option value="recommended">Sortierung: Empfohlen</option>
              <option value="durationAsc">Sortierung: Kurze Laufzeit</option>
              <option value="durationDesc">Sortierung: Lange Laufzeit</option>
            </select>
            {hasFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 hover:border-rose-300 hover:text-rose-700"
              >
                Zurücksetzen
              </button>
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {Object.entries(categoryCounts).map(([key, count]) => (
              <button
                key={`chip-${key}`}
                type="button"
                onClick={() => setActiveCategory((prev) => (prev === key ? "all" : (key as PlanCategory)))}
                className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                  activeCategory === key
                    ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                    : "border-slate-200 bg-white text-slate-700 hover:border-emerald-200"
                }`}
              >
                {categoryLabel[key as PlanCategory]} ({count})
              </button>
            ))}
          </div>
        </section>

        <section className="mb-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Schnellnavigation</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {filteredPlans.map((plan) => (
              <a
                key={`jump-${plan.id}`}
                href={`#${plan.id}`}
                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800"
              >
                {plan.title}
              </a>
            ))}
          </div>
        </section>

        <section className="mb-8 rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-lg font-bold text-slate-900">Vergleich auf einen Blick</h2>
            <p className="text-sm text-slate-500">Welcher Plan passt zu Setup, Budget und Steuerungsgrad.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3 text-left">Plan</th>
                  <th className="px-4 py-3 text-left">Setup</th>
                  <th className="px-4 py-3 text-left">Budget</th>
                  <th className="px-4 py-3 text-left">pH-Ziel</th>
                  <th className="px-4 py-3 text-left">Stufen</th>
                </tr>
              </thead>
              <tbody>
                {filteredPlans.map((plan) => (
                  <tr key={`row-${plan.id}`} className="border-t border-slate-100">
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      <a href={`#${plan.id}`} className="hover:text-emerald-700 hover:underline">
                        {plan.title}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{plan.cultivation}</td>
                    <td className="px-4 py-3 text-slate-700">{levelLabel[plan.level]}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${budgetBadge[plan.budget]}`}>
                        {budgetLabel[plan.budget]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{plan.phRange}</td>
                    <td className="px-4 py-3 text-slate-700">{plan.stages.length} Stufen / {plan.durationWeeks} Wochen</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-6">
          {filteredPlans.map((plan) => (
            <article id={plan.id} key={plan.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm scroll-mt-24">
              <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
                <aside className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <h2 className="text-xl font-bold text-slate-900">{plan.title}</h2>
                  <p className="mt-2 text-sm text-slate-600">{plan.subtitle}</p>
                  <div className="mt-4 space-y-2 text-xs">
                    <p className="rounded-lg border border-slate-200 bg-white px-3 py-2 font-semibold text-slate-700">
                      Setup: {plan.cultivation}
                    </p>
                    <p className="rounded-lg border border-slate-200 bg-white px-3 py-2 font-semibold text-slate-700">
                      pH: {plan.phRange}
                    </p>
                    <p className={`rounded-lg border px-3 py-2 font-semibold ${budgetBadge[plan.budget]}`}>
                      Budget: {budgetLabel[plan.budget]}
                    </p>
                    <p className="rounded-lg border border-slate-200 bg-white px-3 py-2 font-semibold text-slate-700">
                      Level: {levelLabel[plan.level]}
                    </p>
                    <p className="rounded-lg border border-slate-200 bg-white px-3 py-2 font-semibold text-slate-700">
                      Ziel: {goalLabel[plan.goal]}
                    </p>
                    <p className="rounded-lg border border-slate-200 bg-white px-3 py-2 font-semibold text-slate-700">
                      Laufzeit: {plan.durationWeeks} Wochen
                    </p>
                  </div>
                  <p className="mt-3 rounded-lg border border-cyan-200 bg-cyan-50 px-3 py-2 text-xs font-medium text-cyan-800">
                    Wasserhinweis: {plan.waterHint}
                  </p>
                </aside>

                <div className="space-y-4">
                  {plan.stages.map((stage, stageIndex) => (
                    <section key={stage.label} className="rounded-xl border border-slate-200 bg-white p-4">
                      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                            {stageIndex + 1}
                          </span>
                          <p className="text-sm font-bold text-slate-900">{stage.label}</p>
                        </div>
                        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                          Ziel-EC {stage.targetEc}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">{stage.notes}</p>

                      <div className="mt-3 grid gap-2 sm:grid-cols-2">
                        {stage.productIds.map((id) => {
                          const product = byId(id);
                          if (!product) return null;
                          return (
                            <Link
                              key={`${stage.label}-${id}`}
                              href={`/database/fertilizers?q=${encodeURIComponent(product.name)}` as Route}
                              className="block rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 hover:border-emerald-300 hover:bg-emerald-50"
                            >
                              <p className="text-sm font-semibold text-slate-800">{product.name}</p>
                              <p className="text-xs text-slate-500">{product.brand} · NPK {product.npk.n}-{product.npk.p}-{product.npk.k}</p>
                            </Link>
                          );
                        })}
                      </div>
                    </section>
                  ))}
                </div>
              </div>
            </article>
          ))}

          {filteredPlans.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
              <p className="text-lg font-semibold text-slate-700">Kein Plan passt zu den aktuellen Filtern.</p>
              <p className="mt-1 text-sm text-slate-500">Filter lockern oder auf Reset klicken, um alle Pläne wieder zu sehen.</p>
              <button
                type="button"
                onClick={resetFilters}
                className="mt-4 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                Alle Pläne anzeigen
              </button>
            </div>
          )}
        </section>

        <section className="mt-8 grid gap-4 lg:grid-cols-2">
          <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900">Betriebs-Checkliste je Woche</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              <li>Reservoir/Drain-Werte dokumentieren (EC, pH, Temperatur).</li>
              <li>Nur in kleinen Schritten anpassen: max. EC +0.1 bis +0.2 pro Woche.</li>
              <li>Bei Stress erst Bewässerungsrhythmus prüfen, dann Nährstoffmenge.</li>
              <li>Bei Blattspitzenbrand EC kurzfristig senken und stabilisieren.</li>
            </ul>
          </article>
          <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900">Kurze Antworten</h3>
            <div className="mt-3 space-y-2 text-sm text-slate-700">
              <p><span className="font-semibold">Kann ich Pläne mischen?</span> Ja, aber nur stufenweise und mit 1-2 Wochen Übergang.</p>
              <p><span className="font-semibold">Welcher Plan für Anfänger?</span> Starter-Filter aktivieren und mit Budget Klar oder Erde Ausgewogen starten.</p>
              <p><span className="font-semibold">Wann PK-Booster?</span> Erst in stabiler Blüte und nie bei unstabilem pH/EC.</p>
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}
