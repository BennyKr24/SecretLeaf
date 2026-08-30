// Per-page canonical + hreflang. Without this a sub-page inherits the root
// layout's `alternates` verbatim and reports the homepage as its canonical.
//
// URL convention (see i18n/routing.ts): DE lives at the bare path, EN under
// an `/en` prefix. Pass the logical path without a locale segment, e.g.
// `/studies/foo` — never `/de/studies/foo`.

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://secretleaf.net";

export function pageAlternates(path: string, locale: string) {
  const clean = path.replace(/^\/+/, "");
  const de = clean ? `${BASE_URL}/${clean}` : BASE_URL;
  const en = clean ? `${BASE_URL}/en/${clean}` : `${BASE_URL}/en`;
  return {
    canonical: locale === "en" ? en : de,
    languages: { de, en, "x-default": de },
  };
}
