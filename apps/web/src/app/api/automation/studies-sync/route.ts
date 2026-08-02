// ──────────────────────────────────────────────────────────────────────────────
// Deprecated: superseded by /api/automation/engine-sync.
// ──────────────────────────────────────────────────────────────────────────────
//
// This route used to insert raw Crossref search hits into `studies` with no
// classification, scoring, or hard-exclusion filtering (unlike engine-sync,
// which runs the full lib/engine pipeline: classify -> score -> accept gate).
// Left running unnoticed, it filled the pending queue with thousands of
// off-topic studies pulled in by broad Crossref keyword matches.
//
// Removed from vercel.json crons. Kept as a stub (instead of deleting the
// route) so a stray manual call or forgotten cron entry can't silently start
// writing unfiltered data again.
// ──────────────────────────────────────────────────────────────────────────────

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json(
    {
      success: false,
      deprecated: true,
      message: "studies-sync is deprecated and no longer writes to the studies table. Use /api/automation/engine-sync instead.",
    },
    { status: 410 },
  );
}
