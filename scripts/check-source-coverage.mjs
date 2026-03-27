#!/usr/bin/env node
/**
 * check-source-coverage.mjs
 *
 * Algorithmus zur Überprüfung, wie viele der wichtigsten Cannabis-Studienquellen
 * auf der Seite abgedeckt sind. Ziel: ≥ 80 % der Gold-Standard-Quellen.
 *
 * Usage: node scripts/check-source-coverage.mjs [--verbose] [--json]
 */

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const WIKI_TS_PATH = path.join(ROOT, 'apps', 'web', 'src', 'data', 'terpira', 'wiki.ts');
const AUTO_JSON_PATH = path.join(ROOT, 'apps', 'web', 'src', 'data', 'terpira', 'autoSources.json');

const VERBOSE = process.argv.includes('--verbose');
const JSON_OUTPUT = process.argv.includes('--json');

// ─────────────────────────────────────────────────────────────────────────────
// GOLD STANDARD – 50 wichtigste Quellen für Cannabis-Forschung
// Tier 1: Internationale Organisationen (10)
// Tier 2: Top-Medizinjournale (20)
// Tier 3: Cannabis-spezifische Journale (5)
// Tier 4: Chemie & Analytik (5)
// Tier 5: Sicherheit & Toxikologie (5)
// Tier 6: Recht, Standards & Öffentliche Gesundheit (5)
// ─────────────────────────────────────────────────────────────────────────────
const GOLD_STANDARD = [
  // Tier 1 – Internationale Organisationen
  { id: 'who', tier: 1, name: 'World Health Organization (WHO)', keywords: ['world health organization', 'who'] },
  { id: 'unodc', tier: 1, name: 'UNODC', keywords: ['unodc', 'united nations office on drugs'] },
  { id: 'emcdda', tier: 1, name: 'EMCDDA / EUDA', keywords: ['emcdda', 'euda', 'european monitoring centre', 'european drug report'] },
  { id: 'ema', tier: 1, name: 'European Medicines Agency (EMA)', keywords: ['european medicines agency', 'ema guideline'] },
  { id: 'fda', tier: 1, name: 'FDA (U.S. Food and Drug Administration)', keywords: ['food and drug administration', 'fda'] },
  { id: 'bfarm', tier: 1, name: 'BfArM (Germany)', keywords: ['bfarm', 'bundesinstitut für arzneimittel', 'bundesinstitut fuer arzneimittel'] },
  { id: 'ages', tier: 1, name: 'AGES (Austria)', keywords: ['ages', 'austrian agency for health'] },
  { id: 'swissmedic', tier: 1, name: 'Swissmedic', keywords: ['swissmedic'] },
  { id: 'codex', tier: 1, name: 'Codex Alimentarius', keywords: ['codex alimentarius'] },
  { id: 'echa', tier: 1, name: 'ECHA (European Chemicals Agency)', keywords: ['european chemicals agency', 'echa'] },

  // Tier 2 – Top-Medizin- und Wissenschaftsjournale
  { id: 'jama', tier: 2, name: 'JAMA Network', keywords: ['jama', 'journal of the american medical association'] },
  { id: 'lancet', tier: 2, name: 'The Lancet', keywords: ['lancet'] },
  { id: 'nature', tier: 2, name: 'Nature (Portfolio)', keywords: ['nature neuroscience', 'nature medicine', 'nature portfolio', 'nature.com'] },
  { id: 'nejm', tier: 2, name: 'New England Journal of Medicine (NEJM)', keywords: ['new england journal of medicine', 'nejm'] },
  { id: 'bmj', tier: 2, name: 'BMJ (British Medical Journal)', keywords: ['bmj', 'british medical journal'] },
  { id: 'cochrane', tier: 2, name: 'Cochrane Library', keywords: ['cochrane'] },
  { id: 'addiction', tier: 2, name: 'Addiction (journal)', keywords: ['addiction'] },
  { id: 'drug-alcohol', tier: 2, name: 'Drug and Alcohol Dependence', keywords: ['drug and alcohol dependence', 'drug & alcohol'] },
  { id: 'pain-j', tier: 2, name: 'Pain (journal)', keywords: ['pain'] },
  { id: 'psychopharm', tier: 2, name: 'Journal of Psychopharmacology / Psychopharmacology', keywords: ['psychopharmacology'] },
  { id: 'neuropsychopharm', tier: 2, name: 'Neuropsychopharmacology', keywords: ['neuropsychopharmacology'] },
  { id: 'bjp', tier: 2, name: 'British Journal of Pharmacology', keywords: ['british journal of pharmacology'] },
  { id: 'ejp', tier: 2, name: 'European Journal of Pharmacology', keywords: ['european journal of pharmacology'] },
  { id: 'pharm-rev', tier: 2, name: 'Pharmacological Reviews', keywords: ['pharmacological reviews', 'pharmrev'] },
  { id: 'cpt', tier: 2, name: 'Clinical Pharmacology & Therapeutics', keywords: ['clinical pharmacology'] },
  { id: 'pharm-res', tier: 2, name: 'Pharmaceutical Research', keywords: ['pharmaceutical research'] },
  { id: 'frontiers-pharm', tier: 2, name: 'Frontiers in Pharmacology', keywords: ['frontiers in pharmacology'] },
  { id: 'neuropharm', tier: 2, name: 'Neuropharmacology', keywords: ['neuropharmacology'] },
  { id: 'drug-policy', tier: 2, name: 'International Journal of Drug Policy', keywords: ['international journal of drug policy'] },
  { id: 'neuropsychology', tier: 2, name: 'Neuropsychology (APA)', keywords: ['neuropsychology'] },

  // Tier 3 – Cannabis-spezifische Journale
  { id: 'ccr', tier: 3, name: 'Cannabis & Cannabinoid Research', keywords: ['cannabis & cannabinoid research', 'cannabis and cannabinoid research'] },
  { id: 'jcr', tier: 3, name: 'Journal of Cannabis Research', keywords: ['journal of cannabis research'] },
  { id: 'mcc', tier: 3, name: 'Medical Cannabis and Cannabinoids', keywords: ['medical cannabis and cannabinoids'] },
  { id: 'harm-reduction', tier: 3, name: 'Harm Reduction Journal', keywords: ['harm reduction journal'] },
  { id: 'jpd', tier: 3, name: 'Journal of Psychoactive Drugs', keywords: ['psychoactive drugs'] },

  // Tier 4 – Chemie & Analytik
  { id: 'jchrom', tier: 4, name: 'Journal of Chromatography A', keywords: ['chromatography'] },
  { id: 'anchem', tier: 4, name: 'Analytical Chemistry', keywords: ['analytical chemistry'] },
  { id: 'dta', tier: 4, name: 'Drug Testing and Analysis', keywords: ['drug testing and analysis'] },
  { id: 'phytochem', tier: 4, name: 'Phytochemistry', keywords: ['phytochemistry'] },
  { id: 'aoac', tier: 4, name: 'AOAC International', keywords: ['aoac'] },

  // Tier 5 – Sicherheit & Toxikologie
  { id: 'arch-tox', tier: 5, name: 'Archives of Toxicology', keywords: ['archives of toxicology'] },
  { id: 'toxicology', tier: 5, name: 'Toxicology', keywords: ['toxicology'] },
  { id: 'food-control', tier: 5, name: 'Food Control', keywords: ['food control'] },
  { id: 'food-chem', tier: 5, name: 'Journal of Food Chemistry', keywords: ['food chemistry'] },
  { id: 'appl-micro', tier: 5, name: 'Applied Microbiology and Biotechnology', keywords: ['applied microbiology'] },

  // Tier 6 – Standards, Recht & Öffentliche Gesundheit
  { id: 'iso', tier: 6, name: 'ISO', keywords: ['iso/iec', 'iso standard', 'iso'] },
  { id: 'astm', tier: 6, name: 'ASTM International', keywords: ['astm'] },
  { id: 'nutrients', tier: 6, name: 'Nutrients (MDPI)', keywords: ['nutrients'] },
  { id: 'frontiers-ph', tier: 6, name: 'Frontiers in Public Health', keywords: ['frontiers in public health'] },
  { id: 'addictive-beh', tier: 6, name: 'Addictive Behaviors', keywords: ['addictive behaviors'] },
];

// ─────────────────────────────────────────────────────────────────────────────
// Quellen aus wiki.ts extrahieren (Publisher-Felder per Regex)
// ─────────────────────────────────────────────────────────────────────────────
function extractManualPublishers(wikiTsContent) {
  const publishers = new Set();
  // Matches: publisher: "Some Publisher Name"
  const re = /publisher:\s*["']([^"']+)["']/g;
  let m;
  while ((m = re.exec(wikiTsContent)) !== null) {
    publishers.add(m[1].toLowerCase());
  }
  return [...publishers];
}

// ─────────────────────────────────────────────────────────────────────────────
// Publisher aus autoSources.json extrahieren
// ─────────────────────────────────────────────────────────────────────────────
function extractAutoPublishers(autoData) {
  return [...new Set(
    (autoData.sources ?? [])
      .map(s => String(s.publisher ?? '').replace(/&amp;/g, '&').toLowerCase())
      .filter(Boolean)
  )];
}

// ─────────────────────────────────────────────────────────────────────────────
// Gold-Standard-Eintrag gegen Publisher-Liste matchen
// ─────────────────────────────────────────────────────────────────────────────
function matchesGold(goldItem, publishers) {
  return goldItem.keywords.some(kw =>
    publishers.some(pub => pub.includes(kw.toLowerCase()))
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Score berechnen: Gewichtung nach Tier (Tier 1 = wichtiger)
// ─────────────────────────────────────────────────────────────────────────────
const TIER_WEIGHT = { 1: 3, 2: 2, 3: 2, 4: 1, 5: 1, 6: 1 };

function calcCoverage(matched, total) {
  const weightedMatched = matched.reduce((sum, g) => sum + (TIER_WEIGHT[g.tier] ?? 1), 0);
  const weightedTotal = total.reduce((sum, g) => sum + (TIER_WEIGHT[g.tier] ?? 1), 0);
  return {
    simple: matched.length / total.length,
    weighted: weightedMatched / weightedTotal,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Hauptprogramm
// ─────────────────────────────────────────────────────────────────────────────
function main() {
  const wikiTs = readFileSync(WIKI_TS_PATH, 'utf8');
  const autoData = JSON.parse(readFileSync(AUTO_JSON_PATH, 'utf8'));

  const manualPublishers = extractManualPublishers(wikiTs);
  const autoPublishers = extractAutoPublishers(autoData);
  const allPublishers = [...new Set([...manualPublishers, ...autoPublishers])];

  const results = GOLD_STANDARD.map(g => ({
    ...g,
    coveredManual: matchesGold(g, manualPublishers),
    coveredAuto: !matchesGold(g, manualPublishers) && matchesGold(g, autoPublishers),
    coveredTotal: matchesGold(g, allPublishers),
  }));

  const manualMatched = results.filter(r => r.coveredManual);
  const totalMatched = results.filter(r => r.coveredTotal);
  const missing = results.filter(r => !r.coveredTotal);

  const manualCov = calcCoverage(manualMatched, GOLD_STANDARD);
  const totalCov = calcCoverage(totalMatched, GOLD_STANDARD);

  const tierGroups = {};
  for (let t = 1; t <= 6; t++) {
    const inTier = results.filter(r => r.tier === t);
    tierGroups[t] = {
      total: inTier.length,
      manualCovered: inTier.filter(r => r.coveredManual).length,
      totalCovered: inTier.filter(r => r.coveredTotal).length,
    };
  }

  if (JSON_OUTPUT) {
    const report = {
      generatedAt: new Date().toISOString(),
      goldStandardSize: GOLD_STANDARD.length,
      manualSources: manualPublishers.length,
      autoSources: autoPublishers.length,
      manual: { covered: manualMatched.length, pct: +(manualCov.simple * 100).toFixed(1), weightedPct: +(manualCov.weighted * 100).toFixed(1) },
      total: { covered: totalMatched.length, pct: +(totalCov.simple * 100).toFixed(1), weightedPct: +(totalCov.weighted * 100).toFixed(1) },
      targetMet: totalCov.simple >= 0.8,
      manualTargetMet: manualCov.simple >= 0.8,
      tierBreakdown: tierGroups,
      missing: missing.map(r => ({ id: r.id, tier: r.tier, name: r.name })),
      covered: totalMatched.map(r => ({ id: r.id, tier: r.tier, name: r.name, source: r.coveredManual ? 'manual' : 'auto' })),
    };
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  // ── Textausgabe ──────────────────────────────────────────────────────────
  const bar = (pct, len = 40) => {
    const filled = Math.round(pct / 100 * len);
    return '[' + '█'.repeat(filled) + '░'.repeat(len - filled) + ']';
  };
  const pct = n => `${(n * 100).toFixed(1)} %`;

  console.log('\n════════════════════════════════════════════════════════');
  console.log('  SecretLeaf – Cannabis-Quellen-Abdeckung');
  console.log('════════════════════════════════════════════════════════');
  console.log(`  Gold-Standard: ${GOLD_STANDARD.length} Top-Quellen`);
  console.log(`  Manuelle Quellen: ${manualPublishers.length} Publisher`);
  console.log(`  Auto-Import:  ${autoPublishers.length} Publisher`);
  console.log('');

  console.log('  MANUELLE Abdeckung (dauerhaft):');
  console.log(`  ${bar(manualCov.simple * 100)} ${pct(manualCov.simple)}  (${manualMatched.length}/${GOLD_STANDARD.length})`);
  console.log(`  Gewichtet (Tier-basiert):         ${pct(manualCov.weighted)}`);
  console.log('');
  console.log('  GESAMT Abdeckung (inkl. Auto-Import):');
  console.log(`  ${bar(totalCov.simple * 100)} ${pct(totalCov.simple)}  (${totalMatched.length}/${GOLD_STANDARD.length})`);
  console.log(`  Gewichtet (Tier-basiert):         ${pct(totalCov.weighted)}`);
  console.log('');

  const targetSymbol = (met) => met ? '✅' : '❌';
  console.log(`  Ziel ≥ 80 % (gesamt):  ${targetSymbol(totalCov.simple >= 0.8)}`);
  console.log(`  Ziel ≥ 80 % (manuell): ${targetSymbol(manualCov.simple >= 0.8)}`);
  console.log('');

  // Tier-Übersicht
  console.log('  ── Abdeckung pro Tier ─────────────────────────────');
  const TIER_LABELS = {
    1: 'Internationale Organisationen',
    2: 'Top-Medizin- & Wissenschaftsjournale',
    3: 'Cannabis-spezifische Journale',
    4: 'Chemie & Analytik',
    5: 'Sicherheit & Toxikologie',
    6: 'Standards, Recht & Public Health',
  };
  for (const [t, grp] of Object.entries(tierGroups)) {
    const tier = Number(t);
    const manPct = grp.manualCovered / grp.total;
    const totPct = grp.totalCovered / grp.total;
    console.log(`  Tier ${t} — ${TIER_LABELS[tier]}`);
    console.log(`    Manuell: ${grp.manualCovered}/${grp.total}  Gesamt: ${grp.totalCovered}/${grp.total}`);
  }
  console.log('');

  if (missing.length > 0) {
    console.log(`  ── Noch nicht abgedeckt (${missing.length} Quellen) ─────────────`);
    for (const m of missing.sort((a, b) => a.tier - b.tier)) {
      console.log(`  [T${m.tier}] ${m.name}`);
    }
    console.log('');
  }

  if (VERBOSE) {
    console.log('  ── Abgedeckte Quellen ──────────────────────────────');
    for (const r of totalMatched.sort((a, b) => a.tier - b.tier)) {
      const src = r.coveredManual ? 'manual' : 'auto  ';
      console.log(`  [T${r.tier}][${src}] ${r.name}`);
    }
    console.log('');
  }

  console.log('════════════════════════════════════════════════════════\n');

  // Exit-Code: 0 wenn Ziel erreicht, 1 wenn nicht
  process.exit(totalCov.simple >= 0.8 ? 0 : 1);
}

main();
