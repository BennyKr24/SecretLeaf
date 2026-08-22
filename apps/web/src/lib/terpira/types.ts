export type GrowCategory =
  | "lighting"
  | "nutrients"
  | "watering"
  | "climate"
  | "stress"
  | "yield";

export type TerpiraCategory =
  | "anbau"
  | "diagnose"
  | "tutorials"
  | "genetik"
  | "chemie"
  | "terpene"
  | "medizin"
  | "konsumformen"
  | "konzentrate"
  | "recht"
  | "sicherheit"
  | "qualitaet"
  | "markt"
  | "werkzeuge";

export type TerpiraDifficulty = "einsteiger" | "fortgeschritten" | "profi";

/**
 * Symptom-first areas for the "diagnose" category, matching the ids used by
 * the existing /diagnose decision-tree tool (lib/diagnose/tree.ts) 1:1, so
 * the same mental model applies whether a user is in the interactive tool
 * or browsing the studies library. An article can belong to more than one
 * area (the tree itself reaches several diagnoses from multiple branches,
 * e.g. Botrytis under both "klima" and "schaedlinge").
 */
export type DiagnoseArea = "blaetter" | "wachstum" | "klima" | "schaedlinge";

export type TerpiraQuickFact = {
  label: string;
  value: string;
};

export type TerpiraSection = {
  heading: string;
  content: string[];
  checklist?: string[];
};

export type TerpiraSimpleExplainer = {
  title: string;
  text: string;
};

export type TerpiraFaqItem = {
  question: string;
  answer: string;
};

export type TerpiraGlossaryItem = {
  term: string;
  definition: string;
};

export type TerpiraDownload = {
  title: string;
  href: string;
  kind: string;
};

export type TerpiraSource = {
  id: string;
  title: string;
  publisher: string;
  year: string;
  url: string;
  doi?: string;
  sourceType?: "manual" | "auto";
  relevanceScore?: number;
  evidenceLevel?: number;
  publisherQuality?: number;
  topicFit?: number;
  studyType?: string;
  editorialPriority?: "high" | "medium" | "low";
  matchedTopics?: string[];
  flags?: string[];
  firstAuthor?: string;
  affiliationHints?: string[];
  originLabel?: string;
  abstractSnippet?: string;
  reviewSummary?: string[];
  fetchedAt?: string;
  tags?: string[];
};

export type TerpiraArticle = {
  slug: string;
  title: string;
  summary: string;
  category: TerpiraCategory;
  difficulty: TerpiraDifficulty;
  readMinutes: number;
  lastUpdated: string;
  tags: string[];
  keyTakeaways: string[];
  quickFacts: TerpiraQuickFact[];
  sections: TerpiraSection[];
  warnings?: string[];
  simpleExplainers?: TerpiraSimpleExplainer[];
  faq?: TerpiraFaqItem[];
  glossary?: TerpiraGlossaryItem[];
  downloads?: TerpiraDownload[];
  sourceIds?: string[];
  relatedSlugs: string[];
  growValue?: string;
  qualityScore?: number;
  growCategory?: GrowCategory;
  /** Only meaningful for category "diagnose" — see DiagnoseArea. */
  diagnoseAreas?: DiagnoseArea[];
};
