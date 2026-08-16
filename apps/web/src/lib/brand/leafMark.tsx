// Reusable brand mark for generated app icons and social-share images
// (favicon, apple-touch-icon, manifest icons, opengraph-image). The path
// data is lucide-react's "Leaf" icon (node_modules/lucide-react/dist/esm/
// icons/leaf.mjs) copied in raw — next/og's Satori renderer draws plain
// SVG/JSX, it can't consume the lucide-react component itself, but this
// keeps every generated asset pixel-identical to the glyph already used
// live in NavigationBar/Footer/AdminShell's logo badge.

const LEAF_PATHS = [
  "M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z",
  "M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12",
];

export function BrandIcon({
  size,
  radius = 0,
  glyphScale = 0.58,
}: {
  size: number;
  radius?: number;
  glyphScale?: number;
}) {
  const glyph = Math.round(size * glyphScale);
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #1fa971 0%, #0f3226 100%)",
      }}
    >
      <svg
        width={glyph}
        height={glyph}
        viewBox="0 0 24 24"
        fill="none"
        stroke="#f3f6f2"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {LEAF_PATHS.map((d) => (
          <path key={d} d={d} />
        ))}
      </svg>
    </div>
  );
}
