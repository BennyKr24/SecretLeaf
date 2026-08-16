import type { MetadataRoute } from "next";

// Auto-served at /manifest.webmanifest and auto-linked by Next — no
// <link rel="manifest"> needed in layout.tsx. One manifest for the whole
// site (brand identity, not per-locale); icons are generated on-demand by
// app/icons/[size]/route.tsx from the same brand mark used everywhere
// else (see lib/brand/leafMark.tsx).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SecretLeaf – Grow Operating System für Cannabis",
    short_name: "SecretLeaf",
    description:
      "Grow-Tracker, Diagnose und Profi-Tools für deinen Cannabis-Anbau, plus eine geprüfte Wissensbasis.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#070f0b",
    theme_color: "#070f0b",
    lang: "de",
    icons: [
      { src: "/icons/192", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/512", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/192-maskable", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icons/512-maskable", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
