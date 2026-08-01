import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts"
  ]),
  // Design-consistency guard: globals.css defines a semantic token system
  // (bg-background/bg-card/border-border/text-foreground/text-muted-fg) that
  // pages should use instead of raw Tailwind palette classes. Kept as "warn"
  // permanently rather than "error": the remaining hits are legitimate,
  // reviewed exceptions (text on a fixed-dark hero/brand section that never
  // participates in the light/dark toggle, e.g. bg-brand-hero; self-contained
  // UI markers like a gauge needle or toggle knob) — promoting to "error"
  // would just force eslint-disable comments on correct code. Use the
  // warning count as a living regression tracker instead of a hard gate.
  {
    files: ["src/app/**/*.{ts,tsx}", "src/components/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-syntax": [
        "warn",
        {
          selector:
            "JSXAttribute[name.name='className'] Literal[value=/\\b(bg-white|bg-slate-\\d|bg-gray-\\d|text-slate-\\d|border-slate-\\d|from-slate-\\d|via-slate-\\d|to-slate-\\d|from-white|via-white|to-white|from-gray-\\d|via-gray-\\d|to-gray-\\d)/]",
          message:
            "Use design tokens (bg-card, bg-background, border-border, text-foreground, text-muted-fg) instead of raw Tailwind white/slate/gray classes — see the token system in globals.css.",
        },
        {
          selector:
            "JSXAttribute[name.name='className'] TemplateElement[value.raw=/\\b(bg-white|bg-slate-\\d|bg-gray-\\d|text-slate-\\d|border-slate-\\d|from-slate-\\d|via-slate-\\d|to-slate-\\d|from-white|via-white|to-white|from-gray-\\d|via-gray-\\d|to-gray-\\d)/]",
          message:
            "Use design tokens (bg-card, bg-background, border-border, text-foreground, text-muted-fg) instead of raw Tailwind white/slate/gray classes — see the token system in globals.css.",
        },
      ],
    },
  },
]);
