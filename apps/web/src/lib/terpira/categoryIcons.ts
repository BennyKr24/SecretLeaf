// One consistent icon + accent color per content category, used everywhere
// a category badge appears (list items, filters, hub pages) so the same
// category always reads the same way instead of relying on generic plant
// emoji. Previously duplicated as an emoji Record in 5 separate files.

import {
  Sprout, Dna, FlaskConical, Citrus, Stethoscope, Wind, Gem, Scale,
  Shield, Microscope, BarChart3, Wrench, Activity, BookOpen, type LucideIcon,
} from 'lucide-react';

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
