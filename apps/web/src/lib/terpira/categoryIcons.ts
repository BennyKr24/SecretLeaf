// One consistent icon + accent color per content category, used everywhere
// a category badge appears (list items, filters, hub pages) so the same
// category always reads the same way instead of relying on generic plant
// emoji. Previously duplicated as an emoji Record in 5 separate files.

import {
  Sprout, Dna, FlaskConical, Citrus, Stethoscope, Wind, Gem, Scale,
  Shield, Microscope, BarChart3, Wrench, Activity, BookOpen, Leaf, Thermometer, Bug,
  type LucideIcon,
} from 'lucide-react';
import type { DiagnoseArea } from './types';

export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  anbau: Sprout, diagnose: Activity, tutorials: BookOpen, genetik: Dna,
  chemie: FlaskConical, terpene: Citrus, medizin: Stethoscope, konsumformen: Wind,
  konzentrate: Gem, recht: Scale, sicherheit: Shield, qualitaet: Microscope,
  markt: BarChart3, werkzeuge: Wrench,
};

export const CATEGORY_ACCENT: Record<string, string> = {
  anbau: 'text-emerald-600', diagnose: 'text-red-600', tutorials: 'text-sky-600',
  genetik: 'text-violet-600', chemie: 'text-cyan-600', terpene: 'text-pink-600',
  medizin: 'text-rose-600', konsumformen: 'text-slate-600', konzentrate: 'text-fuchsia-600',
  recht: 'text-blue-600', sicherheit: 'text-amber-600', qualitaet: 'text-teal-600',
  markt: 'text-orange-600', werkzeuge: 'text-indigo-600',
};

// One-sentence description per category, shown on the /studies hub grid
// and the /category/[slug] hero. Shared between both so they can never
// drift out of sync with each other.
export const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  anbau:        'Anbau-Technik und Referenz: Substrat, Bewässerung, Nährstoffe, Licht und Ernte im Detail.',
  diagnose:     'Symptom erkannt, jetzt Ursache finden – Mangelerscheinungen, Krankheiten, Schädlinge und Umweltstress diagnostizieren und beheben.',
  tutorials:    'Schritt-für-Schritt-Guides für einen ganzen Grow – vom ersten Setup bis zur Ernte, für jedes Erfahrungslevel.',
  genetik:      'Genetik, Züchtung und Sortenwahl – für gezielte Ergebnisse bei Ertrag und Wirkstoffprofil.',
  chemie:       'Nährstoffe, Substrate und chemische Grundlagen für gesundes Pflanzenwachstum.',
  terpene:      'Terpenprofile, Aromastoffe und deren Einfluss auf Wirkung und Geschmack.',
  medizin:      'Wissenschaftliche Erkenntnisse zu medizinischen Cannabis-Anwendungen.',
  konsumformen: 'Verschiedene Konsumformen und Anwendungsmethoden im Überblick.',
  konzentrate:  'Extraktion, Verarbeitung und Qualitätsbewertung von Konzentraten.',
  recht:        'Rechtliche Rahmenbedingungen, Regulierung und Compliance.',
  sicherheit:   'Sicherheitshinweise, Risikobewertung und verantwortungsvoller Umgang.',
  qualitaet:    'Laboranalysen, Qualitätskontrolle und Reinheitsprüfungen.',
  markt:        'Marktanalysen, Beschaffung und aktuelle Preisentwicklungen.',
  werkzeuge:    'Praktische Rechner, Kalkulatoren und Werkzeuge für den Alltag.',
};

// Labels + icons for the "diagnose" category's symptom-area facet, matching
// lib/diagnose/tree.ts's diagnoseCategories 1:1 (same ids, same icons) so
// the interactive tool and the studies library read as the same mental model.
export const DIAGNOSE_AREA_LABELS: Record<DiagnoseArea, string> = {
  blaetter: 'Blätter',
  wachstum: 'Wachstum & Wurzeln',
  klima: 'Klima & Umgebung',
  schaedlinge: 'Schädlinge',
};

export const DIAGNOSE_AREA_ICONS: Record<DiagnoseArea, LucideIcon> = {
  blaetter: Leaf,
  wachstum: Sprout,
  klima: Thermometer,
  schaedlinge: Bug,
};

export const DIAGNOSE_AREA_ORDER: DiagnoseArea[] = ['blaetter', 'wachstum', 'klima', 'schaedlinge'];
