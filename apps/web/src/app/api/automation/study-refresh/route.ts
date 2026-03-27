import { searchStudies } from "@/lib/search/studyAlgorithms";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const configuredSecret = process.env.CRON_SECRET;
  const headerSecret = req.headers.get("x-cron-key");

  if (configuredSecret && headerSecret !== configuredSecret) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Warm up top cohorts so ranking runs periodically on the server.
  const smart = searchStudies("cannabis evidence", { limit: 12, mode: "smart" });
  const fresh = searchStudies("", { limit: 12, mode: "fresh" });
  const quality = searchStudies("", { limit: 12, mode: "quality" });

  return Response.json({
    ok: true,
    generatedAt: new Date().toISOString(),
    snapshots: {
      smartTop: smart.items.slice(0, 5).map((item) => ({ id: item.id, score: item.score })),
      freshTop: fresh.items.slice(0, 5).map((item) => ({ id: item.id, score: item.score })),
      qualityTop: quality.items.slice(0, 5).map((item) => ({ id: item.id, score: item.score })),
    },
    notes: [
      "Runs on Vercel cron independent of local PC sessions.",
      "This endpoint does not modify repository files.",
      "For persistent sync outside GitHub Actions use external storage (DB/Blob/KV).",
    ],
  });
}
