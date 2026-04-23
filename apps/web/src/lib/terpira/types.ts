export type TerpiraCategory =
  | "anbau"
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
};
