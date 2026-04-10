import autoSourcesData from "@/data/terpira/autoSources.json";
import { recordAutomationRun } from "@/lib/automationRuns";
import { getCronSecret } from "@/lib/env";
import { logError, logInfo, logWarn } from "@/lib/log";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
import { createHash } from "node:crypto";

export const dynamic = "force-dynamic";

const STUDIES_TABLE = "studies";
const JOB_NAME = "studies-sync";

type AutoSource = {
  title?: string;
  url?: string;
  doi?: string;
  publisher?: string;
  tags?: string[];
  matchedTopics?: string[];
  reviewSummary?: string[];
};

function normalizeText(value: string | null | undefined): string {
  return (value ?? "").trim();
}

function toStudyInsert(source: AutoSource) {
  const title = normalizeText(source.title);
  if (!title) return null;

  const reviewSummary = (source.reviewSummary ?? []).map((line) => line.trim()).filter(Boolean).slice(0, 3);
  const description = reviewSummary.length > 0 ? reviewSummary.join(" ") : null;

  const sourceLabel = normalizeText(source.url) || normalizeText(source.publisher) || null;

  const tags = Array.from(
    new Set([...(source.tags ?? []), ...(source.matchedTopics ?? [])].map((tag) => tag.trim().toLowerCase()).filter(Boolean))
  );

  const rawFingerprint = source.doi?.trim().toLowerCase() || source.url?.trim().toLowerCase() || `${title}|${sourceLabel ?? ""}`;
  const sourceFingerprint = createHash("sha256").update(rawFingerprint).digest("hex");

  return {
    title,
    description,
    source: sourceLabel,
    tags,
    source_fingerprint: sourceFingerprint,
    quality_status: "pending" as const,
    reviewed_by: null,
    reviewed_at: null,
    review_note: null,
  };
}

type StudySyncRow = {
  title: string;
  description: string | null;
  source: string | null;
  tags: string[];
  source_fingerprint: string;
  quality_status: "pending";
  reviewed_by: null;
  reviewed_at: null;
  review_note: null;
};

type CrossrefWorkItem = {
  title?: string[];
  URL?: string;
  DOI?: string;
  publisher?: string;
  subject?: string[];
  published?: { "date-parts"?: number[][] };
  issued?: { "date-parts"?: number[][] };
};

type CrossrefResponse = {
  message?: {
    items?: CrossrefWorkItem[];
  };
};

type SyncMetrics = {
  fetched: number;
  inserted: number;
  updated: number;
  skipped: number;
  errors: string[];
  attempts: number;
  sourceGeneratedAt: string | null;
};

function isCronAuthorized(req: Request, configuredSecret: string): boolean {
  const headerSecret =
    req.headers.get("x-cron-key") ??
    new URL(req.url).searchParams.get("x-cron-key");
  return headerSecret === configuredSecret;
}

function buildCrossrefUrl(): string {
  const lookbackDaysRaw = Number.parseInt(process.env.STUDY_SYNC_LOOKBACK_DAYS ?? "3", 10);
  const lookbackDays = Number.isFinite(lookbackDaysRaw) ? Math.min(Math.max(lookbackDaysRaw, 1), 14) : 3;
  const fromDate = new Date(Date.now() - lookbackDays * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const params = new URLSearchParams({
    query: "cannabis cannabinoid thc cbd",
    rows: "60",
    sort: "published",
    order: "desc",
    filter: `from-pub-date:${fromDate},type:journal-article`,
    select: "title,URL,DOI,publisher,subject,published,issued",
  });

  return `https://api.crossref.org/works?${params.toString()}`;
}

async function fetchCrossrefSources(maxAttempts: number): Promise<{ sources: AutoSource[]; attempts: number; errors: string[] }> {
  const errors: string[] = [];
  const url = buildCrossrefUrl();

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "SecretLeafAutomation/1.0 (status@secretleaf.local)",
          Accept: "application/json",
        },
        cache: "no-store",
      });

      if (!response.ok) {
        const message = `crossref_http_${response.status}`;
        errors.push(message);
        continue;
      }

      const body = (await response.json()) as CrossrefResponse;
      const items = body.message?.items ?? [];
      const sources: AutoSource[] = items.map((item) => {
        const title = (item.title ?? []).find((entry) => entry && entry.trim().length > 0) ?? "";
        const subjects = (item.subject ?? []).slice(0, 6).map((subject) => subject.trim().toLowerCase());
        const issued = item.published?.["date-parts"]?.[0] ?? item.issued?.["date-parts"]?.[0] ?? [];
        const year = issued[0] ? String(issued[0]) : "";

        const source: AutoSource = {
          title,
          tags: ["auto:crossref", ...subjects],
          matchedTopics: subjects,
          reviewSummary: [year ? `Published ${year}` : "Recent article", item.publisher ?? "Publisher unknown"],
        };

        if (item.URL) source.url = item.URL;
        if (item.DOI) source.doi = item.DOI;
        if (item.publisher) source.publisher = item.publisher;

        return source;
      });

      return { sources, attempts: attempt, errors };
    } catch (error) {
      const message = error instanceof Error ? error.message : "crossref_fetch_failed";
      errors.push(message);
    }
  }

  return { sources: [], attempts: maxAttempts, errors };
}

async function safeRecordAutomationRun(input: Parameters<typeof recordAutomationRun>[0], metrics: SyncMetrics): Promise<void> {
  try {
    await recordAutomationRun(input);
  } catch (error) {
    const message = error instanceof Error ? error.message : "automation_run_record_failed";
    logWarn("automation.studies-sync.telemetry-failed", { message, jobName: input.jobName });
  }
}

export async function GET(req: Request) {
  const startedAt = new Date().toISOString();
  const metrics: SyncMetrics = {
    fetched: 0,
    inserted: 0,
    updated: 0,
    skipped: 0,
    errors: [],
    attempts: 1,
    sourceGeneratedAt: (autoSourcesData as { generatedAt?: string }).generatedAt ?? null,
  };

  let configuredSecret: string;
  try {
    configuredSecret = getCronSecret();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Missing CRON secret";
    logError("automation.studies-sync.misconfigured", { message });
    metrics.errors.push(message);

    try {
      await safeRecordAutomationRun({
        jobName: JOB_NAME,
        startedAt,
        finishedAt: new Date().toISOString(),
        success: false,
        fetched: metrics.fetched,
        inserted: metrics.inserted,
        updated: metrics.updated,
        skipped: metrics.skipped,
        attempts: metrics.attempts,
        sourceGeneratedAt: metrics.sourceGeneratedAt,
        errorDetails: message,
        metadata: { errors: metrics.errors },
      }, metrics);
    } catch {
      // ignore telemetry failure
    }

    return Response.json({ error: "CRON_SECRET is not configured" }, { status: 500 });
  }

  if (!isCronAuthorized(req, configuredSecret)) {
    logWarn("automation.studies-sync.unauthorized");
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = getSupabaseServerClient();
    const crossrefAttemptRaw = Number.parseInt(process.env.STUDY_SYNC_MAX_ATTEMPTS ?? "3", 10);
    const crossrefAttempts = Number.isFinite(crossrefAttemptRaw) ? Math.min(Math.max(crossrefAttemptRaw, 1), 5) : 3;

    const fetchedExternal = await fetchCrossrefSources(crossrefAttempts);
    metrics.attempts = fetchedExternal.attempts;
    metrics.errors.push(...fetchedExternal.errors);

    const mergedSources = [
      ...((autoSourcesData as { sources?: AutoSource[] }).sources ?? []),
      ...fetchedExternal.sources,
    ];

    const sources = mergedSources
      .map(toStudyInsert)
      .filter(Boolean) as StudySyncRow[];

    metrics.fetched = sources.length;

    if (sources.length === 0) {
      logInfo("automation.studies-sync.empty");
      await safeRecordAutomationRun({
        jobName: JOB_NAME,
        startedAt,
        finishedAt: new Date().toISOString(),
        success: true,
        fetched: metrics.fetched,
        inserted: 0,
        updated: 0,
        skipped: 0,
        attempts: metrics.attempts,
        sourceGeneratedAt: metrics.sourceGeneratedAt,
        metadata: { errors: metrics.errors },
      }, metrics);

      return Response.json({
        success: true,
        fetched: metrics.fetched,
        inserted: 0,
        updated: 0,
        skipped: 0,
        errors: metrics.errors,
        generatedAt: new Date().toISOString(),
      });
    }

    // Explicit insert/update path avoids dependency on ON CONFLICT index inference.

    const fingerprints = sources.map((source) => source.source_fingerprint);
    const { data: existingRows, error: existingError } = await supabase
      .from(STUDIES_TABLE)
      .select("id, source_fingerprint")
      .in("source_fingerprint", fingerprints);

    if (existingError) {
      logError("automation.studies-sync.existing-fetch-failed", { error: existingError.message });
      metrics.errors.push(existingError.message);

      await safeRecordAutomationRun({
        jobName: JOB_NAME,
        startedAt,
        finishedAt: new Date().toISOString(),
        success: false,
        fetched: metrics.fetched,
        inserted: metrics.inserted,
        updated: metrics.updated,
        skipped: metrics.skipped,
        attempts: metrics.attempts,
        sourceGeneratedAt: metrics.sourceGeneratedAt,
        errorDetails: existingError.message,
        metadata: { errors: metrics.errors },
      }, metrics);

      return Response.json({ error: existingError.message }, { status: 500 });
    }

    const existingByFingerprint = new Map(
      (existingRows ?? [])
        .filter((row) => typeof row.source_fingerprint === "string")
        .map((row) => [row.source_fingerprint as string, row.id as string])
    );

    const toInsert = sources.filter((source) => !existingByFingerprint.has(source.source_fingerprint));
    const toUpdate = sources.filter((source) => existingByFingerprint.has(source.source_fingerprint));

    if (toInsert.length > 0) {
      const { error: insertError } = await supabase.from(STUDIES_TABLE).insert(toInsert);
      if (insertError) {
        logError("automation.studies-sync.insert-failed", { error: insertError.message });
        metrics.errors.push(insertError.message);

        await safeRecordAutomationRun({
          jobName: JOB_NAME,
          startedAt,
          finishedAt: new Date().toISOString(),
          success: false,
          fetched: metrics.fetched,
          inserted: metrics.inserted,
          updated: metrics.updated,
          skipped: metrics.skipped,
          attempts: metrics.attempts,
          sourceGeneratedAt: metrics.sourceGeneratedAt,
          errorDetails: insertError.message,
          metadata: { errors: metrics.errors },
        }, metrics);

        return Response.json({ error: insertError.message }, { status: 500 });
      }
    }

    for (const source of toUpdate) {
      const studyId = existingByFingerprint.get(source.source_fingerprint);
      if (!studyId) continue;

      const { error: updateError } = await supabase
        .from(STUDIES_TABLE)
        .update({
          title: source.title,
          description: source.description,
          source: source.source,
          tags: source.tags,
          source_fingerprint: source.source_fingerprint,
        })
        .eq("id", studyId);

      if (updateError) {
        logError("automation.studies-sync.update-failed", { error: updateError.message, studyId });
        metrics.errors.push(updateError.message);

        await safeRecordAutomationRun({
          jobName: JOB_NAME,
          startedAt,
          finishedAt: new Date().toISOString(),
          success: false,
          fetched: metrics.fetched,
          inserted: metrics.inserted,
          updated: metrics.updated,
          skipped: metrics.skipped,
          attempts: metrics.attempts,
          sourceGeneratedAt: metrics.sourceGeneratedAt,
          errorDetails: updateError.message,
          metadata: { errors: metrics.errors, studyId },
        }, metrics);

        return Response.json({ error: updateError.message }, { status: 500 });
      }
    }

    metrics.inserted = toInsert.length;
    metrics.updated = toUpdate.length;

    logInfo("automation.studies-sync.success", {
      totalCandidates: sources.length,
      inserted: metrics.inserted,
      updated: metrics.updated,
    });

    await safeRecordAutomationRun({
      jobName: JOB_NAME,
      startedAt,
      finishedAt: new Date().toISOString(),
      success: true,
      fetched: metrics.fetched,
      inserted: metrics.inserted,
      updated: metrics.updated,
      skipped: metrics.skipped,
      attempts: metrics.attempts,
      sourceGeneratedAt: metrics.sourceGeneratedAt,
      metadata: {
        externalFetched: fetchedExternal.sources.length,
        errors: metrics.errors,
      },
    }, metrics);

    return Response.json({
      success: true,
      fetched: metrics.fetched,
      inserted: metrics.inserted,
      updated: metrics.updated,
      skipped: metrics.skipped,
      errors: metrics.errors,
      generatedAt: new Date().toISOString(),
      notes: [
        "Runs on Vercel cron independent of local PC sessions.",
        "Sync source: static autoSources + external Crossref runtime fetch",
      ],
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Sync failed";
    logError("automation.studies-sync.exception", { message });
    metrics.errors.push(message);

    try {
      await safeRecordAutomationRun({
        jobName: JOB_NAME,
        startedAt,
        finishedAt: new Date().toISOString(),
        success: false,
        fetched: metrics.fetched,
        inserted: metrics.inserted,
        updated: metrics.updated,
        skipped: metrics.skipped,
        attempts: metrics.attempts,
        sourceGeneratedAt: metrics.sourceGeneratedAt,
        errorDetails: message,
        metadata: { errors: metrics.errors },
      }, metrics);
    } catch {
      // ignore telemetry failure
    }

    return Response.json(
      {
        success: false,
        fetched: metrics.fetched,
        inserted: metrics.inserted,
        updated: metrics.updated,
        skipped: metrics.skipped,
        errors: metrics.errors,
      },
      { status: 500 }
    );
  }
}
