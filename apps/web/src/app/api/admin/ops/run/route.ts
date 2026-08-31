// ────────────────────────────────────────────────────────────────────────────
// POST /api/admin/ops/run
//
// „Jetzt ausführen" für einen der 7 Cron-Jobs. Leitet serverseitig an die
// jeweilige /api/automation/*-Route weiter (die per CRON_SECRET geschützt ist)
// und gibt deren Antwort zurück. Ersetzt die alten `engine-*`-Actions der
// Mega-Route (docs/ADMIN_PANEL_OVERHAUL_PLAN.md §4.6 / §7).
// ────────────────────────────────────────────────────────────────────────────

import { adminRoute, parseBody, AdminHttpError } from "@/lib/admin/http";
import { opsRunSchema } from "@/lib/admin/contracts";
import { withAudit } from "@/lib/admin/audit";
import { CRON_BY_JOB_NAME } from "@/components/admin/cronRegistry";
import { getCronSecret } from "@/lib/env";

export const dynamic = "force-dynamic";

export const POST = adminRoute(async ({ req, actor }) => {
  const input = await parseBody(req, opsRunSchema);

  const job = CRON_BY_JOB_NAME[input.job];
  if (!job) {
    throw new AdminHttpError(400, `Unbekannter Job: ${input.job}`);
  }

  let cronSecret: string;
  try {
    cronSecret = getCronSecret();
  } catch {
    throw new AdminHttpError(500, "CRON_SECRET ist nicht konfiguriert");
  }

  // Reliable origin from the incoming request — no header guessing.
  const origin = new URL(req.url).origin;
  const target = new URL(job.path, origin);
  if (input.dryRun) target.searchParams.set("dryRun", "true");
  if (input.lookbackDays != null) target.searchParams.set("lookbackDays", String(input.lookbackDays));
  if (input.maxProcessed != null) target.searchParams.set("maxProcessed", String(input.maxProcessed));
  if (input.batchSize != null) target.searchParams.set("batchSize", String(input.batchSize));

  const result = await withAudit(
    actor,
    {
      resource: "ops",
      resourceId: job.jobName ?? job.path,
      action: input.dryRun ? "run-dry" : "run",
      after: { job: input.job, dryRun: input.dryRun ?? false, lookbackDays: input.lookbackDays, maxProcessed: input.maxProcessed, batchSize: input.batchSize },
    },
    async () => {
      const res = await fetch(target, {
        method: "GET",
        headers: { Authorization: `Bearer ${cronSecret}` },
        cache: "no-store",
      });
      const body = (await res.json().catch(() => ({}))) as Record<string, unknown>;
      if (!res.ok) {
        throw new AdminHttpError(
          res.status === 401 ? 500 : res.status,
          typeof body.error === "string" ? body.error : `Automations-Route antwortete ${res.status}`,
        );
      }
      return body;
    },
  );

  return { job: input.job, dryRun: input.dryRun ?? false, result };
});
