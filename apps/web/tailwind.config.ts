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
        // Semantic tokens — resolved from CSS custom properties in globals.css
        // Usage: bg-background, text-foreground, bg-card, border-border
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: 'var(--card)',
        surface: 'var(--surface)',
        border: { DEFAULT: 'var(--border)' },
        'muted-fg': 'var(--muted-foreground)',
        ring: 'var(--ring)',
        primary: 'var(--primary)',
        'primary-dark': 'var(--primary-dark)',
        'primary-deep': 'var(--primary-deep)',
        'brand-hero': 'var(--brand-hero)',
        // Secondary accent (DESIGN_SYSTEM.md palette, 2026-08-07) — muted
        // brass/gold for premium moments (PRO badges, ratings, highlights).
        // Use sparingly; primary green stays the dominant brand color.
        gold: 'var(--accent-gold)',
        'gold-dark': 'var(--accent-gold-dark)',
      },
    },
  },
  plugins: [],
}
export default config
