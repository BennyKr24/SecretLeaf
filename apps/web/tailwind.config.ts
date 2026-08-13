import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // Motion system (DESIGN_SYSTEM.md §15.4): Tailwind's built-in curves are
      // too weak to feel intentional. `transition`/`transition-colors`/etc.
      // fall back to DEFAULT when no ease-* class is chained — overriding it
      // here upgrades nearly every existing transition in the app for free.
      transitionTimingFunction: {
        DEFAULT: 'cubic-bezier(0.23, 1, 0.32, 1)', // ease-out — enter/exit, default
        out: 'cubic-bezier(0.23, 1, 0.32, 1)',
        'in-out': 'cubic-bezier(0.77, 0, 0.175, 1)', // on-screen movement/morph
      },
      // Typography (DESIGN_SYSTEM.md Typography section / apple-design §15):
      // tracking is size-specific, never one fixed value for every size —
      // negative/tighter as text grows, near-zero at body sizes. Line-height
      // moves inversely (tight on big display text, looser on body copy).
      // A class always outranks the plain h1..h6 fallback rule in globals.css,
      // so any element using one of these sizes gets this automatically.
      fontSize: {
        base: ['1rem', { lineHeight: '1.6', letterSpacing: '0' }],
        lg: ['1.125rem', { lineHeight: '1.6', letterSpacing: '0' }],
        xl: ['1.25rem', { lineHeight: '1.5', letterSpacing: '-0.005em' }],
        '2xl': ['1.5rem', { lineHeight: '1.4', letterSpacing: '-0.01em' }],
        '3xl': ['1.875rem', { lineHeight: '1.3', letterSpacing: '-0.015em' }],
        '4xl': ['2.25rem', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
        '5xl': ['3rem', { lineHeight: '1.1', letterSpacing: '-0.025em' }],
        '6xl': ['3.75rem', { lineHeight: '1.05', letterSpacing: '-0.03em' }],
        '7xl': ['4.5rem', { lineHeight: '1.02', letterSpacing: '-0.035em' }],
      },
      colors: {
        // Semantic tokens — resolved from CSS custom properties in globals.css.
        // `rgb(var(--x-rgb) / <alpha-value>)` (not plain `var(--x)`) so
        // opacity modifiers work: bg-card/80, border-border/40, etc.
        // Tailwind can't splice an alpha channel into a bare hex var, so a
        // plain `var(--x)` reference silently produces no CSS rule at all
        // for any `/NN` usage — see TODO.md, found 2026-08-13.
        // Usage: bg-background, text-foreground, bg-card, border-border
        background: 'rgb(var(--background-rgb) / <alpha-value>)',
        foreground: 'rgb(var(--foreground-rgb) / <alpha-value>)',
        card: 'rgb(var(--card-rgb) / <alpha-value>)',
        surface: 'rgb(var(--surface-rgb) / <alpha-value>)',
        border: { DEFAULT: 'rgb(var(--border-rgb) / <alpha-value>)' },
        'muted-fg': 'rgb(var(--muted-foreground-rgb) / <alpha-value>)',
        ring: 'rgb(var(--ring-rgb) / <alpha-value>)',
        primary: 'rgb(var(--primary-rgb) / <alpha-value>)',
        'primary-dark': 'rgb(var(--primary-dark-rgb) / <alpha-value>)',
        'primary-deep': 'rgb(var(--primary-deep-rgb) / <alpha-value>)',
        'brand-hero': 'rgb(var(--brand-hero-rgb) / <alpha-value>)',
        // Secondary accent (DESIGN_SYSTEM.md palette, 2026-08-07) — muted
        // brass/gold for premium moments (PRO badges, ratings, highlights).
        // Use sparingly; primary green stays the dominant brand color.
        gold: 'rgb(var(--accent-gold-rgb) / <alpha-value>)',
        'gold-dark': 'rgb(var(--accent-gold-dark-rgb) / <alpha-value>)',
      },
    },
  },
  plugins: [],
}
export default config
