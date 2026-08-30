// ────────────────────────────────────────────────────────────────────────────
// E-Mail-Design-Tokens. Bewusst LIGHT-first (siehe docs/EMAIL_TEMPLATES_PLAN.md
// §1.3): weiße Card auf off-white, near-black Text, Marken-Grün nur als Akzent.
// Die dunkle App-Palette (#070F0B) NICHT als Mail-Grund verwenden — Clients mit
// Auto-Light-Mode verhunzen dark-on-dark. Der optionale @media-dark-Block in
// BaseLayout dreht die Rollen bewusst um.
//
// Werte an DESIGN_SYSTEM.md §5 angelehnt, aber für Mail-Kontrast angepasst.
// ────────────────────────────────────────────────────────────────────────────

export const color = {
  // light (Standard)
  canvas: "#F4F6F4",
  card: "#FFFFFF",
  border: "#E6EAE7",
  text: "#1B241F",
  textMuted: "#5B6B61",
  primary: "#1FA971", // Marken-Grün — CTA / Links / Header-Streifen
  primaryText: "#FFFFFF", // Text auf dem CTA-Button
  // dark (nur im @media prefers-color-scheme: dark)
  dark: {
    canvas: "#070F0B",
    card: "#0C1712",
    border: "#1C2A23",
    text: "#F3F6F2",
    textMuted: "#8FA396",
    primary: "#3FBF8A", // heller, damit auf dunklem Grund lesbar
    primaryText: "#06130D",
  },
} as const;

// Space Grotesk / Manrope laden in E-Mail nicht — System-Sans-Fallback.
// Die Marke trägt hier über Farbe/Spacing/Ton, nicht über die Schrift.
export const fontStack =
  '"Space Grotesk", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
export const bodyFontStack =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

export const size = {
  container: 600, // Content-Spalte
  radius: 12,
  buttonRadius: 10,
} as const;
