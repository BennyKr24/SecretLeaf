// ────────────────────────────────────────────────────────────────────────────
// UI Primitive — ProgressBar
//
// Fixed full-width track, fill scaled via `transform: scaleX()` instead of
// `width` — GPU-accelerated instead of triggering layout on every update
// (DESIGN_SYSTEM.md §15.8). Formalizes a pattern that was previously
// duplicated inline in the grow dashboard.
// ────────────────────────────────────────────────────────────────────────────

export type ProgressBarTone = "primary" | "amber" | "rose";

const TONES: Record<ProgressBarTone, string> = {
  primary: "bg-primary",
  amber: "bg-amber-500",
  rose: "bg-rose-500",
};

export function ProgressBar({
  percent,
  tone = "primary",
  size = "md",
  className = "",
}: {
  /** 0–100. Values outside that range are clamped. */
  percent: number;
  tone?: ProgressBarTone;
  size?: "sm" | "md";
  className?: string;
}) {
  const height = size === "sm" ? "h-1.5" : "h-2";
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <div className={`${height} overflow-hidden rounded-full bg-surface ${className}`}>
      <div
        className={`h-full w-full origin-left rounded-full ${TONES[tone]} transition-transform duration-500 ease-in-out`}
        style={{ transform: `scaleX(${clamped / 100})` }}
      />
    </div>
  );
}
