'use client';

import { useState, useMemo, useEffect, useDeferredValue, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  fertilizerCatalog,
  FertilizerPhase,
  FertilizerBase,
  FertilizerProfile,
  FertilizerFormat,
  FertilizerApplication,
  fertilizerCoverageStats
} from '@/data/terpira/fertilizers';
import Link from 'next/link';
import type { Route } from 'next';

type SortField = 'best-match' | 'name' | 'npk-total' | 'cost' | 'ec-min' | 'ppfd-min';
type ViewMode = 'grid' | 'list';
type UseCase = 'balanced' | 'hydro-performance' | 'soil-organic' | 'budget-smart' | 'max-yield';

type FilterProfile = {
  id: string;
  name: string;
  filters: {
    searchQuery: string;
    selectedPhase: FertilizerPhase | 'all';
    selectedBase: FertilizerBase | 'all';
    selectedFormat: FertilizerFormat | 'all';
    selectedApplication: FertilizerApplication | 'all';
    selectedBrand: string;
    selectedCost: 'budget' | 'mid' | 'premium' | 'all';
    sortBy: SortField;
    useCase: UseCase;
  };
};

const FILTER_PROFILE_STORAGE_KEY = 'secretleaf.fertilizerFilterProfiles.v1';

const phaseLabelMap: Record<FertilizerPhase, string> = {
  veg: '🌱 Veg',
  flower: '🌸 Blüte',
  universal: '⚙️ Universal'
};

const baseLabelMap: Record<FertilizerBase, string> = {
  mineral: 'Mineral',
  organic: 'Organisch',
  'bio-organic': 'Bio-Organisch',
  hybrid: 'Hybrid'
};

const formatLabelMap: Record<FertilizerFormat, string> = {
  liquid: 'Flüssig',
  powder: 'Pulver',
  pellets: 'Pellets',
  granules: 'Granulat'
};

const applicationLabelMap: Record<FertilizerApplication, string> = {
  water: 'Wasser',
  soil: 'Erde',
  both: 'Wasser + Erde'
};

const useCaseLabelMap: Record<UseCase, string> = {
  balanced: 'Ausgewogen',
  'hydro-performance': 'Hydro Performance',
  'soil-organic': 'Erde & Organisch',
  'budget-smart': 'Budget Smart',
  'max-yield': 'Maximaler Ertrag'
};

const costLabelMap = {
  budget: 'Budget',
  mid: 'Mittel',
  premium: 'Premium'
};

const costColorMap = {
  budget: 'text-green-600 bg-green-50',
  mid: 'text-amber-600 bg-amber-50',
  premium: 'text-rose-600 bg-rose-50'
};

export default function FertilizersPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPhase, setSelectedPhase] = useState<FertilizerPhase | 'all'>('all');
  const [selectedBase, setSelectedBase] = useState<FertilizerBase | 'all'>('all');
  const [selectedFormat, setSelectedFormat] = useState<FertilizerFormat | 'all'>('all');
  const [selectedApplication, setSelectedApplication] = useState<FertilizerApplication | 'all'>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [selectedCost, setSelectedCost] = useState<'budget' | 'mid' | 'premium' | 'all'>('all');
  const [sortBy, setSortBy] = useState<SortField>('best-match');
  const [useCase, setUseCase] = useState<UseCase>('balanced');
  const [pageSize, setPageSize] = useState(24);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showDetails, setShowDetails] = useState<Set<string>>(new Set());
  const [profileName, setProfileName] = useState('');
  const [profiles, setProfiles] = useState<FilterProfile[]>([]);
  const deferredSearch = useDeferredValue(searchQuery);

  const brands = useMemo(() => {
    return Array.from(new Set(fertilizerCatalog.map((f) => f.brand))).sort((a, b) => a.localeCompare(b));
  }, []);

  const topBrands = useMemo(() => {
    const counts = fertilizerCatalog.reduce<Record<string, number>>((acc, f) => {
      acc[f.brand] = (acc[f.brand] ?? 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([brand]) => brand);
  }, []);

  const resolveApplication = (f: FertilizerProfile): FertilizerApplication => {
    if (f.application) return f.application;
    if (f.format === 'pellets' || f.format === 'granules') return 'soil';
    const hasSoil = f.tags.some((t) => /erde|soil|topdress|boden/i.test(t));
    const hasWater = f.tags.some((t) => /hydro|wasser|coco/i.test(t));
    if (hasSoil && hasWater) return 'both';
    if (hasSoil) return 'soil';
    if (hasWater) return 'water';
    return f.format === 'liquid' || f.format === 'powder' ? 'water' : 'both';
  };

  const computeMatchScore = (f: FertilizerProfile): number => {
    let score = 0;

    if (selectedPhase === 'all' || f.phase.includes(selectedPhase)) score += 12;
    if (selectedBase === 'all' || f.base === selectedBase) score += 10;
    if (selectedFormat === 'all' || f.format === selectedFormat) score += 7;
    if (selectedApplication === 'all' || resolveApplication(f) === selectedApplication) score += 10;
    if (selectedBrand === 'all' || f.brand === selectedBrand) score += 8;
    if (selectedCost === 'all' || f.cost === selectedCost) score += 8;

    const lowerQuery = deferredSearch.trim().toLowerCase();
    if (!lowerQuery) {
      score += 5;
    } else {
      const tokens = lowerQuery.split(/\s+/).filter(Boolean);
      const haystack = `${f.name} ${f.brand} ${f.description} ${f.tags.join(' ')} ${f.micronutrients.join(' ')}`.toLowerCase();
      for (const token of tokens) {
        if (f.name.toLowerCase().includes(token)) score += 14;
        if (f.brand.toLowerCase().includes(token)) score += 10;
        if (haystack.includes(token)) score += 5;
      }
    }

    switch (useCase) {
      case 'hydro-performance':
        if (resolveApplication(f) === 'water' || resolveApplication(f) === 'both') score += 16;
        if (f.base === 'mineral' || f.base === 'hybrid') score += 8;
        score += (f.ppfd_recommendation?.max ?? 0) / 120;
        score += f.ec_range.max * 2;
        break;
      case 'soil-organic':
        if (resolveApplication(f) === 'soil' || resolveApplication(f) === 'both') score += 16;
        if (f.base === 'organic' || f.base === 'bio-organic') score += 12;
        if (f.format === 'pellets' || f.format === 'granules') score += 8;
        break;
      case 'budget-smart':
        if (f.cost === 'budget') score += 18;
        if (f.cost === 'mid') score += 8;
        if (f.phase.includes('universal')) score += 6;
        break;
      case 'max-yield':
        if (f.yeild_potential === 'very_high') score += 22;
        if (f.yeild_potential === 'high') score += 10;
        score += (f.ppfd_recommendation?.max ?? 0) / 100;
        break;
      case 'balanced':
      default:
        if (f.yeild_potential === 'very_high') score += 8;
        if (f.base === 'hybrid' || f.base === 'mineral') score += 4;
        break;
    }

    return Math.round(score * 10) / 10;
  };

  const filtered = useMemo(() => {
    let result = fertilizerCatalog;

    if (selectedPhase !== 'all') result = result.filter((f) => f.phase.includes(selectedPhase));
    if (selectedBase !== 'all') result = result.filter((f) => f.base === selectedBase);
    if (selectedFormat !== 'all') result = result.filter((f) => f.format === selectedFormat);
    if (selectedApplication !== 'all') result = result.filter((f) => resolveApplication(f) === selectedApplication);
    if (selectedBrand !== 'all') result = result.filter((f) => f.brand === selectedBrand);
    if (selectedCost !== 'all') result = result.filter((f) => f.cost === selectedCost);

    if (deferredSearch.trim()) {
      const lower = deferredSearch.toLowerCase();
      result = result.filter((f) =>
        f.name.toLowerCase().includes(lower) ||
        f.brand.toLowerCase().includes(lower) ||
        f.id.toLowerCase().includes(lower) ||
        f.description.toLowerCase().includes(lower) ||
        f.micronutrients.some((m) => m.toLowerCase().includes(lower)) ||
        f.tags.some((t) => t.toLowerCase().includes(lower))
      );
    }

    return [...result].sort((a, b) => {
      switch (sortBy) {
        case 'best-match':
          return computeMatchScore(b) - computeMatchScore(a);
        case 'name':
          return a.name.localeCompare(b.name);
        case 'npk-total':
          return b.npk.n + b.npk.p + b.npk.k - (a.npk.n + a.npk.p + a.npk.k);
        case 'ec-min':
          return a.ec_range.min - b.ec_range.min;
        case 'ppfd-min':
          return (a.ppfd_recommendation?.min ?? 0) - (b.ppfd_recommendation?.min ?? 0);
        case 'cost': {
          const costOrder = { budget: 0, mid: 1, premium: 2 };
          return costOrder[a.cost] - costOrder[b.cost];
        }
        default:
          return 0;
      }
    });
  }, [deferredSearch, selectedPhase, selectedBase, selectedFormat, selectedApplication, selectedBrand, selectedCost, sortBy, useCase]);

  useEffect(() => {
    const qs = new URLSearchParams(searchParams.toString());
    const queryValue = qs.get('q') ?? '';
    if (queryValue && queryValue !== searchQuery) setSearchQuery(queryValue);
  }, [searchParams, searchQuery]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    const qs = new URLSearchParams(searchParams.toString());
    if (searchQuery.trim()) qs.set('q', searchQuery.trim());
    else qs.delete('q');
    const next = qs.toString() ? `/fertilizers?${qs.toString()}` : '/fertilizers';
    router.replace(next as Route, { scroll: false });
  }, [searchQuery, router, searchParams]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedPhase, selectedBase, selectedFormat, selectedApplication, selectedBrand, selectedCost, sortBy, pageSize, useCase]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(FILTER_PROFILE_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as FilterProfile[];
      if (Array.isArray(parsed)) setProfiles(parsed.slice(0, 12));
    } catch {
      // ignore invalid profile storage content
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(FILTER_PROFILE_STORAGE_KEY, JSON.stringify(profiles));
  }, [profiles]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const paged = filtered.slice(startIndex, startIndex + pageSize);

  const toggleDetails = (id: string) => {
    const next = new Set(showDetails);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setShowDetails(next);
  };

  const activeFilterChips = [
    selectedPhase !== 'all' ? { key: 'phase', label: `Phase: ${selectedPhase}` } : null,
    selectedBase !== 'all' ? { key: 'base', label: `Typ: ${selectedBase}` } : null,
    selectedFormat !== 'all' ? { key: 'format', label: `Format: ${selectedFormat}` } : null,
    selectedApplication !== 'all' ? { key: 'application', label: `Einsatz: ${selectedApplication}` } : null,
    selectedBrand !== 'all' ? { key: 'brand', label: `Marke: ${selectedBrand}` } : null,
    selectedCost !== 'all' ? { key: 'cost', label: `Preis: ${selectedCost}` } : null,
    useCase !== 'balanced' ? { key: 'useCase', label: `Use Case: ${useCaseLabelMap[useCase]}` } : null
  ].filter(Boolean) as Array<{ key: string; label: string }>;

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link href="/wiki" className="text-emerald-600 hover:text-emerald-700 text-sm font-medium mb-4 inline-flex items-center gap-2">
            ← Zurück zur Wiki
          </Link>
          <div className="mb-3">
            <Link href={'/fertilizers/coverage' as Route} className="text-sm font-medium text-slate-700 hover:text-slate-900 underline-offset-2 hover:underline">
              Coverage Audit öffnen
            </Link>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">🌿 Dünger-Katalog</h1>
          <p className="text-lg text-slate-600">{fertilizerCatalog.length} professionelle Dünger für alle Phasen und Budgets</p>
          <p className="text-sm text-slate-500 mt-1">Zeige {filtered.length} Treffer, Seite {safePage} von {totalPages}</p>
          <p className="text-sm mt-1 text-emerald-700 font-medium">
            Marktabdeckung: {fertilizerCoverageStats.coveredProducts} von ca. {fertilizerCoverageStats.trackedMarketEstimate} Linien ({fertilizerCoverageStats.coveragePercent}%)
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-500">Schnellwahl Marken:</span>
            {topBrands.map((brand) => (
              <button key={brand} onClick={() => setSelectedBrand(brand)} className="px-2.5 py-1 rounded-full text-xs border border-slate-300 bg-white hover:border-emerald-300">
                {brand}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-emerald-500"><div className="text-sm text-slate-600">Gesamt</div><div className="text-3xl font-bold text-slate-900">{filtered.length}</div></div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500"><div className="text-sm text-slate-600">Marken</div><div className="text-3xl font-bold text-slate-900">{new Set(filtered.map((f) => f.brand)).size}</div></div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-amber-500"><div className="text-sm text-slate-600">Budget</div><div className="text-3xl font-bold text-slate-900">{filtered.filter((f) => f.cost === 'budget').length}</div></div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-orange-500"><div className="text-sm text-slate-600">Organisch</div><div className="text-3xl font-bold text-slate-900">{filtered.filter((f) => f.base === 'organic' || f.base === 'bio-organic').length}</div></div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-rose-500"><div className="text-sm text-slate-600">Premium</div><div className="text-3xl font-bold text-slate-900">{filtered.filter((f) => f.cost === 'premium').length}</div></div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-8 border border-slate-200 sticky top-20 z-10">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Filter, Suche & Automationen</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-10 gap-4">
            <input ref={searchInputRef} type="text" placeholder="Suche nach Name, Marke, Mikronährstoff... (Shortcut /)" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 xl:col-span-2" />
            <select value={selectedPhase} onChange={(e) => setSelectedPhase(e.target.value as FertilizerPhase | 'all')} className="w-full px-4 py-2 border border-slate-300 rounded-lg"><option value="all">Alle Phasen</option><option value="veg">🌱 Veg</option><option value="flower">🌸 Blüte</option><option value="universal">⚙️ Universal</option></select>
            <select value={selectedBase} onChange={(e) => setSelectedBase(e.target.value as FertilizerBase | 'all')} className="w-full px-4 py-2 border border-slate-300 rounded-lg"><option value="all">Alle Typen</option><option value="mineral">Mineral</option><option value="organic">Organisch</option><option value="bio-organic">Bio-Organisch</option><option value="hybrid">Hybrid</option></select>
            <select value={selectedFormat} onChange={(e) => setSelectedFormat(e.target.value as FertilizerFormat | 'all')} className="w-full px-4 py-2 border border-slate-300 rounded-lg"><option value="all">Alle Formate</option><option value="liquid">Flüssig</option><option value="powder">Pulver</option><option value="pellets">Pellets</option><option value="granules">Granulat</option></select>
            <select value={selectedApplication} onChange={(e) => setSelectedApplication(e.target.value as FertilizerApplication | 'all')} className="w-full px-4 py-2 border border-slate-300 rounded-lg"><option value="all">Wasser / Erde</option><option value="water">Für Wasser</option><option value="soil">Für Erde</option><option value="both">Für Wasser + Erde</option></select>
            <select value={selectedBrand} onChange={(e) => setSelectedBrand(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg"><option value="all">Alle Marken</option>{brands.map((brand) => <option key={brand} value={brand}>{brand}</option>)}</select>
            <select value={selectedCost} onChange={(e) => setSelectedCost(e.target.value as 'budget' | 'mid' | 'premium' | 'all')} className="w-full px-4 py-2 border border-slate-300 rounded-lg"><option value="all">Alle Preise</option><option value="budget">💚 Budget</option><option value="mid">💛 Mittel</option><option value="premium">💜 Premium</option></select>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortField)} className="w-full px-4 py-2 border border-slate-300 rounded-lg"><option value="best-match">Best Match (intelligent)</option><option value="name">Nach Name</option><option value="npk-total">Nach NPK-Gesamt</option><option value="ec-min">Nach EC-Min</option><option value="ppfd-min">Nach PPFD-Min</option><option value="cost">Nach Preis</option></select>
            <select value={useCase} onChange={(e) => setUseCase(e.target.value as UseCase)} className="w-full px-4 py-2 border border-slate-300 rounded-lg"><option value="balanced">Use Case: Ausgewogen</option><option value="hydro-performance">Use Case: Hydro Performance</option><option value="soil-organic">Use Case: Erde & Organisch</option><option value="budget-smart">Use Case: Budget Smart</option><option value="max-yield">Use Case: Maximaler Ertrag</option></select>
            <select value={viewMode} onChange={(e) => setViewMode(e.target.value as ViewMode)} className="w-full px-4 py-2 border border-slate-300 rounded-lg"><option value="grid">Ansicht: Grid</option><option value="list">Ansicht: Liste</option></select>
            <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} className="w-full px-4 py-2 border border-slate-300 rounded-lg"><option value={12}>12 pro Seite</option><option value={24}>24 pro Seite</option><option value={48}>48 pro Seite</option><option value={72}>72 pro Seite</option></select>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-[1.6fr_1fr_auto] items-end">
            <input type="text" value={profileName} onChange={(e) => setProfileName(e.target.value)} placeholder="Filterprofil-Name (z.B. Hydro Pro)" className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
            <div className="text-xs text-slate-500">Speichert Suche, Filter, Sortierung und Use-Case lokal im Browser.</div>
            <button
              onClick={() => {
                const name = profileName.trim();
                if (!name) return;
                const id = name.toLowerCase().replace(/\s+/g, '-');
                const payload: FilterProfile = {
                  id,
                  name,
                  filters: { searchQuery, selectedPhase, selectedBase, selectedFormat, selectedApplication, selectedBrand, selectedCost, sortBy, useCase }
                };
                setProfiles((prev) => [payload, ...prev.filter((p) => p.id !== id)].slice(0, 12));
                setProfileName('');
              }}
              className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
            >
              Profil speichern
            </button>
          </div>

          {profiles.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {profiles.map((profile) => (
                <div key={profile.id} className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-white px-2 py-1">
                  <button
                    onClick={() => {
                      setSearchQuery(profile.filters.searchQuery);
                      setSelectedPhase(profile.filters.selectedPhase);
                      setSelectedBase(profile.filters.selectedBase);
                      setSelectedFormat(profile.filters.selectedFormat);
                      setSelectedApplication(profile.filters.selectedApplication);
                      setSelectedBrand(profile.filters.selectedBrand);
                      setSelectedCost(profile.filters.selectedCost);
                      setSortBy(profile.filters.sortBy);
                      setUseCase(profile.filters.useCase);
                    }}
                    className="text-xs text-slate-700 hover:text-slate-900"
                  >
                    {profile.name}
                  </button>
                  <button onClick={() => setProfiles((prev) => prev.filter((p) => p.id !== profile.id))} className="text-xs text-rose-600 hover:text-rose-700 px-1" aria-label={`Profil ${profile.name} löschen`}>
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {(searchQuery || selectedPhase !== 'all' || selectedBase !== 'all' || selectedFormat !== 'all' || selectedApplication !== 'all' || selectedBrand !== 'all' || selectedCost !== 'all' || useCase !== 'balanced') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedPhase('all');
                setSelectedBase('all');
                setSelectedFormat('all');
                setSelectedApplication('all');
                setSelectedBrand('all');
                setSelectedCost('all');
                setUseCase('balanced');
                setSortBy('best-match');
              }}
              className="mt-4 px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium rounded-lg transition"
            >
              Filter zurücksetzen
            </button>
          )}
        </div>

        {activeFilterChips.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {activeFilterChips.map((chip) => (
              <span key={chip.key} className="inline-flex items-center rounded-full border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-700">{chip.label}</span>
            ))}
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow border border-slate-200">
            <p className="text-slate-600">Keine Dünger gefunden, die deinen Kriterien entsprechen.</p>
            <button
              onClick={() => {
                setSelectedBrand('all');
                setSelectedApplication('all');
                setSelectedCost('all');
                setSearchQuery('');
                setUseCase('balanced');
                setSortBy('best-match');
              }}
              className="mt-4 px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
            >
              Auto-Reset auf breite Suche
            </button>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6' : 'space-y-4'}>
            {paged.map((fert) => (
              <div key={fert.id} className={`bg-white rounded-lg shadow hover:shadow-lg transition-all border border-slate-200 overflow-hidden ${viewMode === 'list' ? 'p-4' : ''}`}>
                <div className={`p-4 ${viewMode === 'grid' ? 'border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100' : 'bg-slate-50 rounded-lg mb-3'}`}>
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <div>
                      <h3 className="font-bold text-lg text-slate-900">{fert.name}</h3>
                      <p className="text-sm text-slate-600">{fert.brand}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="px-2 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">Match {Math.round(computeMatchScore(fert))}</div>
                      <div className={`px-3 py-1 rounded-full text-xs font-semibold ${costColorMap[fert.cost]}`}>{costLabelMap[fert.cost]}</div>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 line-clamp-2">{fert.description}</p>
                </div>

                <div className={viewMode === 'grid' ? 'p-4 space-y-2' : 'space-y-2'}>
                  <div className="flex flex-wrap gap-2">{fert.phase.map((p) => <span key={p} className="inline-block px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded">{phaseLabelMap[p]}</span>)}</div>
                  <div className="grid grid-cols-3 gap-2 text-center py-2 bg-slate-50 rounded">
                    <div><div className="text-xl font-bold text-blue-600">{fert.npk.n}</div><div className="text-xs text-slate-600">N</div></div>
                    <div><div className="text-xl font-bold text-orange-600">{fert.npk.p}</div><div className="text-xs text-slate-600">P</div></div>
                    <div><div className="text-xl font-bold text-red-600">{fert.npk.k}</div><div className="text-xs text-slate-600">K</div></div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="bg-blue-50 p-2 rounded"><div className="text-xs text-slate-600">EC-Range</div><div className="font-semibold text-slate-900">{fert.ec_range.min} - {fert.ec_range.max} {fert.ec_range.unit}</div></div>
                    {fert.ppfd_recommendation && <div className="bg-amber-50 p-2 rounded"><div className="text-xs text-slate-600">PPFD</div><div className="font-semibold text-slate-900">{fert.ppfd_recommendation.min}-{fert.ppfd_recommendation.max}</div></div>}
                  </div>
                  <div className="text-xs text-slate-600"><span className="font-semibold text-slate-900">{baseLabelMap[fert.base]}</span> • {formatLabelMap[fert.format]} • {applicationLabelMap[resolveApplication(fert)]}</div>
                  <div className="flex flex-wrap gap-1">
                    {fert.tags.slice(0, 3).map((tag) => <span key={tag} className="inline-block px-2 py-0.5 bg-slate-200 text-slate-700 text-xs rounded">{tag}</span>)}
                    {fert.tags.length > 3 && <span className="inline-block px-2 py-0.5 bg-slate-200 text-slate-700 text-xs rounded">+{fert.tags.length - 3}</span>}
                  </div>
                </div>

                <div className={viewMode === 'grid' ? 'p-4 border-t border-slate-200' : 'pt-3 border-t border-slate-200'}>
                  <button onClick={() => toggleDetails(fert.id)} className="w-full px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold rounded-lg transition">
                    {showDetails.has(fert.id) ? '▼ Details' : '▶ Details'}
                  </button>
                  {showDetails.has(fert.id) && (
                    <div className="mt-4 space-y-3 pt-4 border-t border-slate-200">
                      <div>
                        <h4 className="font-semibold text-slate-900 text-sm mb-1">Nährstoff-Profil</h4>
                        <div className="text-sm text-slate-600 space-y-1">
                          <div><span className="font-medium">N:</span> {fert.npk.n}%</div>
                          <div><span className="font-medium">P:</span> {fert.npk.p}%</div>
                          <div><span className="font-medium">K:</span> {fert.npk.k}%</div>
                          <div><span className="font-medium">NPK-Gesamt:</span> {fert.npk.n + fert.npk.p + fert.npk.k}%</div>
                        </div>
                      </div>
                      {fert.micronutrients.length > 0 && <div><h4 className="font-semibold text-slate-900 text-sm mb-1">Mikronährstoffe</h4><div className="text-sm text-slate-600">{fert.micronutrients.join(', ')}</div></div>}
                      {fert.dilutionRatio && <div><h4 className="font-semibold text-slate-900 text-sm mb-1">Dosierung</h4><div className="text-sm text-slate-600 font-mono bg-slate-50 p-2 rounded">{fert.dilutionRatio}</div></div>}
                      {fert.ph_range && <div><h4 className="font-semibold text-slate-900 text-sm mb-1">pH-Bereich</h4><div className="text-sm text-slate-600">{fert.ph_range.min} - {fert.ph_range.max}</div></div>}
                      <div>
                        <h4 className="font-semibold text-slate-900 text-sm mb-1">Ertragspotenzial</h4>
                        <div className="text-sm font-semibold">{fert.yeild_potential === 'average' && '⭐ Durchschnitt'}{fert.yeild_potential === 'high' && '⭐⭐ Hoch'}{fert.yeild_potential === 'very_high' && '⭐⭐⭐ Sehr Hoch'}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {filtered.length > pageSize && (
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={safePage === 1} className="px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 disabled:opacity-40">Zurück</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - safePage) <= 2)
              .map((p) => (
                <button key={p} onClick={() => setCurrentPage(p)} className={`px-3 py-2 rounded-lg border text-sm ${p === safePage ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-semibold' : 'border-slate-300 bg-white text-slate-700'}`}>
                  {p}
                </button>
              ))}
            <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={safePage === totalPages} className="px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 disabled:opacity-40">Weiter</button>
          </div>
        )}

        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">💡 Hinweis</h3>
          <p className="text-blue-800 text-sm">
            Die angegebenen Werte sind Richtlinien. Die genaue Dosierung hängt vom Anbau-Setup, Wasser-Qualität,
            Licht-Intensität und Nährstoff-Status ab. Beginne immer mit niedriger EC und steigere schrittweise.
            Regelmäßige Blatt- und Boden-Tests sind essentiell für optimale Ergebnisse.
          </p>
        </div>
      </div>
    </main>
  );
}
