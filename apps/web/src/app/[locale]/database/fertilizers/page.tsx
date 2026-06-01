'use client';

import { useState, useMemo, useEffect, useDeferredValue, useRef, useCallback, Suspense, type ReactNode } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  fertilizerCatalog,
  FertilizerPhase,
  FertilizerBase,
  FertilizerProfile,
  FertilizerFormat,
  FertilizerApplication
} from '@/data/terpira/fertilizers';
import {
  filterOffers,
  fertilizerPriceSnapshot,
  formatEuro,
  getEffectivePrice,
  getOffersForProduct
} from '@/data/terpira/fertilizerPrices';
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

const useCaseLabelMap: Record<UseCase, string> = {
  balanced: 'Ausgewogen',
  'hydro-performance': 'Hydro Leistung',
  'soil-organic': 'Erde & Organisch',
  'budget-smart': 'Budget Klar',
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

const UMLAUT_MAP: Record<string, string> = {
  ä: 'ae',
  ö: 'oe',
  ü: 'ue',
  ß: 'ss'
};

const SEARCH_SYNONYMS: Record<string, string[]> = {
  bluete: ['flower', 'bloom', 'flores'],
  grow: ['veg', 'vega', 'wachstum'],
  hydro: ['wasser', 'coco'],
  coco: ['hydro', 'wasser'],
  organisch: ['bio', 'organic', 'bio-organic'],
  duenger: ['fertilizer', 'nutrients'],
  kalzium: ['calcium', 'ca'],
  magnesium: ['mg']
};

function normalizeSearch(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[äöüß]/g, (c) => UMLAUT_MAP[c] ?? c)
    .replace(/[^a-z0-9\s.-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenizeSearch(input: string): string[] {
  return normalizeSearch(input)
    .split(' ')
    .map((t) => t.trim())
    .filter((t) => t.length >= 2);
}

function levenshteinDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const dp: number[] = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i += 1) {
    let prev = dp[0] ?? 0;
    dp[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const tmp = dp[j] ?? 0;
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[j] = Math.min((dp[j] ?? 0) + 1, (dp[j - 1] ?? 0) + 1, prev + cost);
      prev = tmp;
    }
  }
  return dp[b.length] ?? 0;
}

function fuzzyTokenHit(token: string, words: string[]): boolean {
  if (token.length < 4) return false;
  for (const word of words) {
    if (Math.abs(word.length - token.length) > 1) continue;
    if (levenshteinDistance(token, word) <= 1) return true;
  }
  return false;
}

function escapeRegExp(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function highlightMatches(text: string, terms: string[]): ReactNode {
  if (!text || terms.length === 0) return text;

  const uniqueTerms = Array.from(new Set(terms.map((t) => t.trim()).filter((t) => t.length >= 2)));
  if (uniqueTerms.length === 0) return text;

  const pattern = new RegExp(`(${uniqueTerms.map((t) => escapeRegExp(t)).join('|')})`, 'gi');
  const parts = text.split(pattern);

  return parts.map((part, index) => {
    const normalizedPart = normalizeSearch(part);
    const isMatch = uniqueTerms.some((term) => normalizedPart === normalizeSearch(term));
    if (!isMatch) return <span key={`${part}-${index}`}>{part}</span>;
    return (
      <mark key={`${part}-${index}`} className="rounded bg-amber-100 px-0.5 text-amber-900">
        {part}
      </mark>
    );
  });
}

function FertilizersPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const hasInitializedFromUrl = useRef(false);

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
  const [priceRegion, setPriceRegion] = useState<'all' | 'DE' | 'AT' | 'CH' | 'EU' | 'OTHER'>('all');
  const [priceOnlyAvailable, setPriceOnlyAvailable] = useState(false);
  const [priceOnlyWithShipping] = useState(false);
  const [excludedShops] = useState<string[]>([]);
  const [sortByCheapestEffective] = useState(false);
  const [profiles, setProfiles] = useState<FilterProfile[]>([]);
  const deferredSearch = useDeferredValue(searchQuery);

  const searchIndex = useMemo(() => {
    const map = new Map<string, { name: string; brand: string; tags: string; desc: string; micro: string; id: string; words: string[] }>();
    for (const f of fertilizerCatalog) {
      const name = normalizeSearch(f.name);
      const brand = normalizeSearch(f.brand);
      const tags = normalizeSearch(f.tags.join(' '));
      const desc = normalizeSearch(f.description);
      const micro = normalizeSearch(f.micronutrients.join(' '));
      const id = normalizeSearch(f.id);
      const words = Array.from(new Set(tokenizeSearch(`${name} ${brand} ${tags} ${micro}`)));
      map.set(f.id, { name, brand, tags, desc, micro, id, words });
    }
    return map;
  }, []);

  const expandedSearchTokens = useMemo(() => {
    const baseTokens = tokenizeSearch(deferredSearch);
    if (baseTokens.length === 0) return [] as string[];
    const out = new Set<string>(baseTokens);
    for (const token of baseTokens) {
      const synonyms = SEARCH_SYNONYMS[token] ?? [];
      for (const s of synonyms) out.add(s);
    }
    return Array.from(out);
  }, [deferredSearch]);

  const highlightTerms = useMemo(() => {
    return tokenizeSearch(searchQuery).slice(0, 8);
  }, [searchQuery]);

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

  const suggestionLexicon = useMemo(() => {
    const tagCounts = new Map<string, { label: string; count: number }>();
    for (const item of fertilizerCatalog) {
      for (const tag of item.tags) {
        const normalized = normalizeSearch(tag);
        if (!normalized || normalized.length < 4) continue;
        const prev = tagCounts.get(normalized);
        tagCounts.set(normalized, {
          label: tag,
          count: (prev?.count ?? 0) + 1
        });
      }
    }

    const fixedTerms = [
      'blüte',
      'flower',
      'grow',
      'veg',
      'hydro',
      'wasser',
      'erde',
      'coco',
      'organisch',
      'mineral',
      'calmag',
      'silica',
      'booster',
      'pk',
      'budget',
      'premium'
    ];

    const entries: Array<{ norm: string; label: string; weight: number }> = [];
    for (const brand of brands) {
      entries.push({ norm: normalizeSearch(brand), label: brand, weight: 120 });
    }
    for (const term of fixedTerms) {
      entries.push({ norm: normalizeSearch(term), label: term, weight: 80 });
    }
    for (const [norm, data] of Array.from(tagCounts.entries()).sort((a, b) => b[1].count - a[1].count).slice(0, 60)) {
      entries.push({ norm, label: data.label, weight: 50 + data.count });
    }

    const unique = new Map<string, { norm: string; label: string; weight: number }>();
    for (const entry of entries) {
      const existing = unique.get(entry.norm);
      if (!existing || entry.weight > existing.weight) {
        unique.set(entry.norm, entry);
      }
    }

    return Array.from(unique.values());
  }, [brands]);

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

  const computeMatchScore = useCallback((f: FertilizerProfile): number => {
    let score = 0;

    if (selectedPhase === 'all' || f.phase.includes(selectedPhase)) score += 12;
    if (selectedBase === 'all' || f.base === selectedBase) score += 10;
    if (selectedFormat === 'all' || f.format === selectedFormat) score += 7;
    if (selectedApplication === 'all' || resolveApplication(f) === selectedApplication) score += 10;
    if (selectedBrand === 'all' || f.brand === selectedBrand) score += 8;
    if (selectedCost === 'all' || f.cost === selectedCost) score += 8;

    const normalizedQuery = normalizeSearch(deferredSearch);
    if (!normalizedQuery) {
      score += 5;
    } else {
      const idx = searchIndex.get(f.id);
      if (idx) {
        if (idx.name.includes(normalizedQuery)) score += 20;
        if (idx.brand.includes(normalizedQuery)) score += 14;

        let tokenHits = 0;
        for (const token of expandedSearchTokens) {
          let tokenScore = 0;
          if (idx.name.includes(token)) tokenScore = Math.max(tokenScore, 14);
          if (idx.brand.includes(token)) tokenScore = Math.max(tokenScore, 12);
          if (idx.tags.includes(token)) tokenScore = Math.max(tokenScore, 10);
          if (idx.micro.includes(token)) tokenScore = Math.max(tokenScore, 8);
          if (idx.desc.includes(token)) tokenScore = Math.max(tokenScore, 6);
          if (idx.id.includes(token)) tokenScore = Math.max(tokenScore, 8);

          if (tokenScore === 0 && fuzzyTokenHit(token, idx.words)) {
            tokenScore = 4;
          }

          if (tokenScore > 0) {
            tokenHits += 1;
            score += tokenScore;
          }
        }

        // Bonus for broad token coverage so multi-word searches rank better.
        if (expandedSearchTokens.length > 0) {
          const coverage = tokenHits / expandedSearchTokens.length;
          score += coverage * 18;
        }
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
  }, [selectedPhase, selectedBase, selectedFormat, selectedApplication, selectedBrand, selectedCost, deferredSearch, searchIndex, expandedSearchTokens, useCase]);

  const filtered = useMemo(() => {
    let result = fertilizerCatalog;

    if (selectedPhase !== 'all') result = result.filter((f) => f.phase.includes(selectedPhase));
    if (selectedBase !== 'all') result = result.filter((f) => f.base === selectedBase);
    if (selectedFormat !== 'all') result = result.filter((f) => f.format === selectedFormat);
    if (selectedApplication !== 'all') result = result.filter((f) => resolveApplication(f) === selectedApplication);
    if (selectedBrand !== 'all') result = result.filter((f) => f.brand === selectedBrand);
    if (selectedCost !== 'all') result = result.filter((f) => f.cost === selectedCost);

    if (expandedSearchTokens.length > 0) {
      result = result.filter((f) => {
        const idx = searchIndex.get(f.id);
        if (!idx) return false;
        const hits = expandedSearchTokens.reduce((count, token) => {
          const directHit =
            idx.name.includes(token) ||
            idx.brand.includes(token) ||
            idx.id.includes(token) ||
            idx.desc.includes(token) ||
            idx.micro.includes(token) ||
            idx.tags.includes(token);
          if (directHit || fuzzyTokenHit(token, idx.words)) return count + 1;
          return count;
        }, 0);

        // Keep high precision on short searches and allow softer matching for longer inputs.
        const minRequired = expandedSearchTokens.length <= 2 ? expandedSearchTokens.length : Math.ceil(expandedSearchTokens.length * 0.6);
        return hits >= minRequired;
      });
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
  }, [expandedSearchTokens, searchIndex, selectedPhase, selectedBase, selectedFormat, selectedApplication, selectedBrand, selectedCost, sortBy, computeMatchScore]);

  const suggestedQueries = useMemo(() => {
    const rawQuery = searchQuery.trim();
    if (!rawQuery || rawQuery.length < 3) return [] as string[];

    const normalized = normalizeSearch(rawQuery);
    const tokens = normalized.split(' ').filter((t) => t.length >= 2);
    if (tokens.length === 0) return [] as string[];

    const suggestions = new Set<string>();

    tokens.forEach((token, index) => {
      if (token.length < 3) return;

      const matches = suggestionLexicon
        .filter((entry) => entry.norm !== token && Math.abs(entry.norm.length - token.length) <= 3)
        .map((entry) => {
          const distance = levenshteinDistance(token, entry.norm);
          return {
            replacement: entry.label,
            distance,
            weight: entry.weight,
            norm: entry.norm
          };
        })
        .filter((candidate) => {
          const maxDistance = token.length <= 4 ? 1 : 2;
          return candidate.distance <= maxDistance;
        })
        .sort((a, b) => {
          if (a.distance !== b.distance) return a.distance - b.distance;
          return b.weight - a.weight;
        })
        .slice(0, filtered.length === 0 ? 3 : 2);

      for (const candidate of matches) {
        const nextTokens = [...tokens];
        nextTokens[index] = candidate.replacement;
        suggestions.add(nextTokens.join(' '));
      }
    });

    if (tokens.length === 1) {
      const single = tokens[0] ?? '';
      const brandBoost = brands
        .map((brand) => ({ brand, norm: normalizeSearch(brand) }))
        .map((entry) => ({
          ...entry,
          distance: levenshteinDistance(single, entry.norm)
        }))
        .filter((entry) => entry.distance <= (single.length <= 4 ? 1 : 2))
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 2);

      for (const item of brandBoost) suggestions.add(item.brand);
    }

    return Array.from(suggestions)
      .filter((s) => normalizeSearch(s) !== normalized)
      .slice(0, 4);
  }, [searchQuery, suggestionLexicon, brands, filtered.length]);

  useEffect(() => {
    if (hasInitializedFromUrl.current) return;
    const t = setTimeout(() => {
      const qs = new URLSearchParams(searchParams.toString());

      const queryValue = qs.get('q') ?? '';
      if (queryValue) setSearchQuery(queryValue);

      const phaseValue = qs.get('phase');
      if (phaseValue && ['veg', 'flower', 'universal'].includes(phaseValue))
        setSelectedPhase(phaseValue as FertilizerPhase);

      const baseValue = qs.get('base');
      if (baseValue && ['mineral', 'organic', 'bio-organic', 'hybrid'].includes(baseValue))
        setSelectedBase(baseValue as FertilizerBase);

      const costValue = qs.get('cost');
      if (costValue && ['budget', 'mid', 'premium'].includes(costValue))
        setSelectedCost(costValue as 'budget' | 'mid' | 'premium');

      const useCaseValue = qs.get('useCase');
      if (useCaseValue && ['balanced', 'hydro-performance', 'soil-organic', 'budget-smart', 'max-yield'].includes(useCaseValue))
        setUseCase(useCaseValue as UseCase);

      hasInitializedFromUrl.current = true;
    }, 0);
    return () => clearTimeout(t);
  }, [searchParams]);

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
    const nextQuery = searchQuery.trim();
    const currentQuery = qs.get('q') ?? '';
    if (nextQuery === currentQuery) return;

    if (nextQuery) qs.set('q', nextQuery);
    else qs.delete('q');
    const next = qs.toString() ? `/database/fertilizers?${qs.toString()}` : '/database/fertilizers';
    router.replace(next as Route, { scroll: false });
  }, [searchQuery, router, searchParams]);

  useEffect(() => {
    const t = setTimeout(() => setCurrentPage(1), 0);
    return () => clearTimeout(t);
  }, [searchQuery, selectedPhase, selectedBase, selectedFormat, selectedApplication, selectedBrand, selectedCost, sortBy, pageSize, useCase]);

  useEffect(() => {
    const t = setTimeout(() => {
      try {
        const raw = localStorage.getItem(FILTER_PROFILE_STORAGE_KEY);
        if (!raw) return;
        const parsed = JSON.parse(raw) as FilterProfile[];
        if (Array.isArray(parsed)) setProfiles(parsed.slice(0, 12));
      } catch {
        // ignore invalid profile storage content
      }
    }, 0);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    localStorage.setItem(FILTER_PROFILE_STORAGE_KEY, JSON.stringify(profiles));
  }, [profiles]);

  const getVisibleOffers = useCallback((productId: string, limit?: number) => {
    const offers = getOffersForProduct(productId, 20);
    const visible = filterOffers(offers, {
      region: priceRegion,
      onlyAvailable: priceOnlyAvailable,
      onlyWithShipping: priceOnlyWithShipping
    })
      .filter((offer) => !excludedShops.includes(offer.shop));

    if (typeof limit === 'number') return visible.slice(0, limit);
    return visible;
  }, [priceRegion, priceOnlyAvailable, priceOnlyWithShipping, excludedShops]);

  const bestEffectiveById = useMemo(() => {
    const map = new Map<string, number | null>();
    for (const item of filtered) {
      const offers = getVisibleOffers(item.id, 1);
      map.set(item.id, offers[0] ? getEffectivePrice(offers[0]) : null);
    }
    return map;
  }, [filtered, getVisibleOffers]);

  const sortedVisible = useMemo(() => {
    if (!sortByCheapestEffective) return filtered;
    return [...filtered].sort((a, b) => {
      const pa = bestEffectiveById.get(a.id);
      const pb = bestEffectiveById.get(b.id);
      if (pa == null && pb == null) return 0;
      if (pa == null) return 1;
      if (pb == null) return -1;
      return pa - pb;
    });
  }, [filtered, sortByCheapestEffective, bestEffectiveById]);

  const totalVisible = sortedVisible.length;
  const totalPagesVisible = Math.max(1, Math.ceil(totalVisible / pageSize));
  const safePage = Math.min(currentPage, totalPagesVisible);
  const startIndex = (safePage - 1) * pageSize;
  const paged = sortedVisible.slice(startIndex, startIndex + pageSize);

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

  const hasActiveFilters =
    searchQuery ||
    selectedPhase !== 'all' ||
    selectedBase !== 'all' ||
    selectedFormat !== 'all' ||
    selectedApplication !== 'all' ||
    selectedBrand !== 'all' ||
    selectedCost !== 'all' ||
    useCase !== 'balanced';

  return (
    <main className="min-h-screen bg-white">

      {/* ── Sticky filter bar ──────────────────────────────────────── */}
      <div className="sticky top-[60px] z-20 border-b border-slate-200 bg-white/95 backdrop-blur-sm shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-3">

          {/* Row 1: breadcrumb + search */}
          <div className="flex flex-wrap items-center gap-3">
            <Link href={"/database" as Route} className="shrink-0 text-xs font-medium text-slate-400 hover:text-emerald-600">
              ← Katalog
            </Link>
            <div className="h-4 w-px bg-slate-200" />
            <div className="relative min-w-[180px] flex-1 max-w-sm">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Suchen… (Taste /)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-3 pr-8 text-sm focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  ×
                </button>
              )}
            </div>

            {/* Quick phase pills */}
            <div className="hidden sm:flex items-center gap-1.5">
              {(['all', 'veg', 'flower', 'universal'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setSelectedPhase(p)}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                    selectedPhase === p
                      ? 'border-emerald-500 bg-emerald-500 text-white'
                      : 'border-slate-200 bg-white text-slate-500 hover:border-emerald-300 hover:text-emerald-700'
                  }`}
                >
                  {p === 'all' ? 'Alle Phasen' : phaseLabelMap[p]}
                </button>
              ))}
            </div>

            {/* Quick cost pills */}
            <div className="hidden md:flex items-center gap-1.5">
              {(['all', 'budget', 'mid', 'premium'] as const).map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedCost(c === 'all' ? 'all' : c)}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                    selectedCost === c
                      ? 'border-slate-700 bg-slate-700 text-white'
                      : 'border-slate-200 bg-white text-slate-500 hover:border-slate-400'
                  }`}
                >
                  {c === 'all' ? 'Alle Preise' : costLabelMap[c]}
                </button>
              ))}
            </div>

            <div className="ml-auto flex items-center gap-2 shrink-0">
              <span className="hidden sm:inline text-xs text-slate-400 tabular-nums">
                {totalVisible} Treffer
              </span>
              {hasActiveFilters && (
                <button
                  onClick={() => {
                    setSearchQuery(''); setSelectedPhase('all'); setSelectedBase('all');
                    setSelectedFormat('all'); setSelectedApplication('all'); setSelectedBrand('all');
                    setSelectedCost('all'); setUseCase('balanced'); setSortBy('best-match');
                  }}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-500 hover:border-rose-300 hover:text-rose-600"
                >
                  Filter löschen ×
                </button>
              )}
              <select
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value as ViewMode)}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-600"
              >
                <option value="grid">⊞ Kacheln</option>
                <option value="list">☰ Liste</option>
              </select>
            </div>
          </div>

          {/* Row 2: More filters (collapsible via checkbox trick / always visible compact row) */}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <select
              value={selectedBase}
              onChange={(e) => setSelectedBase(e.target.value as FertilizerBase | 'all')}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-600"
            >
              <option value="all">Alle Typen</option>
              <option value="mineral">Mineral</option>
              <option value="organic">Organisch</option>
              <option value="bio-organic">Bio-Organisch</option>
              <option value="hybrid">Hybrid</option>
            </select>
            <select
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value as FertilizerFormat | 'all')}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-600"
            >
              <option value="all">Alle Formate</option>
              <option value="liquid">Flüssig</option>
              <option value="powder">Pulver</option>
              <option value="pellets">Pellets</option>
              <option value="granules">Granulat</option>
            </select>
            <select
              value={selectedApplication}
              onChange={(e) => setSelectedApplication(e.target.value as FertilizerApplication | 'all')}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-600"
            >
              <option value="all">Wasser / Erde</option>
              <option value="water">Nur Wasser</option>
              <option value="soil">Nur Erde</option>
              <option value="both">Wasser + Erde</option>
            </select>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-600"
            >
              <option value="all">Alle Marken</option>
              {brands.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
            <select
              value={useCase}
              onChange={(e) => setUseCase(e.target.value as UseCase)}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-600"
            >
              <option value="balanced">Verwendung: Alle</option>
              <option value="hydro-performance">Hydro / Coco</option>
              <option value="soil-organic">Erde & Bio</option>
              <option value="budget-smart">Budget Klar</option>
              <option value="max-yield">Max. Ertrag</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortField)}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-600"
            >
              <option value="best-match">Sortierung: Beste Treffer</option>
              <option value="name">A – Z</option>
              <option value="cost">Preis aufst.</option>
              <option value="npk-total">NPK-Gesamt</option>
              <option value="ec-min">EC-Min</option>
            </select>
            <select
              value={priceRegion}
              onChange={(e) => setPriceRegion(e.target.value as 'all' | 'DE' | 'AT' | 'CH' | 'EU' | 'OTHER')}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-600"
            >
              <option value="all">Preise: Alle Länder</option>
              <option value="DE">Deutschland</option>
              <option value="AT">Österreich</option>
              <option value="CH">Schweiz</option>
              <option value="EU">EU</option>
            </select>
            <label className="inline-flex items-center gap-1.5 text-xs text-slate-500 cursor-pointer">
              <input
                type="checkbox"
                checked={priceOnlyAvailable}
                onChange={(e) => setPriceOnlyAvailable(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-slate-300"
              />
              Nur verfügbar
            </label>
          </div>

          {/* Active filter chips */}
          {activeFilterChips.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {activeFilterChips.map((chip) => (
                <span key={chip.key} className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800">
                  {chip.label}
                </span>
              ))}
            </div>
          )}

          {/* Spell-check suggestions */}
          {suggestedQueries.length > 0 && (
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-amber-700 font-medium">Meintest du:</span>
              {suggestedQueries.map((s) => (
                <button key={s} onClick={() => setSearchQuery(s)} className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-800 hover:bg-amber-100">
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Content ────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 pt-6 pb-14">

        {/* Top brand chips */}
        <div className="mb-5 flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-slate-400 shrink-0">Marken:</span>
          {topBrands.map((brand) => (
            <button
              key={brand}
              onClick={() => setSelectedBrand(selectedBrand === brand ? 'all' : brand)}
              className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors ${
                selectedBrand === brand
                  ? 'border-emerald-500 bg-emerald-500 text-white'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-emerald-300'
              }`}
            >
              {brand}
            </button>
          ))}
        </div>

        {/* No results */}
        {totalVisible === 0 ? (
          <div className="rounded-2xl border border-slate-100 bg-slate-50 py-16 text-center">
            <p className="text-2xl">🔍</p>
            <p className="mt-3 font-semibold text-slate-700">Keine Dünger gefunden</p>
            <p className="mt-1 text-sm text-slate-500">Versuche weniger Filter oder eine andere Suche.</p>
            {suggestedQueries.length > 0 && (
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                {suggestedQueries.map((s) => (
                  <button key={s} onClick={() => setSearchQuery(s)} className="rounded-full border border-emerald-200 bg-white px-3 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-50">
                    {s}
                  </button>
                ))}
              </div>
            )}
            <button
              onClick={() => {
                setSearchQuery(''); setSelectedPhase('all'); setSelectedBase('all');
                setSelectedFormat('all'); setSelectedApplication('all'); setSelectedBrand('all');
                setSelectedCost('all'); setUseCase('balanced'); setSortBy('best-match');
              }}
              className="mt-5 rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              Alle Filter zurücksetzen
            </button>
          </div>
        ) : (
          <>
            {/* Product grid/list */}
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4' : 'space-y-3'}>
              {paged.map((fert) => {
                const offers = getVisibleOffers(fert.id);
                const bestPrice = offers[0] ? getEffectivePrice(offers[0]) : null;
                const isOpen = showDetails.has(fert.id);
                return (
                  <article
                    key={fert.id}
                    className={`group flex flex-col rounded-2xl border border-slate-200 bg-white transition-shadow hover:shadow-md ${viewMode === 'list' ? 'sm:flex-row sm:items-start' : ''}`}
                  >
                    {/* Card top */}
                    <div className={`flex flex-col gap-2 p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>

                      {/* Brand + badges row */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{fert.brand}</p>
                          <h3 className="mt-0.5 text-base font-bold leading-snug text-slate-900">
                            {highlightMatches(fert.name, highlightTerms)}
                          </h3>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${costColorMap[fert.cost]}`}>
                            {costLabelMap[fert.cost]}
                          </span>
                          {bestPrice != null ? (
                            <span className="rounded-full border border-cyan-200 bg-cyan-50 px-2 py-0.5 text-xs font-bold text-cyan-800">
                              ab {formatEuro(bestPrice)}
                            </span>
                          ) : (
                            <span className="rounded-full border border-slate-100 bg-slate-50 px-2 py-0.5 text-xs text-slate-400">
                              Kein Preis
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Phase chips */}
                      <div className="flex flex-wrap gap-1">
                        {fert.phase.map((p) => (
                          <span key={p} className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                            {phaseLabelMap[p]}
                          </span>
                        ))}
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">
                          {baseLabelMap[fert.base]}
                        </span>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">
                          {formatLabelMap[fert.format]}
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-xs leading-relaxed text-slate-500 line-clamp-2">
                        {highlightMatches(fert.description, highlightTerms)}
                      </p>

                      {/* NPK + EC strip */}
                      <div className="mt-1 flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2 text-xs">
                        <span className="font-bold text-blue-600">N {fert.npk.n}</span>
                        <span className="font-bold text-orange-500">P {fert.npk.p}</span>
                        <span className="font-bold text-red-500">K {fert.npk.k}</span>
                        <span className="ml-auto text-slate-400">EC {fert.ec_range.min}–{fert.ec_range.max}</span>
                        {fert.yeild_potential === 'very_high' && <span title="Sehr hohes Ertragspotenzial" className="text-amber-500">★★★</span>}
                        {fert.yeild_potential === 'high' && <span title="Hohes Ertragspotenzial" className="text-amber-400">★★</span>}
                        {fert.yeild_potential === 'average' && <span title="Durchschnittliches Ertragspotenzial" className="text-slate-300">★</span>}
                      </div>

                      {/* Tags (max 3) */}
                      {fert.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {fert.tags.slice(0, 3).map((tag) => (
                            <span key={tag} className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-500">
                              {highlightMatches(tag, highlightTerms)}
                            </span>
                          ))}
                          {fert.tags.length > 3 && (
                            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-400">
                              +{fert.tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Details toggle */}
                    <div className="border-t border-slate-100">
                      <button
                        onClick={() => toggleDetails(fert.id)}
                        className="flex w-full items-center justify-between px-4 py-2.5 text-xs font-semibold text-slate-500 hover:bg-slate-50 hover:text-emerald-700"
                      >
                        <span>{isOpen ? 'Details schließen' : 'Details & Preisvergleich'}</span>
                        <span className="text-base leading-none">{isOpen ? '▲' : '▼'}</span>
                      </button>

                      {isOpen && (
                        <div className="space-y-4 border-t border-slate-100 px-4 pb-4 pt-3">

                          {/* Prices */}
                          <div>
                            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Preisvergleich</p>
                            {offers.length > 0 ? (
                              <div className="space-y-2">
                                {offers.map((offer) => (
                                  <a
                                    key={`${offer.shop}-${offer.productUrl}`}
                                    href={offer.productUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 hover:border-emerald-200 hover:bg-emerald-50"
                                  >
                                    <div className="min-w-0 flex-1">
                                      <p className="truncate text-xs font-semibold text-slate-700">{offer.shop}</p>
                                      <p className="truncate text-[11px] text-slate-400">{offer.title}</p>
                                    </div>
                                    <div className="shrink-0 text-right">
                                      <p className="text-sm font-bold text-emerald-700">{formatEuro(getEffectivePrice(offer))}</p>
                                      {offer.shipping != null && (
                                        <p className="text-[11px] text-slate-400">+{formatEuro(offer.shipping)} Versand</p>
                                      )}
                                    </div>
                                  </a>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-slate-400">Keine Preise für den gewählten Filter.</p>
                            )}
                          </div>

                          {/* Nutrient detail */}
                          <div>
                            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Nährstoffprofil</p>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div className="rounded-lg bg-slate-50 px-3 py-2">
                                <span className="font-semibold text-slate-600">NPK:</span>{' '}
                                {fert.npk.n}–{fert.npk.p}–{fert.npk.k}
                              </div>
                              {fert.ph_range && (
                                <div className="rounded-lg bg-slate-50 px-3 py-2">
                                  <span className="font-semibold text-slate-600">pH:</span>{' '}
                                  {fert.ph_range.min}–{fert.ph_range.max}
                                </div>
                              )}
                              {fert.dilutionRatio && (
                                <div className="rounded-lg bg-slate-50 px-3 py-2 font-mono">
                                  <span className="font-sans font-semibold text-slate-600">Dosierung:</span>{' '}
                                  {fert.dilutionRatio}
                                </div>
                              )}
                              {fert.ppfd_recommendation && (
                                <div className="rounded-lg bg-slate-50 px-3 py-2">
                                  <span className="font-semibold text-slate-600">PPFD:</span>{' '}
                                  {fert.ppfd_recommendation.min}–{fert.ppfd_recommendation.max} µmol
                                </div>
                              )}
                            </div>
                            {fert.micronutrients.length > 0 && (
                              <p className="mt-2 text-[11px] text-slate-500">
                                <span className="font-semibold">Mikronährstoffe:</span>{' '}
                                {fert.micronutrients.join(', ')}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Pagination */}
            {totalVisible > pageSize && (
              <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={safePage === 1} className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 disabled:opacity-40 hover:border-emerald-300">
                    ← Zurück
                  </button>
                  {Array.from({ length: totalPagesVisible }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === totalPagesVisible || Math.abs(p - safePage) <= 2)
                    .map((p, i, arr) => {
                      const prev = arr[i - 1];
                      return [
                        prev != null && p - prev > 1 ? <span key={`gap-${p}`} className="px-1 text-slate-400">…</span> : null,
                        <button
                          key={p}
                          onClick={() => setCurrentPage(p)}
                          className={`rounded-lg border px-3.5 py-2 text-sm font-medium ${
                            p === safePage
                              ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                              : 'border-slate-200 bg-white text-slate-600 hover:border-emerald-300'
                          }`}
                        >
                          {p}
                        </button>
                      ];
                    })}
                  <button onClick={() => setCurrentPage((p) => Math.min(totalPagesVisible, p + 1))} disabled={safePage === totalPagesVisible} className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 disabled:opacity-40 hover:border-emerald-300">
                    Weiter →
                  </button>
                </div>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600"
                >
                  <option value={12}>12 / Seite</option>
                  <option value={24}>24 / Seite</option>
                  <option value={48}>48 / Seite</option>
                </select>
              </div>
            )}
          </>
        )}

        {/* Footer note */}
        <p className="mt-10 text-center text-[11px] text-slate-400">
          Preisquelle: {fertilizerPriceSnapshot.source} · zuletzt aktualisiert:{' '}
          {fertilizerPriceSnapshot.updatedAt
            ? new Date(fertilizerPriceSnapshot.updatedAt).toLocaleDateString('de-DE')
            : 'ausstehend'}{' '}
          · Werte sind Richtwerte, keine medizinische oder rechtliche Beratung.
        </p>
      </div>
    </main>
  );
}

export default function FertilizersPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <FertilizersPageInner />
    </Suspense>
  );
}
