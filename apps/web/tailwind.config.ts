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
      },
    },
  },
  plugins: [],
}
export default config
