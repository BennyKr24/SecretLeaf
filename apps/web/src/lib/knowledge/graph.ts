import { WIKI_CONTEXT_RULES } from "@/data/terpira/wikiContextMapping";
import { getArticleBySlug, wikiArticles } from "@/data/terpira/wiki";
import type { GrowMedium, GrowPhaseId, GrowTask, LogEntryType } from "@/lib/grow/types";
import type { TerpiraArticle } from "@/lib/terpira/types";

export type KnowledgeNodeType =
  | "study"
  | "diagnosis_pattern"
  | "grow_phase"
  | "grow_medium"
  | "grow_signal"
  | "log_type"
  | "task_category"
  | "tool"
  | "context_rule";

export type KnowledgeRelationType =
  | "related"
  | "supports_diagnosis"
  | "supports_recommendation"
  | "supports_context_rule"
  | "recommends_tool"
  | "maps_task_category";

export type KnowledgeEvidenceLevel = "low" | "medium" | "high";
export type KnowledgePriority = "low" | "medium" | "high";

export type KnowledgeRelation = {
  id: string;
  sourceSlug: string;
  sourceType: KnowledgeNodeType;
  targetSlug: string;
  targetType: KnowledgeNodeType;
  relationType: KnowledgeRelationType;
  weight: number;
  confidenceScore: number;
  evidenceLevel: KnowledgeEvidenceLevel;
  explanation: string;
  expectedBenefit?: string | undefined;
  priority?: KnowledgePriority;
  metadata?: {
    logType?: LogEntryType;
    taskCategory?: GrowTask["category"];
    toolHref?: string;
  };
};

export type KnowledgeStudyMatch = {
  article: TerpiraArticle;
  weight: number;
  confidenceScore: number;
  evidenceLevel: KnowledgeEvidenceLevel;
  reason: string;
  reasons: string[];
  expectedBenefit?: string | undefined;
  priority: KnowledgePriority;
};

type KnowledgeSeed = Omit<KnowledgeRelation, "id">;

const DIAGNOSIS_STUDY_RELATIONS: KnowledgeSeed[] = [
  {
    sourceSlug: "n-mangel",
    sourceType: "diagnosis_pattern",
    targetSlug: "naehrstoffbedarf-cannabis-lebenszyklus",
    targetType: "study",
    relationType: "supports_diagnosis",
    weight: 95,
    confidenceScore: 86,
    evidenceLevel: "high",
    explanation: "Der Befund passt zu einem mobilen Nährstoffmangel mit phasenabhängigem Stickstoffbedarf.",
    expectedBenefit: "Die Gegenmaßnahme wird auf den tatsächlichen Lebenszyklusbedarf statt auf Bauchgefühl abgestimmt.",
    priority: "high",
  },
  {
    sourceSlug: "n-mangel",
    sourceType: "diagnosis_pattern",
    targetSlug: "naehrstoffblockaden-und-antagonismen",
    targetType: "study",
    relationType: "supports_diagnosis",
    weight: 88,
    confidenceScore: 82,
    evidenceLevel: "high",
    explanation: "Vor jeder Dosisanhebung muss eine pH- oder Antagonismus-Blockade ausgeschlossen werden.",
    expectedBenefit: "Verhindert Überkorrekturen und zusätzliche Salzlast.",
    priority: "high",
  },
  {
    sourceSlug: "p-mangel",
    sourceType: "diagnosis_pattern",
    targetSlug: "naehrstoffbedarf-cannabis-lebenszyklus",
    targetType: "study",
    relationType: "supports_diagnosis",
    weight: 84,
    confidenceScore: 74,
    evidenceLevel: "medium",
    explanation: "Phosphorbedarf und Phasenübergänge müssen gemeinsam beurteilt werden.",
    expectedBenefit: "Reduziert Fehldiagnosen zwischen Kältestress und echter Unterversorgung.",
    priority: "medium",
  },
  {
    sourceSlug: "k-mangel",
    sourceType: "diagnosis_pattern",
    targetSlug: "naehrstoffbedarf-cannabis-lebenszyklus",
    targetType: "study",
    relationType: "supports_diagnosis",
    weight: 88,
    confidenceScore: 80,
    evidenceLevel: "high",
    explanation: "Der Kaliumbedarf steigt in der Blüte, deshalb ist der Phasenkontext entscheidend.",
    expectedBenefit: "Erhöht die Chance auf eine gezielte Korrektur ohne Nebenwirkung auf das NPK-Verhältnis.",
    priority: "high",
  },
  {
    sourceSlug: "ca-mangel",
    sourceType: "diagnosis_pattern",
    targetSlug: "stressmarker-frueh-erkennen",
    targetType: "study",
    relationType: "supports_diagnosis",
    weight: 79,
    confidenceScore: 70,
    evidenceLevel: "medium",
    explanation: "Calcium-Symptome und Klima-/Transpirationsstress müssen gemeinsam gelesen werden.",
    expectedBenefit: "Verhindert isolierte CalMag-Reaktionen ohne Klima-Korrektur.",
    priority: "medium",
  },
  {
    sourceSlug: "ca-mangel",
    sourceType: "diagnosis_pattern",
    targetSlug: "vpd-einfach-erklaert",
    targetType: "study",
    relationType: "supports_diagnosis",
    weight: 86,
    confidenceScore: 78,
    evidenceLevel: "high",
    explanation: "Transpirationsstress beeinflusst die Calciumaufnahme direkt.",
    expectedBenefit: "Klärt, ob das Problem in der Nährlösung oder im Klima liegt.",
    priority: "high",
  },
  {
    sourceSlug: "mg-mangel",
    sourceType: "diagnosis_pattern",
    targetSlug: "naehrstoffblockaden-und-antagonismen",
    targetType: "study",
    relationType: "supports_diagnosis",
    weight: 92,
    confidenceScore: 84,
    evidenceLevel: "high",
    explanation: "Mg-Mangelbilder sind häufig Antagonismus-getrieben und nicht reine Unterversorgung.",
    expectedBenefit: "Hilft, Ca:Mg:K wieder auszubalancieren statt nur Mg nachzukippen.",
    priority: "high",
  },
  {
    sourceSlug: "fe-mangel",
    sourceType: "diagnosis_pattern",
    targetSlug: "sensor-kalibrierung-und-messfehler",
    targetType: "study",
    relationType: "supports_diagnosis",
    weight: 83,
    confidenceScore: 79,
    evidenceLevel: "medium",
    explanation: "Eisenmangel ist oft ein Mess- und pH-Thema, nicht ein Rohstoffproblem.",
    expectedBenefit: "Schützt vor unnötigen Additiven und fokussiert zuerst die Messqualität.",
    priority: "medium",
  },
  {
    sourceSlug: "lockout",
    sourceType: "diagnosis_pattern",
    targetSlug: "naehrstoffblockaden-und-antagonismen",
    targetType: "study",
    relationType: "supports_diagnosis",
    weight: 98,
    confidenceScore: 88,
    evidenceLevel: "high",
    explanation: "Gemischte Mangelsymptome deuten im Produktkontext zuerst auf Blockaden, nicht auf isolierte Einzelnährstoffe.",
    expectedBenefit: "Verhindert chaotische Mehrfachkorrekturen.",
    priority: "high",
  },
  {
    sourceSlug: "uebersalzung",
    sourceType: "diagnosis_pattern",
    targetSlug: "naehrstoffblockaden-und-antagonismen",
    targetType: "study",
    relationType: "supports_diagnosis",
    weight: 92,
    confidenceScore: 86,
    evidenceLevel: "high",
    explanation: "Übersalzung und Blockade sind eng gekoppelt und müssen gemeinsam beurteilt werden.",
    expectedBenefit: "Reduziert die Gefahr, trotz Burn weiter nachzudüngen.",
    priority: "high",
  },
  {
    sourceSlug: "hitzestress",
    sourceType: "diagnosis_pattern",
    targetSlug: "lichtstress-und-canopy-management",
    targetType: "study",
    relationType: "supports_diagnosis",
    weight: 93,
    confidenceScore: 85,
    evidenceLevel: "high",
    explanation: "Canopy-Management und Lichtverteilung sind die direktesten Stellhebel bei Hitze- und Lichtstress.",
    expectedBenefit: "Reduziert Blattstress und schützt das Photosynthese-Fenster.",
    priority: "high",
  },
  {
    sourceSlug: "vpd-hoch",
    sourceType: "diagnosis_pattern",
    targetSlug: "vpd-einfach-erklaert",
    targetType: "study",
    relationType: "supports_diagnosis",
    weight: 97,
    confidenceScore: 89,
    evidenceLevel: "high",
    explanation: "Der Befund ist direkt an das VPD-Zielsystem gekoppelt.",
    expectedBenefit: "Erlaubt eine messbare Klima-Korrektur statt allgemeiner Raumoptimierung.",
    priority: "high",
  },
  {
    sourceSlug: "ueberwaesserung",
    sourceType: "diagnosis_pattern",
    targetSlug: "bewaesserung-ohne-uebergiessen",
    targetType: "study",
    relationType: "supports_diagnosis",
    weight: 95,
    confidenceScore: 87,
    evidenceLevel: "high",
    explanation: "Welken trotz nassem Substrat ist ein direktes Wurzelzonen- und Gießrhythmus-Thema.",
    expectedBenefit: "Verhindert weiteren Wurzeldruck durch reflexartiges Nachgießen.",
    priority: "high",
  },
  {
    sourceSlug: "spinnmilben",
    sourceType: "diagnosis_pattern",
    targetSlug: "integrierte-schaedlingspraevention-grow",
    targetType: "study",
    relationType: "supports_diagnosis",
    weight: 96,
    confidenceScore: 88,
    evidenceLevel: "high",
    explanation: "Spinnmilben erfordern Monitoring, Intervall-Logik und Präventionsroutine statt Einzelmaßnahme.",
    expectedBenefit: "Sichert eine systematische Reaktion statt punktueller Symptombekämpfung.",
    priority: "high",
  },
  {
    sourceSlug: "trauermuecken",
    sourceType: "diagnosis_pattern",
    targetSlug: "cannabis-substrat-und-wurzelzone",
    targetType: "study",
    relationType: "supports_diagnosis",
    weight: 90,
    confidenceScore: 81,
    evidenceLevel: "medium",
    explanation: "Trauermücken sind im Produktkontext ein Feuchte- und Wurzelzonen-Signal.",
    expectedBenefit: "Verschiebt den Fokus von Symptomen auf die Ursache in der Wurzelzone.",
    priority: "medium",
  },
  {
    sourceSlug: "thripse",
    sourceType: "diagnosis_pattern",
    targetSlug: "integrierte-schaedlingspraevention-grow",
    targetType: "study",
    relationType: "supports_diagnosis",
    weight: 91,
    confidenceScore: 84,
    evidenceLevel: "high",
    explanation: "Thripse verlangen konsequentes Monitoring, Hygiene und Intervallmaßnahmen.",
    expectedBenefit: "Senkt Re-Infektionsrisiko und strukturiert die Folgeschritte.",
    priority: "high",
  },
  {
    sourceSlug: "blattlaeuse",
    sourceType: "diagnosis_pattern",
    targetSlug: "integrierte-schaedlingspraevention-grow",
    targetType: "study",
    relationType: "supports_diagnosis",
    weight: 88,
    confidenceScore: 82,
    evidenceLevel: "medium",
    explanation: "Aphidenbefall ist ein Präventions- und Monitoringthema mit klaren IPM-Maßnahmen.",
    expectedBenefit: "Verkürzt die Zeit bis zu einer sauberen Eindämmung.",
    priority: "medium",
  },
  {
    sourceSlug: "botrytis",
    sourceType: "diagnosis_pattern",
    targetSlug: "schimmel-und-mykotoxine-bei-cannabis",
    targetType: "study",
    relationType: "supports_diagnosis",
    weight: 99,
    confidenceScore: 91,
    evidenceLevel: "high",
    explanation: "Botrytis ist ein direkter Schimmel- und Sicherheitsfall mit Qualitäts- und Verlustfolgen.",
    expectedBenefit: "Priorisiert Schadensbegrenzung und Hygiene statt kosmetischer Maßnahmen.",
    priority: "high",
  },
  {
    sourceSlug: "breitmilben",
    sourceType: "diagnosis_pattern",
    targetSlug: "integrierte-schaedlingspraevention-grow",
    targetType: "study",
    relationType: "supports_diagnosis",
    weight: 90,
    confidenceScore: 80,
    evidenceLevel: "medium",
    explanation: "Breitmilben erfordern eine saubere Abgrenzung zu Nährstoff- und Neuwuchsstress.",
    expectedBenefit: "Reduziert Fehlbehandlungen bei verkrüppeltem Triebwuchs.",
    priority: "medium",
  },
  {
    sourceSlug: "wurzellaeuse",
    sourceType: "diagnosis_pattern",
    targetSlug: "cannabis-substrat-und-wurzelzone",
    targetType: "study",
    relationType: "supports_diagnosis",
    weight: 90,
    confidenceScore: 81,
    evidenceLevel: "medium",
    explanation: "Wurzellastige Schädlinge müssen über Substrat- und Wurzelzonenlogik eingeordnet werden.",
    expectedBenefit: "Hilft, Symptombilder an der Ursache zu trennen.",
    priority: "medium",
  },
  {
    sourceSlug: "rostmilben",
    sourceType: "diagnosis_pattern",
    targetSlug: "integrierte-schaedlingspraevention-grow",
    targetType: "study",
    relationType: "supports_diagnosis",
    weight: 90,
    confidenceScore: 80,
    evidenceLevel: "medium",
    explanation: "Rostmilben sind ohne saubere IPM-Logik schwer zu stabilisieren.",
    expectedBenefit: "Verhindert verspätete Gegenmaßnahmen bei schleichendem Schaden.",
    priority: "medium",
  },
];

const GROW_CONTEXT_RELATIONS: KnowledgeSeed[] = [
  {
    sourceSlug: "keimung",
    sourceType: "grow_phase",
    targetSlug: "bewaesserung-ohne-uebergiessen",
    targetType: "study",
    relationType: "supports_recommendation",
    weight: 88,
    confidenceScore: 82,
    evidenceLevel: "high",
    explanation: "In der Keimung entscheidet der Gießrhythmus über Sauerstoff an der Wurzelzone.",
    expectedBenefit: "Verhindert frühe Ausfälle durch Staunässe.",
    priority: "high",
  },
  {
    sourceSlug: "keimung",
    sourceType: "grow_phase",
    targetSlug: "cannabis-substrat-und-wurzelzone",
    targetType: "study",
    relationType: "supports_recommendation",
    weight: 80,
    confidenceScore: 74,
    evidenceLevel: "medium",
    explanation: "Die Wurzelzone ist in der Keimung der limitierende Faktor.",
    expectedBenefit: "Hilft, Probleme im Substrat früh sichtbar zu machen.",
    priority: "medium",
  },
  {
    sourceSlug: "saemling",
    sourceType: "grow_phase",
    targetSlug: "vpd-einfach-erklaert",
    targetType: "study",
    relationType: "supports_recommendation",
    weight: 86,
    confidenceScore: 80,
    evidenceLevel: "high",
    explanation: "Sämlinge reagieren besonders empfindlich auf Klimaabweichungen.",
    expectedBenefit: "Stabilisiert Wachstum und reduziert Stressmarker.",
    priority: "high",
  },
  {
    sourceSlug: "veg",
    sourceType: "grow_phase",
    targetSlug: "lichtstress-und-canopy-management",
    targetType: "study",
    relationType: "supports_recommendation",
    weight: 92,
    confidenceScore: 84,
    evidenceLevel: "high",
    explanation: "In der Wachstumsphase entscheidet Canopy-Gleichmäßigkeit über den späteren Ertrag.",
    expectedBenefit: "Verbessert Lichtnutzung vor dem Blütefenster.",
    priority: "high",
  },
  {
    sourceSlug: "veg",
    sourceType: "grow_phase",
    targetSlug: "stressmarker-frueh-erkennen",
    targetType: "study",
    relationType: "supports_recommendation",
    weight: 88,
    confidenceScore: 81,
    evidenceLevel: "high",
    explanation: "Stress in Veg multipliziert sich in die Blüte hinein.",
    expectedBenefit: "Erkennt Probleme vor dem Ertragsfenster.",
    priority: "high",
  },
  {
    sourceSlug: "bluete",
    sourceType: "grow_phase",
    targetSlug: "naehrstoffbedarf-cannabis-lebenszyklus",
    targetType: "study",
    relationType: "supports_recommendation",
    weight: 96,
    confidenceScore: 88,
    evidenceLevel: "high",
    explanation: "In der Blüte ist die phasenrichtige Ernährung direkt ertragsrelevant.",
    expectedBenefit: "Verhindert Unter- und Überversorgung im Peak-Bedarf.",
    priority: "high",
  },
  {
    sourceSlug: "bluete",
    sourceType: "grow_phase",
    targetSlug: "integrierte-schaedlingspraevention-grow",
    targetType: "study",
    relationType: "supports_recommendation",
    weight: 84,
    confidenceScore: 76,
    evidenceLevel: "medium",
    explanation: "Die Blütephase verschärft Schädlings- und Schimmelkosten pro verlorenem Tag.",
    expectedBenefit: "Erhöht Präventionsdisziplin im kritischen Fenster.",
    priority: "medium",
  },
  {
    sourceSlug: "spaetbluete",
    sourceType: "grow_phase",
    targetSlug: "schimmel-und-mykotoxine-bei-cannabis",
    targetType: "study",
    relationType: "supports_recommendation",
    weight: 96,
    confidenceScore: 88,
    evidenceLevel: "high",
    explanation: "Spätblüte ist das höchste Schimmel- und Verlustfenster.",
    expectedBenefit: "Schützt Qualität und Erntegewicht in der Endphase.",
    priority: "high",
  },
  {
    sourceSlug: "ernte",
    sourceType: "grow_phase",
    targetSlug: "wasseraktivitaet-und-curing",
    targetType: "study",
    relationType: "supports_recommendation",
    weight: 98,
    confidenceScore: 90,
    evidenceLevel: "high",
    explanation: "Nach der Ernte verschiebt sich das Hauptrisiko auf Trocknung und Wasseraktivität.",
    expectedBenefit: "Verhindert Qualitätsverlust nach erfolgreichem Grow.",
    priority: "high",
  },
  {
    sourceSlug: "coco",
    sourceType: "grow_medium",
    targetSlug: "substrat-vergleich-coco-erde-hydro",
    targetType: "study",
    relationType: "supports_recommendation",
    weight: 82,
    confidenceScore: 76,
    evidenceLevel: "medium",
    explanation: "Coco verlangt engere Steuerung von EC und Bewässerung.",
    expectedBenefit: "Hilft, das Medium kontrolliert statt intuitiv zu fahren.",
    priority: "medium",
  },
  {
    sourceSlug: "erde",
    sourceType: "grow_medium",
    targetSlug: "cannabis-substrat-und-wurzelzone",
    targetType: "study",
    relationType: "supports_recommendation",
    weight: 80,
    confidenceScore: 72,
    evidenceLevel: "medium",
    explanation: "Erde verzeiht mehr, verschleiert aber Wurzelzonenfehler länger.",
    expectedBenefit: "Macht versteckte Überwässerung und Verdichtung sichtbar.",
    priority: "medium",
  },
  {
    sourceSlug: "hydro",
    sourceType: "grow_medium",
    targetSlug: "sensor-kalibrierung-und-messfehler",
    targetType: "study",
    relationType: "supports_recommendation",
    weight: 90,
    confidenceScore: 82,
    evidenceLevel: "high",
    explanation: "Hydro ist ohne belastbare Sensorik nicht steuerbar.",
    expectedBenefit: "Verhindert Folgefehler durch falsche Messwerte.",
    priority: "high",
  },
  {
    sourceSlug: "wasser",
    sourceType: "log_type",
    targetSlug: "bewaesserung-ohne-uebergiessen",
    targetType: "study",
    relationType: "supports_recommendation",
    weight: 94,
    confidenceScore: 84,
    evidenceLevel: "high",
    explanation: "Direkt nach dem Gieß-Eintrag ist der Bewässerungskontext am verwertbarsten.",
    expectedBenefit: "Verankert Gießentscheidungen im aktuellen Verlauf.",
    priority: "high",
  },
  {
    sourceSlug: "duenger",
    sourceType: "log_type",
    targetSlug: "naehrstoffbedarf-cannabis-lebenszyklus",
    targetType: "study",
    relationType: "supports_recommendation",
    weight: 90,
    confidenceScore: 82,
    evidenceLevel: "high",
    explanation: "Direkt nach Düngelogik ist die Phasenanpassung entscheidend.",
    expectedBenefit: "Verhindert Standardfütterung trotz wechselnder Phase.",
    priority: "high",
  },
  {
    sourceSlug: "training",
    sourceType: "log_type",
    targetSlug: "stressmarker-frueh-erkennen",
    targetType: "study",
    relationType: "supports_recommendation",
    weight: 88,
    confidenceScore: 80,
    evidenceLevel: "medium",
    explanation: "Training erzeugt kurzfristig Stresssignale, die dokumentiert und gelesen werden müssen.",
    expectedBenefit: "Verhindert Übertraining und Timingfehler.",
    priority: "medium",
  },
  {
    sourceSlug: "notiz",
    sourceType: "log_type",
    targetSlug: "grow-log-und-kpi-dashboard",
    targetType: "study",
    relationType: "supports_recommendation",
    weight: 78,
    confidenceScore: 72,
    evidenceLevel: "medium",
    explanation: "Notizen entfalten ihren Wert erst über die KPI-Logik im Verlauf.",
    expectedBenefit: "Macht aus Einzelnotizen verwertbare Muster.",
    priority: "low",
  },
  {
    sourceSlug: "bewaesserung",
    sourceType: "task_category",
    targetSlug: "bewaesserung-ohne-uebergiessen",
    targetType: "study",
    relationType: "maps_task_category",
    weight: 92,
    confidenceScore: 84,
    evidenceLevel: "high",
    explanation: "Bewässerungsaufgaben sollten mit dem passenden Bewässerungswissen gekoppelt sein.",
    expectedBenefit: "Verbindet Aufgabe und Ursache statt nur Termin und Checkbox.",
    priority: "high",
  },
  {
    sourceSlug: "duengung",
    sourceType: "task_category",
    targetSlug: "naehrstoffblockaden-und-antagonismen",
    targetType: "study",
    relationType: "maps_task_category",
    weight: 90,
    confidenceScore: 83,
    evidenceLevel: "high",
    explanation: "Düngeaufgaben ohne Blockadeverständnis erzeugen Fehlentscheidungen.",
    expectedBenefit: "Verankert die Aufgabe im tatsächlichen Nährstoffkontext.",
    priority: "high",
  },
  {
    sourceSlug: "training",
    sourceType: "task_category",
    targetSlug: "lichtstress-und-canopy-management",
    targetType: "study",
    relationType: "maps_task_category",
    weight: 82,
    confidenceScore: 75,
    evidenceLevel: "medium",
    explanation: "Training verändert Canopy und Lichtverteilung direkt.",
    expectedBenefit: "Reduziert Folgeprobleme nach Formschnitt oder LST.",
    priority: "medium",
  },
  {
    sourceSlug: "kontrolle",
    sourceType: "task_category",
    targetSlug: "integrierte-schaedlingspraevention-grow",
    targetType: "study",
    relationType: "maps_task_category",
    weight: 82,
    confidenceScore: 74,
    evidenceLevel: "medium",
    explanation: "Kontrollaufgaben sind Präventionsaufgaben und brauchen das passende Prüfmodell.",
    expectedBenefit: "Erhöht die Qualität von Sichtkontrollen.",
    priority: "medium",
  },
];

const TOOL_RELATIONS: KnowledgeSeed[] = [
  {
    sourceSlug: "vpd-einfach-erklaert",
    sourceType: "study",
    targetSlug: "vpd",
    targetType: "tool",
    relationType: "recommends_tool",
    weight: 100,
    confidenceScore: 88,
    evidenceLevel: "high",
    explanation: "Die VPD-Empfehlung ist nur nutzbar, wenn der Wert direkt gemessen oder berechnet wird.",
    metadata: { toolHref: "/tools/vpd" },
  },
  {
    sourceSlug: "lichtstress-und-canopy-management",
    sourceType: "study",
    targetSlug: "licht-rechner",
    targetType: "tool",
    relationType: "recommends_tool",
    weight: 92,
    confidenceScore: 83,
    evidenceLevel: "medium",
    explanation: "Lichtstress muss mit der Beleuchtungsleistung und Distanz gegengeprüft werden.",
    metadata: { toolHref: "/tools/licht-rechner" },
  },
  {
    sourceSlug: "naehrstoffbedarf-cannabis-lebenszyklus",
    sourceType: "study",
    targetSlug: "naehrstoff-rechner",
    targetType: "tool",
    relationType: "recommends_tool",
    weight: 95,
    confidenceScore: 86,
    evidenceLevel: "high",
    explanation: "Die phasenrichtige Nährstofflogik braucht ein präzises Dosierungswerkzeug.",
    metadata: { toolHref: "/tools/naehrstoff-rechner" },
  },
  {
    sourceSlug: "sensor-kalibrierung-und-messfehler",
    sourceType: "study",
    targetSlug: "vpd",
    targetType: "tool",
    relationType: "recommends_tool",
    weight: 78,
    confidenceScore: 72,
    evidenceLevel: "medium",
    explanation: "Sensorfehler werden erst über konkrete Mess- und Gegenprüfpfade sichtbar.",
    metadata: { toolHref: "/tools/vpd" },
  },
];

const CONTEXT_RULE_RELATIONS: KnowledgeSeed[] = WIKI_CONTEXT_RULES.flatMap((rule) => {
  const base: KnowledgeSeed[] = [
    {
      sourceSlug: rule.id,
      sourceType: "context_rule",
      targetSlug: rule.articleSlug,
      targetType: "study",
      relationType: "supports_context_rule",
      weight: 90,
      confidenceScore: 82,
      evidenceLevel: rule.priority === "critical" || rule.priority === "high" ? "high" : "medium",
      explanation: rule.reason,
      expectedBenefit: rule.goal,
      priority: rule.priority === "critical" || rule.priority === "high"
        ? "high"
        : rule.priority === "medium"
        ? "medium"
        : "low",
    },
  ];

  if (!rule.fallbackSlug) return base;

  return [
    ...base,
    {
      sourceSlug: `${rule.id}:fallback`,
      sourceType: "context_rule",
      targetSlug: rule.fallbackSlug,
      targetType: "study",
      relationType: "supports_context_rule",
      weight: 70,
      confidenceScore: 68,
      evidenceLevel: "medium",
      explanation: `${rule.reason} (Fallback)`,
      expectedBenefit: rule.goal,
      priority: "low",
    },
  ];
});

const DIRECT_STUDY_RELATIONS: KnowledgeSeed[] = wikiArticles.flatMap((article) =>
  article.relatedSlugs.map((relatedSlug, index) => ({
    sourceSlug: article.slug,
    sourceType: "study" as const,
    targetSlug: relatedSlug,
    targetType: "study" as const,
    relationType: "related" as const,
    weight: Math.max(60 - index * 8, 30),
    confidenceScore: Math.max((article.qualityScore ?? 3) * 18, 54),
    evidenceLevel: (article.qualityScore ?? 0) >= 5 ? "high" : (article.qualityScore ?? 0) >= 4 ? "medium" : "low",
    explanation: `${article.title} verweist inhaltlich auf ${relatedSlug}.`,
    expectedBenefit: "Hilft, das Thema in der nächsten Handlungsebene zu vertiefen.",
    priority: (article.qualityScore ?? 0) >= 5 ? "high" : (article.qualityScore ?? 0) >= 4 ? "medium" : "low",
  }))
);

export const KNOWLEDGE_RELATIONS: KnowledgeRelation[] = [
  ...DIRECT_STUDY_RELATIONS,
  ...DIAGNOSIS_STUDY_RELATIONS,
  ...GROW_CONTEXT_RELATIONS,
  ...TOOL_RELATIONS,
  ...CONTEXT_RULE_RELATIONS,
].map((relation, index) => ({
  ...relation,
  id: `${relation.sourceType}:${relation.sourceSlug}:${relation.relationType}:${relation.targetType}:${relation.targetSlug}:${index}`,
}));

function evidenceRank(level: KnowledgeEvidenceLevel): number {
  if (level === "high") return 3;
  if (level === "medium") return 2;
  return 1;
}

function priorityRank(priority: KnowledgePriority): number {
  if (priority === "high") return 3;
  if (priority === "medium") return 2;
  return 1;
}

function buildStudyMatches(relations: KnowledgeRelation[], limit: number, excludeSlugs: string[] = []): KnowledgeStudyMatch[] {
  const blocked = new Set(excludeSlugs);
  const grouped = new Map<string, KnowledgeRelation[]>();

  for (const relation of relations) {
    if (relation.targetType !== "study") continue;
    if (blocked.has(relation.targetSlug)) continue;
    const existing = grouped.get(relation.targetSlug) ?? [];
    grouped.set(relation.targetSlug, [...existing, relation]);
  }

  const matches: KnowledgeStudyMatch[] = [];

  for (const [slug, bucket] of grouped.entries()) {
    const article = getArticleBySlug(slug);
    if (!article) continue;

    const weight = bucket.reduce((sum, relation) => sum + relation.weight, 0);
    const confidenceScore = Math.round(bucket.reduce((sum, relation) => sum + relation.confidenceScore, 0) / bucket.length);
    const evidenceLevel = bucket.reduce<KnowledgeEvidenceLevel>((current, relation) => (
      evidenceRank(relation.evidenceLevel) > evidenceRank(current) ? relation.evidenceLevel : current
    ), "low");
    const reasonParts = Array.from(new Set(bucket.map((relation) => relation.explanation)));
    const primaryRelation = [...bucket].sort((a, b) => {
      const priorityDelta = priorityRank(b.priority ?? "low") - priorityRank(a.priority ?? "low");
      if (priorityDelta !== 0) return priorityDelta;
      return b.weight - a.weight;
    })[0];

    matches.push({
      article,
      weight,
      confidenceScore,
      evidenceLevel,
      reason: reasonParts[0] ?? article.summary,
      reasons: reasonParts,
      expectedBenefit: primaryRelation?.expectedBenefit,
      priority: primaryRelation?.priority ?? "low",
    });
  }

  return matches
    .sort((a, b) => {
      const priorityDelta = priorityRank(b.priority) - priorityRank(a.priority);
      if (priorityDelta !== 0) return priorityDelta;
      if (b.weight !== a.weight) return b.weight - a.weight;
      if (b.confidenceScore !== a.confidenceScore) return b.confidenceScore - a.confidenceScore;
      return (b.article.qualityScore ?? 0) - (a.article.qualityScore ?? 0);
    })
    .slice(0, limit);
}

function getRelationsFor(sourceType: KnowledgeNodeType, sourceSlug: string, relationType?: KnowledgeRelationType): KnowledgeRelation[] {
  return KNOWLEDGE_RELATIONS.filter((relation) =>
    relation.sourceType === sourceType &&
    relation.sourceSlug === sourceSlug &&
    (relationType === undefined || relation.relationType === relationType)
  );
}

export function getRelatedStudiesForStudy(slug: string, limit = 5): KnowledgeStudyMatch[] {
  return buildStudyMatches(getRelationsFor("study", slug, "related"), limit);
}

export function getDiagnoseKnowledge(resultId: string, limit = 3): KnowledgeStudyMatch[] {
  return buildStudyMatches(getRelationsFor("diagnosis_pattern", resultId, "supports_diagnosis"), limit);
}

export function getContextRuleKnowledge(ruleId: string, limit = 2, excludeSlugs: string[] = []): KnowledgeStudyMatch[] {
  const primary = getRelationsFor("context_rule", ruleId, "supports_context_rule");
  const fallback = getRelationsFor("context_rule", `${ruleId}:fallback`, "supports_context_rule");
  return buildStudyMatches([...primary, ...fallback], limit, excludeSlugs);
}

export function getToolHrefForStudy(slug: string): string | null {
  const relation = getRelationsFor("study", slug, "recommends_tool")[0];
  return relation?.metadata?.toolHref ?? null;
}

export function getGrowRecommendationKnowledge(params: {
  phaseId: GrowPhaseId;
  medium: GrowMedium;
  pendingTasks: GrowTask[];
  recentLogType?: LogEntryType | undefined;
  limit?: number;
}): KnowledgeStudyMatch[] {
  const relations: KnowledgeRelation[] = [
    ...getRelationsFor("grow_phase", params.phaseId, "supports_recommendation"),
    ...getRelationsFor("grow_medium", params.medium, "supports_recommendation"),
  ];

  if (params.recentLogType) {
    relations.push(...getRelationsFor("log_type", params.recentLogType, "supports_recommendation"));
  }

  for (const task of params.pendingTasks) {
    relations.push(...getRelationsFor("task_category", task.category, "maps_task_category"));
  }

  return buildStudyMatches(relations, params.limit ?? 5);
}