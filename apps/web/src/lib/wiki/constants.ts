import type { TerpiraCategory, TerpiraDifficulty } from "@/lib/terpira/types";

export const categoryLabels: Record<TerpiraCategory, string> = {
  anbau: "Anbau",
  genetik: "Genetik und Selektion",
  chemie: "Cannabis-Chemie",
  terpene: "Terpene und Aromaprofile",
  medizin: "Medizin und Evidenz",
  konsumformen: "Konsumformen",
  konzentrate: "Hash und Konzentrate",
  recht: "Recht und Compliance",
  sicherheit: "Sicherheit und Aufklaerung",
  qualitaet: "Qualitaet und Laborwerte",
  markt: "Markt und Beschaffung",
  werkzeuge: "Tools und Rechner",
};

export const difficultyLabels: Record<TerpiraDifficulty, string> = {
  einsteiger: "Einsteiger",
  fortgeschritten: "Fortgeschritten",
  profi: "Profi",
};

export const orderedCategories: TerpiraCategory[] = [
  "anbau",
  "genetik",
  "chemie",
  "terpene",
  "konsumformen",
  "konzentrate",
  "qualitaet",
  "sicherheit",
  "medizin",
  "recht",
  "markt",
  "werkzeuge",
];
