// ────────────────────────────────────────────────────────────────────────────
// Diagnose-tree localisation (lean sibling of localizeContent.ts).
//
// The interactive /diagnose flow runs entirely client-side, so it must NOT
// import localizeContent.ts — that pulls the ~800 KB wiki + diagnostics TMs
// into the client bundle. This module imports only en.diagnose-tree.json
// (~13 KB) and is safe to use from client components.
//
// Same idea as localizeContent: a { de -> en } map, deep string-swap, DE
// fallback for anything not yet translated.
// ────────────────────────────────────────────────────────────────────────────

import enTree from "@/data/i18n/en.diagnose-tree.json";

type TMEntry = { de: string; en: string | null; paths: string[] };

const TREE_EN: Map<string, string> = (() => {
  const m = new Map<string, string>();
  for (const entry of Object.values(enTree as Record<string, TMEntry>)) {
    if (entry.en && entry.en.trim()) m.set(entry.de, entry.en);
  }
  return m;
})();

const isEn = (locale: string) => locale === "en";

/**
 * Deep-clone `node`, swapping every string via `map` (missing keys keep the
 * original). Shared by localizeContent.ts. React elements / non-plain objects
 * are passed through untouched.
 */
export function deepLocalizeStrings<T>(node: T, map: Map<string, string>): T {
  if (typeof node === "string") {
    return (map.get(node) ?? node) as unknown as T;
  }
  if (Array.isArray(node)) {
    return node.map((child) => deepLocalizeStrings(child, map)) as unknown as T;
  }
  if (node && typeof node === "object") {
    // Only recurse into plain data objects. React elements / forwardRef
    // components (e.g. a Lucide `icon` on a DiagnoseResult) carry a
    // `$$typeof` symbol and a non-Object prototype — clone-recursing them
    // would rebuild them as broken plain objects, so pass them through.
    const proto = Object.getPrototypeOf(node);
    if (
      (proto !== Object.prototype && proto !== null) ||
      "$$typeof" in (node as Record<string, unknown>)
    ) {
      return node;
    }
    const out: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(node)) out[key] = deepLocalizeStrings(value, map);
    return out as T;
  }
  return node;
}

/** EN-overlaid copy of a diagnose result / node (original for any other locale). */
export function localizeDiagnoseTreeObject<T extends object>(obj: T, locale: string): T {
  return isEn(locale) ? deepLocalizeStrings(obj, TREE_EN) : obj;
}

/** Swap a single diagnose-tree string (e.g. a category label), DE fallback. */
export function localizeDiagnoseTreeString(text: string, locale: string): string {
  return isEn(locale) ? (TREE_EN.get(text) ?? text) : text;
}
