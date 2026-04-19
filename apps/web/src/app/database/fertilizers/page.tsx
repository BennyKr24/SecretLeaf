'use client';

import { useState, useMemo, useEffect, useDeferredValue, useRef, Suspense, type ReactNode } from 'react';
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

const applicationLabelMap: Record<FertilizerApplication, string> = {
  water: 'Wasser',
  soil: 'Erde',
  both: 'Wasser + Erde'
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
  const [priceOnlyWithShipping, setPriceOnlyWithShipping] = useState(false);
  const [excludedShops, setExcludedShops] = useState<string[]>([]);
  const [sortByCheapestEffective, setSortByCheapestEffective] = useState(false);
  const [profileName, setProfileName] = useState('');
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

  const computeMatchScore = (f: FertilizerProfile): number => {
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
  };

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
  }, [expandedSearchTokens, searchIndex, selectedPhase, selectedBase, selectedFormat, selectedApplication, selectedBrand, selectedCost, sortBy, useCase]);

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

  const availableShops = useMemo(() => {
    const counts = new Map<string, number>();
    for (const offers of Object.values(fertilizerPriceSnapshot.offersByProduct)) {
      for (const offer of offers) {
        counts.set(offer.shop, (counts.get(offer.shop) ?? 0) + 1);
      }
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 24)
      .map(([shop, count]) => ({ shop, count }));
  }, []);

  const getVisibleOffers = (productId: string, limit?: number) => {
    const offers = getOffersForProduct(productId, 20);
    const visible = filterOffers(offers, {
      region: priceRegion,
      onlyAvailable: priceOnlyAvailable,
      onlyWithShipping: priceOnlyWithShipping
    })
      .filter((offer) => !excludedShops.includes(offer.shop));

    if (typeof limit === 'number') return visible.slice(0, limit);
    return visible;
  };

  const bestEffectiveById = useMemo(() => {
    const map = new Map<string, number | null>();
    for (const item of filtered) {
      const offers = getVisibleOffers(item.id, 1);
      map.set(item.id, offers[0] ? getEffectivePrice(offers[0]) : null);
    }
    return map;
  }, [filtered, priceRegion, priceOnlyAvailable, priceOnlyWithShipping, excludedShops]);

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

  const toggleExcludedShop = (shop: string) => {
    setExcludedShops((prev) => (prev.includes(shop) ? prev.filter((s) => s !== shop) : [...prev, shop]));
  };

  const pricedProducts = useMemo(
    () =>
      sortedVisible.filter((item) => {
        const value = bestEffectiveById.get(item.id);
        return value != null;
      }).length,
    [sortedVisible, bestEffectiveById]
  );

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
          <Link href={"/database" as Route} className="text-emerald-600 hover:text-emerald-700 text-sm font-medium mb-4 inline-flex items-center gap-2">
            ← Katalog-Übersicht
          </Link>
          <div className="mb-3 flex flex-wrap items-center gap-4">
            <Link href={'/tools/plans' as Route} className="text-sm font-medium text-emerald-700 hover:text-emerald-800 underline-offset-2 hover:underline">
              Tool: Düngerpläne
            </Link>
            <Link href={'/database' as Route} className="text-sm font-medium text-slate-700 hover:text-slate-900 underline-offset-2 hover:underline">
              Database: Lexika & Quellen
            </Link>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">🌿 Dünger-Katalog</h1>
          <p className="text-lg text-slate-600">{fertilizerCatalog.length} professionelle Dünger für alle Phasen und Budgets</p>
          <p className="text-sm text-slate-500 mt-1">Zeige {totalVisible} Treffer, Seite {safePage} von {totalPagesVisible}</p>
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

        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-emerald-500"><div className="text-sm text-slate-600">Gesamt</div><div className="text-3xl font-bold text-slate-900">{totalVisible}</div></div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500"><div className="text-sm text-slate-600">Marken</div><div className="text-3xl font-bold text-slate-900">{new Set(sortedVisible.map((f) => f.brand)).size}</div></div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-amber-500"><div className="text-sm text-slate-600">Budget</div><div className="text-3xl font-bold text-slate-900">{sortedVisible.filter((f) => f.cost === 'budget').length}</div></div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-orange-500"><div className="text-sm text-slate-600">Organisch</div><div className="text-3xl font-bold text-slate-900">{sortedVisible.filter((f) => f.base === 'organic' || f.base === 'bio-organic').length}</div></div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-rose-500"><div className="text-sm text-slate-600">Premium</div><div className="text-3xl font-bold text-slate-900">{sortedVisible.filter((f) => f.cost === 'premium').length}</div></div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-cyan-500">
            <div className="text-sm text-slate-600">Preisdaten</div>
            <div className="text-3xl font-bold text-slate-900">{pricedProducts}</div>
            <div className="text-xs text-slate-500">von {totalVisible} Produkten</div>
          </div>
        </div>

        <div className="mb-6 rounded-xl border border-cyan-200 bg-cyan-50 p-3 text-sm text-cyan-900">
          Preisquelle: {fertilizerPriceSnapshot.source} · Letztes Update: {fertilizerPriceSnapshot.updatedAt ? new Date(fertilizerPriceSnapshot.updatedAt).toLocaleString('de-DE') : 'noch nicht synchronisiert'}
        </div>

        <div className="mb-6 rounded-xl border border-cyan-200 bg-white p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-cyan-700">Preisfilter</p>
          <div className="mt-2 grid gap-3 md:grid-cols-[220px_auto_auto]">
            <select
              value={priceRegion}
              onChange={(e) => setPriceRegion(e.target.value as 'all' | 'DE' | 'AT' | 'CH' | 'EU' | 'OTHER')}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="all">Region: Alle</option>
              <option value="DE">Deutschland</option>
              <option value="AT">Österreich</option>
              <option value="CH">Schweiz</option>
              <option value="EU">EU</option>
              <option value="OTHER">Sonstige</option>
            </select>
            <label className="inline-flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={priceOnlyAvailable}
                onChange={(e) => setPriceOnlyAvailable(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300"
              />
              Nur verfügbare Angebote
            </label>
            <label className="inline-flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={priceOnlyWithShipping}
                onChange={(e) => setPriceOnlyWithShipping(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300"
              />
              Nur Angebote mit Versandangabe
            </label>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <label className="inline-flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={sortByCheapestEffective}
                onChange={(e) => setSortByCheapestEffective(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300"
              />
              Produkte nach günstigstem Endpreis sortieren
            </label>
          </div>

          <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Händler ausschließen</p>
              {excludedShops.length > 0 && (
                <button
                  type="button"
                  onClick={() => setExcludedShops([])}
                  className="text-xs font-semibold text-rose-700 hover:text-rose-800"
                >
                  Ausschlüsse zurücksetzen
                </button>
              )}
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {availableShops.map(({ shop, count }) => {
                const excluded = excludedShops.includes(shop);
                return (
                  <button
                    key={`shop-${shop}`}
                    type="button"
                    onClick={() => toggleExcludedShop(shop)}
                    className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${
                      excluded
                        ? 'border-rose-300 bg-rose-50 text-rose-700'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-emerald-300'
                    }`}
                  >
                    {shop} ({count})
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mb-8 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Neu</p>
              <p className="text-base font-bold text-emerald-900">Unterkategorie Düngerpläne</p>
              <p className="text-sm text-emerald-800">Praxis-Pläne auf Basis eurer bestehenden Katalogprodukte.</p>
            </div>
            <Link
              href={'/tools/plans' as Route}
              className="inline-flex rounded-lg border border-emerald-300 bg-white px-3 py-2 text-sm font-semibold text-emerald-800 hover:border-emerald-400 hover:bg-emerald-100"
            >
              Zu den Düngerplänen
            </Link>
          </div>
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
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortField)} className="w-full px-4 py-2 border border-slate-300 rounded-lg"><option value="best-match">Beste Treffer (intelligent)</option><option value="name">Nach Name</option><option value="npk-total">Nach NPK-Gesamt</option><option value="ec-min">Nach EC-Min</option><option value="ppfd-min">Nach PPFD-Min</option><option value="cost">Nach Preis</option></select>
            <select value={useCase} onChange={(e) => setUseCase(e.target.value as UseCase)} className="w-full px-4 py-2 border border-slate-300 rounded-lg"><option value="balanced">Einsatz: Ausgewogen</option><option value="hydro-performance">Einsatz: Hydro Leistung</option><option value="soil-organic">Einsatz: Erde & Organisch</option><option value="budget-smart">Einsatz: Budget Klar</option><option value="max-yield">Einsatz: Maximaler Ertrag</option></select>
            <select value={viewMode} onChange={(e) => setViewMode(e.target.value as ViewMode)} className="w-full px-4 py-2 border border-slate-300 rounded-lg"><option value="grid">Ansicht: Kacheln</option><option value="list">Ansicht: Liste</option></select>
            <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} className="w-full px-4 py-2 border border-slate-300 rounded-lg"><option value={12}>12 pro Seite</option><option value={24}>24 pro Seite</option><option value={48}>48 pro Seite</option><option value={72}>72 pro Seite</option></select>
          </div>

          {suggestedQueries.length > 0 && (
            <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
              <p className="text-xs font-semibold text-amber-800">Meintest du:</p>
              <div className="mt-1 flex flex-wrap gap-2">
                {suggestedQueries.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setSearchQuery(suggestion)}
                    className="rounded-full border border-amber-300 bg-white px-2.5 py-1 text-xs font-semibold text-amber-800 hover:border-amber-400 hover:bg-amber-100"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4 grid gap-3 md:grid-cols-[1.6fr_1fr_auto] items-end">
            <input type="text" value={profileName} onChange={(e) => setProfileName(e.target.value)} placeholder="Filterprofil-Name (z.B. Hydro Pro)" className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
            <div className="text-xs text-slate-500">Speichert Suche, Filter, Sortierung und Einsatzzweck lokal im Browser.</div>
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

        {totalVisible === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow border border-slate-200">
            <p className="text-slate-600">Keine Dünger gefunden, die deinen Kriterien entsprechen.</p>
            {suggestedQueries.length > 0 && (
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2 px-4">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Meintest du:</span>
                {suggestedQueries.map((suggestion) => (
                  <button
                    key={`empty-${suggestion}`}
                    onClick={() => setSearchQuery(suggestion)}
                    className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 hover:border-emerald-300 hover:bg-emerald-100"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
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
              (() => {
                const offers = getVisibleOffers(fert.id);
                const bestPrice = offers[0] ? getEffectivePrice(offers[0]) : null;
                return (
              <div key={fert.id} className={`bg-white rounded-lg shadow hover:shadow-lg transition-all border border-slate-200 overflow-hidden ${viewMode === 'list' ? 'p-4' : ''}`}>
                <div className={`p-4 ${viewMode === 'grid' ? 'border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100' : 'bg-slate-50 rounded-lg mb-3'}`}>
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <div>
                      <h3 className="font-bold text-lg text-slate-900">{highlightMatches(fert.name, highlightTerms)}</h3>
                      <p className="text-sm text-slate-600">{fert.brand}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="px-2 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">Treffer {Math.round(computeMatchScore(fert))}</div>
                      <div className={`px-3 py-1 rounded-full text-xs font-semibold ${costColorMap[fert.cost]}`}>{costLabelMap[fert.cost]}</div>
                    </div>
                  </div>
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    {bestPrice != null ? (
                      <span className="inline-flex rounded-full border border-cyan-200 bg-cyan-100 px-2.5 py-1 text-xs font-bold text-cyan-800">
                        ab {formatEuro(bestPrice)}
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                        Keine Live-Preise
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-600 line-clamp-2">{highlightMatches(fert.description, highlightTerms)}</p>
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
                    {fert.tags.slice(0, 3).map((tag) => <span key={tag} className="inline-block px-2 py-0.5 bg-slate-200 text-slate-700 text-xs rounded">{highlightMatches(tag, highlightTerms)}</span>)}
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
                        <h4 className="font-semibold text-slate-900 text-sm mb-1">Preisvergleich (alle aktuellen Angebote)</h4>
                        {offers.length > 0 ? (
                          <div className="space-y-2">
                            {offers.map((offer) => (
                              <a
                                key={`${offer.shop}-${offer.productUrl}`}
                                href={offer.productUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="block rounded-lg border border-cyan-200 bg-cyan-50 px-3 py-2 hover:bg-cyan-100"
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <p className="text-sm font-semibold text-cyan-900">{offer.shop}</p>
                                  <p className="text-sm font-bold text-cyan-900">{formatEuro(getEffectivePrice(offer))}</p>
                                </div>
                                <p className="text-xs text-cyan-800 line-clamp-1">{offer.title}</p>
                                <p className="text-xs text-cyan-700">
                                  Produkt: {formatEuro(offer.price)}
                                  {offer.shipping != null ? ` · Versand: ${formatEuro(offer.shipping)}` : ' · Versand: n/a'}
                                </p>
                                  <p className="text-xs text-cyan-700">
                                    Region: {offer.country ?? 'Sonstige'} · Status: {offer.availability ?? 'unbekannt'}
                                  </p>
                              </a>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-slate-500">Keine Preise passend zum aktuellen Preisfilter gefunden.</p>
                        )}
                      </div>

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
                );
              })()
            ))}
          </div>
        )}

        {totalVisible > pageSize && (
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={safePage === 1} className="px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 disabled:opacity-40">Zurück</button>
            {Array.from({ length: totalPagesVisible }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPagesVisible || Math.abs(p - safePage) <= 2)
              .map((p) => (
                <button key={p} onClick={() => setCurrentPage(p)} className={`px-3 py-2 rounded-lg border text-sm ${p === safePage ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-semibold' : 'border-slate-300 bg-white text-slate-700'}`}>
                  {p}
                </button>
              ))}
            <button onClick={() => setCurrentPage((p) => Math.min(totalPagesVisible, p + 1))} disabled={safePage === totalPagesVisible} className="px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 disabled:opacity-40">Weiter</button>
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

export default function FertilizersPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-6" />}>
      <FertilizersPageInner />
    </Suspense>
  );
}
