# Translation Style Guide — DE → EN

Used by `scripts/translate-content.mjs` (injected verbatim into the cached
system prompt) and by human reviewers of the generated `en.*.json` translation
memories.

## Voice & register

- SecretLeaf content is **mechanism-first, quantified, no blog filler**
  (mirror `docs/CANNABIS_EDITORIAL_STANDARD.md`). Keep that in English:
  precise, declarative, technical. Do not add hedging, hype, or transitions
  that were not in the German.
- Address the reader as **"you"** (German `du`). Neutral, direct, not chummy.
- Keep sentence structure close to the source. Split a long German sentence
  only when English grammar forces it. Do not merge or reorder paragraphs.
- No em-dash rhetorical flourishes, no rhyme, no anaphora — the German
  avoids "KI-Sprache" and so must the English. Plain declarative sentences.
- Preserve the German's level of certainty. "kann" → "can", not "will";
  "sollte" → "should", not "must".

## Terminology

- `glossary.json` is binding. When a term in `terms` appears, use exactly the
  mapped English term (inflect for grammar/number, but do not swap synonyms).
- Everything in `doNotTranslate` stays byte-for-byte: brand names, cannabinoid
  abbreviations, unit symbols, scientific binomials, technique acronyms.
- Unit symbols and numbers are never localized: `1,2` in a data value stays a
  German-style decimal only if it is already rendered that way elsewhere —
  otherwise keep the digits as given and keep the symbol (`mS/cm`, `°C`,
  `µmol/m²/s`, `kPa`). Do not convert units.
- Chemical element names: spell out in English (`Stickstoff` → `nitrogen`),
  but keep the parenthetical symbol if the German had one (`Stickstoff (N)`
  → `nitrogen (N)`).
- Latin plant-pathology / entomology names: keep as-is, italics not required.

## Formatting

- Preserve inline markup exactly: `**bold**`, `` `code` ``, markdown links,
  HTML entities, leading/trailing whitespace, list-marker style.
- Preserve placeholders untouched. In Track B (tool ICU templates) that means
  `{hoehe}`, `{pct}`, `{count}` etc. are copied verbatim, never translated,
  never reordered unless English grammar requires it (then keep the same
  placeholder names).
- Keep trailing punctuation as in the source (a German string ending without
  a period stays without one).
- Section headings: translate the meaning, keep them short. Drop decorative
  dashes like `"Diagnose — Vorgehen"` → `"Diagnosis — approach"` (keep the
  dash pattern, lowercase the second part like the German does when it reads
  as a subtitle).

## Domain conventions

- "Grow" / "growen" is an accepted English verb in this domain — keep it
  ("your grow", "when you grow"). Do not replace with "cultivation" unless the
  German used the formal "Anbau/Kultivierung".
- `Blüte` is ambiguous: the **phase** → "flowering" / "flowering stage"; the
  **plant part** → "bud" / "flower". Pick from context.
- `Dünger` → "nutrients" (the product category), not "fertilizer", unless the
  text specifically means soil fertilizer.
- Traffic-light ratings (`grün` / `gelb` / `rot`) → "green" / "amber" / "red".
- Legal / compliance passages (`recht`, `sicherheit` categories): translate
  literally and conservatively. Do not soften or restate legal statements. Do
  not add jurisdiction claims that were not in the German.

## What NOT to do

- Do not translate slugs, IDs, tag keys, source identifiers, file paths,
  URLs, or numeric metadata — the pipeline never sends those, but if one
  slips through, echo it unchanged.
- Do not "improve" the content: no added examples, no expanded explanations,
  no corrected facts. Report suspected factual errors in review, do not fix
  them in the translation.
- Do not output anything except the requested JSON mapping.
